# Multi-Script OCR AI

A comprehensive multi-script Optical Character Recognition (OCR) web application supporting multiple OCR modes, script transliteration, and an AI-powered chatbot with knowledge base integration.

## Features

- **Handwritten OCR**: Convert handwritten Tamil text to digital format
- **Natural Scenes OCR**: Extract text from street signs, documents, and real-world images
- **Brahmi Script OCR**: Recognize ancient Brahmi scripts using a custom-trained ResNet152 model
- **Script Transcription**: Transliterate between different Indic scripts using Aksharamukha
- **Modern UI**: Responsive design with dark/light mode toggle
- **Real-time Processing**: Fast and efficient text recognition

## Tech Stack

### Backend
- **FastAPI**: High-performance Python web framework
- **TensorFlow/Keras**: Machine learning framework for Brahmi model
- **ocr_tamil**: Tamil OCR library
- **Aksharamukha**: Script transliteration library
- **Pillow**: Image processing

### Frontend
- **React.js**: Modern JavaScript framework
- **Framer Motion**: Animation library
- **React Dropzone**: File upload component
- **React Toastify**: Notification system
- **Lucide React**: Icon library

## Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

## Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd tamil-ocr
```

### 2. Backend Setup
```bash
# Option 1: Use the automated setup script (recommended)
./setup.sh

# Option 2: Manual setup
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# The Brahmi model should be placed at:
# /Users/anupamar/Documents/ee/model/best_model.h5
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

## Running the Application

### Start Backend Server
```bash
# Option 1: Using the automated script (recommended)
./start_backend_with_venv.sh

# Option 2: Manual activation
source venv/bin/activate  # Activate virtual environment
python3 start_backend.py
```
The backend will be available at `http://localhost:8000`

### Start Frontend Development Server
```bash
# From the root directory
./start_frontend.sh
# OR
cd frontend && npm start
```
The frontend will be available at `http://localhost:3000`

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/ocr/handwritten` | POST | Handwritten Tamil OCR |
| `/ocr/natural` | POST | Natural scene Tamil OCR |
| `/ocr/brahmi` | POST | Brahmi script OCR |
| `/ocr/transcribe` | POST | Script transcription |
| `/scripts` | GET | Available scripts for transcription |

## Usage

### Handwritten OCR
1. Navigate to the Handwritten OCR page
2. Upload an image containing handwritten Tamil text
3. Click "Extract Text" to process the image
4. Copy or download the extracted text

### Natural Scenes OCR
1. Go to the Natural Scenes OCR page
2. Upload an image with printed Tamil text
3. Process the image to extract text
4. Use the results as needed

### Brahmi Script OCR
1. Visit the Brahmi Script OCR page
2. Upload an image of Brahmi script
3. The custom model will process and convert to Tamil text
4. View and download the results

### Script Transcription
1. Navigate to Script Transcription
2. Enter text in the source script
3. Select input and output scripts
4. Click "Transcribe Text" to convert between scripts

## Model Information

The Brahmi script recognition uses a custom-trained ResNet152 model with the following specifications:
- **Architecture**: ResNet152 with fine-tuned layers
- **Input Shape**: (224, 224, 3)
- **Preprocessing**: ImageDataGenerator with augmentation
- **File Location**: `/Users/anupamar/Documents/ee/model/best_model.h5`

## Supported Scripts

The transcription feature supports various Indic scripts:
- Tamil
- Devanagari
- Kannada
- Telugu
- Malayalam
- Gujarati
- Bengali
- Oriya
- Punjabi
- IAST
- Grantha
- And more...

## File Formats

- **Supported Image Formats**: JPEG, PNG, WebP
- **Maximum File Size**: 10MB
- **Output Format**: Plain text (.txt)

## Development

### Project Structure
```
tamil-ocr/
├── backend/
│   └── main.py              # FastAPI application
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/          # Page components
│   │   ├── utils/          # Utility functions
│   │   └── App.js          # Main app component
│   └── package.json
├── model/
│   └── best_model.h5       # Brahmi model
├── requirements.txt        # Python dependencies
├── start_backend.py       # Backend startup script
├── start_frontend.sh      # Frontend startup script
└── README.md
```

### Adding New Features
1. Backend: Add new endpoints in `backend/main.py`
2. Frontend: Create components in `frontend/src/components/`
3. API: Update `frontend/src/utils/api.js` for new endpoints

## Troubleshooting

### Common Issues

1. **Model not loading**: Ensure `best_model.h5` is in the correct location
2. **OCR accuracy issues**: Try higher quality images with better contrast
3. **API connection errors**: Check if backend is running on port 8000
4. **File upload errors**: Ensure file size is under 10MB and format is supported

### Debug Mode
- Backend: Add `debug=True` in uvicorn.run()
- Frontend: Use browser developer tools for debugging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- **ocr_tamil**: For Tamil OCR capabilities
- **Aksharamukha**: For script transliteration
- **TensorFlow/Keras**: For machine learning framework
- **React.js**: For the frontend framework
- **FastAPI**: For the backend framework

## Support

For support and questions:
- Create an issue on GitHub
- Contact: support@tamilocr.com
- Documentation: [Link to docs]

---

Built with ❤️ for Tamil language processing and preservation.
