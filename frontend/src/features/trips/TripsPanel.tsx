import { useEffect, useState } from "react";
import { describeError } from "../../shared/api/client";
import { formatMoney } from "../../shared/money";
import ErrorMessage from "../../shared/ui/ErrorMessage";
import Modal from "../../shared/ui/Modal";
import { formatTripDate } from "./format";
import Receipt from "./Receipt";
import { tripsApi } from "./tripsApi";
import type { Trip, TripSummary } from "./types";

function isThisMonth(isoDate: string): boolean {
  const date = new Date(isoDate);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

export default function TripsPanel({ onClose }: { onClose: () => void }) {
  const [trips, setTrips] = useState<TripSummary[] | null>(null);
  const [openTrip, setOpenTrip] = useState<Trip | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    tripsApi
      .list()
      .then(setTrips)
      .catch((err) => setError(describeError(err, "Could not load your trips.")));
  }, []);

  async function open(id: string) {
    try {
      setOpenTrip(await tripsApi.get(id));
    } catch (err) {
      setError(describeError(err, "Could not load this trip."));
    }
  }

  if (openTrip) {
    return (
      <Modal
        label="Trip receipt"
        onClose={onClose}
        width="w-[min(92vw,440px)]"
        title={
          <button onClick={() => setOpenTrip(null)} className="text-sm font-semibold text-emerald-700 hover:underline">
            ← All trips
          </button>
        }
      >
        <Receipt trip={openTrip} />
      </Modal>
    );
  }

  const monthTrips = trips?.filter((trip) => isThisMonth(trip.checked_out_at)) ?? [];
  const monthTotal = monthTrips.reduce((sum, trip) => sum + trip.total, 0);

  return (
    <Modal
      label="Trip history"
      onClose={onClose}
      width="w-[min(92vw,440px)]"
      title={<h2 className="text-xl font-bold text-zinc-900">🧾 Your trips</h2>}
    >
      <ErrorMessage message={error} />

      {trips === null && !error ? <p className="text-sm text-zinc-500">Loading…</p> : null}

      {trips ? (
        <>
          <div className="rounded-xl bg-emerald-50 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">This month</p>
            <p className="text-2xl font-bold text-emerald-900">{formatMoney(monthTotal)}</p>
            <p className="text-xs text-emerald-700">
              {monthTrips.length} {monthTrips.length === 1 ? "trip" : "trips"}
            </p>
          </div>

          {trips.length === 0 ? (
            <p className="text-sm text-zinc-500">No trips yet. Fill your cart and head to the checkout counter.</p>
          ) : (
            <ul className="max-h-[45vh] divide-y divide-zinc-100 overflow-y-auto">
              {trips.map((trip) => (
                <li key={trip.id}>
                  <button
                    onClick={() => open(trip.id)}
                    className="flex w-full items-center justify-between gap-3 px-1 py-2.5 text-left hover:bg-zinc-50"
                  >
                    <span>
                      <span className="block text-sm font-medium text-zinc-900">{formatTripDate(trip.checked_out_at)}</span>
                      <span className="text-xs text-zinc-500">
                        {trip.item_count} items
                        {trip.savings > 0 ? ` · saved ${formatMoney(trip.savings)}` : ""}
                      </span>
                    </span>
                    <span className="font-semibold text-zinc-900">{formatMoney(trip.total)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : null}
    </Modal>
  );
}
