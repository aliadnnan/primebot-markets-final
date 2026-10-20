import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { findPost, postsFor } from '@/lib/blogPosts';
import { BlogPostView } from '@/components/BlogViews';

export function generateStaticParams() {
  return postsFor('trading').map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = findPost('trading', slug);
  if (!post) return {};
  return { title: `${post.title} | PrimeBot Markets`, description: post.excerpt };
}

export default async function TradingPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = findPost('trading', slug);
  if (!post) notFound();
  return <BlogPostView blog="trading" post={post} />;
}
