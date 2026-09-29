import { request } from "../../shared/api/client";
import type { Trip, TripSummary } from "./types";

export const tripsApi = {
  checkout: () => request<Trip>("POST", "/trips"),
  list: () => request<TripSummary[]>("GET", "/trips"),
  get: (id: string) => request<Trip>("GET", `/trips/${id}`),
};
