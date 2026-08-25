export type ArticleMeta = {
  slug: string;
  title: string;
  deck: string;
  published: string;
  readingTime: string;
  toys: number;
  status: "live" | "planned";
};

export const ARTICLES: ArticleMeta[] = [
  {
    slug: "who-can-talk-to-whom",
    title: "Who can talk to whom?",
    deck: "MCP is a story about access: apps that have to ask, servers that stay strangers, and one agent holding the keys. Five machines let you click through the boundaries.",
    published: "August 25, 2026",
    readingTime: "10 min",
    toys: 5,
    status: "live",
  },
  {
    slug: "sessions-are-gone",
    title: "Sessions are gone. Now what?",
    deck: "MCP deleted protocol sessions. A short tour of state handles, the small IDs that replaced them.",
    published: "",
    readingTime: "",
    toys: 0,
    status: "planned",
  },
  {
    slug: "the-task-that-outlived-the-request",
    title: "The task that outlived the request",
    deck: "What happens when the work takes twenty minutes and the connection doesn't.",
    published: "",
    readingTime: "",
    toys: 0,
    status: "planned",
  },
];

export const liveArticles = () => ARTICLES.filter((a) => a.status === "live");
export const plannedArticles = () =>
  ARTICLES.filter((a) => a.status === "planned");

export const GUIDE = {
  href: "/guide/",
  title: "A guide to MCP",
  deck: "Every concept, split the way the protocol is: server on one side, agent on the other. Methods, facts, spec links, and a runnable demo each.",
  updated: "August 25, 2026",
  figures: 8,
};
