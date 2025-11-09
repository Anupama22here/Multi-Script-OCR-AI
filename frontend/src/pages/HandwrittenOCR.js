import React from 'react';
import OCRUpload from '../components/OCRUpload';

const HandwrittenOCR = () => {
  return (
    <div className="page">
      <OCRUpload
        title="Handwritten OCR"
        description="Upload handwritten Tamil text images and convert them to digital text with high accuracy. Perfect for digitizing handwritten notes, letters, and documents."
        endpoint="/ocr/handwritten"
      />
    </div>
  );
};

export default HandwrittenOCR;
