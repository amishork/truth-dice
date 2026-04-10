export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  readingTime: string;
  tags: string[];
}

export const posts: BlogPostMeta[] = [
  {
    slug: "why-values-matter",
    title: "Why Naming Your Values Changes Everything",
    description: "Most people know what they believe — they just can't name it. Here's why articulating your core values is the first step toward living them.",
    date: "2026-04-10",
    author: "Alex Mishork",
    readingTime: "4 min read",
    tags: ["values", "formation", "families"],
  },
];
