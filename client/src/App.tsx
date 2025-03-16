import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import {VideoDetail} from "./pages/VideoDetail";

function App() {
  return (
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/video/:id" element={<VideoDetail/>}/>
          </Routes>
        </div>
      </Router>
  );
}

export default App;
