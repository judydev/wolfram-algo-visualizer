"use client";
import { useEffect, useState } from "react";
import ScreenSearchDesktopIcon from '@mui/icons-material/ScreenSearchDesktop';
import WolframPlayground from "./ui/WolframPlayground";
import EditNoteIcon from '@mui/icons-material/EditNote';
import LaunchIcon from '@mui/icons-material/Launch';
import Solutions from "./ui/Solutions";
import PostForm from "./protected/PostForm";
import { createClient } from "@/utils/supabase/client";
import AuthenticatedWrapper from "./protected/AuthenticatedWrapper";

export default function Home() {
  const defaultVisualization = <div>No visualization available</div>;  

  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string | null>(null);
  const [visualization, setVisualization] = useState<React.ReactNode>(defaultVisualization);
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [problems, setProblems] = useState<any[]>([]);

  const itemsPerPage = 10;
  const supabase = createClient();

  // Update useEffect to include currentPage dependency
  useEffect(() => {
    fetchProblems();
  }, [currentPage]);  
  
  const fetchProblems = async () => {
    
    // First get total count
    const { count } = await supabase
      .from('problems')
      .select('*', { count: 'exact', head: true });

    // Then fetch paginated data
    const { data, error } = await supabase
      .from('problems')
      .select('*')
      .range(startIndex, startIndex + itemsPerPage - 1)
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching problems:', error);
      return;
    }

    setTotalCount(count || 0);
    // Add state to store the fetched problems
    setProblems(data || []);
  };

  // Update total pages calculation to use actual count
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;

  const currentItems = problems;

  const handleAlgorithmSelect = (algorithm: string) => {
    setSelectedAlgorithm(algorithm);
    setVisualization(<Solutions problem={algorithm}/>);    
  };

  const askAI = () => {
    setSelectedAlgorithm("Ask AI");
    setVisualization(<WolframPlayground />);    
  }

  const launchLeetcodeProblem = (problem: string) => {
    const problemData = problems.find(p => p.title === problem);
    if (problemData) {
      const url = `https://leetcode.com/problems/${problemData.titleSlug}/`;
      window.open(url, '_blank');
    } else {
      console.error('Problem not found:', problem);
    }
  }

  const addSolution = async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError) alert("You must log in to proceed.");
    else setShowForm(true);
  }

  console.log('currentItems  ', currentItems)
  return (
    <div className="flex flex-col min-h-screen">
      {/* Content Container */}
      <div className="flex flex-1">
        {/* Left Sidebar */}
        <aside className="w-64 bg-gray-100 dark:bg-gray-800 p-4 border-r border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-4">Algorithms</h2>
          <nav>
            <ul className="space-y-2">
              <li key="Ask AI">  
                <button
                    onClick={() => askAI()}
                    className={`w-full text-left px-4 py-2 rounded border-2 
                      ${selectedAlgorithm === "Ask AI" 
                        ? "border-black" 
                        : "border-black bg-gray-800 text-gray-400 hover:bg-gray-700"}
                    `}
                  >
                    <ScreenSearchDesktopIcon />
                    &nbsp;
                    Ask AI
                </button>
              </li>
              <li key="Wolfram Playground">  
                <button
                    onClick={() => handleAlgorithmSelect("Wolfram Playground")}
                    className={`w-full text-left px-4 py-2 rounded border-2 
                      ${selectedAlgorithm === "Wolfram Playground" 
                        ? "border-black" 
                        : "border-black bg-gray-800 text-gray-400 hover:bg-gray-700"}
                    `}
                  >
                    <EditNoteIcon />
                    &nbsp;
                    Wolfram Playground
                </button>
              </li>
              <li key="Bubble Sort">  
                <button
                    onClick={() => handleAlgorithmSelect("Bubble Sort")}
                    className={`w-full text-left px-4 py-2 rounded 
                      ${
                        selectedAlgorithm === "Bubble Sort"
                          ? "bg-blue-500 text-white hover:bg-blue-600"
                          : "hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                  >
                    Bubble Sort
                  </button>
              </li>
              {currentItems.map((problem) => (
                <li key={problem.title}>
                  <button
                    onClick={() => handleAlgorithmSelect(problem.title)}
                    className={`w-full text-left px-4 py-2 rounded flex justify-between 
                      ${
                        selectedAlgorithm === problem.title
                          ? "bg-blue-500 text-white hover:bg-blue-600"
                          : "hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                  >
                    {`${problem.id}. ${problem.title} ${problem.solution_count > 0 ? `(${problem.solution_count})` : ''}`}
                    <LaunchIcon fontSize="small" onClick={() => launchLeetcodeProblem(problem.title)}/>
                  </button>
                </li>
              ))}
            </ul>

            {/* Add pagination controls */}
            <div className="mt-4 flex justify-between items-center">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="ml-2 px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:bg-gray-300 disabled:opacity-50 transition duration-200"
              >
                &lt;
              </button>
              <div className="flex items-center">
                <span className="text-sm mr-1">Page</span>
                <input
                  type="number"
                  value={currentPage}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value >= 1 && value <= totalPages) {
                      setCurrentPage(value);
                    }
                  }}
                  className="w-12 px-1 py-0.5 text-center text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
                  min="1"
                  max={totalPages}
                />
                <span className="text-sm ml-1">of {totalPages}</span>
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="mr-2 px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:bg-gray-300 disabled:opacity-50 transition duration-200"
              >
                &gt;
              </button>
            </div>
          </nav>
        </aside>

        <main className="flex-1 p-8">
          <h3 className="text-2xl font-bold mb-6">
            {selectedAlgorithm ? `${selectedAlgorithm}` : "Select an algorithm to begin"}
          </h3>

          {selectedAlgorithm && (
            <>
              <button 
                onClick={() => addSolution()}
                className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
              >
                Add Solution
              </button>
              <AuthenticatedWrapper>
                {showForm && <PostForm count={totalCount} selectedAlgorithm={selectedAlgorithm} onCancel={() => setShowForm(false)} />}
              </AuthenticatedWrapper>
            </>
          )}

          {selectedAlgorithm && (
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg">
              {visualization}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
