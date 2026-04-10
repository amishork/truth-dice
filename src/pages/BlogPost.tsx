import { useParams, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import BlogLayout from "@/components/BlogLayout";
import { posts } from "@/content/blog/posts";

// Glob import all MDX files
const mdxModules = import.meta.glob("@/content/blog/*.mdx");

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const meta = posts.find((p) => p.slug === slug);

  if (!meta) return <Navigate to="/blog" replace />;

  const mdxPath = `/src/content/blog/${slug}.mdx`;
  const loader = mdxModules[mdxPath];

  if (!loader) return <Navigate to="/blog" replace />;

  const MdxContent = lazy(() =>
    loader().then((mod: any) => ({ default: mod.default }))
  );

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 pt-32">
            <div className="mx-auto max-w-2xl space-y-4">
              <div className="h-8 w-2/3 animate-pulse rounded bg-muted" />
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
            </div>
          </div>
        </div>
      }
    >
      <BlogLayout meta={meta}>
        <MdxContent />
      </BlogLayout>
    </Suspense>
  );
};

export default BlogPost;
