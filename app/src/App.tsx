import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from 'react';
import Header from "./components/Header";
import MainPage from "./components/MainPage";
import Methods from "./components/Methods";
import AboutPage from "./components/About";

function App() {
  const [width, setWidth] = useState(window.innerWidth);

  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }

  useEffect(() => {
      window.addEventListener('resize', handleWindowSizeChange);
      return () => {
          window.removeEventListener('resize', handleWindowSizeChange);
      }
  }, []);

  const isMobile = width <= 640;

  return (
    <div className="flex flex-col sm:h-screen">
      <Header isMobile={isMobile} />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/methods" element={<Methods />} />
      </Routes>
    </div>
  );
}

export default App;
