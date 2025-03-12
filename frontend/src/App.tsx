import { useEffect, useState } from 'react'
import './App.css'

const App = () => {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api')
      .then((response) => response.json())
      .then((data) => setMessage(data.message))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  return (
    <div>
      <h1>Hello from Vite + React!</h1>
      <p>Message from NestJS: {message}</p>
    </div>
  );
}

export default App;