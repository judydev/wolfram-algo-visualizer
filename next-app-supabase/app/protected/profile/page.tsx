'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import PostForm from '@/app/protected/PostForm'
import React from 'react'
import AuthenticatedWrapper from '../AuthenticatedWrapper'
import EditNoteIcon from '@mui/icons-material/EditNote';

export default function ProfilePage() {
  const [posts, setPosts] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const supabase = createClient()
  const [selectedPost, setSelectedPost] = useState<any>(null)

  useEffect(() => {
    const fetchPosts = async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      
      const { data, error } = await supabase.from('posts').select().eq('user_id', userData.user?.id)
      if (error) {
        console.error('Error fetching posts:', error)
      } else {
        setPosts(data)
      }
    }
    fetchPosts()
  }, [])

  return (
    <div className="profile-page p-6 bg-gray-200 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-4 text-gray-900">User Posts</h1>
      <div className="flex">
        <div className="w-2/3 pl-4">
          {posts.length > 0 ? (
            posts.map((post) => (
              <div key={post.id} className="mb-4 p-4 bg-white rounded-lg shadow">
                <div className="flex items-center">
                    <h3 className="text-xl font-bold text-gray-900">Problem: {post.problem_title}</h3>
                    <button 
                        className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200 ml-2"
                        onClick={() => handleEditPost(post.id)}
                    >
                        <EditNoteIcon fontSize="small" />
                    </button>
                </div>
                <p className="text-gray-800">{post.description}</p>
                {post.wolfram_link && (
                  <a href={post.wolfram_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {post.wolfram_link}
                  </a>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-600">No posts available.</p>
          )}
        </div>
      </div>

      <AuthenticatedWrapper>
        {showForm && <PostForm 
            count={posts.length} 
            selectedAlgorithm={selectedPost?.problem_title} 
            oldId={selectedPost?.id}
            oldNotebookLink={selectedPost?.wolfram_link} 
            oldDescription={selectedPost?.description} 
            onCancel={() => setShowForm(false)} 
            />}
      </AuthenticatedWrapper>
    </div>
  )

  function handleEditPost(id: string) {
    const postToEdit = posts.find(post => post.id === id)
    setSelectedPost(postToEdit)
    setShowForm(true)
  }
}