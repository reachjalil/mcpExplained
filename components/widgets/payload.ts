import type { ReactNode } from "react";

export type PayloadTab = {
  id: string;
  tab: string;
  /** Lines of the payload; strings are rendered plain, tokens get colour. */
  lines: PayloadLine[];
};

export type PayloadLine = Array<
  | string
  | { t: "key" | "str" | "num"; v: string }
  | { t: "hot"; v: string; id: string }
>;

export type PayloadNote = { id: string; title: string; body: ReactNode };

/* Tiny builders to keep payload definitions readable. */
export const k = (v: string): PayloadLine[number] => ({ t: "key", v });
export const s = (v: string): PayloadLine[number] => ({ t: "str", v });
export const num = (v: string): PayloadLine[number] => ({ t: "num", v });
export const hot = (v: string, id: string): PayloadLine[number] => ({
  t: "hot",
  v,
  id,
});
