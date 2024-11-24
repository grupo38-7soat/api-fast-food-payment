import asyncio
from datetime import datetime
from typing import List

from integrator_framework.exceptions import handle_no_content_exception
from integrator_framework.schemas import OffersInput, OffersOutput
from integrator_framework.schemas.instalments import TypeEnum
from integrator_framework.schemas.offers import OfferOutput, DebtOutput, DebtInput

from src.mappers.offers import OfferOutputMapper, DebtOutputMapper
from src.models.offers import PartnerOffersResponse, BvCreliContrato, Simulacao, PartnerOffersCache
from src.talkers import PartnerTalker
from src.talkers.cache_bv_creli import BvCreliCache


class PaymentsService:
    valid_contracts: List[BvCreliContrato]
    valid_debts: List[DebtInput]
    valid_simulations: List[List[dict]]

    def __init__(self, offers_input: OffersInput):
        self.partner_talker = PartnerTalker()
        self.cache = BvCreliCache()
        self.offers_input = offers_input
        # Apenas dividas bv-creli devem ser consideradas
        self.offers_input.debts = [debt for debt in self.offers_input.debts if
                                   debt.dataPartner and debt.dataPartner == {'dataSource': 'lno-debts'}]
        self.valid_contracts = []
        self.valid_debts = []
        self.valid_simulations = []

    def _has_bv_creli_debt(self) -> bool:
        return bool(self.offers_input.debts)

    async def offers(self) -> OffersOutput:
        if not self._has_bv_creli_debt():
            handle_no_content_exception("Sem dividas bv-creli na base Serasa.")

        partner_offers_json = await self.partner_talker.get_partner_offers(self.offers_input.document)
        partner_offers_response = PartnerOffersResponse(**partner_offers_json)

        contracts_with_simulation = OffersService.__filter_contract_with_simulation(partner_offers_response.contratos)

        if not contracts_with_simulation:
            handle_no_content_exception("Sem oferta com simulacao disponivel.")

        self.__filter_base_contracts(contracts_with_simulation)

        if not self.valid_contracts:
            handle_no_content_exception("Sem oferta com dívida na base.")

        self.__filter_agreement_contracts(contracts_with_simulation)

        if not self.valid_contracts:
            handle_no_content_exception("Todos os contratos já possuem acordo fechado.")

        await self.__get_partner_simulations(partner_offers_response.datas_vencimento_disponiveis)

        offers = self.__config_offers_and_cache_simulations()

        return OffersOutput(offers=offers, notFound=[])

    async def __get_partner_simulations(self, due_date_options: List[str]) -> None:
        max_due_date = OffersService.__get_max_expiration_date(due_date_options)

        partner_simulations = [
            self.partner_talker.get_partner_simulation(
                contract_number=contract.numero_contrato,
                due_date=max_due_date
            ) for contract in self.valid_contracts
        ]

        self.valid_simulations = list(await asyncio.gather(*partner_simulations))

    def __config_offers_and_cache_simulations(self) -> List[OfferOutput]:
        offers = []
        for key, contract in enumerate(self.valid_contracts):
            for valid_debt in self.valid_debts:
                if contract.numero_contrato.lstrip("0") == valid_debt.contractNumber.lstrip("0"):
                    offer_output = self.__set_offer_output(
                        contract=contract,
                        simulations=self.valid_simulations[key],
                        debt_input=valid_debt
                    )
                    offers.append(offer_output)

                    self.cache.set_offers_cache(
                        value=PartnerOffersCache(
                            contract=contract,
                            simulations=self.valid_simulations[key]
                        ),
                        user_id=self.offers_input.userId,
                        offer_id=offer_output.id
                    )
                    break
        return offers

    def __set_offer_output(self, contract: BvCreliContrato,
                           simulations: List[dict],
                           debt_input: DebtInput) -> OfferOutput:

        sorted_simulation = self.__sort_simulations(simulations)

        at_sight_simulation = Simulacao(**sorted_simulation[0])
        max_simulation = Simulacao(**sorted_simulation[-1])

        instalment_type = TypeEnum.differents.value \
            if max_simulation.quantidade_parcelas_acordo > 1 else TypeEnum.equals.value

        max_instalments = max_simulation.quantidade_parcelas_acordo if len(sorted_simulation) > 1 else None
        max_instalment_value = float(max_simulation.valor_parcelas) if len(sorted_simulation) > 1 else None

        debts = [
            self.__set_debt_output(
                debt_input=debt_input,
                contract=contract,
                at_sight_simulation=at_sight_simulation
            )
        ]

        return OfferOutputMapper(
            at_sight_simulation=at_sight_simulation,
            has_instalments=len(sorted_simulation) > 1,
            instalment_type=instalment_type,
            debts=debts,
            max_instalments=max_instalments,
            max_instalment_value=max_instalment_value
        )

    def __set_debt_output(self, debt_input: DebtInput,
                          contract: BvCreliContrato,
                          at_sight_simulation: Simulacao) -> DebtOutput:

        company = next(filter(lambda c: c.id == debt_input.partnerId, self.offers_input.partnerDocuments), None)
        debt_output = DebtOutputMapper(
            company=company,
            debt_input=debt_input,
            contract=contract,
            at_sight_simulation=at_sight_simulation
        )

        return debt_output

    def __filter_base_contracts(self, contracts: List[BvCreliContrato]) -> None:
        for contract in contracts:
            debt_input = self.__debt_input_match_contract(contract)
            if debt_input is not None:
                self.valid_contracts.append(contract)
                self.valid_debts.append(debt_input)

    def __filter_agreement_contracts(self, contracts: List[BvCreliContrato]) -> None:
        self.valid_contracts = [
            contract for contract in contracts if not hasattr(contract, 'acordo') or not contract.acordo
        ]

    def __debt_input_match_contract(self, contract: BvCreliContrato):
        for debt_input in self.offers_input.debts:
            if debt_input.contractNumber == contract.numero_contrato.lstrip("0"):
                return debt_input
        return None

    @staticmethod
    def __get_max_expiration_date(dates: List[str]) -> str:
        format_date = '%Y-%m-%d'
        dates_datetime = [datetime.strptime(date, format_date) for date in dates]
        max_datetime = max(dates_datetime)
        return max_datetime.strftime(format_date)

    @staticmethod
    def __sort_simulations(simulations: List[dict]) -> List[dict]:
        return sorted(simulations, key=lambda s: s['quantidadeParcelasAcordo'])

    @staticmethod
    def __filter_contract_with_simulation(contracts: List[BvCreliContrato]) -> List[BvCreliContrato]:
        return [
            contract
            for contract in contracts
            if hasattr(contract, 'simulacao_acordo') and contract.simulacao_acordo is not None
        ]
