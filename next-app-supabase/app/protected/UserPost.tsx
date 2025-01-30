'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'

export default function UserPost() {
  const [posts, setPosts] = useState<any[] | null>(null)
  const [session, setSession] = useState<any>(null);
  const supabase = createClient()

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };

    getSession();
  }, []);

  useEffect(() => {
    const getData = async () => {
      if (session) { // Check if user is logged in
        const { data, error } = await supabase.from('posts').select()
        if (error) {
          console.error('Error fetching posts:', error)
        } else {
          setPosts(data)
        }
      } else {
        console.log('User is not logged in')
      }
    }
    getData();
  }, [session]); // Depend on session

  if (!session) {
    return <div/>
  }

  return <pre>{JSON.stringify(posts, null, 2)}</pre>
}
