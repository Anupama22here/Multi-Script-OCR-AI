import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Image as ImageIcon, 
  X, 
  Loader2, 
  Copy, 
  Download,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import { uploadFile } from '../utils/api';
import './OCRUpload.css';

const OCRUpload = ({ 
  title, 
  description, 
  endpoint, 
  buttonText = 'Extract Text',
  acceptedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
  maxSize = 10 * 1024 * 1024 // 10MB
}) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0].code === 'file-too-large') {
        toast.error('File size must be less than 10MB');
      } else if (rejection.errors[0].code === 'file-invalid-type') {
        toast.error('Please upload a valid image file (JPEG, PNG, WebP)');
      }
      return;
    }

    const selectedFile = acceptedFiles[0];
    setFile(selectedFile);
    setError(null);
    setResult(null);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(selectedFile);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize,
    multiple: false
  });

  const processImage = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const data = await uploadFile(endpoint, file);
      setResult(data);
      // Check if this is Brahmi script classification
      const successMessage = endpoint.includes('/brahmi') 
        ? 'Script family identified successfully!' 
        : 'Text extracted successfully!';
      toast.success(successMessage);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (result?.text) {
      try {
        await navigator.clipboard.writeText(result.text);
        toast.success('Text copied to clipboard!');
      } catch (err) {
        toast.error('Failed to copy text');
      }
    }
  };

  const downloadResult = () => {
    if (result?.text) {
      const blob = new Blob([result.text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ocr_result_${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Result downloaded!');
    }
  };

  const clearAll = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="ocr-upload">
      <div className="ocr-header">
        <h1 className="ocr-title">{title}</h1>
        <p className="ocr-description">{description}</p>
      </div>

      <div className="ocr-content">
        {/* Upload Area */}
        <div className="upload-section">
          <div
            {...getRootProps()}
            className={`upload-area ${isDragActive ? 'active' : ''} ${file ? 'has-file' : ''}`}
          >
            <input {...getInputProps()} />
            <div className="upload-content">
              {preview ? (
                <div className="preview-container">
                  <img src={preview} alt="Preview" className="preview-image" />
                  <button
                    className="remove-file"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearAll();
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <Upload size={48} />
                  <h3>Drop your image here</h3>
                  <p>or click to browse files</p>
                  <div className="upload-info">
                    <p>Supports: JPEG, PNG, WebP</p>
                    <p>Max size: 10MB</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {file && (
            <motion.div
              className="file-info"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="file-details">
                <ImageIcon size={20} />
                <div>
                  <p className="file-name">{file.name}</p>
                  <p className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button
                className="btn btn-primary"
                onClick={processImage}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="loading" />
                    Processing...
                  </>
                ) : (
                  buttonText
                )}
              </button>
            </motion.div>
          )}
        </div>

        {/* Results Section */}
        <AnimatePresence>
          {(result || error) && (
            <motion.div
              className="results-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="results-header">
                <h3>{endpoint.includes('/brahmi') ? 'Script Classification Result' : 'Extracted Text'}</h3>
                {result && (
                  <div className="result-actions">
                    <button
                      className="btn btn-secondary"
                      onClick={copyToClipboard}
                    >
                      <Copy size={16} />
                      Copy
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={downloadResult}
                    >
                      <Download size={16} />
                      Download
                    </button>
                  </div>
                )}
              </div>

              <div className="results-content">
                {error ? (
                  <div className="error-message">
                    <AlertCircle size={20} />
                    <p>{error}</p>
                  </div>
                ) : result ? (
                  <div className="success-message">
                    <CheckCircle size={20} />
                    <div className="extracted-text">
                      <p>{result.text || 'No text detected'}</p>
                    </div>
                  </div>
                ) : null}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OCRUpload;
