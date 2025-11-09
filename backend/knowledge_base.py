"""
Knowledge Base module for processing PDFs and creating embeddings for RAG
"""
import os
import PyPDF2
from openai import OpenAI
from dotenv import load_dotenv
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import logging
from typing import List, Dict, Tuple

load_dotenv()

logger = logging.getLogger(__name__)

class KnowledgeBase:
    def __init__(self, data_folder: str = "/Users/anupamar/Documents/ee/data"):
        self.data_folder = data_folder
        self.openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.documents: List[Dict] = []
        self.embeddings: List[List[float]] = []
        self.initialized = False
        
    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """Extract text from a PDF file"""
        try:
            text = ""
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page_num, page in enumerate(pdf_reader.pages):
                    page_text = page.extract_text()
                    if page_text:
                        text += f"\n\n--- Page {page_num + 1} ---\n\n{page_text}"
            return text.strip()
        except Exception as e:
            logger.error(f"Error extracting text from {pdf_path}: {str(e)}")
            return ""
    
    def chunk_text(self, text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
        """Split text into chunks with overlap"""
        chunks = []
        words = text.split()
        
        for i in range(0, len(words), chunk_size - overlap):
            chunk = ' '.join(words[i:i + chunk_size])
            if chunk.strip():
                chunks.append(chunk)
        
        return chunks
    
    def get_embedding(self, text: str) -> List[float]:
        """Get embedding for text using OpenAI"""
        try:
            response = self.openai_client.embeddings.create(
                model="text-embedding-ada-002",
                input=text
            )
            return response.data[0].embedding
        except Exception as e:
            logger.error(f"Error getting embedding: {str(e)}")
            return []
    
    def initialize(self):
        """Initialize knowledge base by processing all PDFs in data folder"""
        if self.initialized:
            return
        
        logger.info("Initializing knowledge base...")
        
        if not os.path.exists(self.data_folder):
            logger.error(f"Data folder not found: {self.data_folder}")
            return
        
        # Process all PDF files
        pdf_files = [f for f in os.listdir(self.data_folder) if f.endswith('.pdf')]
        
        if not pdf_files:
            logger.warning(f"No PDF files found in {self.data_folder}")
            return
        
        for pdf_file in pdf_files:
            pdf_path = os.path.join(self.data_folder, pdf_file)
            logger.info(f"Processing {pdf_file}...")
            
            # Extract text
            text = self.extract_text_from_pdf(pdf_path)
            if not text:
                logger.warning(f"No text extracted from {pdf_file}")
                continue
            
            # Chunk the text
            chunks = self.chunk_text(text)
            
            # Create embeddings for each chunk
            for chunk_idx, chunk in enumerate(chunks):
                embedding = self.get_embedding(chunk)
                if embedding:
                    self.documents.append({
                        'text': chunk,
                        'source': pdf_file,
                        'chunk_index': chunk_idx
                    })
                    self.embeddings.append(embedding)
        
        self.initialized = True
        logger.info(f"Knowledge base initialized with {len(self.documents)} chunks from {len(pdf_files)} PDFs")
    
    def search_relevant_chunks(self, query: str, top_k: int = 3) -> List[Dict]:
        """Search for relevant chunks based on query"""
        if not self.initialized or not self.documents:
            return []
        
        # Get query embedding
        query_embedding = self.get_embedding(query)
        if not query_embedding:
            return []
        
        # Calculate similarities
        similarities = cosine_similarity(
            [query_embedding],
            self.embeddings
        )[0]
        
        # Get top k most similar chunks
        top_indices = np.argsort(similarities)[-top_k:][::-1]
        
        results = []
        for idx in top_indices:
            results.append({
                'text': self.documents[idx]['text'],
                'source': self.documents[idx]['source'],
                'similarity': float(similarities[idx])
            })
        
        return results
    
    def generate_answer(self, query: str, context_chunks: List[Dict], conversation_history: List[Dict] = None) -> str:
        """Generate answer using OpenAI with context from knowledge base"""
        if not context_chunks:
            return "I couldn't find relevant information in the knowledge base to answer your question."
        
        # Build context from chunks
        context = "\n\n".join([
            f"[From {chunk['source']}]\n{chunk['text']}"
            for chunk in context_chunks
        ])
        
        # Build conversation history context if available
        conversation_context = ""
        if conversation_history:
            conv_text = []
            for msg in conversation_history[-5:]:  # Last 5 messages for context
                role = msg.get('role') or msg.get('sender', 'user')
                text = msg.get('text', '') or msg.get('content', '')
                if text:
                    conv_text.append(f"{'User' if role == 'user' else 'Assistant'}: {text}")
            if conv_text:
                conversation_context = "\n\nPrevious conversation:\n" + "\n".join(conv_text)
        
        # Create prompt
        prompt = f"""You are a helpful AI assistant with access to a knowledge base about Tamil OCR, Brahmi scripts, and related topics.

Based on the following context from the knowledge base, please answer the user's question. If the context doesn't contain enough information to answer the question, say so.{conversation_context}

Context from knowledge base:
{context}

Current question: {query}

Answer:"""
        
        try:
            messages = [
                {"role": "system", "content": "You are a helpful assistant that answers questions based on the provided context from a knowledge base about Tamil OCR and Brahmi scripts. You can also reference previous conversation if relevant."},
                {"role": "user", "content": prompt}
            ]
            
            response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                temperature=0.7,
                max_tokens=500
            )
            
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"Error generating answer: {str(e)}")
            return f"Error generating answer: {str(e)}"

# Global knowledge base instance
knowledge_base = KnowledgeBase()

