import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageMeta from "@/components/PageMeta";
import JsonLd, { webPageSchema } from "@/components/JsonLd";
import { posts } from "@/content/blog/posts";
import NewsletterSignup from "@/components/NewsletterSignup";

const categories = ["All", "Formation", "Schools", "Families", "Culture", "Leadership"];

const Blog = () => {
  const [filter, setFilter] = useState("All");

  const filtered = filter === "All"
    ? posts
    : posts.filter((p) => p.tags.some((t) => t.toLowerCase() === filter.toLowerCase()));

  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title="Blog"
        description="Insights on values formation, family culture, school identity, and building organizations that embody what they believe."
        path="/blog"
      />
      <JsonLd data={webPageSchema("Blog", "Insights on values formation, family culture, and organizational identity.", "/blog")} />
      <Navigation />

      <main id="main" className="container mx-auto px-4 pt-24 pb-20">
        <div className="mx-auto max-w-3xl">
          <h1
            className="text-4xl sm:text-5xl font-semibold text-foreground"
            style={{ animation: "fadeSlideUp 0.4s ease-out forwards" }}
          >
            Blog
          </h1>
          <p
            className="mt-4 text-lg text-muted-foreground"
            style={{ animation: "fadeSlideUp 0.5s ease-out forwards" }}
          >
            On values, formation, and building cultures that last.
          </p>

          {/* Category filter */}
          <div
            className="mt-8 flex flex-wrap gap-2"
            style={{ animation: "fadeSlideUp 0.55s ease-out forwards" }}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filter === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Posts */}
          <div className="mt-10 space-y-8" style={{ animation: "fadeSlideUp 0.6s ease-out forwards" }}>
            {filtered.map((post) => (
              <a
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-sm"
              >
                <div className="flex flex-wrap gap-2 mb-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-semibold uppercase tracking-[0.15em] text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h2 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
                <p className="mt-2 text-muted-foreground leading-relaxed">
                  {post.description}
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                  {post.author} · {new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} · {post.readingTime}
                </p>
              </a>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="mt-12 text-center text-muted-foreground">
              No posts in this category yet.{" "}
              <button onClick={() => setFilter("All")} className="text-primary underline hover:text-primary/80">
                View all posts
              </button>
            </p>
          )}

          {/* Email capture */}
          <div className="mt-16 rounded-xl border border-border bg-card p-8 text-center">
            <p className="text-sm font-semibold text-foreground mb-2">
              Get insights like this in your inbox.
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Short, practical writing on values formation. No spam.
            </p>
            <div className="max-w-sm mx-auto">
              <NewsletterSignup />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
