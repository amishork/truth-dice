import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageMeta from "@/components/PageMeta";
import JsonLd, { webPageSchema } from "@/components/JsonLd";
import { posts } from "@/content/blog/posts";

const Blog = () => {
  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title="Blog"
        description="Insights on values formation, family culture, and building organizations that embody what they believe."
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

          <div className="mt-12 space-y-8" style={{ animation: "fadeSlideUp 0.6s ease-out forwards" }}>
            {posts.map((post) => (
              <a
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-sm"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  {post.tags[0]}
                </p>
                <h2 className="mt-2 text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
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

          {posts.length === 0 && (
            <p className="mt-12 text-center text-muted-foreground">
              Posts coming soon. In the meantime,{" "}
              <a href="/quiz" className="text-primary underline hover:text-primary/80">
                discover your core values
              </a>.
            </p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
