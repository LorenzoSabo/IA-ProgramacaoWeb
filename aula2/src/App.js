import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './navbar/';
import Home from './home/';
import Produto from './produtos/';

function App() {
  return (
    <div className="App">
      <Router>
        <NavBar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/produtos" element={<Produto />} />
          </Routes>
        </main>
      </Router>
    </div>
  );
}

export default App;
