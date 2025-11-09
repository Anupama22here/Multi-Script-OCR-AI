#!/bin/bash

echo "🚀 Setting up Tamil OCR Web Application..."
echo "=========================================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Create virtual environment
echo "🐍 Setting up Python virtual environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "✅ Virtual environment created"
else
    echo "✅ Virtual environment already exists"
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip in virtual environment
echo "⬆️  Upgrading pip..."
python -m pip install --upgrade pip

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

if [ $? -eq 0 ]; then
    echo "✅ Python dependencies installed successfully"
else
    echo "❌ Failed to install Python dependencies"
    exit 1
fi

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
cd frontend
npm install

if [ $? -eq 0 ]; then
    echo "✅ Node.js dependencies installed successfully"
else
    echo "❌ Failed to install Node.js dependencies"
    exit 1
fi

cd ..

# Check if the model file exists
if [ ! -f "model/best_model.h5" ]; then
    echo "⚠️  Warning: best_model.h5 not found in model/ directory"
    echo "   The Brahmi OCR feature will not work without this model file."
    echo "   Please ensure the model is placed at: model/best_model.h5"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "To start the application:"
echo "1. Start the backend: ./start_backend_with_venv.sh"
echo "2. Start the frontend: ./start_frontend.sh"
echo ""
echo "Alternative (manual virtual environment activation):"
echo "1. Activate venv: source venv/bin/activate"
echo "2. Start backend: python3 start_backend.py"
echo "3. Start frontend: ./start_frontend.sh"
echo ""
echo "The application will be available at:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:8000"
echo "- API Documentation: http://localhost:8000/docs"
echo ""
echo "Virtual environment location: ./venv/"
echo "To deactivate virtual environment: deactivate"
echo ""
echo "Happy coding! 🚀"
