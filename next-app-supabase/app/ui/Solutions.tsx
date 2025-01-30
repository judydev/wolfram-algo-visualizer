import React, { useEffect, useState } from 'react';
import EmbedNotebook from './EmbedNotebook';
import { createClient } from "@/utils/supabase/client";
import AuthenticatedWrapper from '../protected/AuthenticatedWrapper';
import PostForm from '../protected/PostForm';

const Solutions = ({ problem }: { problem: string }) => {
  const [data, setData] = useState<any[]>([]); // Changed to array type
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isAuthor, setIsAuthor] = useState(false);

  const itemsPerPage = 1;
  const supabase = createClient();

  const fetchSolutions = async (problemTitle: string, page: number) => {
    setLoading(true);

    // First get total count
    const { count, error: countError } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('problem_title', problemTitle);

    setLoading(false);

    if (countError) {
      console.error('Error fetching count:', countError);
      return { data: [], count: 0 };
    } else if (count == 0) {
      return { data: [], count: 0 };
    }

    // Then fetch paginated data
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('problem_title', problemTitle)
      .range((page - 1) * itemsPerPage, (page * itemsPerPage) - 1)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching solutions:', error);
      return { data: [], count: 0 };
    }

    const { data: userData, error: userError } = await supabase.auth.getUser()
    setIsAuthor(userData.user?.id == data[0].user_id)
    return { data, count };
  };

  useEffect(() => {
    console.log('Init:', problem);
    const fetchPosts = async () => {
        const { data, error } = await supabase.from('posts').select()
        if (error) {
            console.error('Error fetching posts:', error)
        } else {
            // setPosts(data)
            console.log(data)
        }
    }

    setLoading(true);
    fetchPosts()
    setLoading(false);
  }, [])

  useEffect(() => {
    console.log('Debug - Problem changed:', problem);
    const getNotebookLink = async () => {
      const { data, count } = await fetchSolutions(problem, currentPage);
      setData(data || []);
      setTotalCount(count || 0);
    };

    setLoading(true);
    getNotebookLink();
    setLoading(false);
  }, [problem, currentPage]);

  const handleNextPage = () => {
    if (currentPage < Math.ceil(totalCount / itemsPerPage)) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  if (loading) {
    return <div>Loading...</div>
  }

  if (totalCount == 0) {
    return <div>No solutions posted</div>
  }

  return (
    <div className="solutions-container">
      <div className="text-sm text-gray-500 my-2">
        <div className="flex gap-2 inline-block ml-4">
          Solution {currentPage} of {Math.ceil(totalCount / itemsPerPage)}
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="px-2 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Previous
          </button>
          <button
            onClick={handleNextPage}
            disabled={currentPage >= Math.ceil(totalCount / itemsPerPage)}
            className="px-2 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Next
          </button>
          <AuthenticatedWrapper>
            {isAuthor && (
            <div key={data[0].id} className="solution-item text-right">
                <button
                      onClick={() => setShowForm(true)} // handleEdit should be defined to handle the edit action
                    className="px-2 py-1 bg-yellow-500 text-white rounded"
                >
                    Edit
                </button>
                <span className="mx-1"/>
                <button
                      onClick={() => handleDelete(data[0].id)} // handleEdit should be defined to handle the edit action
                    className="px-2 py-1 bg-red-500 text-white rounded"
                >
                    Delete
                </button>
            </div>
            )}
        </AuthenticatedWrapper>
        </div>
      </div>

      <div className="solution-description my-2">
        <p>{data[0]?.description}</p>
      </div>
      {data[0] && <EmbedNotebook notebookLink={data[0].wolfram_link} />}

      <AuthenticatedWrapper>
        {showForm && <PostForm 
            count={totalCount} 
            selectedAlgorithm={problem} 
            oldId={data[0].id}
            oldNotebookLink={data[0].wolfram_link} 
            oldDescription={data[0].description} 
            onCancel={() => setShowForm(false)} 
            />}
      </AuthenticatedWrapper>
    </div>
  );

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Are you sure you want to delete this solution?");
    if (confirmed) {
        // Proceed with deletion
        const supabase = await createClient();
        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError
        
        const { data, error } = await supabase
            .from('posts')
            .delete()
            .match({id: id});

        if (error) alert("Error deleting post");
        else alert("Post deleted");
    }
  }
};

export default Solutions;
