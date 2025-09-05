import { useEffect, useRef, useState } from 'react'
import './App.css'
import './index.css'
import axios from 'axios'
import {FaMicrophone, FaPaperPlane, FaStop, FaCopy, FaCheck, FaBrain, FaRocket, FaShieldAlt, FaGlobe, FaComments, FaClock, FaLock, FaStar } from "react-icons/fa";

function App() {
  const [question, setQuestion] = useState("");
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [copiedCode, setCopiedCode] = useState(null);
  const [showChat, setShowChat] = useState(false);

  const recognitionRef = useRef(null);

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(index);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const formatMessage = (text, messageIndex) => {
    const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    let codeBlockIndex = 0;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        const textBefore = text.slice(lastIndex, match.index);
        if (textBefore.trim()) {
          parts.push({
            type: 'text',
            content: textBefore.trim()
          });
        }
      }

      const language = match[1] || 'text';
      const code = match[2].trim();
      parts.push({
        type: 'code',
        language,
        content: code,
        index: `${messageIndex}-${codeBlockIndex}`
      });
      codeBlockIndex++;
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      const remainingText = text.slice(lastIndex);
      if (remainingText.trim()) {
        parts.push({
          type: 'text',
          content: remainingText.trim()
        });
      }
    }

    if (parts.length === 0) {
      parts.push({
        type: 'text',
        content: text
      });
    }

    return parts.map((part, index) => {
      if (part.type === 'code') {
        return (
          <div key={index} className="code-block-container">
            <div className="code-block-header">
              <span className="code-language">{part.language}</span>
              <button
                className="copy-btn"
                onClick={() => copyToClipboard(part.content, part.index)}
                title="Copy code"
              >
                {copiedCode === part.index ? <FaCheck /> : <FaCopy />}
              </button>
            </div>
            <pre className="code-block">
              <code>{part.content}</code>
            </pre>
          </div>
        );
      } else {
        return (
          <div key={index} className="text-content">
            {part.content.split('\n').map((line, lineIndex) => {
              if (line.trim() === '') {
                return <br key={lineIndex} />;
              }
              
              const inlineCodeRegex = /`([^`]+)`/g;
              const lineParts = [];
              let lastIdx = 0;
              let inlineMatch;

              while ((inlineMatch = inlineCodeRegex.exec(line)) !== null) {
                if (inlineMatch.index > lastIdx) {
                  lineParts.push(line.slice(lastIdx, inlineMatch.index));
                }
                lineParts.push(
                  <code key={`inline-${lineIndex}-${inlineMatch.index}`} className="inline-code">
                    {inlineMatch[1]}
                  </code>
                );
                lastIdx = inlineMatch.index + inlineMatch[0].length;
              }
              
              // Add remaining text
              if (lastIdx < line.length) {
                lineParts.push(line.slice(lastIdx));
              }
              
              if (lineParts.length === 0) {
                lineParts.push(line);
              }

              return (
                <p key={lineIndex} className="message-paragraph">
                  {lineParts}
                </p>
              );
            })}
          </div>
        );
      }
    });
  };

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsRecording(true);
        setInterimTranscript("");
      };

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setQuestion(prev => prev + finalTranscript);
          setInterimTranscript("");
        } else {
          setInterimTranscript(interimTranscript);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
        setInterimTranscript("");
      };

      recognition.onerror = (event) => {
        setIsRecording(false);
        setInterimTranscript("");
        alert('Voice input error: ' + event.error);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const startVoiceInput = () => {
    if (recognitionRef.current) {
      if (isRecording) {
        recognitionRef.current.stop();
      } else {
        recognitionRef.current.start();
      }
    } else {
      alert("Your browser does not support voice input.");
    }
  };


  async function generateAnswer() {
    if (!question.trim()) return;

    const userQuestion = question.trim();
    setConversations(prev => [{ question: userQuestion, answer: null }, ...prev]);
    setQuestion("");
    setLoading(true);

    try {
      const response = await axios({
        url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyB9DaUQSDjgUbRaNIfujV_2Indjunf2qqs",
        method: "post",
        data: {
          contents: [{ parts: [{ text: userQuestion }] }],
        },
      });

      const answer = response.data.candidates[0].content.parts[0].text;

      setConversations(prev => 
        prev.map((conv, index) => 
          index === 0 ? { ...conv, answer } : conv
        )
      );
    } catch (error) {
      setConversations(prev => 
        prev.map((conv, index) => 
          index === 0 ? { ...conv, answer: "Something went wrong." } : conv
        )
      );
    }

    setLoading(false);
  }

  return (
    <>
      {!showChat ? (
        <div className="landing-page">
          {/* Animated Background */}
          <div className="landing-background">
            <div className="floating-particles">
              {[...Array(20)].map((_, i) => (
                <div key={i} className={`particle particle-${i + 1}`}></div>
              ))}
            </div>
          </div>

          {/* Hero Section */}
          <section className="hero-section">
            <div className="hero-content">
              <div className="hero-text">
                <h1 className="hero-title">
                  Your Smart AI Chat Assistant
                </h1>
                <p className="hero-subtitle">
                  Experience the future of conversations — fast, intelligent, and always available.
                </p>
                <button 
                  className="cta-button"
                  onClick={() => setShowChat(true)}
                >
                  <FaRocket className="cta-icon" />
                  Start Chatting
                </button>
              </div>
              <div className="hero-visual">
                <div className="ai-brain-container">
                  <FaBrain className="ai-brain-icon" />
                  <div className="brain-pulse"></div>
                  <div className="brain-pulse delay-1"></div>
                  <div className="brain-pulse delay-2"></div>
                </div>
              </div>
            </div>
          </section>

          {/* About Section */}
          <section className="about-section">
            <div className="container">
              <h2 className="section-title">Intelligent Conversations, Redefined</h2>
              <p className="section-description">
                Our AI chat assistant leverages cutting-edge technology to provide you with 
                meaningful, context-aware conversations that adapt to your needs.
              </p>
              <div className="about-features">
                <div className="about-feature">
                  <FaBrain className="feature-icon" />
                  <h3>Smart AI</h3>
                  <p>Advanced neural networks for intelligent responses</p>
                </div>
                <div className="about-feature">
                  <FaComments className="feature-icon" />
                  <h3>Natural Chat</h3>
                  <p>Seamless conversations that feel human-like</p>
                </div>
                <div className="about-feature">
                  <FaRocket className="feature-icon" />
                  <h3>Lightning Fast</h3>
                  <p>Instant responses powered by modern technology</p>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="features-section">
            <div className="container">
              <h2 className="section-title">Powerful Features</h2>
              <div className="features-grid">
                <div className="feature-card">
                  <div className="feature-icon-container">
                    <FaBrain className="feature-main-icon" />
                  </div>
                  <h3>Smart Replies</h3>
                  <p>Get intelligent responses tailored to your specific questions and context.</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon-container">
                    <FaClock className="feature-main-icon" />
                  </div>
                  <h3>24/7 Support</h3>
                  <p>Available around the clock to assist you whenever you need help.</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon-container">
                    <FaGlobe className="feature-main-icon" />
                  </div>
                  <h3>Multi-Language</h3>
                  <p>Communicate in multiple languages with seamless translation capabilities.</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon-container">
                    <FaLock className="feature-main-icon" />
                  </div>
                  <h3>Secure & Private</h3>
                  <p>Your conversations are protected with enterprise-grade security.</p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="cta-section">
            <div className="container">
              <h2 className="cta-title">Ready to Experience the Future?</h2>
              <p className="cta-description">
                Join thousands of users who are already enjoying smarter conversations.
              </p>
              <button 
                className="cta-button secondary"
                onClick={() => setShowChat(true)}
              >
                <FaStar className="cta-icon" />
                Get Started Now
              </button>
            </div>
          </section>

          {/* Footer */}
          <footer className="landing-footer">
            <div className="container">
              <div className="footer-content">
                <div className="footer-brand">
                  <h3>ChatWith AI</h3>
                  <p>The future of intelligent conversations</p>
                </div>
                <div className="footer-links">
                  <div className="footer-section">
                    <h4>Product</h4>
                    <a href="#features">Features</a>
                    <a href="#about">About</a>
                    <a href="#pricing">Pricing</a>
                  </div>
                  <div className="footer-section">
                    <h4>Support</h4>
                    <a href="#help">Help Center</a>
                    <a href="#contact">Contact</a>
                    <a href="#privacy">Privacy</a>
                  </div>
                </div>
              </div>
              <div className="footer-bottom">
                <p>&copy; 2025 ChatWith AI. All Rights Reserved by @Vipul Thakur♠️</p>
              </div>
            </div>
          </footer>
        </div>
      ) : (
        // Chat Application
        <div id="app" className="chat-app">
                    <header className="chat-header">
            <div className="header-left">
              <button 
                className="back-btn"
                onClick={() => setShowChat(false)}
              >
                ← Back to Home
              </button>
            </div>
            <div className="header-center">
              <h1>ChatWith AI 🖤</h1>
            </div>
            <div className="header-right">
              <button 
                className="clear-btn" 
                onClick={() => {
                  setQuestion("");
                  setAnswer("");
                  setMessages([]);
                }}
              >
                Clear Chat
              </button>
            </div>
          </header>

          <div className="chat-container">
            <div className="messages-container">
              {conversations.length === 0 ? (
                <div className="welcome-message">
                  <h2>Welcome to AI Chat! 👋</h2>
                  <p>Start a conversation by typing your message below.</p>
                </div>
              ) : (
                conversations.slice().reverse().map((conv, index) => (
                  <div key={index} className="message-pair">
                    <div className="message user-message">
                      <div className="message-content">{conv.question}</div>
                      <div className="message-avatar">You</div>
                    </div>
                    {conv.answer !== null && (
                      <div className="message ai-message">
                        <div className="message-avatar">AI</div>
                        <div className="message-content ai-formatted">
                          {formatMessage(conv.answer, index)}
                        </div>
                      </div>
                    )}
                    {conv.answer === null && loading && index === conversations.length - 1 && (
                      <div className="message ai-message">
                        <div className="message-avatar">AI</div>
                        <div className="message-content loading">
                          <div className="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                          AI is thinking...
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="input-container">
            {isRecording && (
              <div className="recording-status">
                <div className="recording-dot"></div>
                <span>Listening... Speak now</span>
              </div>
            )}
            <div className="input-wrapper">
              <textarea
                placeholder='Type your message here...'
                value={question + interimTranscript}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    generateAnswer();
                  }
                }}
                rows="1"
              ></textarea>
              <div className="input-actions">
                <div className={`mic-container ${isRecording ? 'recording' : ''}`}>
                  {isRecording ? (
                    <FaStop className="mic-icon stop-icon" onClick={startVoiceInput} />
                  ) : (
                    <FaMicrophone className="mic-icon" onClick={startVoiceInput} />
                  )}
                  {isRecording && (
                    <div className="recording-animation">
                      <div className="pulse-ring"></div>
                      <div className="pulse-ring delay-1"></div>
                      <div className="pulse-ring delay-2"></div>
                    </div>
                  )}
                </div>
                <button 
                  className="send-btn" 
                  onClick={generateAnswer} 
                  disabled={loading || (!question.trim() && !interimTranscript.trim())}
                >
                  <FaPaperPlane />
                </button>
              </div>
            </div>
          </div>

          <footer className='footer'>&copy; All Rights Reserved by @Vipul Thakur♠️</footer>
        </div>
      )}
    </>
  )
}

export default App
