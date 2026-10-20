import type { Metadata } from 'next';
import { postsFor } from '@/lib/blogPosts';
import { BlogIndex, BLOG_META } from '@/components/BlogViews';

export const metadata: Metadata = {
  title: 'PrimeBot Sales Blog — Product News & Buying Guides | PrimeBot Markets',
  description: BLOG_META.sales.tagline,
};

export default function SalesBlogPage() {
  return <BlogIndex blog="sales" posts={postsFor('sales')} />;
}
