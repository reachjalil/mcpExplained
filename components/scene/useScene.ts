"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SceneStep } from "./types";

const DEFAULT_HOLD = 2600;

export type SceneOptions = {
  /** Start playing the first time the scene scrolls into view. */
  autoPlayOnView?: boolean;
  /** Loop back to step 0 instead of stopping at the end. */
  loop?: boolean;
};

export type SceneController = {
  steps: SceneStep[];
  index: number;
  step: SceneStep;
  /** Changes on every transition — including a replay of the same index — so
   *  one-shot CSS animations can be restarted with `key={runKey}`. */
  runKey: string;
  playing: boolean;
  atStart: boolean;
  atEnd: boolean;
  reducedMotion: boolean;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  reset: () => void;
  goTo: (i: number) => void;
};

export function useScene(
  steps: SceneStep[],
  { autoPlayOnView = true, loop = false }: SceneOptions = {},
): SceneController & {
  rootRef: React.RefObject<HTMLElement | null>;
  onKeyDown: (e: React.KeyboardEvent) => void;
} {
  const [index, setIndex] = useState(0);
  const [tick, setTick] = useState(0);
  const [playing, setPlaying] = useState(false);
  const rootRef = useRef<HTMLElement | null>(null);
  const hasAutoPlayed = useRef(false);
  const reducedMotion = useReducedMotion();

  const last = steps.length - 1;
  const clamped = Math.min(index, last);
  const step = steps[clamped];

  const goTo = useCallback(
    (i: number) => {
      setIndex(Math.max(0, Math.min(i, steps.length - 1)));
      setTick((t) => t + 1);
    },
    [steps.length],
  );

  const next = useCallback(() => {
    setIndex((i) => {
      if (i >= steps.length - 1) return loop ? 0 : i;
      return i + 1;
    });
    setTick((t) => t + 1);
  }, [steps.length, loop]);

  const prev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
    setTick((t) => t + 1);
  }, []);

  const play = useCallback(() => {
    setIndex((i) => (i >= steps.length - 1 ? 0 : i));
    setTick((t) => t + 1);
    setPlaying(true);
  }, [steps.length]);

  const pause = useCallback(() => setPlaying(false), []);

  const toggle = useCallback(() => {
    setPlaying((p) => {
      if (p) return false;
      setIndex((i) => (i >= steps.length - 1 ? 0 : i));
      setTick((t) => t + 1);
      return true;
    });
  }, [steps.length]);

  const reset = useCallback(() => {
    setPlaying(false);
    setIndex(0);
    setTick((t) => t + 1);
  }, []);

  // Reset when the step list itself changes identity (the playground rebuilds
  // its steps whenever the reader edits the plan).
  const stepsKey = useMemo(() => steps.map((s) => s.id).join("|"), [steps]);
  const prevStepsKey = useRef(stepsKey);
  useEffect(() => {
    if (prevStepsKey.current !== stepsKey) {
      prevStepsKey.current = stepsKey;
      setPlaying(false);
      setIndex(0);
      setTick((t) => t + 1);
    }
  }, [stepsKey]);

  // Autoplay clock.
  useEffect(() => {
    if (!playing) return;
    if (clamped >= last && !loop) {
      const id = window.setTimeout(() => setPlaying(false), 400);
      return () => window.clearTimeout(id);
    }
    const hold = reducedMotion
      ? 1400
      : (steps[clamped]?.hold ?? DEFAULT_HOLD);
    const id = window.setTimeout(next, hold);
    return () => window.clearTimeout(id);
  }, [playing, clamped, last, loop, next, steps, reducedMotion]);

  // Pause off-screen; optionally start on first reveal.
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          if (autoPlayOnView && !hasAutoPlayed.current && !reducedMotion) {
            hasAutoPlayed.current = true;
            setPlaying(true);
          }
        } else {
          setPlaying(false);
        }
      },
      { threshold: 0.45 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [autoPlayOnView, reducedMotion]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const target = e.target as HTMLElement;
      // Let real controls handle their own keys.
      if (
        target.tagName === "INPUT" ||
        target.tagName === "SELECT" ||
        target.tagName === "TEXTAREA"
      ) {
        return;
      }
      switch (e.key) {
        case " ":
        case "k":
          if (target.tagName === "BUTTON") return;
          e.preventDefault();
          toggle();
          break;
        case "ArrowRight":
        case "l":
          e.preventDefault();
          pause();
          next();
          break;
        case "ArrowLeft":
        case "h":
          e.preventDefault();
          pause();
          prev();
          break;
        case "Home":
        case "r":
          e.preventDefault();
          reset();
          break;
      }
    },
    [toggle, next, prev, pause, reset],
  );

  return {
    steps,
    index: clamped,
    step,
    runKey: `${clamped}-${tick}`,
    playing,
    atStart: clamped === 0,
    atEnd: clamped === last,
    reducedMotion,
    play,
    pause,
    toggle,
    next,
    prev,
    reset,
    goTo,
    rootRef,
    onKeyDown,
  };
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}
