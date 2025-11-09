import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Languages, 
  ArrowRight, 
  Copy, 
  Download, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import { transcribeText, fetchScripts } from '../utils/api';
import './ScriptTranscription.css';

const ScriptTranscription = () => {
  const [inputText, setInputText] = useState('');
  const [inputScript, setInputScript] = useState('Latn');
  const [outputScript, setOutputScript] = useState('Arab');
  const [scripts, setScripts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadScripts();
  }, []);

  const loadScripts = async () => {
    try {
      const data = await fetchScripts();
      setScripts(data.scripts || []);
    } catch (err) {
      console.error('Error fetching scripts:', err);
    }
  };

  const handleTranscribe = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter text to transcribe');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await transcribeText(inputText, inputScript, outputScript);
      setResult(data);
      toast.success('Text transcribed successfully!');
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Text copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy text');
    }
  };

  const downloadResult = (text, filename) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Result downloaded!');
  };

  const clearAll = () => {
    setInputText('');
    setResult(null);
    setError(null);
  };

  return (
    <div className="script-transcription">
      <div className="transcription-header">
        <h1 className="transcription-title">Script Transcription</h1>
        <p className="transcription-description">
          Transcribe text between different ancient scripts using the Aksharamukha library. 
          Convert between Latin, Arabic, Brahmi, Greek, Hebrew, and other historical scripts.
        </p>
      </div>

      <div className="transcription-content">
        {/* Input Section */}
        <div className="input-section">
          <div className="script-selectors">
            <div className="script-selector">
              <label htmlFor="input-script">From Script</label>
              <select
                id="input-script"
                value={inputScript}
                onChange={(e) => setInputScript(e.target.value)}
                className="select"
              >
                {scripts.map((script) => (
                  <option key={script.code} value={script.code}>
                    {script.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="script-arrow">
              <ArrowRight size={24} />
            </div>

            <div className="script-selector">
              <label htmlFor="output-script">To Script</label>
              <select
                id="output-script"
                value={outputScript}
                onChange={(e) => setOutputScript(e.target.value)}
                className="select"
              >
                {scripts.map((script) => (
                  <option key={script.code} value={script.code}>
                    {script.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-input-section">
            <label htmlFor="input-text">Enter Text to Transcribe</label>
            <textarea
              id="input-text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type or paste your text here..."
              className="textarea"
              rows={6}
            />
            <div className="input-actions">
              <button
                className="btn btn-primary"
                onClick={handleTranscribe}
                disabled={loading || !inputText.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="loading" />
                    Transcribing...
                  </>
                ) : (
                  <>
                    <Languages size={20} />
                    Transcribe Text
                  </>
                )}
              </button>
              <button
                className="btn btn-secondary"
                onClick={clearAll}
                disabled={loading}
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <motion.div
            className="results-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="results-header">
              <h3>Transcription Result</h3>
              <div className="result-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => copyToClipboard(result.transliterated_text)}
                >
                  <Copy size={16} />
                  Copy Result
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => downloadResult(
                    result.transliterated_text, 
                    `transcription_${result.input_script}_to_${result.output_script}.txt`
                  )}
                >
                  <Download size={16} />
                  Download
                </button>
              </div>
            </div>

            <div className="results-content">
              <div className="transcription-pair">
                <div className="text-block">
                  <div className="text-label">
                    Original ({scripts.find(s => s.code === result.input_script)?.name || result.input_script})
                  </div>
                  <div className="text-content">
                    {result.original_text}
                  </div>
                  <button
                    className="copy-btn"
                    onClick={() => copyToClipboard(result.original_text)}
                    title="Copy original text"
                  >
                    <Copy size={16} />
                  </button>
                </div>

                <div className="arrow-separator">
                  <ArrowRight size={20} />
                </div>

                <div className="text-block">
                  <div className="text-label">
                    Transcribed ({scripts.find(s => s.code === result.output_script)?.name || result.output_script})
                  </div>
                  <div className="text-content">
                    {result.transliterated_text}
                  </div>
                  <button
                    className="copy-btn"
                    onClick={() => copyToClipboard(result.transliterated_text)}
                    title="Copy transcribed text"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Error Section */}
        {error && (
          <motion.div
            className="error-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="error-message">
              <AlertCircle size={20} />
              <p>{error}</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ScriptTranscription;
