import type { Metadata } from "next";
import { ReadingProgress } from "@/components/site/ReadingProgress";
import { Ambient } from "@/components/article/Ambient";
import { Reveal } from "@/components/article/Reveal";
import { Evidence } from "@/components/article/Evidence";
import { PullQuote } from "@/components/article/PullQuote";
import { Term } from "@/components/article/Term";
import { StatStrip } from "@/components/article/StatStrip";
import {
  ArticleHeader,
  Callout,
  KeyIdea,
  Lede,
  Legend,
  Payload,
  Section,
  Sources,
  TableWrap,
  Toc,
} from "@/components/article/prose";
import { WiringScene } from "@/components/scenes/WiringScene";
import { HandleScene } from "@/components/scenes/HandleScene";
import { RoundTripScene } from "@/components/scenes/RoundTripScene";
import { TaskScene } from "@/components/scenes/TaskScene";
import { EventScene } from "@/components/scenes/EventScene";
import { TripScene } from "@/components/scenes/TripScene";
import { AppsScene } from "@/components/scenes/AppsScene";
import { MentalModelScene } from "@/components/scenes/MentalModelScene";
import { EdgeCounter } from "@/components/widgets/EdgeCounter";
import { Lifecycle } from "@/components/widgets/Lifecycle";
import { Race } from "@/components/widgets/Race";
import { ContextBudget } from "@/components/widgets/ContextBudget";
import { Guardrail } from "@/components/widgets/Guardrail";
import { Composer } from "@/components/widgets/Composer";
import { PayloadInspector } from "@/components/widgets/PayloadInspector";
import { k, s, hot } from "@/components/widgets/payload";

export const metadata: Metadata = {
  title: "Agent-Mediated Composition",
  description:
    "How sessionless MCP, multi round-trip requests, Tasks, and events turn the Model Context Protocol into a set of composable workflow primitives — with the agent as the composer.",
};

const CHANGES = [
  {
    color: "server",
    sep: "July 2026 release",
    title: "Sessionless MCP",
    body: "Protocol sessions and the initialization handshake are gone. State becomes explicit handles the agent carries.",
    icon: <path d="M3 8h10M8 3v10M5 5.2 11 10.8M11 5.2 5 10.8" />,
  },
  {
    color: "model",
    sep: "SEP-2322",
    title: "Multi round-trip requests",
    body: "A request can stop, ask for input, and resume — with every request self-contained.",
    icon: <path d="M2.5 5.5h8.5l-2.5-2.5M13.5 10.5H5l2.5 2.5" />,
  },
  {
    color: "task",
    sep: "SEP-2663",
    title: "Tasks",
    body: "Long-running work becomes a durable state machine with an id, instead of a connection held open.",
    icon: <path d="M8 4.5V8l2.5 1.5M8 14.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13z" />,
  },
  {
    color: "event",
    sep: "Roadmap · Aug 2026",
    title: "Triggers & events",
    body: "Server-initiated channels, subscriptions, webhooks — so agents react instead of polling.",
    icon: <path d="M8 2v2M8 12v2M2 8h2M12 8h2M4 4l1.4 1.4M10.6 10.6 12 12M12 4l-1.4 1.4M5.4 10.6 4 12" />,
  },
];

export default function Article() {
  return (
    <>
      <ReadingProgress />

      <div className="article-hero">
        <Ambient />
        <div className="article-hero-inner">
          <ArticleHeader
            kicker="MCP deep explainer · Nº 01"
            title={
              <>
                Agent-Mediated <em>Composition</em>
              </>
            }
            standfirst={
              <>
                MCP is quietly turning into a set of composable workflow
                primitives — explicit state, resumable calls, durable tasks,
                events. This article steps through what that means, one
                replayable diagram at a time, and why the agent — not the
                servers — ends up holding the workflow.
              </>
            }
            meta={[
              "August 25, 2026",
              "≈ 25 min",
              "16 interactive figures",
              "press play, or drive every figure by hand",
            ]}
          />
        </div>
      </div>

      <article className="article">
        <Reveal>
          <Lede>
            There is no MCP primitive named &ldquo;agent-mediated
            composition,&rdquo; and this article is not going to pretend
            otherwise. What the official roadmap says, as of August 2026, is
            narrower and stranger: MCP now has several different ways to
            represent ongoing work — tasks, subscriptions, progress, triggers —
            and the maintainers are starting a{" "}
            <strong>composition review</strong> so those mechanisms share one
            lifecycle, one cancellation story, one error surface.
          </Lede>
        </Reveal>

        <Reveal>
          <p>
            That phrase is doing a lot of work. When a protocol starts worrying
            about whether its primitives <em>compose</em>, it has stopped being
            a way to call functions and started being a way to build
            workflows. This piece is about the architectural consequence hiding
            in that shift: <strong>the agent becomes the layer that
            assembles independent capabilities into a workflow</strong>, instead
            of servers being wired to each other or holding a hidden shared
            session. Call it agent-mediated composition{" "}
            <Evidence level="inference" /> — a name for a pattern the spec
            changes make almost inevitable.
          </p>
        </Reveal>

        <Callout label="How to read the badges" tone="spec">
          <p>
            For a protocol this young, the difference between shipped and
            speculative matters. Everything below is tagged:{" "}
            <Evidence level="spec" /> is in merged spec or SEP text today,{" "}
            <Evidence level="roadmap" /> is named on the official roadmap as a
            current priority (explicitly not a commitment), and{" "}
            <Evidence level="inference" /> is this article&rsquo;s synthesis.
          </p>
        </Callout>

        <Reveal>
          <KeyIdea>
            Old orchestration hard-codes the workflow into the wires between
            services. The new MCP primitives let the workflow live in the
            agent, assembled at runtime from capabilities that never learn of
            each other&rsquo;s existence.
          </KeyIdea>
        </Reveal>

        <Legend
          items={[
            { role: "agent", label: "agent / host" },
            { role: "server", label: "MCP server" },
            { role: "human", label: "human" },
            { role: "model", label: "model" },
            { role: "task", label: "task" },
            { role: "event", label: "event" },
          ]}
        />

        <Toc
          items={[
            { href: "#sec-wires", label: "The quadratic tax on useful workflows", scene: true },
            { href: "#sec-changes", label: "Four changes arriving at once" },
            { href: "#sec-handles", label: "The agent carries the thread", scene: true },
            { href: "#sec-mrtr", label: "A call that can stop and ask", scene: true },
            { href: "#sec-tasks", label: "Work becomes an object", scene: true },
            { href: "#sec-events", label: "Being told instead of asking", scene: true },
            { href: "#sec-trip", label: "The trip, composed", scene: true },
            { href: "#sec-discovery", label: "Discovering capabilities on demand", scene: true },
            { href: "#sec-apps", label: "Where MCP Apps fit", scene: true },
            { href: "#sec-guardrails", label: "What this must not mean", scene: true },
            { href: "#sec-mental", label: "The mental-model shift", scene: true },
            { href: "#sec-playground", label: "Compose one yourself", scene: true },
            { href: "#sec-sources", label: "The reading list" },
          ]}
        />

        {/* ------------------------------------------------------------- */}

        <Section id="sec-wires" num="01" title="The quadratic tax on useful workflows">
          <p>
            Start with the problem that predates MCP entirely. You have a
            flight service, a hotel service, a calendar, a payment processor, a
            CRM. Every genuinely useful thing you want to do —{" "}
            <em>book the flight, then put it on the calendar, then file the
            expense</em> — spans several of them.
          </p>
          <p>
            The classical answer is to wire them together: the flight system
            grows a calendar integration, the expense tool learns about the
            payment processor. Each of those wires is code someone writes,
            versions, monitors, and gets paged about. Worse, each wire{" "}
            <strong>encodes one workflow, permanently</strong> — the
            integration <em>is</em> the workflow, frozen at development time.
          </p>
        </Section>

        <WiringScene />

        <Reveal>
          <p>
            The count is the least interesting part of the disease, but it is
            the easiest to feel. Drag it yourself:
          </p>
        </Reveal>

        <EdgeCounter />

        <Reveal>
          <p>
            The deep change in Fig.&nbsp;1 is not the edge count — it is the{" "}
            <strong>direction of dependency</strong>. In the mesh, the flight
            server must know the calendar exists. In the star, no provider
            knows anything beyond its own contract. The only participant that
            understands the user&rsquo;s objective is the agent, and it turns
            out the objective was the one piece of knowledge all those wires
            were trying to encode.
          </p>
        </Reveal>

        <PullQuote source="the shift in one sentence">
          Here are independent capabilities — let the agent assemble the
          workflow.
        </PullQuote>

        <Reveal>
          <p>
            For this to be more than a slogan, the protocol has to cooperate.
            An agent can only carry a workflow across servers if state,
            interruptions, long-running work, and notifications all survive
            outside any single connection. That is precisely what the recent
            MCP changes deliver — and why this article exists.
          </p>
        </Reveal>

        {/* ------------------------------------------------------------- */}

        <Section id="sec-changes" num="02" title="Four changes arriving at once">
          <p>
            None of these four changes says &ldquo;composition&rdquo; on the
            tin. Together they are the composition story. The August 22
            roadmap groups the latter three under{" "}
            <strong>Agentic Messaging Primitives</strong>{" "}
            <Evidence level="roadmap" /> and says the goal is to make the
            mechanisms work together.
          </p>
        </Section>

        <div className="change-grid bleed-wide">
          {CHANGES.map((c, i) => (
            <Reveal key={c.title} delay={i * 90}>
              <div
                className="change-card"
                style={{ "--cc": `var(--${c.color})` } as React.CSSProperties}
              >
                <span className="cc-icon">
                  <svg viewBox="0 0 16 16">{c.icon}</svg>
                </span>
                <span className="cc-sep">{c.sep}</span>
                <h3>{c.title}</h3>
                <p>{c.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <TableWrap>
          <table>
            <thead>
              <tr>
                <th>Change</th>
                <th>What it adds</th>
                <th>Why composition cares</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Sessionless MCP</td>
                <td>Removes hidden protocol sessions</td>
                <td>The agent carries explicit state instead</td>
              </tr>
              <tr>
                <td>Multi round-trip requests</td>
                <td>Lets a request stop for input and resume</td>
                <td>The agent mediates human and model input</td>
              </tr>
              <tr>
                <td>Tasks</td>
                <td>Gives long-running work a durable handle</td>
                <td>The agent leaves work running and comes back</td>
              </tr>
              <tr>
                <td>Triggers &amp; events</td>
                <td>Push mechanisms under active design</td>
                <td>The agent reacts instead of polling</td>
              </tr>
            </tbody>
          </table>
        </TableWrap>

        <Reveal>
          <p>
            The rest of this article takes them one at a time — each with a
            figure you can play, scrub, and replay — then puts them back
            together into a single composed workflow.
          </p>
        </Reveal>

        {/* ------------------------------------------------------------- */}

        <Section id="sec-handles" num="03" title="The agent carries the thread">
          <p>
            This is probably the most important piece, and the least flashy.
            Under the old model you could imagine a server holding something
            like <code>session_123 → {"{"} user, basket, current_step {"}"}</code>{" "}
            in memory. Convenient — until the server is three replicas behind a
            load balancer and the next request lands on a machine that has
            never heard of <code>session_123</code>.
          </p>
          <p>
            The July 2026 release removed protocol-level sessions and the
            initialization handshake outright <Evidence level="spec" />.
            SEP-2567 replaces the implicit thread with an explicit design
            pattern: <Term tip="An opaque identifier for a server-side object — a basket, a document, a search — returned by one call and passed into later ones. The state exists; it just stopped hiding inside a connection.">
            state handles</Term>. Instead of <code>add_item(&quot;shoes&quot;)</code>{" "}
            meaning something only on the machine that remembers you, the
            basket becomes an object with a name that any replica can load.
          </p>
        </Section>

        <HandleScene />

        <PayloadInspector
          fig="Fig. 4"
          title="The handle pattern, on the wire"
          accent="server"
          defaultNote="basket"
          tabs={[
            {
              id: "create",
              tab: "1 · create_basket",
              lines: [
                [k("tools/call"), " ", s('"create_basket"'), " ", "→"],
                ["{"],
                ["  ", k('"basket_id"'), ": ", hot('"bsk_a1b2c3"', "basket")],
                ["}"],
              ],
            },
            {
              id: "add",
              tab: "2 · add_item",
              lines: [
                [k("tools/call"), " ", s('"add_item"'), " ", "{"],
                ["  ", k('"basket_id"'), ": ", hot('"bsk_a1b2c3"', "carry"), ","],
                ["  ", k('"sku"'), ": ", s('"shoes"')],
                ["}"],
              ],
            },
            {
              id: "share",
              tab: "3 · hand to a sub-agent",
              lines: [
                [k("spawn"), " ", s("sub_agent_A"), " ", "with", " ", "{"],
                ["  ", k('"basket_id"'), ": ", hot('"bsk_a1b2c3"', "share"), "   ", hot("// shared", "share")],
                ["}"],
                [k("spawn"), " ", s("sub_agent_B"), " ", "with", " ", "{"],
                ["  ", k('"doc_id"'), ": ", hot('"doc_77f0"', "isolate"), "     ", hot("// isolated", "isolate")],
                ["}"],
              ],
            },
          ]}
          notes={[
            {
              id: "basket",
              title: '"bsk_a1b2c3"',
              body: (
                <>
                  The whole trick. The basket exists on the server, but its{" "}
                  <em>identity</em> now travels in payloads instead of living in
                  a connection. Nothing about this request cares which process
                  serves the next one.
                </>
              ),
            },
            {
              id: "carry",
              title: "the agent carries it back",
              body: (
                <>
                  Every later call re-presents the handle. The server needs
                  zero memory of you between requests — which is exactly what
                  lets it scale horizontally without sticky sessions.
                </>
              ),
            },
            {
              id: "share",
              title: "shared on purpose",
              body: (
                <>
                  SEP-2567 is explicit about the consequence: with handles, the
                  orchestrator decides what is shared and what is isolated. Two
                  sub-agents given the same handle collaborate on one object.
                </>
              ),
            },
            {
              id: "isolate",
              title: "isolated on purpose",
              body: (
                <>
                  Give a sub-agent its own handle and it cannot trample anyone
                  else&rsquo;s state. Isolation stops being an accident of
                  which process you hit and becomes a composition decision.
                </>
              ),
            },
          ]}
        />

        <Reveal>
          <p>
            Read that third tab again, because it is the foundation of
            everything that follows: the agent can hold{" "}
            <code>flight_search_id</code>, <code>basket_id</code>,{" "}
            <code>task_id</code>, <code>customer_id</code> — and pass them
            between otherwise independent capabilities. State stopped being
            architecture and became <strong>data the composer routes</strong>{" "}
            <Evidence level="spec" />.
          </p>
        </Reveal>

        {/* ------------------------------------------------------------- */}

        <Section id="sec-mrtr" num="04" title="A call that can stop and ask">
          <p>
            Now make it interactive. Mid-way through{" "}
            <code>book_flight</code>, the server discovers it cannot continue
            without a choice: Economy Flex or Business Saver? In the old world
            it would fire a question back across a persistent connection and
            keep its execution state alive while waiting — ugly at best once
            servers are stateless.
          </p>
          <p>
            SEP-2322 — <Term tip="Multi Round-Trip Requests: a request can return input_required with questions and an opaque requestState; the caller retries with answers attached, and any process can resume the work.">
            multi round-trip requests</Term>{" "}
            <Evidence level="spec" /> — turns the pause into data. The server
            replies <em>I&rsquo;m not finished; here is what I need; here is an
            opaque token that lets any process resume me.</em>
          </p>
        </Section>

        <RoundTripScene />

        <PayloadInspector
          fig="Fig. 6"
          title="input_required, dissected"
          accent="model"
          defaultNote="rt"
          tabs={[
            {
              id: "pause",
              tab: "the pause",
              lines: [
                ["{"],
                ["  ", k('"resultType"'), ": ", hot('"input_required"', "rt"), ","],
                ["  ", k('"inputRequests"'), ": [", hot("{ fare: … }", "iq"), "],"],
                ["  ", k('"requestState"'), ": ", hot('"opaque-state-handle"', "rs")],
                ["}"],
              ],
            },
            {
              id: "resume",
              tab: "the resume",
              lines: [
                [k("tools/call"), " ", s('"book_flight"'), " ", "{"],
                ["  ", k('"inputResponses"'), ": ", hot('{ fare: "economy_flex" }', "ir"), ","],
                ["  ", k('"requestState"'), ": ", hot('"opaque-state-handle"', "rs2")],
                ["}"],
              ],
            },
          ]}
          notes={[
            {
              id: "rt",
              title: '"input_required"',
              body: (
                <>
                  Not an error, not a result — a third kind of outcome. The
                  operation is alive but parked, and the protocol now has a
                  word for that.
                </>
              ),
            },
            {
              id: "iq",
              title: "inputRequests",
              body: (
                <>
                  The server declares <em>what</em> it needs — never{" "}
                  <em>who</em> should answer. That routing decision is the
                  agent&rsquo;s, and it is where the composition becomes
                  genuinely agentic.
                </>
              ),
            },
            {
              id: "rs",
              title: "requestState",
              body: (
                <>
                  The server&rsquo;s own execution context, serialized and
                  handed to the caller. The process that asked the question can
                  die; whichever process receives the resume can carry on.
                </>
              ),
            },
            {
              id: "ir",
              title: "inputResponses",
              body: (
                <>
                  The answers, gathered however the agent saw fit — a human
                  dialog, a model sample, a policy lookup. The server never
                  learns which.
                </>
              ),
            },
            {
              id: "rs2",
              title: "requestState, returned",
              body: (
                <>
                  SEP-2322&rsquo;s stated objective: each request is
                  processable using only what is inside it. This token is what
                  makes the second request self-contained.
                </>
              ),
            },
          ]}
        />

        <Reveal>
          <p>
            The middle box of Fig.&nbsp;5 deserves a second look. The server
            says <em>what it needs</em>; the agent decides <em>how the
            requirement gets satisfied</em> — elicit the human, sample the
            model, consult policy. A price confirmation should reach a person;
            a formatting choice should not. That judgment lives in exactly one
            place, and it is not the flight server.
          </p>
        </Reveal>

        {/* ------------------------------------------------------------- */}

        <Section id="sec-tasks" num="05" title="Work becomes an object">
          <p>
            The next problem is time. <code>analyze_entire_repository()</code>{" "}
            takes twenty minutes; holding an HTTP request open for twenty
            minutes is how you collect timeouts, duplicate retries, and a
            blocked agent. SEP-2663 — the{" "}
            <Term tip="A durable, addressable state machine representing long-running work: created from a normal call, queried with tasks/get, cancellable with tasks/cancel, able to pause on input_required.">
            Tasks extension</Term>{" "}
            <Evidence level="spec" /> — lets the server answer immediately with
            something better than a result: a promise with a name.
          </p>
        </Section>

        <Payload title="the immediate reply" role="task">
{`{
  `}<b>{`"resultType"`}</b>{`: `}<u>{`"task"`}</u>{`,
  `}<b>{`"taskId"`}</b>{`: `}<u>{`"786512…"`}</u>{`,
  `}<b>{`"status"`}</b>{`: `}<u>{`"working"`}</u>{`
}`}<i>{`   // the work just became an object`}</i>
        </Payload>

        <TaskScene />

        <Reveal>
          <p>
            SEP-2663 describes tasks as <strong>durable state machines</strong>{" "}
            and gives them a real API — <code>tasks/get</code>,{" "}
            <code>tasks/update</code>, <code>tasks/cancel</code>{" "}
            <Evidence level="spec" />. The states are few and they matter.
            Drive the machine yourself:
          </p>
        </Reveal>

        <Lifecycle />

        <Reveal>
          <p>
            Notice <code>input_required</code> sitting inside the task
            lifecycle — the same primitive from §04, now available to work
            that has been running for ten minutes. The two SEPs interlock: a
            paused call and a paused task ask for input the same way, and the
            agent routes both.
          </p>
          <p>
            What does all this buy? Wall-clock time, mostly — and the freedom
            for one agent to hold many concurrent strands. Race the two
            versions of the same afternoon:
          </p>
        </Reveal>

        <Race />

        {/* ------------------------------------------------------------- */}

        <Section id="sec-events" num="06" title="Being told instead of asking">
          <p>
            Tasks create an obvious follow-up problem. If the only way to
            learn a task finished is <code>tasks/get</code>, the agent becomes
            a metronome of wasted requests — and the same is true for resource
            subscriptions and external triggers.
          </p>
        </Section>

        <EventScene />

        <Reveal>
          <p>
            This is the least settled layer of the stack{" "}
            <Evidence level="roadmap" />. The August roadmap calls out
            server-initiated events — channels, subscriptions, webhooks — so
            clients need not rely exclusively on polling, and it is candid
            about why the composition review exists: these mechanisms emerged
            from different corners of the ecosystem and risk incompatible
            lifecycle, cancellation, and error semantics. The maintainers&rsquo;
            phrase for the goal is exactly four words:{" "}
            <strong>&ldquo;We want them to compose.&rdquo;</strong>
          </p>
        </Reveal>

        <Callout label="Why this closes the loop" tone="note">
          <p>
            Every earlier primitive produces things worth being told about — a
            task completing, a paused call unblocking, a subscribed resource
            changing. Events are what let the agent treat those as{" "}
            <em>moments to react to</em> rather than states to fish for. Without
            them, composition across time works but wastes the clock; with
            them, the agent becomes genuinely event-driven.
          </p>
        </Callout>

        {/* ------------------------------------------------------------- */}

        <Section id="sec-trip" num="07" title="The trip, composed">
          <p>
            Time to put all four pieces back together. The request is one
            sentence: <em>&ldquo;Find me a good flight to Paris, book it after
            I approve the price, reserve a hotel, and put everything on my
            calendar.&rdquo;</em> No single server implements any of that. Watch
            what does — and doesn&rsquo;t — happen:
          </p>
        </Section>

        <TripScene />

        <StatStrip
          stats={[
            { value: 3, label: "independent servers touched", color: "server" },
            { value: 1, label: "human approval, routed to the right decider", color: "human" },
            { value: 1, label: "durable task awaited without blocking", color: "task" },
            { value: 0, label: "server-to-server integrations built, ever", color: "danger" },
          ]}
        />

        <Reveal>
          <p>
            The last step of Fig.&nbsp;11 is the entire argument. The
            calendar event contains the flight&rsquo;s arrival time — a fact
            that travelled from the flight server to the calendar server{" "}
            <strong>through the agent</strong>, as a value in a payload. In the
            old world that fact travels through a Flight→Calendar integration
            someone had to build. Here, that wire never existed, and next week
            the same three servers can be composed into an entirely different
            workflow without anyone touching them.
          </p>
        </Reveal>

        <PullQuote source="the deeper significance">
          The workflow graph no longer has to be fully determined at
          development time.
        </PullQuote>

        {/* ------------------------------------------------------------- */}

        <Section id="sec-discovery" num="08" title="Discovering capabilities on demand">
          <p>
            There is a scaling problem hiding in &ldquo;the agent knows the
            capabilities.&rdquo; Knows <em>how</em>? A serious deployment can
            expose hundreds of tools, and feeding every definition to a model
            up front is expensive — the roadmap notes it can actively degrade
            tool selection <Evidence level="roadmap" />. The answer under
            design is{" "}
            <Term tip="A roadmap effort letting clients learn tools and resources as needed — search or expand the catalogue progressively — instead of ingesting everything at initialization.">
            progressive discovery</Term>: learn the catalogue the way the plan
            needs it.
          </p>
        </Section>

        <ContextBudget />

        <Reveal>
          <p>
            Put progressive discovery next to handles and the composition
            picture sharpens into something almost self-building: the agent
            discovers <em>which capabilities are relevant</em>, goes deeper
            only where the plan leads, creates state, pauses for humans, waits
            on tasks, reacts to events. It is not merely selecting a function —
            it is progressively constructing its own capability graph{" "}
            <Evidence level="inference" />.
          </p>
        </Reveal>

        {/* ------------------------------------------------------------- */}

        <Section id="sec-apps" num="09" title="Where MCP Apps fit">
          <p>
            One more participant belongs in the picture. The MCP Apps draft
            (SEP-1865) lets a tool result carry a declared, sandboxed UI that
            the host renders <Evidence level="spec" /> — and it distinguishes
            which tools are visible to the <em>model</em>, which to the{" "}
            <em>app</em>, and routes every app interaction through the host.
          </p>
        </Section>

        <AppsScene />

        <Reveal>
          <p>
            The interesting part for composition is the taxonomy of deciders it
            completes. Some decisions belong to the model (which capability
            next), some to deterministic software (seat maps, date pickers,
            validation), some to the human (spending money). MCP Apps gives the
            middle category a first-class home, and the host becomes the
            policy boundary between all three.
          </p>
        </Reveal>

        {/* ------------------------------------------------------------- */}

        <Section id="sec-guardrails" num="10" title="What this must not mean">
          <p>
            A necessary cold shower. Agent-mediated composition does{" "}
            <strong>not</strong> mean handing a model unrestricted access to
            every tool and hoping. Composition decides{" "}
            <em>which operation comes next</em>; it does not repeal the
            correctness guarantees of the systems underneath. A serious
            deployment still runs every mutation through deterministic
            machinery:
          </p>
        </Section>

        <Guardrail />

        <Reveal>
          <p>
            Nothing in the new primitives weakens this — if anything they
            strengthen it, because explicit handles and pauses give the
            deterministic layers cleaner places to attach. An{" "}
            <code>input_required</code> is a natural approval checkpoint; a
            handle is a natural unit for authorization; a task is a natural
            unit for audit. The guardrails and the composition are not in
            tension. They are the same architecture, seen from two sides{" "}
            <Evidence level="inference" />.
          </p>
        </Reveal>

        {/* ------------------------------------------------------------- */}

        <Section id="sec-mental" num="11" title="The mental-model shift">
          <p>
            If you have followed every figure to here, the summary almost
            draws itself. The first mental model of MCP was a straight line.
            The new one is a loop with three kinds of voice feeding it, three
            futures for every call, and no hidden distributed session anywhere.
          </p>
        </Section>

        <MentalModelScene />

        <PullQuote source="where this lands">
          From tool invocation to agent-composed distributed workflows —
          without putting an implicit session back into the protocol.
        </PullQuote>

        {/* ------------------------------------------------------------- */}

        <Section id="sec-playground" num="12" title="Compose one yourself">
          <p>
            Reading about composition is one thing. Here are three servers and
            eight capabilities — build the plan, run it, and watch the trace
            speak the protocol this article just taught you. The preset called{" "}
            <em>the broken order</em> is worth your time: it fails exactly the
            way a real sessionless composition fails, and the error message is
            the whole lesson of §03 in one line.
          </p>
        </Section>

        <Composer />

        {/* ------------------------------------------------------------- */}

        <Section id="sec-sources" num="13" title="The reading list">
          <p>
            Six documents, in the order that makes the idea click. Everything
            in this article traces back to them.
          </p>
        </Section>

        <Sources
          items={[
            {
              title: "MCP Roadmap — August 22, 2026",
              note: "The clearest statement of direction: Agentic Messaging Primitives, the composition review, progressive discovery, agent identity. Explicitly priorities, not commitments.",
              href: "https://modelcontextprotocol.io/development/roadmap",
            },
            {
              title: "“The New MCP Roadmap” (official blog)",
              note: "The narrative connecting the July stateless release to Tasks, MRTR, events, and the composition work.",
              href: "https://blog.modelcontextprotocol.io",
            },
            {
              title: "SEP-2567 — Sessionless MCP via explicit state handles",
              note: "The most architecturally important document: state as addressable handles, and orchestrators choosing what is shared versus isolated between sub-agents.",
              href: "https://github.com/modelcontextprotocol/modelcontextprotocol/issues/2567",
            },
            {
              title: "SEP-2322 — Multi round-trip requests",
              note: "input_required, inputRequests / inputResponses, opaque requestState — pausing an operation without preserving an in-memory server session.",
              href: "https://github.com/modelcontextprotocol/modelcontextprotocol/issues/2322",
            },
            {
              title: "SEP-2663 — Tasks",
              note: "Durable async execution: taskId, the working / input_required / completed / failed / cancelled machine, and tasks/get, tasks/update, tasks/cancel.",
              href: "https://github.com/modelcontextprotocol/modelcontextprotocol/issues/2663",
            },
            {
              title: "SEP-1865 — MCP Apps",
              note: "Sandboxed interactive UI inside tool results; model-visible versus app-visible tools; host-mediated communication.",
              href: "https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1865",
            },
          ]}
        />

        <Callout label="Honesty footer" tone="caution">
          <p>
            &ldquo;Agent-mediated composition&rdquo; is this article&rsquo;s
            synthesis, not a normative MCP term — the normative language is
            that maintainers are beginning a <em>composition review</em> across
            Tasks, triggers, transports, subscriptions, and progress. The
            roadmap warns that priorities can shift; if the spec moves, this
            page should too.{" "}
            <a
              href="https://github.com/reachjalil/mcpExplained/issues"
              target="_blank"
              rel="noreferrer noopener"
            >
              File an issue
            </a>{" "}
            when it does.
          </p>
        </Callout>

        <Callout label="Watch this space" tone="aside">
          <p>
            The combination to track: SEP-2567&rsquo;s explicit handles,
            progressive discovery, and the composition review. Together they
            point at agents that discover capabilities on demand, create and
            route state objects, pause for people, wait on tasks, react to
            events — and dynamically assemble cross-server workflows no one
            wrote down in advance. That is a much bigger idea than
            &ldquo;LLMs can call tools.&rdquo;
          </p>
        </Callout>
      </article>
    </>
  );
}
