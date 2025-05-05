import { useState } from 'react'
import './App.css'
import './index.css'

function App() {
  return (
    <>
      <div id="app">
      <div className='main'>
        <textarea placeholder='Enter the Question'></textarea>
        <button>Submit</button>
        <div className="output">
          <h3>Output:</h3>
        </div>
        <div className="output-Box">
          Hey I'm The Output
        </div>
      </div>
        <footer className='footer'>&copy;All Rights are reserved by @Vipul Thakur♠️</footer>
      </div>
    </>
  )
}

export default App
