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
    "MCP is a story about access: apps that have to ask, servers that stay strangers, and one agent holding all the keys. Five little machines explain the boundaries.",
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
          MCP looks complicated until you ask one question of it:{" "}
          <strong>who holds access?</strong> Five little machines, one answer.
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
        Almost everything confusing about the protocol untangles if you track a
        single thing: <strong>who is allowed to talk to whom</strong>. The
        machines below are that question, one boundary at a time — and to show
        you, I&apos;m going to need your help.
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
        <G k="agent">agent</G> is connected to a <G k="server">server</G>. The
        agent sends a <G k="request">request</G>; the server answers with a{" "}
        <G k="result">result</G>. Nobody else is on the wire.
      </p>
      <DirectCall />
      <p>
        That&apos;s the entire protocol in one breath: request out, result
        back. Everything else in MCP is about what happens when this one line
        isn&apos;t enough.
      </p>

      {/* ----------------------------------------------------------------- */}
      <H2 n="02">Servers are strangers</H2>
      <p>
        Add a second server and the temptation arrives: surely{" "}
        <strong>flights</strong> should just tell the <strong>calendar</strong>{" "}
        about your trip? Click and see.
      </p>
      <ServerWall />
      <p>
        There is no wire between servers. Not a slow one, not a hidden one —
        none. Flights cannot call the calendar, and it never learns the
        calendar exists. Each server knows its own job and nothing else.
      </p>
      <p>
        That sounds like a limitation. It&apos;s the design. A server that
        can&apos;t reach other servers is a server nobody has to firewall,
        audit, or distrust on behalf of the others.
      </p>

      {/* ----------------------------------------------------------------- */}
      <H2 n="03">Facts travel through the middle</H2>
      <p>
        So how does the arrival time get to the calendar? It rides through the{" "}
        <G k="agent">agent</G>. The agent asks flights, gets{" "}
        <code>14:05</code> back, and — because it holds a connection to the
        calendar too — hands it over.
      </p>
      <TwoHops />
      <p>
        Try the toggle. With the agent gone, the fact is stranded: there is
        simply no path from one server to the other. The workflow doesn&apos;t
        live in the servers and it isn&apos;t wired between them.{" "}
        <strong>It exists only in the middle.</strong>
      </p>

      {/* ----------------------------------------------------------------- */}
      <H2 n="04">Apps have to ask</H2>
      <p>
        Now the character this article was written for. A server can ship UI
        to your screen — a seat map, a price ticker. That <G k="app">app</G>{" "}
        runs in a sandbox, and here is the part people miss:{" "}
        <strong>the app has no connection to its own server.</strong> It
        can&apos;t fetch. It can&apos;t call home. When it needs data, it asks
        the agent — and the agent decides.
      </p>
      <AppAsks />
      <p>
        The permission you flipped is real. An app declares which tools it
        wants to call, and the host enforces the list — the same click, the
        same app, the same server, and the only thing that changed is what the
        middle allows.
      </p>
      <aside className="note">
        <span className="note-k">fine print</span>
        The app rules come from the MCP Apps draft (SEP-1865); everything else
        on this page is core MCP. Drafts move — if this paragraph goes stale,{" "}
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
        crossed the line, because waiting for you is a first-class state — not
        a failure.
      </p>

      {/* ----------------------------------------------------------------- */}
      <H2 n="06">The map</H2>
      <p>Each machine writes a rule. Here they are together.</p>
      <BoundaryMap />
      <p>
        Memorize the table and you&apos;ve memorized the architecture: one
        process holds the connections, and everyone else — servers, apps, even
        the model — goes through it. <strong>Access is the architecture.</strong>
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
          <span>the source of truth for everything the agent and servers do</span>
        </li>
        <li>
          <a
            href="https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1865"
            target="_blank"
            rel="noreferrer noopener"
          >
            SEP-1865 — MCP Apps
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

      <p className="post-end">fin — thanks for clicking</p>
    </article>
  );
}
