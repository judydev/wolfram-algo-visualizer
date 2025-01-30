'use client'

import { useState } from 'react'
import { WOLFRAM_API } from '../page'

export default function Query() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    try {
      const curlCommand = `curl -X GET "${WOLFRAM_API}${query}" -H "Content-Type: application/json"`;
      console.log('Curl command:', curlCommand); // Log the curl command for checking

      const response = await fetch("http://localhost:3001/query", {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        // body: JSON.stringify({ query }),
        // mode: 'no-cors',
      });

      console.log('Response:', response.status, response.statusText, response.body);

      if (!response.ok) {
        const currentTime = new Date().toLocaleString();
        throw new Error(`Failed to query: ${currentTime}`);
      }

      const textData = await response.text();
      console.log('Text data:', textData);

    //   const data = await response.json(); // Process the response data
    //   console.log('Json Data:', data);
      
      setResult(textData); // Set the result with the fetched data
    } catch (error) {
      setResult('Error querying: ' + error);
    }
  }

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your query"
          className="border p-2 mr-2 rounded"
        />
        <button 
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Query
        </button>
      </form>
      <div dangerouslySetInnerHTML={{ __html: result }} />
    </div>
  )
}
