"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";

type Status = "checking" | "online" | "offline";

const LABELS: Record<Status, string> = {
  checking: "API: checking…",
  online: "API: online",
  offline: "API: offline",
};

const COLORS: Record<Status, string> = {
  checking: "bg-zinc-500",
  online: "bg-green-600",
  offline: "bg-red-600",
};

export default function ApiStatus() {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((response) => setStatus(response.ok ? "online" : "offline"))
      .catch(() => setStatus("offline"));
  }, []);

  return (
    <span className={`rounded-full px-3 py-1 text-sm font-medium text-white ${COLORS[status]}`}>
      {LABELS[status]}
    </span>
  );
}
