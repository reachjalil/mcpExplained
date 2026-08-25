import { REPO_URL } from "@/lib/site";

export function Footer() {
  return (
    <footer className="site-footer">
      <span>mcpexplained · open source, MIT. no trackers, no cookies.</span>
      <span>
        <a href={REPO_URL} target="_blank" rel="noreferrer noopener">
          source
        </a>
        {" · "}
        <a
          href="https://modelcontextprotocol.io"
          target="_blank"
          rel="noreferrer noopener"
        >
          modelcontextprotocol.io
        </a>
      </span>
    </footer>
  );
}
