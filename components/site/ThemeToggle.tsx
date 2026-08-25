"use client";

import { useCallback, useSyncExternalStore } from "react";

type Theme = "light" | "dark";

/** The DOM attribute (set pre-paint by the boot script) is the single source
 *  of truth; a MutationObserver keeps React in sync with it. */
function subscribe(onChange: () => void) {
  const mo = new MutationObserver(onChange);
  mo.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
  mq?.addEventListener("change", onChange);
  return () => {
    mo.disconnect();
    mq?.removeEventListener("change", onChange);
  };
}

function getTheme(): Theme {
  const attr = document.documentElement.getAttribute("data-theme");
  if (attr === "dark" || attr === "light") return attr;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeToggle() {
  const theme = useSyncExternalStore<Theme | null>(
    subscribe,
    getTheme,
    () => null,
  );

  const flip = useCallback(() => {
    const next: Theme = getTheme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("mcpx-theme", next);
    } catch {
      /* private mode — the choice just won't persist */
    }
  }, []);

  return (
    <button
      type="button"
      className="ghost-link"
      onClick={flip}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      title="Toggle theme"
    >
      <svg
        viewBox="0 0 16 16"
        width="15"
        height="15"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      >
        {theme === "dark" ? (
          <>
            <circle cx="8" cy="8" r="3.1" />
            <path d="M8 1v1.6M8 13.4V15M15 8h-1.6M2.6 8H1M12.9 3.1l-1.1 1.1M4.2 11.8l-1.1 1.1M12.9 12.9l-1.1-1.1M4.2 4.2 3.1 3.1" />
          </>
        ) : (
          <path d="M13.4 9.6A5.8 5.8 0 0 1 6.4 2.6a5.9 5.9 0 1 0 7 7z" />
        )}
      </svg>
      <span suppressHydrationWarning>{theme === "dark" ? "Light" : "Dark"}</span>
    </button>
  );
}
