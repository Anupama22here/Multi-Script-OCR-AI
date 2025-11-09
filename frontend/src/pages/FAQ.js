import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import './FAQ.css';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "What is OCR?",
      answer: "OCR (Optical Character Recognition) is a technology that converts different types of documents, such as scanned paper documents, PDF files, or images captured by a digital camera, into editable and searchable data. Our Tamil OCR specifically recognizes Tamil text from various sources."
    },
    {
      question: "How accurate is the Brahmi script recognition?",
      answer: "Our Brahmi script recognition uses a custom-trained ResNet152 model that has been fine-tuned specifically for Brahmi scripts. While accuracy depends on image quality and text clarity, our model typically achieves high accuracy rates for well-preserved Brahmi inscriptions."
    },
    {
      question: "What image formats are supported?",
      answer: "We support JPEG, PNG, and WebP image formats. The maximum file size allowed is 10MB. For best results, use high-quality images with good contrast and lighting."
    },
    {
      question: "Can I use this for commercial purposes?",
      answer: "Yes, our Tamil OCR application can be used for commercial purposes. However, please ensure you have the necessary rights to the images you're processing and comply with any applicable terms of service."
    },
    {
      question: "What scripts are supported for transcription?",
      answer: "Our script transcription feature supports a wide range of Indic scripts including Tamil, Devanagari, Kannada, Telugu, Malayalam, Gujarati, Bengali, Oriya, Punjabi, IAST, Grantha, and more using the Aksharamukha library."
    },
    {
      question: "Is my data stored on your servers?",
      answer: "No, we do not store your images or extracted text on our servers. All processing is done in real-time, and your data remains private. Once the processing is complete, the data is not retained."
    },
    {
      question: "Why is my OCR result not accurate?",
      answer: "OCR accuracy depends on several factors including image quality, text clarity, font type, and image resolution. Try using higher quality images, ensuring good lighting, and avoiding blurry or distorted text. Different OCR modes work better for different types of text."
    },
    {
      question: "Can I process multiple images at once?",
      answer: "Currently, our application processes one image at a time. This ensures optimal processing quality and resource allocation. You can process multiple images sequentially by uploading them one by one."
    },
    {
      question: "What's the difference between handwritten and natural scene OCR?",
      answer: "Handwritten OCR is optimized for handwritten Tamil text, while natural scene OCR is designed for printed text found in documents, street signs, and other real-world scenarios. Each mode uses different processing techniques optimized for their specific use cases."
    },
    {
      question: "How do I get the best results?",
      answer: "For best results: 1) Use high-resolution images with good contrast, 2) Ensure text is clearly visible and not obscured, 3) Choose the appropriate OCR mode for your text type, 4) Use JPEG or PNG formats, 5) Avoid heavily stylized or damaged text."
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq">
      <div className="page-header">
        <h1 className="page-title">Frequently Asked Questions</h1>
        <p className="page-description">
          Find answers to common questions about our OCR application
        </p>
      </div>

      <div className="faq-content">
        <div className="container">
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className="faq-item"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <button
                  className="faq-question"
                  onClick={() => toggleFAQ(index)}
                >
                  <span className="question-text">{faq.question}</span>
                  <motion.div
                    className="chevron"
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown size={20} />
                  </motion.div>
                </button>
                
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      className="faq-answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="answer-content">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          <div className="faq-help">
            <div className="help-card">
              <HelpCircle size={48} />
              <h3>Still have questions?</h3>
              <p>
                If you can't find the answer you're looking for, feel free to reach out to us. 
                We're here to help you get the most out of our Tamil OCR application.
              </p>
              <div className="help-actions">
                <a href="mailto:support@tamilocr.com" className="btn btn-primary">
                  Contact Support
                </a>
                <a href="/how-to-use" className="btn btn-outline">
                  View Guide
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
