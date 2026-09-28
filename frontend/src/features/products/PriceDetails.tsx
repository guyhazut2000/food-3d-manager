import { formatMoney } from "../../shared/money";
import { INSIGHT_WINDOW_DAYS } from "./constants";
import type { PriceInsight, ProductPrice } from "./types";

export function PriceTag({ price }: { price: ProductPrice }) {
  const onSale = price.sale !== null;
  return (
    <div className="flex flex-wrap items-baseline gap-2">
      <span className={`text-3xl font-bold ${onSale ? "text-red-600" : "text-zinc-900"}`}>{formatMoney(price.unit)}</span>
      {onSale ? (
        <>
          <span className="text-lg text-zinc-400 line-through">{formatMoney(price.regular)}</span>
          <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">SALE</span>
        </>
      ) : null}
      {price.deal_quantity !== null && price.deal_price !== null ? (
        <span className="rounded-full bg-amber-400 px-2 py-0.5 text-xs font-bold text-amber-950">
          {price.deal_quantity} for {formatMoney(price.deal_price)} · {formatMoney(price.best_unit)} each
        </span>
      ) : null}
    </div>
  );
}

const INSIGHT_STYLES: Record<PriceInsight["kind"], string> = {
  lowest: "bg-emerald-50 text-emerald-800 border-emerald-200",
  highest: "bg-red-50 text-red-800 border-red-200",
  above_low: "bg-amber-50 text-amber-800 border-amber-200",
  stable: "bg-zinc-50 text-zinc-700 border-zinc-200",
};

function insightMessage(insight: PriceInsight): string {
  const window = `the last ${INSIGHT_WINDOW_DAYS} days`;
  switch (insight.kind) {
    case "lowest":
      return `🔥 Lowest price in ${window} — a good time to buy.`;
    case "highest":
      return `⚠️ Highest price in ${window}. It was as low as ${formatMoney(insight.lowest)}.`;
    case "above_low":
      return `📈 ${insight.percent_above_low}% above its ${INSIGHT_WINDOW_DAYS}-day low of ${formatMoney(insight.lowest)}.`;
    case "stable":
      return `Price has been stable over ${window}.`;
  }
}

export function InsightAlert({ insight }: { insight: PriceInsight }) {
  return (
    <div role="status" className={`rounded-lg border px-3 py-2 text-sm ${INSIGHT_STYLES[insight.kind]}`}>
      <p className="font-medium">{insightMessage(insight)}</p>
      {insight.kind !== "stable" ? (
        <p className="mt-0.5 text-xs opacity-80">
          {INSIGHT_WINDOW_DAYS}-day range: {formatMoney(insight.lowest)} – {formatMoney(insight.highest)} per item
        </p>
      ) : null}
    </div>
  );
}
