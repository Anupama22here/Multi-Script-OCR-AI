import React from 'react';
import OCRUpload from '../components/OCRUpload';

const NaturalOCR = () => {
  return (
    <div className="page">
      <OCRUpload
        title="Natural Scenes OCR"
        description="Extract Tamil text from natural scenes, street signs, printed documents, and real-world images. Ideal for capturing text from photos and scanned documents."
        endpoint="/ocr/natural"
      />
    </div>
  );
};

export default NaturalOCR;
