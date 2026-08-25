import type { Metadata } from "next";
import { InView } from "@/components/ui/InView";
import { G } from "@/components/ui/Glyph";
import { WireBlock } from "@/components/ui/WireBlock";
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
          <span>10 min</span>
          <span>5 machines</span>
          <span>you&apos;ll be doing the clicking</span>
        </div>
      </header>

      <p>
        There are four characters in this story. You. An{" "}
        <G k="agent">agent</G> working on your behalf; MCP&apos;s spec calls it
        the host, and it is the only character that holds connections. Some{" "}
        <G k="server">servers</G>, one per capability: weather, flights, a
        calendar. And sometimes an <G k="app">app</G>, a scrap of UI a server
        ships to your screen. A fifth thing hides inside the agent and never
        touches the wire at all: the model. It only ever writes text. Keep
        that one in mind.
      </p>
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
        <G k="agent">agent</G> holds a connection to a <G k="server">server</G>.
        The agent sends a <G k="request">request</G>; the server answers with
        a <G k="result">result</G>. Nobody else is on the wire.
      </p>
      <DirectCall />
      <p>
        That&apos;s the entire protocol: request out, result back. The line
        itself is ordinary JSON-RPC. The agent opens the session, asks{" "}
        <code>tools/list</code> to learn what the server can do, then calls
        tools by name. When the machine above ran, the traffic looked like
        this:
      </p>
      <WireBlock label="on the wire · one round trip">
        <b>→ agent to weather</b>{"\n"}
        {`{
  "jsonrpc": "2.0", "id": 7,
  "method": "tools/call",
  "params": {
    "name": "get_forecast",
    "arguments": { "city": "Lisbon" }
  }
}`}
        {"\n\n"}
        <b>← weather to agent</b>{"\n"}
        {`{
  "jsonrpc": "2.0", "id": 7,
  "result": {
    "content": [
      { "type": "text", "text": "sunny · 22°" }
    ]
  }
}`}
      </WireBlock>
      <p>
        The spec&apos;s own vocabulary is a little stricter than mine. The
        agent application is the <strong>host</strong>, and inside it runs one{" "}
        <strong>client</strong> per server; a connection is always one client
        talking to one server. Five servers means five clients, all in the
        same host, none aware of each other. Everything else in MCP is about
        what happens when this one line isn&apos;t enough.
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
        The reason is not tidiness. A server is code you trusted with one
        job, written by someone you have never met. If flights could reach
        the calendar, then whoever compromises flights inherits your calendar
        too, and a poisoned tool description becomes a burglary kit.
        MCP&apos;s answer is topology instead of vigilance: the call fails
        because the wire does not exist, and no amount of clever prompting
        invents a wire.
      </p>
      <p>
        It also kills a quieter tax. Five servers that could all call each
        other would be ten integrations somebody maintains. Five servers that
        can&apos;t is five.
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
      <p>
        Here is what the machine hides: who decided to make the second call?
        The model did. The host handed it your goal and the flight result,
        the model wrote &quot;add 14:05 to the calendar&quot; as text, and the
        host turned that text into a real call. The result goes back into the
        model&apos;s context, the model reads it, and decides what happens
        next. That loop is the entire trick behind the word{" "}
        <strong>agentic</strong>.
      </p>
      <p>
        The loop has a price. Every fact that crosses between servers rides
        through the model&apos;s context window, so the middle is not free: a
        two-line arrival time travels well, a forty-megabyte spreadsheet does
        not. The protocol&apos;s newer answer, passing IDs around instead of
        payloads, gets its own essay later.
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
      <p>
        Mechanically the sandbox is boring, which is the point. The app is an
        iframe with no network. Its clicks become messages to the host, the
        host checks the tool against the declared list, and only then does a
        real client make a real call. The app never holds a token, a URL, or
        a connection. Give it <code>fetch</code> and you have handed the
        server a browser inside your session. Refuse, and the worst a
        malicious app can do is ask.
      </p>
      <p>
        The declared list holds more than proxy permissions, because a tool
        picks its audience: the model, the app, or both. The seat map calls{" "}
        <code>get_seat_availability</code> every time you hover a row; the
        model never needs that tool, so it never sees it. The tool that
        opened the seat map in the first place belongs to the model, and the
        app can&apos;t call it. Same server, two audiences, one host
        enforcing both lists.
      </p>
      <p>
        Traffic also flows the other way, into the conversation. What you do
        inside the app doesn&apos;t stay there. When the app&apos;s call
        comes back, the host writes the result into the model&apos;s context;
        that is the note under the machine above, and it changed before the
        app&apos;s display did. Refresh again and watch the order. Without
        that line the model would keep quoting a price you refreshed away
        two clicks ago. It is the same context window from section 03, fed
        from a second direction.
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
      <H2 n="05">The wire runs both ways</H2>
      <p>
        So far every request started on the left. The protocol is more
        symmetric than that, and this is the part most explainers skip. A
        server can ask the agent to run the model for it; the spec calls this{" "}
        <strong>sampling</strong>. Summarize this diff. Pick the likelier
        duplicate. The server never sees the model and never holds an API
        key. It files a request, and the host decides whether the model
        answers and what the server gets back.
      </p>
      <p>
        A server can also ask <strong>you</strong> a question; the spec calls
        that <strong>elicitation</strong>. Which of these three flights did
        you mean? The question arrives on the same wire its results do and
        lands in the agent&apos;s UI, not in some popup the server owns.
      </p>
      <p>
        Both features would be alarming as direct lines. As hops through the
        middle they are just more traffic, subject to the same veto as
        everything else.
      </p>

      {/* ----------------------------------------------------------------- */}
      <H2 n="06">You are a boundary too</H2>
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
      <p>
        Approval is not a courtesy dialog bolted on top. It is the same
        mechanism as every other boundary in this article: a hop the agent
        refuses to make until someone with authority says yes. The authority
        happens to be you.
      </p>

      {/* ----------------------------------------------------------------- */}
      <H2 n="07">The map</H2>
      <p>Each section above wrote a rule. Here they are together.</p>
      <BoundaryMap />
      <p>
        Memorize the table and you&apos;ve memorized the architecture. One
        process holds the connections. Servers, apps, even the model all go
        through it. <strong>That one rule is most of MCP.</strong>
      </p>

      {/* ----------------------------------------------------------------- */}
      <H2 n="08">What this costs</H2>
      <p>
        Fairness requires the other column. A single mandatory middle is a
        bottleneck: every byte pays the toll, every hop adds latency, and the
        agent sees everything, which makes it the one component you must
        trust completely. Centralizing access also centralizes failure; when
        the host is down, all of it is down.
      </p>
      <p>
        MCP takes that trade with open eyes. One place to log, one place to
        revoke, one place to say no. Distributed trust sounds nicer until you
        try to audit it.
      </p>

      {/* ----------------------------------------------------------------- */}
      <H2 n="09">Keep reading</H2>
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
            href="https://modelcontextprotocol.io/docs/concepts/sampling"
            target="_blank"
            rel="noreferrer noopener"
          >
            Sampling
          </a>
          <span>the server-asks-the-model flow from section 05</span>
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
