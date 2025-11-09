import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Loader, MessageCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import './Chatbot.css';
import { chatWithBot, getChatbotStatus } from '../utils/api';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const isInitialMount = useRef(true);
  const messagesContainerRef = useRef(null);
  const pendingRequestRef = useRef(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    // Check chatbot status on mount
    checkStatus();
    // Add welcome message
    setMessages([{
      id: Date.now(),
      text: "Hello! I'm your AI assistant. I can help you with questions about Tamil OCR, Brahmi scripts, and related topics based on the knowledge base. How can I help you today?",
      sender: 'bot',
      timestamp: new Date(),
      suggestedQuestions: [
        'What is Brahmi script?',
        'How does Tamil OCR work?',
        'What are the different types of scripts?'
      ]
    }]);
    
    // Prevent scroll on initial mount
    window.scrollTo(0, 0);
    isInitialMount.current = false;
  }, []);

  useEffect(() => {
    // Scroll to bottom when new messages are added, but only if we're not on initial mount
    // and only scroll within the messages container, not the whole page
    if (!isInitialMount.current && messages.length > 0 && messagesContainerRef.current) {
      // Scroll within the messages container
      setTimeout(() => {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }, 50);
    }
  }, [messages]);

  const checkStatus = async () => {
    try {
      const status = await getChatbotStatus();
      setIsInitialized(status.initialized);
      if (!status.initialized) {
        toast.info('Initializing knowledge base... This may take a moment.');
      }
    } catch (error) {
      console.error('Error checking chatbot status:', error);
    }
  };

  const generateSuggestedQuestions = (answer, userQuestion) => {
    // Generate suggested questions based on the answer and user question
    const suggestions = [];
    
    // Extract key topics from the answer
    const lowerAnswer = answer.toLowerCase();
    const lowerQuestion = userQuestion.toLowerCase();
    
    // Common follow-up questions based on topics
    if (lowerAnswer.includes('brahmi') || lowerQuestion.includes('brahmi')) {
      suggestions.push('What is the history of Brahmi script?');
      suggestions.push('How is Brahmi script used today?');
      suggestions.push('What are the characteristics of Brahmi script?');
    }
    
    if (lowerAnswer.includes('ocr') || lowerQuestion.includes('ocr')) {
      suggestions.push('How does OCR work?');
      suggestions.push('What are the different types of OCR?');
      suggestions.push('How accurate is OCR technology?');
    }
    
    if (lowerAnswer.includes('tamil') || lowerQuestion.includes('tamil')) {
      suggestions.push('What is Tamil OCR?');
      suggestions.push('How is Tamil script recognized?');
      suggestions.push('What are the challenges in Tamil OCR?');
    }
    
    if (lowerAnswer.includes('script') || lowerQuestion.includes('script')) {
      suggestions.push('What are the different Indian scripts?');
      suggestions.push('How are scripts transcribed?');
      suggestions.push('What is script transliteration?');
    }
    
    // Generic follow-up questions if no specific topics found
    if (suggestions.length === 0) {
      suggestions.push('Can you tell me more about this?');
      suggestions.push('What are the key features?');
      suggestions.push('How does this relate to other topics?');
    }
    
    // Return 3 random suggestions
    return suggestions.sort(() => Math.random() - 0.5).slice(0, 3);
  };

  const handleSuggestedQuestion = async (question) => {
    if (isLoading) return;
    
    setInputMessage(question);
    
    // Create user message
    const userMessage = {
      id: Date.now(),
      text: question,
      sender: 'user',
      timestamp: new Date()
    };

    // Cancel any pending request
    if (pendingRequestRef.current) {
      return;
    }
    
    setIsLoading(true);
    
    // Add user message and make API call
    setMessages(prev => {
      const updatedMessages = [...prev, userMessage];
      const conversationHistory = updatedMessages
        .filter(msg => msg.sender !== 'bot' || !msg.text.includes("Hello! I'm your AI assistant"))
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          text: msg.text,
          sender: msg.sender
        }));
      
      // Make API call with conversation history (use setTimeout to ensure state is updated)
      const currentRequestId = ++requestIdRef.current;
      setTimeout(() => {
        // Check if this is still the latest request
        if (currentRequestId !== requestIdRef.current) {
          return;
        }
        
        const requestPromise = chatWithBot(question, conversationHistory);
        pendingRequestRef.current = requestPromise;
        
        requestPromise.then(response => {
          // Only process if this is still the current request
          if (pendingRequestRef.current !== requestPromise || currentRequestId !== requestIdRef.current) {
            return;
          }
          pendingRequestRef.current = null;
          
          const botMessage = {
            id: Date.now() + 1,
            text: response.answer,
            sender: 'bot',
            timestamp: new Date(),
            suggestedQuestions: generateSuggestedQuestions(response.answer, question)
          };
          setMessages(prevMsgs => {
            // Check if this message already exists to prevent duplicates
            const exists = prevMsgs.some(msg => 
              msg.id === botMessage.id || 
              (msg.sender === 'bot' && msg.text === botMessage.text && 
               Math.abs(new Date(msg.timestamp) - new Date(botMessage.timestamp)) < 1000)
            );
            if (exists) return prevMsgs;
            return [...prevMsgs, botMessage];
          });
          setIsLoading(false);
        }).catch(error => {
          // Only process if this is still the current request
          if (pendingRequestRef.current !== requestPromise || currentRequestId !== requestIdRef.current) {
            return;
          }
          pendingRequestRef.current = null;
          console.error('Chat error:', error);
          const errorMessage = {
            id: Date.now() + 1,
            text: 'Sorry, I encountered an error. Please try again later.',
            sender: 'bot',
            timestamp: new Date(),
            isError: true
          };
          setMessages(prevMsgs => {
            const exists = prevMsgs.some(msg => 
              msg.id === errorMessage.id || 
              (msg.sender === 'bot' && msg.text === errorMessage.text && 
               Math.abs(new Date(msg.timestamp) - new Date(errorMessage.timestamp)) < 1000)
            );
            if (exists) return prevMsgs;
            return [...prevMsgs, errorMessage];
          });
          toast.error('Failed to get response from chatbot');
          setIsLoading(false);
        });
      }, 0);
      
      return updatedMessages;
    });
    
    setInputMessage('');
  };

  const handleSend = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;
    
    // Prevent page scroll when submitting
    e.stopPropagation();

    // Cancel any pending request
    if (pendingRequestRef.current) {
      return;
    }

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    const currentInput = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    // Add user message first
    setMessages(prev => {
      const allMessages = [...prev, userMessage];
      
      // Build conversation history
      const conversationHistory = allMessages
        .filter(msg => msg.sender !== 'bot' || !msg.text.includes("Hello! I'm your AI assistant"))
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          text: msg.text,
          sender: msg.sender
        }));
      
      // Make API call with conversation history (use setTimeout to ensure state is updated)
      const currentRequestId = ++requestIdRef.current;
      setTimeout(() => {
        // Check if this is still the latest request
        if (currentRequestId !== requestIdRef.current) {
          return;
        }
        
        const requestPromise = chatWithBot(currentInput, conversationHistory);
        pendingRequestRef.current = requestPromise;
        
        requestPromise.then(response => {
          // Only process if this is still the current request
          if (pendingRequestRef.current !== requestPromise || currentRequestId !== requestIdRef.current) {
            return;
          }
          pendingRequestRef.current = null;
          
          const botMessage = {
            id: Date.now() + 1,
            text: response.answer,
            sender: 'bot',
            timestamp: new Date(),
            suggestedQuestions: generateSuggestedQuestions(response.answer, currentInput)
          };
          setMessages(prevMsgs => {
            // Check if this message already exists to prevent duplicates
            const exists = prevMsgs.some(msg => 
              msg.id === botMessage.id || 
              (msg.sender === 'bot' && msg.text === botMessage.text && 
               Math.abs(new Date(msg.timestamp) - new Date(botMessage.timestamp)) < 1000)
            );
            if (exists) return prevMsgs;
            return [...prevMsgs, botMessage];
          });
          setIsLoading(false);
        }).catch(error => {
          // Only process if this is still the current request
          if (pendingRequestRef.current !== requestPromise || currentRequestId !== requestIdRef.current) {
            return;
          }
          pendingRequestRef.current = null;
          console.error('Chat error:', error);
          const errorMessage = {
            id: Date.now() + 1,
            text: 'Sorry, I encountered an error. Please try again later.',
            sender: 'bot',
            timestamp: new Date(),
            isError: true
          };
          setMessages(prevMsgs => {
            const exists = prevMsgs.some(msg => 
              msg.id === errorMessage.id || 
              (msg.sender === 'bot' && msg.text === errorMessage.text && 
               Math.abs(new Date(msg.timestamp) - new Date(errorMessage.timestamp)) < 1000)
            );
            if (exists) return prevMsgs;
            return [...prevMsgs, errorMessage];
          });
          toast.error('Failed to get response from chatbot');
          setIsLoading(false);
        });
      }, 0);
      
      return allMessages;
    });
  };

  return (
    <div className="chatbot-page">
      <div className="page-header">
        <h1 className="page-title">
          <MessageCircle size={32} />
          AI Chatbot
        </h1>
        <p className="page-description">
          Ask questions about Tamil OCR, Brahmi scripts, and related topics
        </p>
        {!isInitialized && (
          <div className="status-badge">
            <Loader size={16} className="spinning" />
            <span>Initializing knowledge base...</span>
          </div>
        )}
      </div>

      <div className="chatbot-container">
        <div className="chatbot-messages" ref={messagesContainerRef}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              className={`message ${message.sender}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="message-avatar">
                {message.sender === 'bot' ? (
                  <Bot size={20} />
                ) : (
                  <User size={20} />
                )}
              </div>
              <div className="message-content">
                <div className="message-text">
                  {message.text}
                </div>
                {message.suggestedQuestions && message.suggestedQuestions.length > 0 && (
                  <div className="suggested-questions">
                    <div className="suggested-questions-label">Suggested questions:</div>
                    <div className="suggested-questions-list">
                      {message.suggestedQuestions.map((question, idx) => (
                        <button
                          key={idx}
                          className="suggested-question-btn"
                          onClick={() => handleSuggestedQuestion(question)}
                          disabled={isLoading}
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </motion.div>
          ))}
          
          {isLoading && (
            <motion.div
              className="message bot"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="message-avatar">
                <Bot size={20} />
              </div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </motion.div>
          )}
          
        </div>

        <form className="chatbot-input-form" onSubmit={handleSend}>
          <input
            type="text"
            className="chatbot-input"
            placeholder="Type your question here..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="chatbot-send-button"
            disabled={isLoading || !inputMessage.trim()}
          >
            {isLoading ? (
              <Loader size={20} className="spinning" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;

