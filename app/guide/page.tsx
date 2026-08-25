import type { Metadata } from "next";
import Link from "next/link";
import { G } from "@/components/ui/Glyph";
import { WireBlock } from "@/components/ui/WireBlock";
import { GSection, SpecRef } from "@/components/guide/shared";
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
    "Every MCP concept on one page: tools, resources, prompts, sampling, elicitation, roots, progress. Each one is a small interactive app, with the spec reference next to it.",
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
            Every concept in the Model Context Protocol on one page. Each one
            is a small app you can run, with the spec methods and a reference
            link beside it. Bookmark it; the essays are for reading, this is
            for looking things up.
          </p>
          <div className="post-meta">
            <span>updated august 25, 2026</span>
            <span>spec 2025-06-18</span>
            <span>8 interactive figures</span>
          </div>
        </header>

        <p className="gjump" aria-label="Jump to a concept">
          {[
            ["#g-basics", "session"],
            ["#g-tools", "tools"],
            ["#g-resources", "resources"],
            ["#g-prompts", "prompts"],
            ["#g-sampling", "sampling"],
            ["#g-elicitation", "elicitation"],
            ["#g-roots", "roots"],
            ["#g-progress", "progress"],
            ["#g-transports", "transports"],
          ].map(([href, label]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </p>

        <p>
          MCP is a protocol for giving an AI application capabilities it
          wasn&apos;t built with. One <G k="agent">host</G> holds connections;
          each connection runs to one <G k="server">server</G> that offers one
          capability. The model lives inside the host and only writes text.
          Everything below is the vocabulary those parties share. The politics
          of who may talk to whom has{" "}
          <Link href="/articles/who-can-talk-to-whom/">its own essay</Link>;
          this page is the reference.
        </p>

        {/* ------------------------------------------------------------- */}
        <GSection id="g-basics" side="both" title="The session" methods={["initialize", "notifications/initialized"]}>
          <p>
            Everything starts with a handshake. The client sends{" "}
            <code>initialize</code> naming its protocol version and
            capabilities; the server answers with its own. Neither side may
            use a feature the other didn&apos;t declare. One session, one
            client, one server.
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
          <SpecRef
            href={`${SPEC}/specification/2025-06-18`}
            label="specification · 2025-06-18"
            extra={<span>JSON-RPC 2.0 underneath, always</span>}
          />
        </GSection>

        {/* ------------------------------------------------------------- */}
        <div className="gindex">
          <div className="gindex-col">
            <strong>
              <i data-g="server" aria-hidden="true" /> the server offers
            </strong>
            <p>
              Three primitives, three intended audiences: the model calls
              tools, the host reads resources, the person invokes prompts.
            </p>
            <a href="#g-tools">tools</a>
            <a href="#g-resources">resources</a>
            <a href="#g-prompts">prompts</a>
          </div>
          <div className="gindex-col">
            <strong>
              <i data-g="host" aria-hidden="true" /> the host offers back
            </strong>
            <p>
              The protocol is symmetric. A server can borrow the model, ask
              the person, and learn where it is allowed to look.
            </p>
            <a href="#g-sampling">sampling</a>
            <a href="#g-elicitation">elicitation</a>
            <a href="#g-roots">roots</a>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        <GSection id="g-tools" side="server" title="Tools" methods={["tools/list", "tools/call", "notifications/tools/list_changed"]}>
          <p>
            A tool is a function with a name, a description, and a JSON schema
            for its arguments. The model chooses tools during its loop; the
            host executes the call and feeds the result back. Side effects
            live here, so approvals and allowlists apply here first.
          </p>
          <ToolsDemo />
          <p>
            Discovery is part of the contract. Whatever <code>tools/list</code>{" "}
            returned is all there is, and when the set changes the server says
            so with <code>list_changed</code> rather than surprising anyone
            mid-session.
          </p>
          <SpecRef href={`${SPEC}/docs/concepts/tools`} label="concepts · tools" />
        </GSection>

        {/* ------------------------------------------------------------- */}
        <GSection id="g-resources" side="server" title="Resources" methods={["resources/list", "resources/read", "resources/subscribe"]}>
          <p>
            A resource is content with a URI: a file, a table, a log. Reading
            one has no side effects, which is the entire point; it is context
            the host can pull in without asking anyone&apos;s permission to
            run code. Subscriptions keep long-lived context honest: the server
            notifies, the host re-reads.
          </p>
          <ResourcesDemo />
          <SpecRef href={`${SPEC}/docs/concepts/resources`} label="concepts · resources" />
        </GSection>

        {/* ------------------------------------------------------------- */}
        <GSection id="g-prompts" side="server" title="Prompts" methods={["prompts/list", "prompts/get"]}>
          <p>
            Prompts are templates a person invokes by name and the server
            fills into ready-to-send messages. They are user-controlled by
            design: slash-command material. The model picks tools; it does not
            pick prompts.
          </p>
          <PromptsDemo />
          <SpecRef href={`${SPEC}/docs/concepts/prompts`} label="concepts · prompts" />
        </GSection>

        {/* ------------------------------------------------------------- */}
        <GSection id="g-sampling" side="host" title="Sampling" methods={["sampling/createMessage"]}>
          <p>
            Sampling reverses the arrow: the server asks the host to run the
            model on its behalf. The host may rewrite the request, pick the
            model, bill it, refuse it, or put it in front of you first. The
            server gets intelligence without ever holding an API key or seeing
            your other context.
          </p>
          <SamplingDemo />
          <SpecRef href={`${SPEC}/docs/concepts/sampling`} label="concepts · sampling" />
        </GSection>

        {/* ------------------------------------------------------------- */}
        <GSection id="g-elicitation" side="host" title="Elicitation" methods={["elicitation/create"]}>
          <p>
            When a server needs a decision mid-request, it asks through the
            host. The host renders the question in its own UI, with a schema
            describing what a valid answer looks like. Answers travel back;
            screens never do.
          </p>
          <ElicitationDemo />
          <SpecRef href={`${SPEC}/docs/concepts/elicitation`} label="concepts · elicitation" />
        </GSection>

        {/* ------------------------------------------------------------- */}
        <GSection id="g-roots" side="host" title="Roots" methods={["roots/list", "notifications/roots/list_changed"]}>
          <p>
            Roots are the host telling a server where it is meant to operate:
            these folders, that repo, nothing else. Change them any time and a
            notification announces the new world. Roots are scoping, not
            enforcement; the locks stay wherever the files actually live.
          </p>
          <RootsDemo />
          <SpecRef href={`${SPEC}/docs/concepts/roots`} label="concepts · roots" />
        </GSection>

        {/* ------------------------------------------------------------- */}
        <GSection id="g-progress" side="both" title="Progress and cancellation" methods={["notifications/progress", "notifications/cancelled"]}>
          <p>
            Any request can carry a progress token; the other side streams
            progress notifications against it while the work runs.{" "}
            <code>cancelled</code> says stop caring. Both are notifications:
            fire and forget, no reply, no result.
          </p>
          <ProgressDemo />
          <SpecRef
            href={`${SPEC}/specification/2025-06-18/basic/utilities/progress`}
            label="utilities · progress"
          />
        </GSection>

        {/* ------------------------------------------------------------- */}
        <GSection id="g-transports" side="both" title="Transports" methods={["stdio", "Streamable HTTP"]}>
          <p>
            Two official ways to carry the JSON-RPC. <strong>stdio</strong>{" "}
            for a server the host spawns as a local process: fast, private, no
            network. <strong>Streamable HTTP</strong> for a server elsewhere:
            messages go up as POSTs, and an optional event stream carries
            server-initiated traffic back down. Same messages either way;
            sessions and resumability live at this layer, not in your code.
          </p>
          <SpecRef href={`${SPEC}/docs/concepts/transports`} label="concepts · transports" />
        </GSection>

        {/* ------------------------------------------------------------- */}
        <GSection id="g-status" side="both" title="What is stable">
          <p>
            Everything demonstrated above is the current spec, revision{" "}
            <strong>2025-06-18</strong>. Two things this site covers are
            drafts and behave like drafts: <strong>MCP Apps</strong>{" "}
            (SEP-1865), the sandboxed-UI story, and <strong>Tasks</strong>{" "}
            (SEP-2663), durable handles for work that outlives a request. The
            roadmap moves; when it does, this page gets edited rather than
            defended.
          </p>
        </GSection>

        {/* ------------------------------------------------------------- */}
        <GSection id="g-refs" side="both" title="References">
          <ul className="reading">
            <li>
              <a href={`${SPEC}/specification/2025-06-18`} target="_blank" rel="noreferrer noopener">
                The specification, 2025-06-18
              </a>
              <span>the normative text for everything above</span>
            </li>
            <li>
              <a href={`${SPEC}/docs/concepts/architecture`} target="_blank" rel="noreferrer noopener">
                Architecture overview
              </a>
              <span>host, client, server, drawn by the people who named them</span>
            </li>
            <li>
              <Link href="/articles/who-can-talk-to-whom/">
                Who can talk to whom?
              </Link>
              <span>our essay on the access boundaries underneath this page</span>
            </li>
            <li>
              <a href={`${SPEC}/development/roadmap`} target="_blank" rel="noreferrer noopener">
                The roadmap
              </a>
              <span>what changes next</span>
            </li>
          </ul>
        </GSection>

        <p className="post-end">fin · spec revisions welcome</p>
      </article>
    </div>
  );
}
