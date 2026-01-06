import React, { useState, useEffect } from "react";
import { createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { dummyUserData, dummyChats } from "../assets/assets.js";

const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [Chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  const fetchUser = async () => {
    setUser(dummyUserData);
  };

  const fetchUserChats = async () => {
    setChats(dummyChats);
    setSelectedChat(dummyChats[0]);
  };

  useEffect(() => {
    // localStorage.setItem("theme", theme);
    // document.documentElement.setAttribute("data-theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (user) {
      fetchUserChats();
    } else {
      setChats([]);
      setSelectedChat(null);
    }
  }, [user]);

  useEffect(() => {
    fetchUser();
  }, []);

  const value = {
    navigate,
    user,
    setUser,
    Chats,
    setChats,
    selectedChat,
    setSelectedChat,
    theme,
    setTheme,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
