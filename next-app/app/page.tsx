"use client";
import { useState } from "react";
import EmbedNotebook from "./ui/EmbedNotebook";
import ScreenSearchDesktopIcon from '@mui/icons-material/ScreenSearchDesktop';
import WolframPlayground from "./ui/WolframPlayground";
import EditNoteIcon from '@mui/icons-material/EditNote';
import LaunchIcon from '@mui/icons-material/Launch';
import problems from './scripts/problems.json';

const hashmap = new Map(problems.data.problemsetQuestionListV2.questions.map(question => [question.title, question]));

export default function Home() {
  const defaultVisualization = <div>No visualization available</div>;

  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string | null>(null);
  const [visualization, setVisualization] = useState<React.ReactNode>(defaultVisualization);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate total pages and current page items
  const totalPages = Math.ceil(hashmap.size / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = Array.from(hashmap.entries())
    .slice(startIndex, startIndex + itemsPerPage);

  const handleAlgorithmSelect = (algorithm: string) => {
    setSelectedAlgorithm(algorithm);

    switch (algorithm) {
      case "Bubble Sort":
        setVisualization(<EmbedNotebook />);
        break;
      // case "Wolfram Playground ":
      //   setVisualization(<EmbedPlaygroundIframe />);
      //   break;
      // case "Plot":
      //   setVisualization(<EmbedPlot />);
      //   break;
      default:
        setVisualization(defaultVisualization);
    }
  };

  const askAI = () => {
    setSelectedAlgorithm("Ask AI");

    setVisualization(<WolframPlayground />);    
  }

  const launchLeetcodeProblem = (problem: string) => {
  const problemData = hashmap.get(problem);
  if (problemData) {
    const url = `https://leetcode.com/problems/${problemData.titleSlug}/`;
    window.open(url, '_blank');
  } else {
    console.error('Problem not found:', problem);
  }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Header */}
      <header className="w-full bg-white dark:bg-gray-900 p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl font-bold text-center">
          Algorithm Visualization with Wolfram
        </h1>
      </header>

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
              {currentItems.map(([algorithm, data]) => (
                <li key={algorithm}>
                  <button
                    onClick={() => handleAlgorithmSelect(algorithm)}
                    className={`w-full text-left px-4 py-2 rounded flex justify-between 
                      ${
                        selectedAlgorithm === algorithm
                          ? "bg-blue-500 text-white hover:bg-blue-600"
                          : "hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                  >
                    {`${data.id}. ${algorithm}`}
                    <LaunchIcon fontSize="small" onClick={() => launchLeetcodeProblem(algorithm)}/>
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
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg">
              {visualization}
          </div>
        </main>
      </div>
    </div>
  );
}

