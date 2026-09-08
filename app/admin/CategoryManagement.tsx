'use client'

import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { VideoCategory } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth-context'

interface CategoryWithCount extends VideoCategory {
  video_count?: number
}

interface CategoryManagementProps {
  onBackToVideos?: () => void
}

export default function CategoryManagement({ onBackToVideos }: CategoryManagementProps) {
  const { getAccessToken } = useAuth()
  const [categories, setCategories] = useState<CategoryWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [newCategory, setNewCategory] = useState({ name: '', description: '' })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState({ name: '', description: '' })

  const adminFetch = useCallback(
    async (input: RequestInfo | URL, init: RequestInit = {}) => {
      const token = await getAccessToken()
      if (!token) throw new Error('Admin session not found')
      const headers = new Headers(init.headers)
      headers.set('Authorization', `Bearer ${token}`)
      return fetch(input, { ...init, headers })
    },
    [getAccessToken]
  )

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true)
      setLoadError(null)
      const response = await adminFetch('/api/admin/categories')
      const data = await response.json()
      if (data.success) {
        setCategories(data.categories || [])
      } else {
        setLoadError(data.error || 'Failed to load categories')
      }
    } catch (error) {
      console.error('Error loading categories:', error)
      setLoadError(error instanceof Error ? error.message : 'Failed to load categories')
    } finally {
      setLoading(false)
    }
  }, [adminFetch])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategory.name.trim()) {
      toast.error('Please enter a category name')
      return
    }

    setSaving(true)
    try {
      const response = await adminFetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategory.name,
          description: newCategory.description,
        }),
      })
      const data = await response.json()
      if (data.success) {
        toast.success('Category created')
        setNewCategory({ name: '', description: '' })
        loadCategories()
      } else {
        toast.error(data.error || 'Failed to create category')
      }
    } catch (error) {
      console.error('Error creating category:', error)
      toast.error('Failed to create category')
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (category: CategoryWithCount) => {
    setEditingId(category.id)
    setEditValues({ name: category.name, description: category.description || '' })
  }

  const handleUpdate = async (categoryId: string) => {
    if (!editValues.name.trim()) {
      toast.error('Category name cannot be empty')
      return
    }

    setSaving(true)
    try {
      const response = await adminFetch(`/api/admin/categories/${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editValues),
      })
      const data = await response.json()
      if (data.success) {
        toast.success('Category updated')
        setEditingId(null)
        loadCategories()
      } else {
        toast.error(data.error || 'Failed to update category')
      }
    } catch (error) {
      console.error('Error updating category:', error)
      toast.error('Failed to update category')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (category: CategoryWithCount) => {
    if (!confirm(`Delete the category "${category.name}"?`)) return

    setSaving(true)
    try {
      let response = await adminFetch(`/api/admin/categories/${category.id}`, { method: 'DELETE' })
      let data = await response.json()

      // The category still has videos attached. Deleting it cascades to those
      // videos, so ask for explicit confirmation before forcing it through.
      if (!data.success && data.requiresForce) {
        const confirmed = confirm(
          `"${category.name}" still has ${data.videoCount} video(s).\n\n` +
            `Deleting this category will ALSO DELETE those videos permanently.\n\n` +
            `Click OK only if you are sure. Otherwise click Cancel and move the videos to another category first.`
        )
        if (!confirmed) {
          toast('Deletion cancelled')
          return
        }
        response = await adminFetch(`/api/admin/categories/${category.id}?force=true`, {
          method: 'DELETE',
        })
        data = await response.json()
      }

      if (data.success) {
        toast.success(data.message || 'Category deleted')
        loadCategories()
      } else {
        toast.error(data.error || 'Failed to delete category')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('Failed to delete category')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Video Categories</h2>
          <p className="text-sm text-slate-400 mt-1">
            Categories appear in the Video Upload form and as filters on the public Video Tutorials page.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadCategories}
            className="px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition"
          >
            Refresh
          </button>
          {onBackToVideos && (
            <button
              onClick={onBackToVideos}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Back to Videos
            </button>
          )}
        </div>
      </div>

      {/* Add category */}
      <form
        onSubmit={handleCreate}
        className="bg-slate-700/50 border border-slate-600 rounded-lg p-5 mb-8"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Add New Category</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Category Name *</label>
            <input
              type="text"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              placeholder="e.g. Bot Performance"
              className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Description</label>
            <input
              type="text"
              value={newCategory.description}
              onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
              placeholder="Optional short description"
              className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="mt-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2 px-6 rounded-lg transition"
        >
          {saving ? 'Saving...' : '+ Add Category'}
        </button>
      </form>

      {/* Category list */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-slate-400">Loading categories...</p>
        </div>
      ) : loadError ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
          <p className="text-red-400 font-semibold mb-1">Could not load categories</p>
          <p className="text-sm text-red-300/80 mb-4">{loadError}</p>
          <button
            onClick={loadCategories}
            className="px-4 py-2 border border-red-500/40 text-red-300 rounded-lg hover:bg-red-500/10 transition"
          >
            Try again
          </button>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12 bg-slate-700/50 rounded-lg">
          <p className="text-slate-400">No categories yet</p>
          <p className="text-sm text-slate-500 mt-2">
            Add your first category above. At least one category is required before you can upload a video.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 hover:border-slate-500 transition"
            >
              {editingId === category.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editValues.name}
                    onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    value={editValues.description}
                    onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                    placeholder="Description"
                    className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(category.id)}
                      disabled={saving}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold py-2 px-4 rounded-lg transition"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-4 py-2 border border-slate-600 text-slate-300 text-sm rounded-lg hover:bg-slate-700 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-4 justify-between items-start">
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-white">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-slate-400 mt-1">{category.description}</p>
                    )}
                    <p className="text-xs text-slate-500 mt-2">
                      {category.video_count || 0} video{category.video_count === 1 ? '' : 's'}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => startEdit(category)}
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(category)}
                      disabled={saving}
                      className="text-red-400 hover:text-red-300 disabled:opacity-50 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
