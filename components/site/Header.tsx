import Link from "next/link";
import { REPO_URL } from "@/lib/site";

export function Header() {
  return (
    <header className="site-header">
      <Link href="/" className="wordmark">
        mcpexplained<i aria-hidden="true" />
      </Link>
      <nav>
        <a href={REPO_URL} target="_blank" rel="noreferrer noopener">
          github
        </a>
      </nav>
    </header>
  );
}
