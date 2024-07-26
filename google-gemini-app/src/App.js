import logo from './logo.svg';
import './App.css';
import { run } from './genAi.js';
import { useEffect, useState } from 'react';

function App() {
  const[data, setData] = useState([])
  useEffect(() => {
    async function fetchData(){
      const textData = await run()
      setData(textData)
    }
    fetchData()
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div>{data}</div>;
      </header>
    </div>
  );
}

export default App;
