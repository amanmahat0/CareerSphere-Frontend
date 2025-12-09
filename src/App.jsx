import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Logo from './Component/Logo/Logo.jsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>

        <>Hii Aman Kumar Mahato</>
        <Logo />
      </div>
    </>
  )
}

export default App
