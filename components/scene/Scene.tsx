"use client";

import type { ReactNode } from "react";
import { useScene, type SceneController, type SceneOptions } from "./useScene";
import type { Role, SceneStep } from "./types";
import { NextIcon, PauseIcon, PlayIcon, PrevIcon, ResetIcon } from "./icons";

export type SceneProps = SceneOptions & {
  /** Anchor id, so the table of contents can link straight to a diagram. */
  id: string;
  /** Figure number, e.g. "Fig. 3". */
  fig: string;
  title: string;
  hint?: string;
  accent?: Role;
  steps: SceneStep[];
  /** SVG viewBox for the stage, e.g. "0 0 760 400". */
  viewBox: string;
  children: (scene: SceneController) => ReactNode;
  /** Extra UI rendered between the stage and the narration. */
  aside?: ReactNode;
  playLabel?: string;
};

/**
 * The player shell every diagram on the site shares: a stage, a narration
 * line for the current step, and transport controls. Scenes never own their
 * own buttons — they only draw the current step.
 */
export function Scene({
  id,
  fig,
  title,
  hint,
  accent = "agent",
  steps,
  viewBox,
  children,
  aside,
  playLabel = "Play",
  autoPlayOnView,
  loop,
}: SceneProps) {
  const { rootRef, onKeyDown, ...scene } = useScene(steps, {
    autoPlayOnView,
    loop,
  });
  const { index, step, playing, atStart, atEnd, reducedMotion } = scene;

  return (
    <figure
      id={id}
      className="scene bleed-wide"
      ref={rootRef as React.RefObject<HTMLElement>}
      tabIndex={0}
      onKeyDown={onKeyDown}
      data-reduced={reducedMotion ? "true" : "false"}
      style={{ "--scene-accent": `var(--${accent})` } as React.CSSProperties}
      aria-roledescription="step-through diagram"
      aria-label={`${fig}: ${title}`}
    >
      <div className="scene-head">
        <span className="scene-figno">{fig}</span>
        <div>
          <h4>{title}</h4>
          {hint ? <p>{hint}</p> : null}
        </div>
        <div className="scene-keys" aria-hidden="true">
          <kbd>space</kbd>
          <kbd>←</kbd>
          <kbd>→</kbd>
        </div>
      </div>

      <div className="scene-stage">
        <svg viewBox={viewBox} role="img" aria-label={step.title}>
          {children(scene)}
        </svg>
      </div>

      {aside}

      <figcaption className="scene-narration">
        <span className="scene-step-badge" aria-hidden="true">
          {index + 1}
        </span>
        <div className="narration-body">
          <div key={scene.runKey} className="narration-swap">
            <div className="narration-title">{step.title}</div>
            <p className="narration-text">{step.body}</p>
          </div>
        </div>
      </figcaption>

      <div className="scene-controls">
        <button
          type="button"
          className="ctrl"
          onClick={scene.reset}
          disabled={atStart && !playing}
          aria-label="Restart"
          title="Restart (r)"
        >
          <ResetIcon />
        </button>
        <button
          type="button"
          className="ctrl"
          onClick={() => {
            scene.pause();
            scene.prev();
          }}
          disabled={atStart}
          aria-label="Previous step"
          title="Previous step (←)"
        >
          <PrevIcon />
        </button>
        <button
          type="button"
          className="ctrl ctrl-primary"
          onClick={scene.toggle}
          aria-label={playing ? "Pause" : atEnd ? "Replay" : playLabel}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
          <span>{playing ? "Pause" : atEnd ? "Replay" : playLabel}</span>
        </button>
        <button
          type="button"
          className="ctrl"
          onClick={() => {
            scene.pause();
            scene.next();
          }}
          disabled={atEnd}
          aria-label="Next step"
          title="Next step (→)"
        >
          <NextIcon />
        </button>

        <div className="pips" role="tablist" aria-label="Steps">
          {steps.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className="pip"
              role="tab"
              aria-selected={i === index}
              aria-label={`Step ${i + 1}: ${s.label}`}
              title={`${i + 1}. ${s.label}`}
              data-state={i === index ? "current" : i < index ? "past" : "next"}
              onClick={() => {
                scene.pause();
                scene.goTo(i);
              }}
            />
          ))}
        </div>

        <span className="scene-count">
          {index + 1} / {steps.length}
        </span>
      </div>
    </figure>
  );
}
