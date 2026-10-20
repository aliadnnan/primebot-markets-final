import type { Metadata } from 'next';
import { postsFor } from '@/lib/blogPosts';
import { BlogIndex, BLOG_META } from '@/components/BlogViews';

export const metadata: Metadata = {
  title: 'Trading Blog — Gold, Risk & Automation Guides | PrimeBot Markets',
  description: BLOG_META.trading.tagline,
};

export default function TradingBlogPage() {
  return <BlogIndex blog="trading" posts={postsFor('trading')} />;
}
