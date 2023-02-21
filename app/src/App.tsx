import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import MainPage from "./components/MainPage";

function App() {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <Routes>
        <Route path="/" element={<MainPage />} />
      </Routes>
    </div>
  );
}

export default App;
