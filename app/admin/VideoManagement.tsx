'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Video, VideoCategory } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth-context'

interface VideoWithCategory extends Video {
  video_categories?: VideoCategory | null
}

interface VideoManagementProps {
  /** Switches the Admin Panel to the Video Categories tab. */
  onManageCategories?: () => void
}

export default function VideoManagement({ onManageCategories }: VideoManagementProps) {
  const { getAccessToken } = useAuth()
  const [videos, setVideos] = useState<VideoWithCategory[]>([])
  const [categories, setCategories] = useState<VideoCategory[]>([])
  const [categoryError, setCategoryError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [togglingId, setTogglingId] = useState<string | null>(null)
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
    video_url: '',
    source_type: 'upload' as 'upload' | 'link',
    thumbnail_file: null as File | null,
    published: false,
    is_public: true,
    autoplay: false,
  })

  const [editData, setEditData] = useState({
    title: '',
    description: '',
    category_id: '',
    published: false,
    is_public: true,
    autoplay: false,
    video_url: '',
  })


  const adminFetch = async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const token = await getAccessToken()
    if (!token) throw new Error('Admin session not found')
    const headers = new Headers(init.headers)
    headers.set('Authorization', `Bearer ${token}`)
    return fetch(input, { ...init, headers })
  }

  useEffect(() => {
    loadVideos()
    loadCategories()
  }, [])

  const loadVideos = async () => {
    try {
      setLoading(true)
      const response = await adminFetch('/api/admin/videos')
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

  // Loads the categories that populate the Category dropdown.
  // Failures used to be swallowed here, which is why an empty dropdown gave no
  // clue about what had gone wrong. Errors are now surfaced in the UI.
  const loadCategories = async () => {
    try {
      setCategoryError(null)
      const response = await fetch('/api/videos/categories')
      const data = await response.json()
      if (data.success) {
        setCategories(data.categories || [])
      } else {
        setCategories([])
        setCategoryError(data.error || 'Failed to load categories')
      }
    } catch (error) {
      console.error('Error loading categories:', error)
      setCategories([])
      setCategoryError(error instanceof Error ? error.message : 'Failed to load categories')
    }
  }

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.category_id || (formData.source_type === 'upload' ? !formData.video_file : !formData.video_url.trim())) {
      toast.error('Please fill in all required fields')
      return
    }

    setUploading(true)
    try {
      let videoPath = formData.video_url.trim()
      if (formData.source_type === 'upload') {
        setUploadProgress(25)
        const videoFormData = new FormData()
        videoFormData.append('file', formData.video_file as File)
        const videoResponse = await adminFetch('/api/admin/upload-video', {
          method: 'POST',
          body: videoFormData,
        })
        const videoData = await videoResponse.json()
        if (!videoData.success) {
          toast.error(videoData.error || 'Failed to upload video')
          return
        }
        videoPath = videoData.path
      }
      setUploadProgress(50)

      // Upload thumbnail if provided
      let thumbnailPath = null
      if (formData.thumbnail_file) {
        const thumbnailFormData = new FormData()
        thumbnailFormData.append('file', formData.thumbnail_file)

        const thumbnailResponse = await adminFetch('/api/admin/upload-thumbnail', {
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
      const createResponse = await adminFetch('/api/admin/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category_id: formData.category_id,
          video_url: videoPath,
          thumbnail_url: thumbnailPath,
          published: formData.published,
          is_public: formData.is_public,
          autoplay: formData.autoplay,
        }),
      })

      const createData = await createResponse.json()
      if (createData.success) {
        toast.success('Video created successfully!')
        if (createData.warning) toast(createData.warning, { duration: 8000 })
        setFormData({
          title: '',
          description: '',
          category_id: '',
          video_file: null,
          video_url: '',
          source_type: 'upload',
          thumbnail_file: null,
          published: false,
          is_public: true,
          autoplay: false,
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
      const response = await adminFetch(`/api/admin/videos/${selectedVideo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Video updated successfully!')
        if (data.warning) toast(data.warning, { duration: 8000 })
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
      const response = await adminFetch(`/api/admin/videos/${videoId}`, {
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

  // Quick inline toggles for publish state and public visibility.
  const toggleVideoFlag = async (
    video: VideoWithCategory,
    field: 'published' | 'is_public' | 'autoplay',
    value: boolean
  ) => {
    setTogglingId(video.id)
    try {
      const response = await adminFetch(`/api/admin/videos/${video.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      })
      const data = await response.json()
      if (data.success) {
        const labels: Record<string, string> = {
          published: value ? 'Video published' : 'Video unpublished',
          is_public: value ? 'Video set to Public' : 'Video set to Private',
          autoplay: value ? 'Autoplay enabled' : 'Autoplay disabled',
        }
        toast.success(labels[field])
        if (data.warning) toast(data.warning, { duration: 8000 })
        loadVideos()
      } else {
        toast.error(data.error || 'Failed to update video')
      }
    } catch (error) {
      console.error('Error updating video:', error)
      toast.error('Failed to update video')
    } finally {
      setTogglingId(null)
    }
  }

  const openEditModal = (video: VideoWithCategory) => {
    setSelectedVideo(video)
    setEditData({
      title: video.title,
      description: video.description || '',
      category_id: video.category_id,
      published: video.published,
      is_public: video.is_public !== false,
      autoplay: video.autoplay === true,
      // Left blank on purpose: only a non-empty value replaces the stored
      // video source, so the existing upload/link is never clobbered.
      video_url: '',
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
        <div className="flex flex-wrap gap-3">
          {onManageCategories && (
            <button
              onClick={onManageCategories}
              className="px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition"
            >
              Manage Categories
            </button>
          )}
          <button
            onClick={() => {
              // Refresh categories every time the form opens so a category
              // added moments ago is immediately selectable.
              loadCategories()
              setShowUploadModal(true)
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            + Upload Video
          </button>
        </div>
      </div>

      {/* Category loading problem / no categories yet */}
      {categoryError ? (
        <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400 font-semibold text-sm">Categories could not be loaded</p>
          <p className="text-xs text-red-300/80 mt-1">{categoryError}</p>
          <button
            onClick={loadCategories}
            className="mt-3 text-xs px-3 py-1.5 border border-red-500/40 text-red-300 rounded-lg hover:bg-red-500/10 transition"
          >
            Try again
          </button>
        </div>
      ) : categories.length === 0 ? (
        <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <p className="text-yellow-400 font-semibold text-sm">No video categories exist yet</p>
          <p className="text-xs text-yellow-300/80 mt-1">
            The Category dropdown will stay empty until at least one category is created.
          </p>
          {onManageCategories && (
            <button
              onClick={onManageCategories}
              className="mt-3 text-xs px-3 py-1.5 border border-yellow-500/40 text-yellow-300 rounded-lg hover:bg-yellow-500/10 transition"
            >
              Add a category
            </button>
          )}
        </div>
      ) : null}

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

                    <div className="flex flex-wrap items-center gap-2 justify-end">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          video.published
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}
                      >
                        {video.published ? 'Published' : 'Draft'}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          video.is_public === false
                            ? 'bg-slate-500/20 text-slate-300'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}
                      >
                        {video.is_public === false ? 'Private' : 'Public'}
                      </span>
                      {video.autoplay && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-purple-500/20 text-purple-300">
                          Autoplay
                        </span>
                      )}
                    </div>
                  </div>

                  {video.description && (
                    <p className="text-sm text-slate-400 mt-2 line-clamp-2">{video.description}</p>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-4 mt-3 items-center">
                    <button
                      onClick={() => openEditModal(video)}
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleVideoFlag(video, 'published', !video.published)}
                      disabled={togglingId === video.id}
                      className="text-green-400 hover:text-green-300 disabled:opacity-50 text-sm font-medium"
                    >
                      {video.published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      onClick={() => toggleVideoFlag(video, 'is_public', video.is_public === false)}
                      disabled={togglingId === video.id}
                      className="text-slate-300 hover:text-white disabled:opacity-50 text-sm font-medium"
                    >
                      {video.is_public === false ? 'Make Public' : 'Make Private'}
                    </button>
                    <button
                      onClick={() => toggleVideoFlag(video, 'autoplay', !video.autoplay)}
                      disabled={togglingId === video.id}
                      className="text-purple-300 hover:text-purple-200 disabled:opacity-50 text-sm font-medium"
                    >
                      {video.autoplay ? 'Disable Autoplay' : 'Enable Autoplay'}
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
                {categories.length === 0 && (
                  <p className="text-xs text-yellow-400 mt-2">
                    No categories available. Create one in the Video Categories tab first.
                  </p>
                )}
              </div>

              {/* Video Source */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-300">Video Source *</label>
                <div className="flex gap-4 text-sm text-slate-300">
                  <label className="flex items-center gap-2">
                    <input type="radio" checked={formData.source_type === 'upload'} onChange={() => setFormData({ ...formData, source_type: 'upload' })} />
                    Upload video file
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" checked={formData.source_type === 'link'} onChange={() => setFormData({ ...formData, source_type: 'link' })} />
                    Video link
                  </label>
                </div>
                {formData.source_type === 'upload' ? (
                  <div>
                    <input type="file" accept="video/mp4,video/webm" onChange={(e) => setFormData({ ...formData, video_file: e.target.files?.[0] || null })} className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-300" required />
                    <p className="text-xs text-slate-400 mt-1">Max size: 500MB. Formats: MP4, WebM</p>
                  </div>
                ) : (
                  <div>
                    <input type="url" value={formData.video_url} onChange={(e) => setFormData({ ...formData, video_url: e.target.value })} placeholder="Paste a YouTube, TikTok, Facebook or direct video URL" className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-500" required />
                    <p className="text-xs text-slate-400 mt-1">YouTube, TikTok, Facebook and direct video links are supported.</p>
                  </div>
                )}
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

              {/* Visibility & playback */}
              <div className="space-y-3 bg-slate-700/40 border border-slate-600 rounded-lg p-4">
                <p className="text-sm font-semibold text-slate-300">Visibility & Playback</p>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="published"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="mt-1 w-4 h-4 rounded bg-slate-700 border-slate-600 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="published" className="ml-2 text-sm text-slate-300">
                    Publish immediately
                    <span className="block text-xs text-slate-500">
                      Unpublished videos stay as drafts and are never shown on the website.
                    </span>
                  </label>
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="is_public"
                    checked={formData.is_public}
                    onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                    className="mt-1 w-4 h-4 rounded bg-slate-700 border-slate-600 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="is_public" className="ml-2 text-sm text-slate-300">
                    Public - visitors can watch without logging in
                    <span className="block text-xs text-slate-500">
                      Uncheck to keep the video private (admin only).
                    </span>
                  </label>
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="autoplay"
                    checked={formData.autoplay}
                    onChange={(e) => setFormData({ ...formData, autoplay: e.target.checked })}
                    className="mt-1 w-4 h-4 rounded bg-slate-700 border-slate-600 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="autoplay" className="ml-2 text-sm text-slate-300">
                    Feature with autoplay on the Video Tutorials page
                    <span className="block text-xs text-slate-500">
                      Plays muted when scrolled into view, as required by browser autoplay policies.
                    </span>
                  </label>
                </div>
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
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Replace video source (optional) */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Replace Video Link (optional)
                </label>
                <input
                  type="url"
                  value={editData.video_url}
                  onChange={(e) => setEditData({ ...editData, video_url: e.target.value })}
                  placeholder="Leave blank to keep the current video"
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Paste a YouTube, TikTok, Facebook or direct video URL to swap the source.
                </p>
              </div>

              {/* Visibility & playback */}
              <div className="space-y-3 bg-slate-700/40 border border-slate-600 rounded-lg p-4">
                <p className="text-sm font-semibold text-slate-300">Visibility & Playback</p>

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

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="edit-is-public"
                    checked={editData.is_public}
                    onChange={(e) => setEditData({ ...editData, is_public: e.target.checked })}
                    className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="edit-is-public" className="ml-2 text-sm text-slate-300">
                    Public (visible to visitors without login)
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="edit-autoplay"
                    checked={editData.autoplay}
                    onChange={(e) => setEditData({ ...editData, autoplay: e.target.checked })}
                    className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="edit-autoplay" className="ml-2 text-sm text-slate-300">
                    Feature with muted autoplay
                  </label>
                </div>
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
