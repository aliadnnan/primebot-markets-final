'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Video, VideoCategory } from '@/lib/supabase/client'

interface VideoWithCategory extends Video {
  video_categories?: VideoCategory | null
}

export default function VideoManagement() {
  const [videos, setVideos] = useState<VideoWithCategory[]>([])
  const [categories, setCategories] = useState<VideoCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<VideoWithCategory | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploading, setUploading] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    video_file: null as File | null,
    thumbnail_file: null as File | null,
    published: false,
  })

  const [editData, setEditData] = useState({
    title: '',
    description: '',
    category_id: '',
    published: false,
  })

  useEffect(() => {
    loadVideos()
    loadCategories()
  }, [])

  const loadVideos = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/videos')
      const data = await response.json()
      if (data.success) {
        setVideos(data.videos)
      } else {
        toast.error(data.error || 'Failed to load videos')
      }
    } catch (error) {
      console.error('Error loading videos:', error)
      toast.error('Failed to load videos')
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

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.category_id || !formData.video_file) {
      toast.error('Please fill in all required fields')
      return
    }

    setUploading(true)
    try {
      // Upload video file
      setUploadProgress(25)
      const videoFormData = new FormData()
      videoFormData.append('file', formData.video_file)

      const videoResponse = await fetch('/api/admin/upload-video', {
        method: 'POST',
        body: videoFormData,
      })

      const videoData = await videoResponse.json()
      if (!videoData.success) {
        toast.error(videoData.error || 'Failed to upload video')
        setUploading(false)
        return
      }

      const videoPath = videoData.path
      setUploadProgress(50)

      // Upload thumbnail if provided
      let thumbnailPath = null
      if (formData.thumbnail_file) {
        const thumbnailFormData = new FormData()
        thumbnailFormData.append('file', formData.thumbnail_file)

        const thumbnailResponse = await fetch('/api/admin/upload-thumbnail', {
          method: 'POST',
          body: thumbnailFormData,
        })

        const thumbnailData = await thumbnailResponse.json()
        if (thumbnailData.success) {
          thumbnailPath = thumbnailData.path
        }
      }

      setUploadProgress(75)

      // Create video record
      const createResponse = await fetch('/api/admin/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category_id: formData.category_id,
          video_url: videoPath,
          thumbnail_url: thumbnailPath,
          published: formData.published,
        }),
      })

      const createData = await createResponse.json()
      if (createData.success) {
        toast.success('Video created successfully!')
        setFormData({
          title: '',
          description: '',
          category_id: '',
          video_file: null,
          thumbnail_file: null,
          published: false,
        })
        setShowUploadModal(false)
        loadVideos()
      } else {
        toast.error(createData.error || 'Failed to create video')
      }

      setUploadProgress(100)
    } catch (error) {
      console.error('Error uploading video:', error)
      toast.error('An error occurred while uploading the video')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedVideo) return

    try {
      const response = await fetch(`/api/admin/videos/${selectedVideo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Video updated successfully!')
        setShowEditModal(false)
        setSelectedVideo(null)
        loadVideos()
      } else {
        toast.error(data.error || 'Failed to update video')
      }
    } catch (error) {
      console.error('Error updating video:', error)
      toast.error('Failed to update video')
    }
  }

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return

    try {
      const response = await fetch(`/api/admin/videos/${videoId}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Video deleted successfully!')
        loadVideos()
      } else {
        toast.error(data.error || 'Failed to delete video')
      }
    } catch (error) {
      console.error('Error deleting video:', error)
      toast.error('Failed to delete video')
    }
  }

  const openEditModal = (video: VideoWithCategory) => {
    setSelectedVideo(video)
    setEditData({
      title: video.title,
      description: video.description || '',
      category_id: video.category_id,
      published: video.published,
    })
    setShowEditModal(true)
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId)
    return category?.name || 'Unknown'
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Video Management</h2>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
        >
          + Upload Video
        </button>
      </div>

      {/* Videos List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-slate-400">Loading videos...</p>
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-12 bg-slate-700/50 rounded-lg">
          <p className="text-slate-400">No videos uploaded yet</p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="mt-4 text-blue-400 hover:text-blue-300"
          >
            Upload your first video
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {videos.map((video) => (
            <div
              key={video.id}
              className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 hover:border-slate-500 transition"
            >
              <div className="flex gap-4">
                {video.thumbnail_url && (
                  <div className="w-24 h-24 bg-slate-600 rounded-lg flex-shrink-0 overflow-hidden">
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white truncate">{video.title}</h3>
                      <p className="text-sm text-slate-400 mt-1">
                        Category: <span className="text-slate-300">{getCategoryName(video.category_id)}</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(video.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          video.published
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}
                      >
                        {video.published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>

                  {video.description && (
                    <p className="text-sm text-slate-400 mt-2 line-clamp-2">{video.description}</p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => openEditModal(video)}
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteVideo(video.id)}
                      className="text-red-400 hover:text-red-300 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Upload Video</h2>
              <button
                onClick={() => {
                  setShowUploadModal(false)
                  setUploadProgress(0)
                }}
                className="text-slate-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Video Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter video title"
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter video description"
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Video File */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Video File (MP4/WebM) *
                </label>
                <input
                  type="file"
                  accept="video/mp4,video/webm"
                  onChange={(e) => setFormData({ ...formData, video_file: e.target.files?.[0] || null })}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-300"
                  required
                />
                <p className="text-xs text-slate-400 mt-1">Max size: 500MB. Formats: MP4, WebM</p>
              </div>

              {/* Thumbnail */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Thumbnail Image
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setFormData({ ...formData, thumbnail_file: e.target.files?.[0] || null })}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-300"
                />
                <p className="text-xs text-slate-400 mt-1">Max size: 5MB. Formats: JPEG, PNG, WebP</p>
              </div>

              {/* Published Checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="published" className="ml-2 text-sm text-slate-300">
                  Publish immediately
                </label>
              </div>

              {/* Progress Bar */}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  {uploading ? 'Uploading...' : 'Upload Video'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false)
                    setUploadProgress(0)
                  }}
                  disabled={uploading}
                  className="flex-1 px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedVideo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Edit Video</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Video Title
                </label>
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Category
                </label>
                <select
                  value={editData.category_id}
                  onChange={(e) => setEditData({ ...editData, category_id: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:border-blue-500"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Published Checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="edit-published"
                  checked={editData.published}
                  onChange={(e) => setEditData({ ...editData, published: e.target.checked })}
                  className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="edit-published" className="ml-2 text-sm text-slate-300">
                  Published
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  Update Video
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
