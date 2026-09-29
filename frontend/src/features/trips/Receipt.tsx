import { formatMoney } from "../../shared/money";
import { formatTripDate } from "./format";
import type { Trip } from "./types";

export default function Receipt({ trip }: { trip: Trip }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-zinc-500">{formatTripDate(trip.checked_out_at)}</p>
      <ul className="max-h-[40vh] divide-y divide-zinc-100 overflow-y-auto">
        {trip.items.map((item, index) => (
          <li key={index} className="flex items-center gap-2 py-2 text-sm">
            <span className="h-3 w-3 shrink-0 rounded" style={{ backgroundColor: item.color }} />
            <span className="min-w-0 flex-1 truncate">
              {item.name} <span className="text-zinc-400">· {item.unit}</span>
            </span>
            <span className="text-zinc-500">
              {item.quantity} × {formatMoney(item.unit_price)}
            </span>
            <span className="w-16 text-right font-medium">{formatMoney(item.total)}</span>
          </li>
        ))}
      </ul>
      <div className="border-t border-zinc-200 pt-2 text-sm">
        {trip.savings > 0 ? (
          <p className="flex justify-between text-emerald-700">
            <span>You saved</span>
            <span>{formatMoney(trip.savings)}</span>
          </p>
        ) : null}
        <p className="flex justify-between text-lg font-bold text-zinc-900">
          <span>Total · {trip.item_count} items</span>
          <span>{formatMoney(trip.total)}</span>
        </p>
      </div>
    </div>
  );
}
