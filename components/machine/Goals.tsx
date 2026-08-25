"use client";

import type { ReactNode } from "react";

export type GoalDef = {
  id: string;
  label: ReactNode;
  target?: number;
};

export type GoalState = Record<string, number>;

/** Encore-style checklist: checkbox pops when a goal completes; counted
 *  goals show an n/N pill that fills as you go. */
export function Goals({ items, state }: { items: GoalDef[]; state: GoalState }) {
  return (
    <div className="goals">
      <span className="goals-title">Goals</span>
      {items.map((g) => {
        const target = g.target ?? 1;
        const n = Math.min(state[g.id] ?? 0, target);
        const done = n >= target;
        return (
          <div className="goal" key={g.id} data-done={done}>
            <span className="gbox" aria-hidden="true">
              {done ? (
                <svg viewBox="0 0 16 16">
                  <path d="m3 8.5 3.4 3.4L13 5.5" />
                </svg>
              ) : null}
            </span>
            {target > 1 ? (
              <span className="gcount">
                {n}/{target}
              </span>
            ) : null}
            <span className="glabel">{g.label}</span>
            <span className="sr-only">{done ? " — done" : ""}</span>
          </div>
        );
      })}
    </div>
  );
}
