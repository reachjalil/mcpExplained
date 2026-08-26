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
        <GWide id="g-basics" title="The session">
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
