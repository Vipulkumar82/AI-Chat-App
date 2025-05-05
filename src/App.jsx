import { useState } from 'react'
import './App.css'
import './index.css'
import axios from 'axios'

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

    async function generateAnswer(){
      setAnswer("Loading...")
      const response = await axios({
        url:"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyB9DaUQSDjgUbRaNIfujV_2Indjunf2qqs",
        method:"post",
        data: {
          contents: [
            {parts: [{ text: question}]},
          ],
        },
      });
      setAnswer(response['data']['candidates'][0]['content'] ['parts'][0]['text'])
    }

  return (
    <>
      <div id="app">
      <div className='main'>
        <h1>ChatWith AI 🖤</h1>
        <textarea placeholder='Enter the Question' value={question} onChange={(e)=> setQuestion(e.target.value)}></textarea>
        <button onClick={generateAnswer}>Submit</button>
        <div className="output">
          <h3>Output:</h3>
        </div>
        <div className="output-Box">
          <pre>{answer}</pre>
        </div>
      </div>
        <footer className='footer'>&copy;All Rights are reserved by @Vipul Thakur♠️</footer>
      </div>
    </>
  )
}

export default App
