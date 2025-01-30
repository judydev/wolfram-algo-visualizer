'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'

export default function ProfilePage() {
  const [posts, setPosts] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase.from('posts').select()
      if (error) {
        console.error('Error fetching posts:', error)
      } else {
        setPosts(data)
      }
    }
    fetchPosts()
  }, [])

  return (
    <div className="profile-page">
      <h1>User Posts</h1>
      {posts.length > 0 ? (
        <ul>
          {posts.map((post) => (
            <li key={post.id}>{post.content}</li>
          ))}
        </ul>
      ) : (
        <p>No posts available.</p>
      )}
    <hr className="my-4" />
    </div>
  )
}
