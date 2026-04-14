import { ReactNode } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageMeta from "@/components/PageMeta";
import JsonLd, { articleSchema } from "@/components/JsonLd";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { BlogPostMeta } from "@/content/blog/posts";

interface BlogLayoutProps {
  meta: BlogPostMeta;
  children: ReactNode;
}

const BlogLayout = ({ meta, children }: BlogLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title={meta.title}
        description={meta.description}
        path={`/blog/${meta.slug}`}
      />
      <JsonLd data={articleSchema({
        title: meta.title,
        description: meta.description,
        slug: meta.slug,
        date: meta.date,
        author: meta.author,
        tags: meta.tags,
      })} />
      <Navigation />

      <main id="main" className="container mx-auto px-4 pt-24 pb-20">
        <div className="mx-auto max-w-2xl">
          <a
            href="/blog"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All Posts
          </a>

          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {meta.tags[0]}
            </p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-semibold text-foreground leading-tight">
              {meta.title}
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              {meta.author} · {new Date(meta.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} · {meta.readingTime}
            </p>
          </div>

          <article className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-primary prose-a:underline hover:prose-a:text-primary/80 prose-p:leading-relaxed prose-p:text-foreground prose-strong:text-foreground prose-li:text-foreground">
            {children}
          </article>

          <div className="mt-16 pt-8 border-t border-border text-center">
            <p className="text-muted-foreground">Ready to name what you love?</p>
            <div className="mt-4">
              <Button asChild size="lg">
                <a href="/quiz">Take the Free Values Assessment</a>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BlogLayout;
