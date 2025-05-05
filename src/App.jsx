import { useState } from 'react'
import './App.css'
import './index.css'

function App() {
  return (
    <>
      <div className='main'>
        <textarea placeholder='Enter the Question'></textarea>
        <button>Submit</button>
        <div className="output">
          <h3>Output:</h3>
        </div>
      </div>
    </>
  )
}

export default App
