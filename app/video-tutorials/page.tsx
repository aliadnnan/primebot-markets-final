'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { VideoCategory, Video } from '@/lib/supabase/client'

interface VideoWithCategory extends Video {
  video_categories?: VideoCategory | null
}

export default function VideoTutorialsPage() {
  const [videos, setVideos] = useState<VideoWithCategory[]>([])
  const [categories, setCategories] = useState<VideoCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedVideo, setSelectedVideo] = useState<VideoWithCategory | null>(null)

  useEffect(() => {
    loadVideos()
    loadCategories()
  }, [])

  const loadVideos = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/videos?published=true')
      const data = await response.json()
      if (data.success) {
        setVideos(data.videos)
      }
    } catch (error) {
      console.error('Error loading videos:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/videos/categories')
      const data = await response.json()
      if (data.success) {
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const filteredVideos = videos.filter((video) => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (video.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    const matchesCategory = selectedCategory === 'all' || video.category_id === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 py-12">
      <div className="container-custom max-w-6xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-white mb-4">Video Tutorials</h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Learn how to use PrimeBot with our comprehensive video tutorials. From installation to advanced trading strategies.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-8">
          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tutorials..."
              className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Categories */}
          <div>
            <p className="text-sm text-slate-400 font-semibold mb-3">Filter by Category:</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                All Categories
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Video Count */}
        <div className="mb-6 text-slate-400">
          {loading ? (
            <p>Loading videos...</p>
          ) : filteredVideos.length === 0 ? (
            <p>No videos found</p>
          ) : (
            <p>{filteredVideos.length} tutorial{filteredVideos.length !== 1 ? 's' : ''} found</p>
          )}
        </div>

        {/* Videos Grid */}
        {loading ? (
          <div className="text-center py-24">
            <p className="text-slate-400">Loading tutorials...</p>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-slate-400 text-lg">No videos found matching your search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <div
                key={video.id}
                className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden hover:border-blue-500 transition-all hover:shadow-lg hover:shadow-blue-500/20 cursor-pointer"
                onClick={() => setSelectedVideo(video)}
              >
                {/* Thumbnail */}
                <div className="relative w-full aspect-video bg-slate-700 overflow-hidden">
                  {video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="w-full h-full object-cover hover:scale-110 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
                      <svg
                        className="w-12 h-12 text-slate-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                      </svg>
                    </div>
                  )}
                  {/* Play Icon */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-white ml-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="mb-2">
                    <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                      {video.video_categories?.name || 'Uncategorized'}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 hover:text-blue-400 transition-colors">
                    {video.title}
                  </h3>
                  {video.description && (
                    <p className="text-sm text-slate-400 line-clamp-2">{video.description}</p>
                  )}
                  <div className="mt-4 text-xs text-slate-500">
                    {new Date(video.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Video Player Modal */}
        {selectedVideo && (
          <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedVideo(null)}
          >
            <div
              className="w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <div className="flex justify-end mb-2">
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="text-white hover:text-slate-300 text-3xl"
                >
                  ×
                </button>
              </div>

              {/* Video Player */}
              <div className="bg-black rounded-lg overflow-hidden">
                <div className="relative w-full aspect-video">
                  {selectedVideo.video_url.endsWith('.mp4') ||
                  selectedVideo.video_url.endsWith('.webm') ? (
                    <video
                      key={selectedVideo.id}
                      controls
                      autoPlay
                      className="w-full h-full"
                      style={{ maxHeight: '80vh' }}
                    >
                      <source src={selectedVideo.video_url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <iframe
                      key={selectedVideo.id}
                      src={selectedVideo.video_url}
                      className="w-full h-full"
                      style={{ maxHeight: '80vh' }}
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  )}
                </div>
              </div>

              {/* Video Info */}
              <div className="mt-6 bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-2">{selectedVideo.title}</h2>
                <div className="flex flex-wrap gap-4 mb-4">
                  <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-400">
                    {selectedVideo.video_categories?.name || 'Uncategorized'}
                  </span>
                  <span className="text-sm text-slate-400">
                    {new Date(selectedVideo.created_at).toLocaleDateString()}
                  </span>
                </div>
                {selectedVideo.description && (
                  <p className="text-slate-300">{selectedVideo.description}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
