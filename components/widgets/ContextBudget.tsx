"use client";

import { useMemo, useState } from "react";

const DOMAINS = [
  { name: "finance", tools: ["invoices_list", "invoice_get", "payment_run", "ledger_query", "tax_report", "budget_diff"] },
  { name: "crm", tools: ["customer_get", "customer_search", "deal_update", "pipeline_stats", "contact_merge", "note_add"] },
  { name: "documents", tools: ["doc_create", "doc_patch", "doc_search", "doc_export", "doc_share", "doc_history"] },
  { name: "calendar", tools: ["event_create", "event_move", "free_slots", "invite_send"] },
  { name: "flights", tools: ["flight_search", "fare_rules", "book_flight", "seat_map", "checkin"] },
  { name: "hotels", tools: ["hotel_search", "reserve", "rate_calendar", "cancel_policy"] },
  { name: "payments", tools: ["charge", "refund", "payout_status", "dispute_open"] },
  { name: "analytics", tools: ["funnel_query", "cohort_build", "export_csv", "dashboard_link"] },
];

const RELEVANT = new Set(["flight_search", "fare_rules", "book_flight", "hotel_search", "reserve", "event_create", "free_slots", "charge"]);

/**
 * The context-budget argument for progressive discovery: pay for the whole
 * catalogue up front, or learn tools as the plan needs them.
 */
export function ContextBudget() {
  const [mode, setMode] = useState<"upfront" | "progressive">("upfront");

  const all = useMemo(() => DOMAINS.flatMap((d) => d.tools.map((t) => ({ d: d.name, t }))), []);
  const shown = mode === "upfront" ? all : all.filter((x) => RELEVANT.has(x.t));
  const used = mode === "upfront" ? 86 : 14;

  return (
    <div className="budget bleed-wide">
      <div
        className="widget-head"
        style={{
          padding: "0.95rem 1.15rem",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          flexWrap: "wrap",
          gap: "0.6rem 1rem",
          alignItems: "center",
        }}
      >
        <div style={{ flex: "1 1 16rem" }}>
          <h4><span className="scene-figno" style={{ marginInlineEnd: "0.55rem" }}>Fig. 12</span>The context bill for “plan my Paris trip”</h4>
          <p>{all.length} tools exist across 8 servers. How many definitions does the model read?</p>
        </div>
        <div className="edge-mode" role="group" aria-label="Discovery mode">
          <button
            type="button"
            aria-pressed={mode === "upfront"}
            onClick={() => setMode("upfront")}
          >
            Whole catalogue
          </button>
          <button
            type="button"
            aria-pressed={mode === "progressive"}
            onClick={() => setMode("progressive")}
          >
            Progressive
          </button>
        </div>
      </div>
      <div className="budget-body">
        <div className="budget-meter" data-hot={mode === "upfront"}>
          <i style={{ "--used": used } as React.CSSProperties} />
          <b>
            {mode === "upfront"
              ? `${all.length} tool definitions ingested before the first token of planning`
              : `${shown.length} definitions, loaded as the plan touched them`}
          </b>
        </div>
        <div className="tool-cloud" key={mode}>
          {(mode === "upfront" ? all : shown).map((x, i) => (
            <span
              key={`${x.d}-${x.t}`}
              className="tool-pill"
              data-hot={RELEVANT.has(x.t)}
              data-dim={mode === "upfront" && !RELEVANT.has(x.t)}
              style={{ "--pd": `${Math.min(i * 18, 700)}ms` } as React.CSSProperties}
            >
              {x.d}/{x.t}
            </span>
          ))}
        </div>
      </div>
      <div
        style={{
          padding: "0.8rem 1.15rem",
          fontSize: "0.85rem",
          color: "var(--text-muted)",
        }}
        aria-live="polite"
      >
        {mode === "upfront" ? (
          <>
            Every faded pill is context spent on a tool this request will never
            call — and research keeps showing tool selection degrades as the
            catalogue grows.
          </>
        ) : (
          <>
            The agent asked for <em>travel-shaped</em> capabilities, then went
            deeper only where the plan led. The other {all.length - shown.length}{" "}
            definitions were never paid for.
          </>
        )}
      </div>
    </div>
  );
}
