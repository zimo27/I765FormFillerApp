import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import I765Form from './pages/I765Form';
import Immigration from './pages/Immigration';



const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/i765" element={<I765Form/>} />
        <Route path="/im" element={<Immigration/>} />
        {/* Define other routes for Sign Up and Log In */}
      </Routes>
    </Router>
  );
};

export default App;
