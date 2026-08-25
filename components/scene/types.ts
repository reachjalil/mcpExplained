import type { ReactNode } from "react";

/** Actor roles share one colour across every diagram on the site. */
export type Role =
  | "agent"
  | "server"
  | "human"
  | "model"
  | "task"
  | "event"
  | "danger"
  | "neutral";

export type NodeState = "idle" | "active" | "done" | "error" | "dim";

export type SceneStep = {
  /** Stable key; also used to restart one-shot animations. */
  id: string;
  /** Short label shown when hovering the step pips. */
  label: string;
  /** Narration heading under the stage. */
  title: string;
  /** Narration body. Keep it to one or two sentences. */
  body: ReactNode;
  /** How long autoplay holds on this step, in ms. */
  hold?: number;
};
