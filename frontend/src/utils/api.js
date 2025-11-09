// API configuration and utility functions
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const api = {
  // OCR endpoints
  handwritten: `${API_BASE_URL}/ocr/handwritten`,
  natural: `${API_BASE_URL}/ocr/natural`,
  brahmi: `${API_BASE_URL}/ocr/brahmi`,
  transcribe: `${API_BASE_URL}/ocr/transcribe`,
  scripts: `${API_BASE_URL}/scripts`,
  
  // Health check
  health: `${API_BASE_URL}/`,
};

export const uploadFile = async (endpoint, file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to process image');
  }

  return response.json();
};

export const transcribeText = async (text, inputScript, outputScript) => {
  const formData = new FormData();
  formData.append('text', text);
  formData.append('input_script', inputScript);
  formData.append('output_script', outputScript);

  const response = await fetch(api.transcribe, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to transcribe text');
  }

  return response.json();
};

export const fetchScripts = async () => {
  const response = await fetch(api.scripts);
  
  if (!response.ok) {
    throw new Error('Failed to fetch scripts');
  }

  return response.json();
};

// Chatbot endpoints
export const chatWithBot = async (message, conversationHistory = []) => {
  const response = await fetch(`${API_BASE_URL}/chatbot/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      message,
      conversation_history: conversationHistory
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to get response from chatbot');
  }

  return response.json();
};

export const getChatbotStatus = async () => {
  const response = await fetch(`${API_BASE_URL}/chatbot/status`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch chatbot status');
  }

  return response.json();
};

export const initializeKnowledgeBase = async () => {
  const response = await fetch(`${API_BASE_URL}/chatbot/initialize`, {
    method: 'POST',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to initialize knowledge base');
  }

  return response.json();
};
