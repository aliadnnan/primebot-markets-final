import Link from 'next/link';
import type { BlogKind, BlogPost } from '@/lib/blogPosts';

export const BLOG_META: Record<
  BlogKind,
  { base: string; title: string; tagline: string }
> = {
  trading: {
    base: '/blog',
    title: 'Trading Blog',
    tagline:
      'Plain-language trading education — gold, risk management and automation. New post every day. Educational only, never financial advice.',
  },
  sales: {
    base: '/sales-blog',
    title: 'PrimeBot Sales Blog',
    tagline:
      'Product news, buying guides and setup help for PrimeBot Markets customers — how our bots work, how licensing protects you, and how to get started.',
  },
};

export function BlogIndex({
  blog,
  posts,
}: {
  blog: BlogKind;
  posts: BlogPost[];
}) {
  const meta = BLOG_META[blog];
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-bold text-white sm:text-4xl">{meta.title}</h1>
      <p className="mt-3 max-w-2xl text-slate-400">{meta.tagline}</p>
      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {posts.map((p) => (
          <Link
            key={p.slug}
            href={`${meta.base}/${p.slug}`}
            className="block rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-blue-500/50 hover:bg-white/[0.05]"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
              {p.category} · {p.date} · {p.readMins} min read
            </p>
            <h2 className="mt-2 text-lg font-bold leading-snug text-white">
              {p.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              {p.excerpt}
            </p>
            <span className="mt-4 inline-block text-sm font-semibold text-blue-400">
              Read more →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function BlogPostView({
  blog,
  post,
}: {
  blog: BlogKind;
  post: BlogPost;
}) {
  const meta = BLOG_META[blog];
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <Link href={meta.base} className="text-sm font-semibold text-blue-400">
        ← Back to {meta.title}
      </Link>
      <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-blue-400">
        {post.category} · {post.date} · {post.readMins} min read
      </p>
      <h1 className="mt-2 text-3xl font-bold leading-tight text-white">
        {post.title}
      </h1>
      <p className="mt-3 text-base leading-relaxed text-slate-400">
        {post.excerpt}
      </p>
      <div className="mt-8 space-y-5">
        {post.content.map((b, i) => {
          if (b.type === 'h2') {
            return (
              <h2 key={i} className="pt-3 text-xl font-bold text-white">
                {b.text}
              </h2>
            );
          }
          if (b.type === 'list') {
            return (
              <ul key={i} className="list-disc space-y-2 pl-6 text-slate-300">
                {(b.items || []).map((it, j) => (
                  <li key={j} className="leading-relaxed">
                    {it}
                  </li>
                ))}
              </ul>
            );
          }
          return (
            <p key={i} className="leading-relaxed text-slate-300">
              {b.text}
            </p>
          );
        })}
      </div>
      <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-sm leading-relaxed text-slate-400">
          Trading involves risk, including the possible loss of capital. This
          article is educational and is not financial advice. Always test any
          strategy or Expert Advisor on a demo or cent account first.
        </p>
        <Link
          href="/bots"
          className="mt-4 inline-block rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
        >
          See the PrimeBot Trading Bots
        </Link>
      </div>
    </article>
  );
}
