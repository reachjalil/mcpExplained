import type { Metadata } from "next";
import { InView } from "@/components/ui/InView";
import { G } from "@/components/ui/Glyph";
import { TalkOverture } from "@/components/toys/TalkOverture";
import { DirectCall } from "@/components/toys/DirectCall";
import { ServerWall } from "@/components/toys/ServerWall";
import { TwoHops } from "@/components/toys/TwoHops";
import { AppAsks } from "@/components/toys/AppAsks";
import { YouApprove } from "@/components/toys/YouApprove";
import { BoundaryMap } from "@/components/toys/BoundaryMap";

export const metadata: Metadata = {
  title: "Who can talk to whom?",
  description:
    "MCP is a story about access: apps that have to ask, servers that stay strangers, and one agent holding the keys. Five machines let you click through the boundaries.",
};

function H2({ n, children }: { n: string; children: string }) {
  return (
    <InView as="h2" threshold={0.9} id={`s-${n}`}>
      <span className="hn">{n}</span>
      <span className="hu">{children}</span>
    </InView>
  );
}

export default function Article() {
  return (
    <article className="post">
      <header className="post-header">
        <h1>Who can talk to whom?</h1>
        <p className="stand">
          MCP looks complicated until you ask{" "}
          <strong>who holds access</strong>. Five machines below answer it,
          one boundary each.
        </p>
        <div className="post-meta">
          <span>august 25, 2026</span>
          <span>7 min</span>
          <span>5 machines</span>
          <span>you&apos;ll be doing the clicking</span>
        </div>
      </header>

      <TalkOverture />

      <p>
        Almost everything confusing about the protocol untangles once you
        track a single fact: <strong>who is allowed to talk to whom</strong>.
        That fact is what the machines test. I&apos;ll need your help, because
        none of them runs on its own.
      </p>
      <p className="owe">
        With a nod to{" "}
        <a
          href="https://encore.dev/blog/queueing"
          target="_blank"
          rel="noreferrer noopener"
        >
          Sam Rose&apos;s queueing essay</a>
        .
      </p>

      {/* ----------------------------------------------------------------- */}
      <H2 n="01">One connection</H2>
      <p>
        Start with the only line that exists at the beginning: the{" "}
        <G k="agent">agent</G> holds a connection to a <G k="server">server</G>. The
        agent sends a <G k="request">request</G>; the server answers with a{" "}
        <G k="result">result</G>. Nobody else is on the wire.
      </p>
      <DirectCall />
      <p>
        That&apos;s the entire protocol: request out, result back. Everything
        else in MCP is about what happens when this one line isn&apos;t
        enough.
      </p>

      {/* ----------------------------------------------------------------- */}
      <H2 n="02">Servers are strangers</H2>
      <p>
        Add a second server and the shortcut is tempting. Surely{" "}
        <strong>flights</strong> can just tell the <strong>calendar</strong>{" "}
        about your trip? Click and see.
      </p>
      <ServerWall />
      <p>
        There is no wire between servers. Not a slow one, not a hidden one.
        None. Flights cannot call the calendar and never learns it exists.
        Each server knows its own job and nothing else.
      </p>
      <p>
        That sounds like a limitation. It&apos;s the design. A server that
        can&apos;t reach other servers is a server nobody has to distrust on
        the others&apos; behalf.
      </p>

      {/* ----------------------------------------------------------------- */}
      <H2 n="03">Facts travel through the middle</H2>
      <p>
        So how does the arrival time get to the calendar? It rides through the{" "}
        <G k="agent">agent</G>. The agent asks flights and gets{" "}
        <code>14:05</code> back. It holds the calendar connection too, so it
        hands the time over.
      </p>
      <TwoHops />
      <p>
        Try the toggle. With the agent gone, the time is stranded. There is
        no path from one server to the other. The workflow doesn&apos;t live
        in the servers and isn&apos;t wired between them.{" "}
        <strong>It exists only in the middle.</strong>
      </p>

      {/* ----------------------------------------------------------------- */}
      <H2 n="04">Apps have to ask</H2>
      <p>
        Now the character this article was written for. A server can ship UI
        to your screen: a seat map, a price ticker. That <G k="app">app</G>{" "}
        runs in a sandbox, and here is the part people miss:{" "}
        <strong>the app has no connection to its own server.</strong> It
        can&apos;t fetch. It can&apos;t call home. When it needs data, it asks
        the agent, and the agent decides.
      </p>
      <AppAsks />
      <p>
        The permission you flipped is real. An app declares which tools it
        wants and the host enforces that list. Same app, same server, same
        button. The only thing that changed is what the middle allows.
      </p>
      <aside className="note">
        <span className="note-k">fine print</span>
        The app rules come from the MCP Apps draft (SEP-1865); everything else
        on this page is core MCP. Drafts move. If this paragraph goes stale,{" "}
        <a
          href="https://github.com/reachjalil/mcpExplained/issues"
          target="_blank"
          rel="noreferrer noopener"
        >
          tell me
        </a>
        .
      </aside>

      {/* ----------------------------------------------------------------- */}
      <H2 n="05">You are a boundary too</H2>
      <p>
        One connection is missing from every machine so far: the one to your
        money. When a side effect matters, the agent doesn&apos;t get to
        decide alone. The request parks, and the question comes to you.
      </p>
      <YouApprove />
      <p>
        Deny it and notice what happened: <strong>nothing</strong>. No
        half-booked flight, no pending charge to unwind. The request never
        crossed the line, because waiting for you is a first-class state, not
        a failure.
      </p>

      {/* ----------------------------------------------------------------- */}
      <H2 n="06">The map</H2>
      <p>Each machine writes a rule. Here they are together.</p>
      <BoundaryMap />
      <p>
        Memorize the table and you&apos;ve memorized the architecture. One
        process holds the connections. Servers, apps, even the model all go
        through it. <strong>That one rule is most of MCP.</strong>
      </p>

      {/* ----------------------------------------------------------------- */}
      <H2 n="07">Keep reading</H2>
      <ul className="reading">
        <li>
          <a
            href="https://modelcontextprotocol.io"
            target="_blank"
            rel="noreferrer noopener"
          >
            The MCP specification
          </a>
          <span>where every rule above actually lives</span>
        </li>
        <li>
          <a
            href="https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1865"
            target="_blank"
            rel="noreferrer noopener"
          >
            SEP-1865 · MCP Apps
          </a>
          <span>the sandbox, and which tools an app may request</span>
        </li>
        <li>
          <a
            href="https://modelcontextprotocol.io/development/roadmap"
            target="_blank"
            rel="noreferrer noopener"
          >
            The MCP roadmap
          </a>
          <span>where the boundaries go next</span>
        </li>
      </ul>

      <p className="post-end">fin · thanks for clicking</p>
    </article>
  );
}
