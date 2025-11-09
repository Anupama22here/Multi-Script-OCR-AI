import React from 'react';
import './Page.css';

const Privacy = () => {
  return (
    <div className="page">
      <div className="container">
        <h1>Privacy Policy</h1>
        <div className="privacy-content">
          <h2>Data Collection and Usage</h2>
          <p>
            This OCR application processes images locally and does not store any personal data or uploaded images on our servers.
          </p>
          
          <h2>Image Processing</h2>
          <p>
            All OCR processing is done in real-time. Images are processed temporarily and are not retained after the OCR operation is complete.
          </p>
          
          <h2>Data Security</h2>
          <p>
            We do not collect, store, or transmit any personal information. All processing happens locally on your device or in temporary server memory.
          </p>
          
          <h2>Third-Party Services</h2>
          <p>
            This application uses the following libraries:
          </p>
          <ul>
            <li>ocr_tamil - For Tamil text recognition</li>
            <li>Aksharamukha - For script transliteration</li>
            <li>TensorFlow/Keras - For machine learning models</li>
          </ul>
          
          <h2>Contact</h2>
          <p>
            If you have any questions about this privacy policy, please contact us at privacy@tamilocr.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
