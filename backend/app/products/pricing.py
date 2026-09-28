"""Pure pricing rules. All amounts are integer agorot."""

from dataclasses import dataclass
from typing import Literal

INSIGHT_WINDOW_DAYS = 90


@dataclass(frozen=True)
class Price:
    regular: int
    sale: int | None = None
    deal_quantity: int | None = None
    deal_price: int | None = None

    @property
    def unit(self) -> int:
        """What one item costs when bought alone."""
        return self.sale if self.sale is not None else self.regular

    @property
    def best_unit(self) -> int:
        """Lowest achievable per-item price, taking a quantity deal into account."""
        if self.deal_quantity and self.deal_price:
            return min(self.unit, round(self.deal_price / self.deal_quantity))
        return self.unit


@dataclass(frozen=True)
class LineTotal:
    total: int
    regular_total: int

    @property
    def savings(self) -> int:
        return self.regular_total - self.total


def line_total(price: Price, quantity: int) -> LineTotal:
    """Cheapest total for `quantity` items: as many full deals as fit, the rest at the unit price."""
    regular_total = price.regular * quantity
    if not (price.deal_quantity and price.deal_price):
        return LineTotal(price.unit * quantity, regular_total)

    deals, remainder = divmod(quantity, price.deal_quantity)
    with_deal = deals * price.deal_price + remainder * price.unit
    return LineTotal(min(with_deal, price.unit * quantity), regular_total)


InsightKind = Literal["lowest", "highest", "above_low", "stable"]


@dataclass(frozen=True)
class PriceInsight:
    kind: InsightKind
    lowest: int
    highest: int
    percent_above_low: int


def price_insight(current_best_unit: int, history_best_units: list[int]) -> PriceInsight:
    """Compares the current per-item price with the price range seen in the insight window."""
    observed = [*history_best_units, current_best_unit]
    lowest, highest = min(observed), max(observed)
    percent_above_low = round((current_best_unit - lowest) * 100 / lowest)

    if lowest == highest:
        kind: InsightKind = "stable"
    elif current_best_unit == lowest:
        kind = "lowest"
    elif current_best_unit == highest:
        kind = "highest"
    else:
        kind = "above_low"
    return PriceInsight(kind, lowest, highest, percent_above_low)
