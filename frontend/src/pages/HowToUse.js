import React from 'react';
import { motion } from 'framer-motion';
import { 
  PenTool, 
  Camera, 
  Scroll, 
  Languages, 
  Upload, 
  FileText, 
  Download,
  CheckCircle,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import './HowToUse.css';

const HowToUse = () => {
  const steps = [
    {
      icon: Upload,
      title: 'Upload Image',
      description: 'Drag and drop your image or click to browse files',
      tips: ['Supported formats: JPEG, PNG, WebP', 'Maximum file size: 10MB', 'Ensure good image quality']
    },
    {
      icon: FileText,
      title: 'Process Text',
      description: 'Click "Extract Text" to start OCR processing',
      tips: ['Processing time varies by image complexity', 'Larger images may take longer', 'Ensure stable internet connection']
    },
    {
      icon: Download,
      title: 'Get Results',
      description: 'Copy or download the extracted text',
      tips: ['Text is automatically copied to clipboard', 'Download as .txt file', 'Results are not stored on our servers']
    }
  ];

  const ocrTypes = [
    {
      icon: PenTool,
      title: 'Handwritten OCR',
      description: 'Best for handwritten Tamil text',
      tips: [
        'Use clear, well-lit images',
        'Ensure text is not too small',
        'Avoid heavily stylized handwriting',
        'Clean background works best'
      ]
    },
    {
      icon: Camera,
      title: 'Natural Scenes OCR',
      description: 'Perfect for printed text and documents',
      tips: [
        'Capture text straight-on when possible',
        'Good lighting is essential',
        'Avoid shadows on text',
        'Higher resolution images work better'
      ]
    },
    {
      icon: Scroll,
      title: 'Brahmi Script OCR',
      description: 'Specialized for ancient Brahmi inscriptions',
      tips: [
        'Use high-quality images of inscriptions',
        'Ensure good contrast',
        'Avoid damaged or unclear text',
        'Our custom model is trained for Brahmi scripts'
      ]
    },
    {
      icon: Languages,
      title: 'Script Transcription',
      description: 'Convert between different Indic scripts',
      tips: [
        'Enter text in the source script',
        'Select correct input and output scripts',
        'Works with various Indic languages',
        'Supports Unicode output'
      ]
    }
  ];

  const bestPractices = [
    {
      icon: CheckCircle,
      title: 'Image Quality',
      description: 'Use high-resolution images with good contrast and lighting'
    },
    {
      icon: AlertTriangle,
      title: 'Text Clarity',
      description: 'Ensure text is clearly visible and not obscured'
    },
    {
      icon: Lightbulb,
      title: 'File Format',
      description: 'JPEG and PNG formats work best for OCR processing'
    }
  ];

  return (
    <div className="how-to-use">
      <div className="page-header">
        <h1 className="page-title">How to Use OCR</h1>
        <p className="page-description">
          Learn how to get the best results from our OCR application
        </p>
      </div>

      {/* General Steps */}
      <section className="steps-section">
        <div className="container">
          <h2 className="section-title">General Process</h2>
          <div className="steps-grid">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  className="step-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="step-number">{index + 1}</div>
                  <div className="step-icon">
                    <Icon size={32} />
                  </div>
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-description">{step.description}</p>
                  <ul className="step-tips">
                    {step.tips.map((tip, tipIndex) => (
                      <li key={tipIndex}>{tip}</li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* OCR Types */}
      <section className="ocr-types-section">
        <div className="container">
          <h2 className="section-title">OCR Types & Tips</h2>
          <div className="ocr-types-grid">
            {ocrTypes.map((type, index) => {
              const Icon = type.icon;
              return (
                <motion.div
                  key={type.title}
                  className="ocr-type-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="ocr-type-icon">
                    <Icon size={40} />
                  </div>
                  <h3 className="ocr-type-title">{type.title}</h3>
                  <p className="ocr-type-description">{type.description}</p>
                  <ul className="ocr-type-tips">
                    {type.tips.map((tip, tipIndex) => (
                      <li key={tipIndex}>{tip}</li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Best Practices */}
      <section className="best-practices-section">
        <div className="container">
          <h2 className="section-title">Best Practices</h2>
          <div className="practices-grid">
            {bestPractices.map((practice, index) => {
              const Icon = practice.icon;
              return (
                <motion.div
                  key={practice.title}
                  className="practice-card"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="practice-icon">
                    <Icon size={24} />
                  </div>
                  <h3 className="practice-title">{practice.title}</h3>
                  <p className="practice-description">{practice.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Troubleshooting */}
      <section className="troubleshooting-section">
        <div className="container">
          <h2 className="section-title">Troubleshooting</h2>
          <div className="troubleshooting-content">
            <div className="troubleshooting-item">
              <h4>No text detected</h4>
              <p>Try improving image quality, ensuring better lighting, or using a different image format.</p>
            </div>
            <div className="troubleshooting-item">
              <h4>Inaccurate results</h4>
              <p>Ensure the text is clear and not distorted. Try different OCR modes for different text types.</p>
            </div>
            <div className="troubleshooting-item">
              <h4>Processing errors</h4>
              <p>Check your internet connection and try again. Ensure the file size is under 10MB.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowToUse;
