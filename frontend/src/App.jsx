import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './components/Landing';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AnimatedBackground from './components/AnimatedBackground';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <AnimatedBackground />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
