import { useState } from 'react';

const WolframPlayground = () => {
  const [code, setCode] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
  };

  const handleRunCode = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/runWolframCode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setResult(data.result);
      }
    } catch (e) {
      setError('Error connecting to Wolfram Cloud: ' + e);
    }

    setLoading(false);
  };

  return (
    <div className="playground">
      <h1>Wolfram Language Playground</h1>
      <textarea
        value={code}
        onChange={handleCodeChange}
        placeholder="Type Wolfram Language code here..."
        rows={10}
        style={{ width: '100%', fontFamily: 'monospace' }}
      />
      <button onClick={handleRunCode} disabled={loading}>
        {loading ? 'Running...' : 'Run Code'}
      </button>

      {error && <div className="error">{error}</div>}
      {result && <div className="result"><strong>Result:</strong><pre>{result}</pre></div>}
    </div>
  );
};

export default WolframPlayground;
