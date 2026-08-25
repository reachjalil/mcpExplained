import Link from "next/link";
import { Ambient } from "@/components/article/Ambient";
import { liveArticles, plannedArticles } from "@/lib/articles";
import { REPO_URL } from "@/lib/site";

export default function Home() {
  return (
    <div className="home">
      <section className="home-hero">
        <Ambient />
        <span className="eyebrow">Model Context Protocol</span>
        <h1>
          Protocols are easier to understand when you can <em>press play</em>.
        </h1>
        <p>
          mcpExplained is a small, open collection of deep explainers about MCP.
          Every idea that involves something moving — a call, a handle, a task,
          an event — gets a diagram you can step through, pause, and replay.
        </p>
      </section>

      <div className="section-rule">Explainers</div>
      <div className="card-grid">
        {liveArticles().map((a) => (
          <Link
            key={a.slug}
            href={`/articles/${a.slug}`}
            className="article-card"
          >
            <h3>{a.title}</h3>
            <p>{a.standfirst}</p>
            <div className="card-meta">
              <span className="tag">{a.readingTime}</span>
              <span className="tag">{a.scenes} interactive figures</span>
              <span>{a.published}</span>
            </div>
          </Link>
        ))}
        {plannedArticles().map((a) => (
          <div key={a.slug} className="article-card" data-state="soon">
            <h3>{a.title}</h3>
            <p>{a.standfirst}</p>
            <div className="card-meta">
              <span className="tag">in the works</span>
            </div>
          </div>
        ))}
      </div>

      <div className="section-rule">How this works</div>
      <div className="card-grid">
        <div className="article-card" data-state="soon">
          <h3>Every figure is a player</h3>
          <p>
            Diagrams are hand-written SVG driven by a tiny step machine —
            play, pause, scrub, and keyboard control, with no animation
            dependency and full support for reduced-motion.
          </p>
        </div>
        <div className="article-card" data-state="soon">
          <h3>Colour means something</h3>
          <p>
            The agent is violet, MCP servers are teal, humans are amber, tasks
            are green, events are pink. Learn the palette once and every
            diagram on the site reads faster.
          </p>
        </div>
        <div className="article-card" data-state="soon">
          <h3>Claims are separated from guesses</h3>
          <p>
            Explainers mark what is specified today, what is roadmap work, and
            what is the author&rsquo;s inference — because for a protocol this
            young, the difference matters.
          </p>
        </div>
      </div>

      <div className="section-rule">Contribute</div>
      <p style={{ maxWidth: "52ch", color: "var(--text-muted)" }}>
        New explainers are welcome, and so are corrections — especially if a
        spec moves under us.{" "}
        <a href={`${REPO_URL}/blob/main/CONTRIBUTING.md`}>
          Start with CONTRIBUTING.md
        </a>
        , which walks through building a scene from scratch.
      </p>
    </div>
  );
}
