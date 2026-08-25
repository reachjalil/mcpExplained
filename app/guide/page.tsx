import type { Metadata } from "next";
import Link from "next/link";
import { G } from "@/components/ui/Glyph";
import { WireBlock } from "@/components/ui/WireBlock";
import { GCard, GWide } from "@/components/guide/shared";
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
    "Every MCP concept on one page: tools, resources, prompts, sampling, elicitation, roots, progress. Definitions, fact lists, spec links, and a runnable demo for each.",
};

const SPEC = "https://modelcontextprotocol.io";

function Toc() {
  return (
    <nav className="gtoc" aria-label="Guide contents">
      <p className="gtoc-k">basics</p>
      <a href="#g-basics">the session</a>
      <p className="gtoc-k">
        <i data-g="server" aria-hidden="true" /> the server offers
      </p>
      <a href="#g-tools">tools</a>
      <a href="#g-resources">resources</a>
      <a href="#g-prompts">prompts</a>
      <p className="gtoc-k">
        <i data-g="host" aria-hidden="true" /> the host offers back
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
            Every concept in the Model Context Protocol: a definition, the
            facts that matter, the spec link, and a demo whose animation shows
            the mechanism.
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

        <p>
          One <G k="agent">host</G> holds every connection, one per{" "}
          <G k="server">server</G>. The model lives inside the host and only
          writes text. Why the wiring looks like that has{" "}
          <Link href="/articles/who-can-talk-to-whom/">its own essay</Link>;
          this page is for looking things up.
        </p>

        {/* ------------------------------------------------------------- */}
        <GWide id="g-basics" title="The session">
          <p className="mchips">
            <code>initialize</code>
            <code>notifications/initialized</code>
          </p>
          <p>
            The client opens with <code>initialize</code>, naming its protocol
            version and capabilities; the server answers with its own. Neither
            side may use anything the other didn&apos;t declare.
          </p>
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
              the server offers
              <span>model · host · person</span>
            </h2>

            <GCard
              id="g-tools"
              side="server"
              title="Tools"
              methods={["tools/list", "tools/call", "…/list_changed"]}
              def={
                <>
                  A function with a name, a description, and a JSON schema for
                  its arguments.
                </>
              }
              facts={[
                <>
                  <b>called by</b> the model, executed by the host
                </>,
                <>
                  <b>side effects</b> live here; approvals apply here first
                </>,
                <>
                  whatever <code>tools/list</code> returned is the whole
                  universe
                </>,
                <>
                  the set changes via <code>list_changed</code>, never silently
                </>,
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
              def={
                <>
                  Content with a URI the host can read into context: a file, a
                  table, a log.
                </>
              }
              facts={[
                <>
                  <b>chosen by</b> the host or the person, not the model
                </>,
                <>
                  <b>no side effects</b>, by definition; reading is always safe
                </>,
                <>
                  subscriptions push <code>updated</code>; the host re-reads
                </>,
                <>text or binary; URI templates for parameterized reads</>,
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
              def={
                <>
                  A named template the server fills into ready-to-send
                  messages.
                </>
              }
              facts={[
                <>
                  <b>invoked by</b> the person; slash-command material
                </>,
                <>takes arguments; returns messages, not prose</>,
                <>the model picks tools, it does not pick prompts</>,
              ]}
              spec={`${SPEC}/docs/concepts/prompts`}
              specLabel="concepts · prompts"
            >
              <PromptsDemo />
            </GCard>
          </div>

          <div className="gcol">
            <h2 className="gcol-h" id="g-host-side">
              <i data-g="host" aria-hidden="true" />
              the host offers back
              <span>the symmetric half</span>
            </h2>

            <GCard
              id="g-sampling"
              side="host"
              title="Sampling"
              methods={["sampling/createMessage"]}
              def={<>The server asks the host to run the model on its behalf.</>}
              facts={[
                <>
                  <b>the server never sees</b> a key, the model choice, or your
                  other context
                </>,
                <>the host may edit, refuse, or put it in front of you</>,
                <>one request in, one completion back</>,
              ]}
              spec={`${SPEC}/docs/concepts/sampling`}
              specLabel="concepts · sampling"
            >
              <SamplingDemo />
            </GCard>

            <GCard
              id="g-elicitation"
              side="host"
              title="Elicitation"
              methods={["elicitation/create"]}
              def={
                <>
                  The server asks the person a question, through the host&apos;s
                  UI.
                </>
              }
              facts={[
                <>a schema describes what a valid answer looks like</>,
                <>
                  <b>the host renders it</b>; the server&apos;s screens never
                  cross
                </>,
                <>declining is a valid, expected outcome</>,
              ]}
              spec={`${SPEC}/docs/concepts/elicitation`}
              specLabel="concepts · elicitation"
            >
              <ElicitationDemo />
            </GCard>

            <GCard
              id="g-roots"
              side="host"
              title="Roots"
              methods={["roots/list", "…/list_changed"]}
              def={<>The host tells the server where it is meant to operate.</>}
              facts={[
                <>
                  <b>scoping, not enforcement</b>; the locks stay with the
                  files
                </>,
                <>change them any time; a notification announces it</>,
                <>
                  servers ask with <code>roots/list</code>
                </>,
              ]}
              spec={`${SPEC}/docs/concepts/roots`}
              specLabel="concepts · roots"
            >
              <RootsDemo />
            </GCard>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        <GWide id="g-progress" title="Progress and cancellation">
          <p className="mchips">
            <code>notifications/progress</code>
            <code>notifications/cancelled</code>
          </p>
          <p>
            Any request can carry a progress token; the other side streams
            ticks against it. <code>cancelled</code> says stop caring. Both
            are notifications: fire and forget, no reply.
          </p>
          <ProgressDemo />
          <p className="specref">
            <b>spec</b>
            <a href={`${SPEC}/specification/2025-06-18/basic/utilities/progress`} target="_blank" rel="noreferrer noopener">
              utilities · progress
            </a>
          </p>
        </GWide>

        {/* ------------------------------------------------------------- */}
        <GWide id="g-transports" title="Transports">
          <p className="mchips">
            <code>stdio</code>
            <code>Streamable HTTP</code>
          </p>
          <p>
            <strong>stdio</strong> for a server the host spawns locally:
            fast, private, no network. <strong>Streamable HTTP</strong> for a
            server elsewhere: POSTs up, an optional event stream back down.
            Same messages either way.
          </p>
          <p className="specref">
            <b>spec</b>
            <a href={`${SPEC}/docs/concepts/transports`} target="_blank" rel="noreferrer noopener">
              concepts · transports
            </a>
          </p>
        </GWide>

        {/* ------------------------------------------------------------- */}
        <div className="gmeta2">
          <GWide id="g-status" title="What is stable">
            <ul className="gfacts">
              <li>
                everything above: <b>spec 2025-06-18</b>, current
              </li>
              <li>
                <b>MCP Apps</b> (SEP-1865): draft; sandboxed UI, app-visible
                tools
              </li>
              <li>
                <b>Tasks</b> (SEP-2663): draft; durable handles for long work
              </li>
              <li>when the roadmap moves, this page gets edited</li>
            </ul>
          </GWide>

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
        </div>

        <p className="post-end">fin · spec revisions welcome</p>
      </article>
    </div>
  );
}
