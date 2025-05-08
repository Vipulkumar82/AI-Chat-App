import { useState, useEffect } from "react";
import "./App.css";
import "./index.css";
import axios from "axios";

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [typedAnswer, setTypedAnswer] = useState("");

  useEffect(() => {
    let i = 0;
    setTypedAnswer("");

    if (answer) {
      const typingInterval = setInterval(() => {
        setTypedAnswer((prev) => prev + answer.charAt(i));
        i++;
        if (i >= answer.length) clearInterval(typingInterval);
      }, 10);

      return () => clearInterval(typingInterval);
    }
  }, [answer]);

  async function generateAnswer() {
    setAnswer("Waiting...");
    const response = await axios({
      url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyB9DaUQSDjgUbRaNIfujV_2Indjunf2qqs",
      method: "post",
      data: {
        contents: [{ parts: [{ text: question }] }],
      },
    });
    const result = response.data.candidates[0].content.parts[0].text;
    setAnswer(result);
  }

  return (
    <div id="app">
      <div className="main">
        <h1>ChatWith AI 🖤</h1>
        <textarea
          placeholder="Ask me anything..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        ></textarea>

        <div className="btn-box">
          <button onClick={generateAnswer}>Submit</button>
          <button
            onClick={() => {
              setQuestion("");
              setAnswer("");
              setTypedAnswer("");
            }}
          >
            Clear
          </button>
        </div>

        <div className="output-Box">
          {question && <div className="user-question">{question}</div>}
          <div className="bot-answer">
            {answer === "Loading..." ? "Loading..." : <div>{answer}</div>}
          </div>
        </div>
      </div>
      <footer className="footer">
        &copy; All Rights are reserved by @Vipul Thakur♠️
      </footer>
    </div>
  );
}

export default App;
