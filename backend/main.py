from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import base64
from aksharamukha.transliterate import Transliterator
from ocr_tamil.ocr import OCR
import logging
import os
import sys
from typing import Optional
from pydantic import BaseModel
# Import knowledge base - adjust path based on how the app is run
try:
    from knowledge_base import knowledge_base
except ImportError:
    # If running from project root
    from backend.knowledge_base import knowledge_base

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Tamil OCR API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for model caching
brahmi_model = None
model_loaded = False
ocr_handwritten = None
ocr_natural = None
ocr_initialized = False

# Model configuration
IM_SHAPE = (224, 224, 3)  # Default ResNet input shape, adjust based on your model

def load_brahmi_model():
    """Load the Brahmi model once on startup"""
    global brahmi_model, model_loaded
    try:
        model_path = "/Users/anupamar/Documents/ee/model/best_model.h5"
        if os.path.exists(model_path):
            # Try to load the model with custom objects to handle potential issues
            try:
                # Try loading with compile=False to avoid architecture issues
                brahmi_model = tf.keras.models.load_model(model_path, compile=False)
                
                # Compile the model manually if needed
                try:
                    brahmi_model.compile(
                        loss='categorical_crossentropy',
                        optimizer=tf.keras.optimizers.Adam(),
                        metrics=['accuracy']
                    )
                except Exception as compile_error:
                    logger.warning(f"Could not compile model: {str(compile_error)}")
                    # Continue without compilation - model can still make predictions
                
                model_loaded = True
                logger.info("Brahmi model loaded successfully")
            except Exception as model_error:
                logger.error(f"Model architecture error: {str(model_error)}")
                logger.info("Trying to recreate model architecture...")
                
                # Try to create a similar model architecture and load weights
                try:
                    from tensorflow.keras.applications import ResNet152
                    from tensorflow.keras.layers import GlobalAveragePooling2D, Dense, Dropout
                    
                    # Try to load without ImageNet weights first (use only the trained weights)
                    try:
                        base_model = ResNet152(weights=None, include_top=False, input_shape=(224, 224, 3))
                    except Exception:
                        # If that fails, try with 'imagenet' weights
                        base_model = ResNet152(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
                    
                    model = tf.keras.Sequential()
                    model.add(base_model)
                    model.add(GlobalAveragePooling2D())
                    model.add(Dense(512, activation='relu'))
                    model.add(Dropout(0.5))
                    model.add(Dense(12, activation='softmax'))  # Try 12 classes (actual number from saved weights)
                    
                    # Try to load only the weights
                    model.load_weights(model_path)
                    brahmi_model = model
                    model_loaded = True
                    logger.info("Brahmi model recreated and weights loaded successfully")
                except Exception as recreate_error:
                    logger.error(f"Could not recreate model: {str(recreate_error)}")
                    # Set a flag but don't completely fail - will return informative message
                    brahmi_model = "ARCHITECTURE_ERROR"
                    model_loaded = False
        else:
            logger.error(f"Model file not found at {model_path}")
            model_loaded = False
    except Exception as e:
        logger.error(f"Error loading Brahmi model: {str(e)}")
        model_loaded = False

def initialize_ocr():
    """Initialize OCR models for handwritten and natural text"""
    global ocr_handwritten, ocr_natural, ocr_initialized
    try:
        # Initialize OCR for handwritten text
        ocr_handwritten = OCR(detect=True, details=2, batch_size=128)
        
        # Initialize OCR for natural scenes (same model, different usage)
        ocr_natural = OCR(detect=True, details=2, batch_size=128)
        
        ocr_initialized = True
        logger.info("OCR models initialized successfully")
    except Exception as e:
        logger.error(f"Error initializing OCR models: {str(e)}")
        ocr_initialized = False

def line_print(prediction):
    """Format OCR prediction with line breaks"""
    current_line = 1
    extracted_text = ""
    for text in prediction:
        pred_text = text[0]
        line_details = text[2][1]

        if line_details != current_line:
            extracted_text += "\n" + pred_text + " "
            current_line = line_details
        else:
            extracted_text += pred_text + " "
    return extracted_text.strip()

@app.on_event("startup")
async def startup_event():
    """Load models on startup"""
    load_brahmi_model()
    initialize_ocr()
    # Initialize knowledge base in background
    try:
        knowledge_base.initialize()
    except Exception as e:
        logger.error(f"Error initializing knowledge base: {str(e)}")

def preprocess_image(image: Image.Image, target_size: tuple = IM_SHAPE[:2]) -> np.ndarray:
    """Preprocess image for Brahmi model prediction"""
    try:
        # Resize image
        image = image.resize(target_size)
        
        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Convert to numpy array and normalize
        img_array = np.array(image)
        img_array = img_array.astype('float32') / 255.0
        
        # Add batch dimension
        img_array = np.expand_dims(img_array, axis=0)
        
        return img_array
    except Exception as e:
        logger.error(f"Error preprocessing image: {str(e)}")
        raise HTTPException(status_code=400, detail="Error preprocessing image")

def predict_brahmi_text(image_array: np.ndarray) -> str:
    """Predict script family from image using Brahmi model"""
    global brahmi_model, model_loaded
    
    if brahmi_model == "ARCHITECTURE_ERROR":
        return "⚠️ Brahmi model has architecture issues. The model file exists but has incompatible layer structure. Please retrain the model or use a compatible version."
    
    if not model_loaded or brahmi_model is None:
        return "❌ Brahmi model not loaded. Please ensure the model file exists and is compatible."
    
    try:
        # Get the class names - 12 distinct Indian scripts as per your training data
        class_names = [
            "Assamese", "Brahmi", "Devanagari", "Gujarati", "Kannada",
            "Malayalam", "Modi", "Odia", "Punjabi", "Tamil",
            "Telugu", "Urdu"
        ]
        
        # Make prediction
        predictions = brahmi_model.predict(image_array, verbose=0)
        
        # Get the predicted class
        predicted_class_index = np.argmax(predictions[0])
        confidence = float(predictions[0][predicted_class_index])
        
        # Get the class name
        predicted_class = class_names[predicted_class_index] if predicted_class_index < len(class_names) else f"Class_{predicted_class_index}"
        
        # Return the result with confidence
        result = f"Predicted Script Family: {predicted_class}\nConfidence: {confidence:.2%}"
        
        return result
    except Exception as e:
        logger.error(f"Error making prediction: {str(e)}")
        # Return a more user-friendly error message
        return f"Error processing Brahmi script: {str(e)}"

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Tamil OCR API is running", 
        "brahmi_model_loaded": model_loaded,
        "ocr_initialized": ocr_initialized
    }

@app.post("/ocr/handwritten")
async def ocr_handwritten_endpoint(file: UploadFile = File(...)):
    """OCR for handwritten Tamil text"""
    global ocr_handwritten, ocr_initialized
    
    if not ocr_initialized or ocr_handwritten is None:
        raise HTTPException(status_code=500, detail="OCR models not initialized")
    
    try:
        # Read and process image
        contents = await file.read()
        
        # Save temporary file for OCR processing
        import tempfile
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp_file:
            tmp_file.write(contents)
            tmp_file_path = tmp_file.name
        
        try:
            # Use ocr_tamil for handwritten text
            text_list = ocr_handwritten.predict([tmp_file_path])
            
            if text_list and len(text_list) > 0:
                # Format the output with line breaks
                extracted_text = line_print(text_list[0])
            else:
                extracted_text = "No text detected"
                
        finally:
            # Clean up temporary file
            import os
            if os.path.exists(tmp_file_path):
                os.unlink(tmp_file_path)
        
        return {
            "success": True,
            "text": extracted_text,
            "type": "handwritten",
            "filename": file.filename
        }
    
    except Exception as e:
        logger.error(f"Handwritten OCR error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error processing handwritten OCR: {str(e)}")

@app.post("/ocr/natural")
async def ocr_natural_endpoint(file: UploadFile = File(...)):
    """OCR for natural scene Tamil text"""
    global ocr_natural, ocr_initialized
    
    if not ocr_initialized or ocr_natural is None:
        raise HTTPException(status_code=500, detail="OCR models not initialized")
    
    try:
        # Read and process image
        contents = await file.read()
        
        # Save temporary file for OCR processing
        import tempfile
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp_file:
            tmp_file.write(contents)
            tmp_file_path = tmp_file.name
        
        try:
            # Use ocr_tamil for natural scene text
            text_list = ocr_natural.predict([tmp_file_path])
            
            if text_list and len(text_list) > 0:
                # Format the output with line breaks
                extracted_text = line_print(text_list[0])
            else:
                extracted_text = "No text detected"
                
        finally:
            # Clean up temporary file
            import os
            if os.path.exists(tmp_file_path):
                os.unlink(tmp_file_path)
        
        return {
            "success": True,
            "text": extracted_text,
            "type": "natural",
            "filename": file.filename
        }
    
    except Exception as e:
        logger.error(f"Natural OCR error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error processing natural scene OCR: {str(e)}")

@app.post("/ocr/brahmi")
async def ocr_brahmi_endpoint(file: UploadFile = File(...)):
    """OCR for Brahmi script using custom model"""
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read and process image
        contents = await file.read()
        
        if not contents:
            raise HTTPException(status_code=400, detail="Empty file uploaded")
        
        try:
            # Open image with PIL
            image = Image.open(io.BytesIO(contents))
            
            # Convert to RGB if necessary
            if image.mode != 'RGB':
                image = image.convert('RGB')
                
        except Exception as img_error:
            logger.error(f"Image processing error: {str(img_error)}")
            raise HTTPException(status_code=400, detail=f"Invalid image format: {str(img_error)}")
        
        # Preprocess image for Brahmi model
        processed_image = preprocess_image(image)
        
        # Make prediction (this will handle model errors gracefully)
        predicted_text = predict_brahmi_text(processed_image)
        
        return {
            "success": True,
            "text": predicted_text,
            "type": "brahmi",
            "filename": file.filename
        }
    
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        logger.error(f"Brahmi OCR error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error processing Brahmi OCR: {str(e)}")

@app.post("/ocr/transcribe")
async def transcribe_text_endpoint(
    text: str = Form(...),
    input_script: str = Form(...),
    output_script: str = Form(...)
):
    """Transcribe text between different scripts using Aksharamukha"""
    try:
        if not text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty")
        
        # Use Aksharamukha for transliteration
        try:
            transliterator = Transliterator()
            transliterated_text = transliterator.tr(text, input_script, output_script)
        except Exception as e:
            logger.error(f"Aksharamukha error: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Error in transliteration: {str(e)}")
        
        return {
            "success": True,
            "original_text": text,
            "transliterated_text": transliterated_text,
            "input_script": input_script,
            "output_script": output_script
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Transcription error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error in transcription: {str(e)}")

@app.get("/scripts")
async def get_available_scripts():
    """Get list of available scripts for transcription"""
    # Scripts actually supported by this version of Aksharamukha
    # Note: This version supports ancient scripts, not modern Indic scripts
    scripts = [
        # Arabic Variants
        {"code": "Arab", "name": "Arabic"},
        {"code": "Arab-Fa", "name": "Arabic (Persian)"},
        {"code": "Arab-Ur", "name": "Arabic (Urdu)"},
        {"code": "Arab-Pa", "name": "Arabic (Punjabi)"},
        
        # Ancient & Historical Scripts
        {"code": "Brah", "name": "Brahmi"},
        {"code": "Armi", "name": "Imperial Aramaic"},
        {"code": "Hebr", "name": "Hebrew"},
        {"code": "Grek", "name": "Greek"},
        {"code": "Latn", "name": "Latin"},
        
        # Other Ancient Scripts
        {"code": "Thaa", "name": "Thaana"},
        {"code": "Ethi", "name": "Ethiopic"},
        {"code": "Chrs", "name": "Chorasmian"},
        {"code": "Egyp", "name": "Egyptian Hieroglyphs"},
        {"code": "Elym", "name": "Elymaic"},
        {"code": "Hatr", "name": "Hatran"},
        {"code": "Hebr-Ar", "name": "Hebrew (Arabic)"},
        {"code": "Mani", "name": "Manichaean"},
        {"code": "Narb", "name": "Old North Arabian"},
        {"code": "Nbat", "name": "Nabataean"},
        {"code": "Palm", "name": "Palmyrene"},
        {"code": "Phli", "name": "Inscriptional Pahlavi"},
        {"code": "Phlp", "name": "Psalter Pahlavi"},
        {"code": "Phnx", "name": "Phoenician"},
        {"code": "Prti", "name": "Inscriptional Parthian"},
        {"code": "Samr", "name": "Samaritan"},
        {"code": "Sarb", "name": "Old South Arabian"},
        {"code": "Sogd", "name": "Sogdian"},
        {"code": "Sogo", "name": "Old Sogdian"},
        {"code": "Syre", "name": "Syriac (Estrangelo)"},
        {"code": "Syrn", "name": "Syriac (Nestorian)"},
        {"code": "Syrj", "name": "Syriac (Jacobite)"},
        {"code": "Ugar", "name": "Ugaritic"},
    ]
    
    return {"scripts": scripts}

# Chatbot endpoints
class ChatRequest(BaseModel):
    message: str
    conversation_history: list = []  # List of previous messages in format [{"role": "user/bot", "text": "..."}]

class ChatResponse(BaseModel):
    answer: str
    sources: list = []

@app.post("/chatbot/chat")
async def chatbot_chat(request: ChatRequest):
    """Chat with AI assistant using knowledge base"""
    try:
        if not request.message or not request.message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        # Ensure knowledge base is initialized
        if not knowledge_base.initialized:
            knowledge_base.initialize()
        
        # Check if question is about the conversation itself
        query_lower = request.message.lower()
        is_conversation_query = any(phrase in query_lower for phrase in [
            'my first question', 'first question', 'previous question', 'earlier question',
            'what did i ask', 'what was my question', 'tell me my question',
            'what questions did i ask', 'my questions'
        ])
        
        if is_conversation_query and request.conversation_history:
            # Extract user questions from conversation history
            user_questions = [
                msg.get('text', '') for msg in request.conversation_history 
                if msg.get('role') == 'user' or msg.get('sender') == 'user'
            ]
            
            if user_questions:
                first_question = user_questions[0] if user_questions else None
                if 'first' in query_lower and first_question:
                    return {
                        "success": True,
                        "answer": f"Your first question was: \"{first_question}\"",
                        "sources": []
                    }
                elif user_questions:
                    questions_list = "\n".join([f"{i+1}. {q}" for i, q in enumerate(user_questions)])
                    return {
                        "success": True,
                        "answer": f"Here are the questions you've asked in this conversation:\n\n{questions_list}",
                        "sources": []
                    }
        
        # Search for relevant chunks
        relevant_chunks = knowledge_base.search_relevant_chunks(request.message, top_k=3)
        
        # Generate answer with conversation history
        answer = knowledge_base.generate_answer(
            request.message, 
            relevant_chunks,
            conversation_history=request.conversation_history
        )
        
        # Get unique sources
        sources = list(set([chunk['source'] for chunk in relevant_chunks]))
        
        return {
            "success": True,
            "answer": answer,
            "sources": sources
        }
    
    except Exception as e:
        logger.error(f"Chatbot error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")

@app.post("/chatbot/initialize")
async def initialize_knowledge_base():
    """Manually initialize the knowledge base"""
    try:
        knowledge_base.initialize()
        return {
            "success": True,
            "message": f"Knowledge base initialized with {len(knowledge_base.documents)} chunks",
            "num_chunks": len(knowledge_base.documents)
        }
    except Exception as e:
        logger.error(f"Error initializing knowledge base: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error initializing knowledge base: {str(e)}")

@app.get("/chatbot/status")
async def chatbot_status():
    """Get chatbot status"""
    return {
        "initialized": knowledge_base.initialized,
        "num_documents": len(knowledge_base.documents),
        "num_chunks": len(knowledge_base.documents)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
