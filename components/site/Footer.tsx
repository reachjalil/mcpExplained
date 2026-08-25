import { REPO_URL } from "@/lib/site";

export function Footer() {
  return (
    <footer className="site-footer">
      <span>
        mcpExplained — open source, MIT licensed. Diagrams are hand-built SVG;
        no animation library.
      </span>
      <nav>
        <a href={REPO_URL} target="_blank" rel="noreferrer noopener">
          Source
        </a>
        <a
          href={`${REPO_URL}/blob/main/CONTRIBUTING.md`}
          target="_blank"
          rel="noreferrer noopener"
        >
          Contribute an explainer
        </a>
        <a
          href="https://modelcontextprotocol.io"
          target="_blank"
          rel="noreferrer noopener"
        >
          modelcontextprotocol.io
        </a>
      </nav>
    </footer>
  );
}
