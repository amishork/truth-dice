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
    slug: "five-signs-culture-drift",
    title: "Five Signs Your School's Culture Is Drifting From Its Mission",
    description: "Culture drift is quiet. It doesn't announce itself. Here are five diagnostic signals that the gap between your mission and your daily life is growing.",
    date: "2026-04-13",
    author: "Alex Mishork",
    readingTime: "6 min read",
    tags: ["Schools", "Culture"],
  },
  {
    slug: "why-mission-statements-dont-form-students",
    title: "Why Mission Statements Don't Form Students",
    description: "Every Catholic school has a mission statement. Most are beautiful. And most are functionally irrelevant to the daily experience of being a student.",
    date: "2026-04-11",
    author: "Alex Mishork",
    readingTime: "5 min read",
    tags: ["Schools", "Formation"],
  },
  {
    slug: "why-values-matter",
    title: "Why Naming Your Values Changes Everything",
    description: "Most people know what they believe — they just can't name it. Here's why articulating your core values is the first step toward living them.",
    date: "2026-04-10",
    author: "Alex Mishork",
    readingTime: "4 min read",
    tags: ["Formation", "Families"],
  },
  {
    slug: "difference-between-values-and-rules",
    title: "The Difference Between Values and Rules",
    description: "A rule tells you what to do. A value tells you why it matters. This distinction is the foundation of formation — and the reason most cultures fail to form.",
    date: "2026-04-08",
    author: "Alex Mishork",
    readingTime: "5 min read",
    tags: ["Formation", "Families", "Culture"],
  },
  {
    slug: "what-faculty-formation-looks-like",
    title: "What Faculty Formation Actually Looks Like",
    description: "Professional development makes teachers better at their craft. Formation makes teachers better at their vocation. The distinction matters.",
    date: "2026-04-05",
    author: "Alex Mishork",
    readingTime: "5 min read",
    tags: ["Schools", "Leadership"],
  },
  {
    slug: "values-architecture-charism-visible",
    title: "Values Architecture: Making Your Charism Visible",
    description: "Every Catholic school has a charism. Few have built the operational framework that makes it visible in daily life. That framework is values architecture.",
    date: "2026-04-02",
    author: "Alex Mishork",
    readingTime: "5 min read",
    tags: ["Schools", "Culture"],
  },
];
