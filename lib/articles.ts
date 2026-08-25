export type ArticleMeta = {
  slug: string;
  title: string;
  standfirst: string;
  published: string;
  readingTime: string;
  scenes: number;
  tags: string[];
  status: "live" | "planned";
};

export const ARTICLES: ArticleMeta[] = [
  {
    slug: "agent-mediated-composition",
    title: "Agent-Mediated Composition",
    standfirst:
      "MCP is quietly turning into a set of composable workflow primitives. The agent — not the servers — becomes the thing that assembles them.",
    published: "2026-08-25",
    readingTime: "25 min",
    scenes: 16,
    tags: ["composition", "tasks", "sessionless", "mrtr"],
    status: "live",
  },
  {
    slug: "progressive-discovery",
    title: "Progressive Discovery",
    standfirst:
      "What happens to tool selection when a server exposes 400 tools, and why the catalogue has to arrive in pieces.",
    published: "",
    readingTime: "",
    scenes: 0,
    tags: ["discovery", "context"],
    status: "planned",
  },
  {
    slug: "mcp-apps",
    title: "MCP Apps, Explained",
    standfirst:
      "Sandboxed UI inside a tool result: who is allowed to call what, and why the host sits in the middle of all of it.",
    published: "",
    readingTime: "",
    scenes: 0,
    tags: ["apps", "ui", "host"],
    status: "planned",
  },
];

export const liveArticles = () => ARTICLES.filter((a) => a.status === "live");
export const plannedArticles = () =>
  ARTICLES.filter((a) => a.status === "planned");

export function getArticle(slug: string): ArticleMeta | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}
