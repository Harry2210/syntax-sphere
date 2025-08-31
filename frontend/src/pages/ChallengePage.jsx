import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ChallengePage = ({ challengeId }) => {
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [generatingTestCase, setGeneratingTestCase] = useState(false);
  const [generatedTestCase, setGeneratedTestCase] = useState(null);

  useEffect(() => {
    const fetchChallenge = async () => {
      // Check if challengeId is valid before making the API call
      if (!challengeId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5000/api/challenges/${challengeId}`);
        setChallenge(res.data);
        setLanguage(res.data.languages[0] || 'python'); // Set initial language
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch challenge:', error);
        setLoading(false);
      }
    };

    fetchChallenge();
  }, [challengeId]);

  const handleCodeChange = (e) => {
    setCode(e.target.value);
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const res = await axios.post(`http://localhost:5000/api/challenges/${challengeId}/submit`, {
        code,
        language,
      });
      setResult(res.data);
      setSubmitting(false);
    } catch (error) {
      console.error('Submission failed:', error);
      setResult(error.response.data);
      setSubmitting(false);
    }
  };

  const handleGenerateTestCase = async () => {
    setGeneratingTestCase(true);
    try {
      const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=';
      const userPrompt = `Generate a single, interesting test case for the following coding challenge problem description.
      Problem: ${challenge.description}
      Expected format is a JSON object with 'input' and 'expectedOutput' fields. Do not include any extra text.`;

      const payload = {
        contents: [{ parts: [{ text: userPrompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: "OBJECT",
                properties: {
                    "input": { "type": "STRING" },
                    "expectedOutput": { "type": "STRING" }
                }
            }
        },
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const newTestCase = JSON.parse(result.candidates[0].content.parts[0].text);
      setGeneratedTestCase(newTestCase);
    } catch (error) {
      console.error('Failed to generate test case:', error);
      setGeneratedTestCase({ input: 'Error', expectedOutput: 'Failed to generate test case.' });
    } finally {
      setGeneratingTestCase(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
        <p className="ml-4 text-xl">Loading challenge...</p>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
        <p className="text-xl">Challenge not found.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen p-8 font-inter">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Challenge Header */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
            {challenge.title}
          </h1>
          <p className="text-gray-400 text-lg">{challenge.description}</p>
        </div>

        {/* Challenge Content and Editor */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Panel: Problem Details */}
          <div className="md:w-1/2 bg-gray-800 p-6 rounded-xl shadow-lg space-y-4">
            <h2 className="text-2xl font-semibold border-b border-gray-700 pb-2 mb-4">
              Problem Description
            </h2>
            <p className="text-gray-300 whitespace-pre-wrap">{challenge.description}</p>

            <h3 className="text-xl font-semibold mt-6">Example Test Cases</h3>
            {challenge.testCases.map((tc, index) => (
              <div key={index} className="bg-gray-700 p-4 rounded-lg">
                <p className="font-mono text-sm text-gray-200">
                  <strong className="text-purple-400">Input:</strong> {tc.input}
                </p>
                <p className="font-mono text-sm text-gray-200">
                  <strong className="text-pink-400">Expected Output:</strong> {tc.expectedOutput}
                </p>
              </div>
            ))}
            
            <button
              onClick={handleGenerateTestCase}
              disabled={generatingTestCase}
              className={`mt-4 w-full px-4 py-2 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                generatingTestCase
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg'
              }`}
            >
              {generatingTestCase ? 'Generating...' : '✨ Suggest a Test Case ✨'}
            </button>

            {generatedTestCase && (
              <div className="bg-gray-700 p-4 rounded-lg mt-4 animate-fadeIn">
                <p className="text-lg font-semibold border-b border-gray-600 pb-2 mb-2">
                  Generated Test Case
                </p>
                <p className="font-mono text-sm text-gray-200">
                  <strong className="text-purple-400">Input:</strong> {generatedTestCase.input}
                </p>
                <p className="font-mono text-sm text-gray-200">
                  <strong className="text-pink-400">Expected Output:</strong> {generatedTestCase.expectedOutput}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  (Generated by Gemini API)
                </p>
              </div>
            )}
          </div>

          {/* Right Panel: Code Editor */}
          <div className="md:w-1/2 bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col">
            <div className="flex items-center space-x-4 mb-4">
              <label htmlFor="language-select" className="text-lg font-semibold">
                Language:
              </label>
              <select
                id="language-select"
                className="bg-gray-700 text-white rounded-md p-2 focus:outline-none"
                value={language}
                onChange={handleLanguageChange}
              >
                {challenge.languages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-grow rounded-lg overflow-hidden">
              <textarea
                className="w-full h-full bg-gray-700 text-white font-mono p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                spellCheck="false"
                value={code}
                onChange={handleCodeChange}
                placeholder="Write your code here..."
              />
            </div>
            
            <div className="flex justify-end mt-4">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className={`px-8 py-3 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                  submitting
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg'
                }`}
              >
                {submitting ? 'Submitting...' : 'Run & Submit'}
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg mt-8">
            <h2 className="text-2xl font-semibold border-b border-gray-700 pb-2 mb-4">
              Submission Results
            </h2>
            <div className="space-y-4">
              {result.results.map((res, index) => (
                <div key={index} className="bg-gray-700 p-4 rounded-lg">
                  <p
                    className={`font-bold text-lg ${
                      res.passed ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    Test Case {index + 1}: {res.passed ? 'Passed' : 'Failed'}
                  </p>
                  {res.error && (
                    <p className="text-red-300 mt-2">
                      <strong className="text-red-400">Error:</strong> {res.error}
                    </p>
                  )}
                  {!res.isExample && (
                    <p className="text-gray-400 text-sm mt-2">
                      (This is a hidden test case.)
                    </p>
                  )}
                </div>
              ))}
            </div>
            <p
              className={`text-2xl font-bold mt-6 text-center ${
                result.allPassed ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {result.message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengePage;
