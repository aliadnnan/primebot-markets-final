import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { findPost, postsFor } from '@/lib/blogPosts';
import { BlogPostView } from '@/components/BlogViews';

export function generateStaticParams() {
  return postsFor('sales').map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = findPost('sales', slug);
  if (!post) return {};
  return { title: `${post.title} | PrimeBot Markets`, description: post.excerpt };
}

export default async function SalesPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = findPost('sales', slug);
  if (!post) notFound();
  return <BlogPostView blog="sales" post={post} />;
}
