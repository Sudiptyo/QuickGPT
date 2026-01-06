import React, { useState } from "react";
import SideBar from "./Components/SideBar";
import ChatBot from "./Components/ChatBot";
import Loading from "./Pages/Loading";
import Credits from "./Pages/Credits";
import Community from "./Pages/Community";
import Login from "./Pages/Login";
import { Routes, Route } from "react-router-dom";
import { assets } from "./assets/assets";
import './assets/prism.css';

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <>
      {!isMenuOpen && (
        <img
          src={assets.menu_icon}
          alt="Loading..."
          className="absolute top-3 left-3 w-8 h-8 cursor-pointer md:hidden not-dark:invert"
          onClick={() => setIsMenuOpen(true)}
        />
      )}
      <div className="dark:bg-linear-to-b from-[#242124] to-[#000000] dark:text-white">
        <div className="flex h-screen w-screen">
          <SideBar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
          <Routes>
            <Route path="/" element={<ChatBot />} />
            <Route path="/loading" element={<Loading />} />
            <Route path="/credits" element={<Credits />} />
            <Route path="/community" element={<Community />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>
      </div>
    </>
  );
};

export default App;
