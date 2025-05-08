import { useEffect, useRef, useState } from 'react'
import './App.css'
import './index.css'
import axios from 'axios'
import { FaMicrophone } from "react-icons/fa";

function App() {
  const [question, setQuestion] = useState("");
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);

  const recognitionRef = useRef(null);

  useEffect(() => {
    // Setup recognition of Voice Input 
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuestion(transcript);
      };

      recognition.onerror = (event) => {
        alert('Voice input error: ' + event.error);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const startVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
    } else {
      alert("Your browser does not support voice input.");
    }
  };


  async function generateAnswer() {
    if (!question.trim()) return;

    setLoading(true);

    try {
      const response = await axios({
        url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyB9DaUQSDjgUbRaNIfujV_2Indjunf2qqs",
        method: "post",
        data: {
          contents: [{ parts: [{ text: question }] }],
        },
      });

      const answer = response.data.candidates[0].content.parts[0].text;

      setConversations(prev => [{ question, answer }, ...prev]);
      setQuestion("");
    } catch (error) {
      setConversations(prev => [{ question, answer: "Something went wrong." }, ...prev]);
    }

    setLoading(false);
  }

  return (
    <div id="app">
      <div className='main'>
        <h1>ChatWith AI 🖤</h1>
        <div className="textarea-wrapper">
                  <textarea
          placeholder='Ask me anything...'
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        ></textarea>
        <FaMicrophone className="mic-icon" onClick={startVoiceInput} />

        </div>

        <div className="btn-box">
          <button onClick={generateAnswer} disabled={loading}>
            {loading ? "Loading..." : "Submit"}
          </button>
          <button onClick={() => {
            setQuestion("");
            setConversations([]);
          }}>Clear</button>
        </div>

        <div className="chat-box">
          {conversations.map((conv, index) => (
            <div key={index} className="chat-entry">
              <div className="user-question">{conv.question}</div>
              <div className="bot-answer">{conv.answer}</div>
            </div>
          ))}
        </div>
      </div>
      <footer className='footer'>&copy; All Rights Reserved by @Vipul Thakur♠️</footer>
    </div>
  )
}

export default App
