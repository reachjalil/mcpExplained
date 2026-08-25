import Link from "next/link";
import { HelloToy } from "@/components/toys/HelloToy";
import { InView } from "@/components/ui/InView";
import { liveArticles, plannedArticles } from "@/lib/articles";

export default function Home() {
  return (
    <div className="home">
      <h1>Learn MCP by poking at it.</h1>
      <p className="home-sub">
        <strong>mcpexplained</strong> is a series of short, interactive essays
        about the Model Context Protocol. No videos, no jargon walls — small
        machines you can click, embedded in careful writing.
      </p>

      <HelloToy />

      <p className="index-head">Essays</p>
      <ul className="index">
        {liveArticles().map((a) => (
          <li key={a.slug}>
            <InView as="div" className="iv">
              <Link href={`/articles/${a.slug}`}>
                <h2>
                  {a.title}
                  <span className="arrow" aria-hidden="true">
                    →
                  </span>
                </h2>
                <p>{a.deck}</p>
                <div className="meta">
                  {a.readingTime} · {a.toys} machines · {a.published}
                </div>
              </Link>
            </InView>
          </li>
        ))}
        {plannedArticles().map((a, i) => (
          <li key={a.slug}>
            <InView as="div" className="iv" delay={i * 90}>
              <div className="soon">
                <h2>{a.title}</h2>
                <p>{a.deck}</p>
                <div className="meta">
                  <i>in the works</i>
                </div>
              </div>
            </InView>
          </li>
        ))}
      </ul>
    </div>
  );
}
