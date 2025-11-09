import React from 'react';
import OCRUpload from '../components/OCRUpload';

const BrahmiOCR = () => {
  return (
    <div className="page">
      <OCRUpload
        title="Brahmi Script OCR"
        description="Identify and classify Indian script families using our custom-trained ResNet152 model. Upload images of text to identify whether it belongs to: Assamese, Brahmi, Devanagari, Gujarati, Kannada, Malayalam, Modi, Odia, Punjabi, Tamil, Telugu, or Urdu."
        endpoint="/ocr/brahmi"
        buttonText="Process Script Family"
      />
    </div>
  );
};

export default BrahmiOCR;
