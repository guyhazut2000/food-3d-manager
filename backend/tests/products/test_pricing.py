from app.products.pricing import Price, line_total, price_insight


def test_unit_price_uses_sale_when_present():
    assert Price(regular=1000).unit == 1000
    assert Price(regular=1000, sale=800).unit == 800


def test_best_unit_accounts_for_quantity_deal():
    assert Price(regular=1000, deal_quantity=2, deal_price=1500).best_unit == 750


def test_best_unit_ignores_deal_worse_than_sale():
    assert Price(regular=1000, sale=600, deal_quantity=2, deal_price=1500).best_unit == 600


def test_line_total_without_deal():
    totals = line_total(Price(regular=1000, sale=800), 3)

    assert totals.total == 2400
    assert totals.savings == 600


def test_line_total_applies_full_deals_and_prices_the_remainder_normally():
    # 2 for 15.00: three items = one deal (15.00) + one single (10.00)
    totals = line_total(Price(regular=1000, deal_quantity=2, deal_price=1500), 3)

    assert totals.total == 2500
    assert totals.savings == 500


def test_line_total_below_deal_quantity_pays_unit_price():
    assert line_total(Price(regular=1000, deal_quantity=3, deal_price=2000), 2).total == 2000


def test_line_total_never_uses_a_deal_that_costs_more():
    # Sale makes singles cheaper than the deal
    assert line_total(Price(regular=1000, sale=500, deal_quantity=2, deal_price=1500), 2).total == 1000


def test_insight_lowest_when_current_matches_low():
    insight = price_insight(800, [900, 1000, 950])

    assert insight.kind == "lowest"
    assert (insight.lowest, insight.highest) == (800, 1000)
    assert insight.percent_above_low == 0


def test_insight_highest_when_current_matches_high():
    assert price_insight(1100, [900, 1000]).kind == "highest"


def test_insight_above_low_reports_percentage():
    insight = price_insight(1000, [800, 1200])

    assert insight.kind == "above_low"
    assert insight.percent_above_low == 25


def test_insight_stable_without_price_changes():
    assert price_insight(1000, [1000, 1000]).kind == "stable"
    assert price_insight(1000, []).kind == "stable"
