import type { Metadata } from "next";
import Link from "next/link";
import { WireBlock } from "@/components/ui/WireBlock";
import { GCard, GFacts, GWide } from "@/components/guide/shared";
import { HandshakeDemo } from "@/components/guide/HandshakeDemo";
import { ToolsDemo } from "@/components/guide/ToolsDemo";
import { ResourcesDemo } from "@/components/guide/ResourcesDemo";
import { PromptsDemo } from "@/components/guide/PromptsDemo";
import { SamplingDemo } from "@/components/guide/SamplingDemo";
import { ElicitationDemo } from "@/components/guide/ElicitationDemo";
import { RootsDemo } from "@/components/guide/RootsDemo";
import { ProgressDemo } from "@/components/guide/ProgressDemo";

export const metadata: Metadata = {
  title: "A guide to MCP",
  description:
    "Every MCP concept, split the way the protocol is split: server on one side, agent on the other. Methods, facts, spec links, and a runnable demo for each.",
};

const SPEC = "https://modelcontextprotocol.io";

function Toc() {
  return (
    <nav className="gtoc" aria-label="Guide contents">
      <p className="gtoc-k">basics</p>
      <a href="#g-terms">who&apos;s who</a>
      <a href="#g-basics">the session</a>
      <p className="gtoc-k">
        <i data-g="server" aria-hidden="true" /> the server
      </p>
      <a href="#g-tools">tools</a>
      <a href="#g-resources">resources</a>
      <a href="#g-prompts">prompts</a>
      <p className="gtoc-k">
        <i data-g="host" aria-hidden="true" /> the agent
      </p>
      <a href="#g-sampling">sampling</a>
      <a href="#g-elicitation">elicitation</a>
      <a href="#g-roots">roots</a>
      <p className="gtoc-k">plumbing</p>
      <a href="#g-progress">progress · cancellation</a>
      <a href="#g-transports">transports</a>
      <p className="gtoc-k">meta</p>
      <a href="#g-status">what is stable</a>
      <a href="#g-refs">references</a>
    </nav>
  );
}

const JUMPS: Array<[string, string]> = [
  ["#g-terms", "who's who"],
  ["#g-basics", "session"],
  ["#g-tools", "tools"],
  ["#g-resources", "resources"],
  ["#g-prompts", "prompts"],
  ["#g-sampling", "sampling"],
  ["#g-elicitation", "elicitation"],
  ["#g-roots", "roots"],
  ["#g-progress", "progress"],
  ["#g-transports", "transports"],
];

export default function Guide() {
  return (
    <div className="guide">
      <Toc />
      <article className="post gpost">
        <header className="gheader">
          <span className="gkicker">
            <i aria-hidden="true" />
            the reference
          </span>
          <h1>A guide to MCP</h1>
          <p className="stand">
            What each piece is, who calls it, and a demo you can run.
          </p>
          <div className="post-meta">
            <span>updated august 25, 2026</span>
            <span>spec 2025-06-18</span>
            <span>8 runnable figures</span>
          </div>
        </header>

        <p className="gjump" aria-label="Jump to a concept">
          {JUMPS.map(([href, label]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </p>

        <p className="gcast" aria-label="How to read the figures">
          <span>
            <i data-g="host" aria-hidden="true" /> agent · host
          </span>
          <span>
            <i data-g="server" aria-hidden="true" /> server
          </span>
          <span>
            <i className="c-req" aria-hidden="true" /> request
          </span>
          <span>
            <i className="c-res" aria-hidden="true" /> result
          </span>
          <span>every figure runs · click things</span>
        </p>

        {/* ------------------------------------------------------------- */}
        <GWide id="g-terms" title="Who&apos;s who">
          <p className="gwhat">
            Five words the rest of this page leans on. The confusing one is{" "}
            <strong>host</strong>: it is simply the spec&apos;s formal name
            for the agent application itself.
          </p>
          <GFacts
            items={[
              {
                k: "agent · host",
                v: (
                  <>
                    the AI application you talk to: a chat app, an IDE, Claude.
                    The spec says <b>host</b>; this page mostly says{" "}
                    <b>agent</b>. Same thing.
                  </>
                ),
              },
              {
                k: "client",
                v: (
                  <>
                    a small piece <em>inside</em> the host that holds one
                    connection to one server. Five servers, five clients, one
                    host.
                  </>
                ),
              },
              {
                k: "server",
                v: (
                  <>
                    the capability being plugged in: files, flights, a
                    calendar. One job each, no knowledge of the others.
                  </>
                ),
              },
              {
                k: "model",
                v: (
                  <>
                    the LLM inside the host. It only writes text; the host
                    turns that text into real calls.
                  </>
                ),
              },
              {
                k: "you",
                v: <>the person. Some hops park until you click.</>,
              },
            ]}
          />
        </GWide>

        {/* ------------------------------------------------------------- */}
        <GWide id="g-basics" title="The session">
          <p className="gwhat">
            A session is the live connection between an agent and one server.
            Opening it is a handshake: each side lists what it can do, and
            that exchange defines everything allowed afterwards. Click{" "}
            <strong>connect</strong> to watch one open.
          </p>
          <p className="mchips">
            <code>initialize</code>
            <code>notifications/initialized</code>
          </p>
          <GFacts
            items={[
              { k: "opens with", v: <><code>initialize</code>: protocol version and capabilities, both directions</> },
              { k: "the rule", v: <>use nothing the other side didn&apos;t declare</> },
              { k: "shape", v: <>one session · one client · one server</> },
            ]}
          />
          <div className="gsession">
            <HandshakeDemo />
            <WireBlock label="on the wire · the handshake, trimmed">
            <b>→ initialize</b>{"\n"}
            {`{ "method": "initialize",
  "params": {
    "protocolVersion": "2025-06-18",
    "capabilities": { "sampling": {}, "elicitation": {}, "roots": {} },
    "clientInfo": { "name": "my-host", "version": "1.0" }
  } }`}
            {"\n\n"}
            <b>← result</b>{"\n"}
            {`{ "result": {
    "protocolVersion": "2025-06-18",
    "capabilities": { "tools": {}, "resources": { "subscribe": true }, "prompts": {} },
    "serverInfo": { "name": "notes", "version": "2.1" }
  } }`}
            </WireBlock>
          </div>
          <p className="specref">
            <b>spec</b>
            <a href={`${SPEC}/specification/2025-06-18`} target="_blank" rel="noreferrer noopener">
              specification · 2025-06-18
            </a>
            <span>JSON-RPC 2.0 underneath, always</span>
          </p>
        </GWide>

        {/* ------------------------------------------------------------- */}
        <div className="gcols">
          <div className="gcol">
            <h2 className="gcol-h" id="g-server-side">
              <i data-g="server" aria-hidden="true" />
              the server
              <span>the capability you plug in</span>
            </h2>

            <GCard
              id="g-tools"
              side="server"
              title="Tools"
              methods={["tools/list", "tools/call", "…/list_changed"]}
              what={
                <>
                  Tools are how a server lets the agent <em>do</em> things:
                  search files, send an email, book a flight. The model decides
                  a tool is needed, the host makes the call, and the result
                  lands back in the conversation.
                </>
              }
              facts={[
                { k: "is", v: <>a function with a name and a JSON schema for its arguments</> },
                { k: "called by", v: <>the model; the host executes</> },
                { k: "effects", v: <>yes, they live here; approvals apply here first</> },
                { k: "discover", v: <><code>tools/list</code> is the whole universe; <code>list_changed</code> announces edits</> },
              ]}
              spec={`${SPEC}/docs/concepts/tools`}
              specLabel="concepts · tools"
            >
              <ToolsDemo />
            </GCard>

            <GCard
              id="g-resources"
              side="server"
              title="Resources"
              methods={["resources/list", "resources/read", "resources/subscribe"]}
              what={
                <>
                  Resources are how a server shares things to <em>read</em>:
                  files, tables, logs. Reading one changes nothing, which is
                  why the host can pull them into context freely. Subscribing
                  keeps your copy honest when the original moves on.
                </>
              }
              facts={[
                { k: "is", v: <>content behind a URI: a file, a table, a log</> },
                { k: "chosen by", v: <>the host or the person, never the model</> },
                { k: "effects", v: <>none, by definition; reading is always safe</> },
                { k: "fresh", v: <>subscribe → <code>updated</code> → read again</> },
              ]}
              spec={`${SPEC}/docs/concepts/resources`}
              specLabel="concepts · resources"
            >
              <ResourcesDemo />
            </GCard>

            <GCard
              id="g-prompts"
              side="server"
              title="Prompts"
              methods={["prompts/list", "prompts/get"]}
              what={
                <>
                  Prompts are canned requests a server offers the person:
                  pick one, the server fills in the details, and a
                  ready-to-send message appears. Think slash commands.
                </>
              }
              facts={[
                { k: "is", v: <>a named template the server fills into ready messages</> },
                { k: "invoked by", v: <>the person; slash-command material</> },
                { k: "returns", v: <>messages with roles, not prose</> },
                { k: "note", v: <>the model picks tools, never prompts</> },
              ]}
              spec={`${SPEC}/docs/concepts/prompts`}
              specLabel="concepts · prompts"
            >
              <PromptsDemo />
            </GCard>
          </div>

          <div className="gcol">
            <h2 className="gcol-h" id="g-agent-side">
              <i data-g="host" aria-hidden="true" />
              the agent
              <span>the host that runs them</span>
            </h2>

            <GCard
              id="g-sampling"
              side="agent"
              title="Sampling"
              methods={["sampling/createMessage"]}
              what={
                <>
                  Sampling lets a server borrow the agent&apos;s model for its
                  own thinking: summarize this, classify that. The server
                  hands over a question and gets an answer; it never touches
                  the keys or your conversation.
                </>
              }
              facts={[
                { k: "is", v: <>the server borrowing the model, through the host</> },
                { k: "hidden", v: <>keys, model choice, your other context</> },
                { k: "host may", v: <>edit, refuse, or put it in front of you</> },
                { k: "shape", v: <>one request in, one completion back</> },
              ]}
              spec={`${SPEC}/docs/concepts/sampling`}
              specLabel="concepts · sampling"
            >
              <SamplingDemo />
            </GCard>

            <GCard
              id="g-elicitation"
              side="agent"
              title="Elicitation"
              methods={["elicitation/create"]}
              what={
                <>
                  Sometimes a server needs the person to decide something mid
                  job: which flight, which folder. Elicitation is that
                  question, asked through the agent&apos;s own UI and answered
                  with a click.
                </>
              }
              facts={[
                { k: "is", v: <>the server asking the person a question</> },
                { k: "rendered by", v: <>the host&apos;s UI; server screens never cross</> },
                { k: "answer", v: <>schema-validated; declining is a valid outcome</> },
              ]}
              spec={`${SPEC}/docs/concepts/elicitation`}
              specLabel="concepts · elicitation"
            >
              <ElicitationDemo />
            </GCard>

            <GCard
              id="g-roots"
              side="agent"
              title="Roots"
              methods={["roots/list", "…/list_changed"]}
              what={
                <>
                  Roots are how the agent tells a server where it is welcome
                  to work: these folders, this repo. A courtesy boundary the
                  server should respect, not a lock.
                </>
              }
              facts={[
                { k: "is", v: <>the host declaring where a server should operate</> },
                { k: "power", v: <>scoping, not enforcement; locks stay with the files</> },
                { k: "change", v: <>any time; a notification announces the new world</> },
              ]}
              spec={`${SPEC}/docs/concepts/roots`}
              specLabel="concepts · roots"
            >
              <RootsDemo />
            </GCard>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        <div className="gmeta2">
          <GWide id="g-progress" title="Progress · cancellation">
            <p className="gwhat">
              Long jobs shouldn&apos;t go silent. Progress ticks in while the
              work runs, and a cancellation tells the other side to stop.
              Neither ever gets a reply.
            </p>
            <p className="mchips">
              <code>notifications/progress</code>
              <code>notifications/cancelled</code>
            </p>
            <GFacts
              items={[
                { k: "tick", v: <>progress streams against a request&apos;s token</> },
                { k: "stop", v: <><code>cancelled</code> says stop caring; best effort</> },
                { k: "nature", v: <>notifications, both directions; no reply ever</> },
              ]}
            />
            <ProgressDemo />
            <p className="specref">
              <b>spec</b>
              <a href={`${SPEC}/specification/2025-06-18/basic/utilities/progress`} target="_blank" rel="noreferrer noopener">
                utilities · progress
              </a>
            </p>
          </GWide>

          <GWide id="g-transports" title="Transports">
            <p className="gwhat">
              The same messages can travel two ways: stdio when the agent
              starts the server on your machine, Streamable HTTP when the
              server lives somewhere else.
            </p>
            <p className="mchips">
              <code>stdio</code>
              <code>Streamable HTTP</code>
            </p>
            <GFacts
              items={[
                { k: "stdio", v: <>the host spawns the server locally; private, fast, no network</> },
                { k: "http", v: <>remote; POSTs up, optional SSE stream back down</> },
                { k: "same", v: <>identical JSON-RPC either way; sessions live at this layer</> },
              ]}
            />
            <p className="specref">
              <b>spec</b>
              <a href={`${SPEC}/docs/concepts/transports`} target="_blank" rel="noreferrer noopener">
                concepts · transports
              </a>
            </p>

            <h2 className="gwide-sub" id="g-status">
              What is stable
            </h2>
            <GFacts
              items={[
                { k: "stable", v: <>everything above · spec 2025-06-18</> },
                { k: "draft", v: <>MCP Apps (SEP-1865): sandboxed UI, app-visible tools</> },
                { k: "draft", v: <>Tasks (SEP-2663): durable handles for long work</> },
                { k: "policy", v: <>when the roadmap moves, this page gets edited</> },
              ]}
            />
          </GWide>
        </div>

        {/* ------------------------------------------------------------- */}
        <GWide id="g-refs" title="References">
          <ul className="reading">
            <li>
              <a href={`${SPEC}/specification/2025-06-18`} target="_blank" rel="noreferrer noopener">
                The specification
              </a>
              <span>the normative text</span>
            </li>
            <li>
              <a href={`${SPEC}/docs/concepts/architecture`} target="_blank" rel="noreferrer noopener">
                Architecture overview
              </a>
              <span>host, client, server, officially drawn</span>
            </li>
            <li>
              <Link href="/articles/who-can-talk-to-whom/">
                Who can talk to whom?
              </Link>
              <span>our essay on the boundaries underneath</span>
            </li>
            <li>
              <a href={`${SPEC}/development/roadmap`} target="_blank" rel="noreferrer noopener">
                The roadmap
              </a>
              <span>what changes next</span>
            </li>
          </ul>
        </GWide>

        <p className="post-end">fin · spec revisions welcome</p>
      </article>
    </div>
  );
}
