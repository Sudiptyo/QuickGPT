import React, { useState, useEffect } from "react";
import { createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { dummyUserData, dummyChats } from "../assets/assets.js";
import axios from "axios";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_SERVER_URL;
axios.defaults.withCredentials = true;

const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [Chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [loadingUser, setLoadingUser] = useState(true);

  const fetchUser = async () => {
    try {
      const { data } = await axios.get("/api/v1/users/getuser");
      if (data?.success) {
        setUser(data?.data);
      } else {
        toast.error(data?.message);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        // user is simply not logged in
        setUser(null);
      } else {
        toast.error(err?.response?.data?.message || err?.message);
      }
    } finally {
      setLoadingUser(false);
    }
  };

  const createNewChat = async () => {
    try {
      if (!user) {
        toast("Login to create a new chat");
        return;
      }

      const { data } = await axios.post("/api/v1/chats/create");

      if (data?.success) {
        setChats((prev) => [data.data, ...prev]);
        setSelectedChat(data.data);
      }
    } catch (err) {
      console.error("Create new chat error:", err);
      toast.error(err.response?.data?.message || "Failed to create chat");
    }
  };

  const fetchUserChats = async () => {
    try {
      const res = await axios.get("/api/v1/chats/get");

      const chats = Array.isArray(res?.data?.data) ? res.data.data : [];

      setChats(chats);
      setSelectedChat(chats[0] || null);
    } catch (err) {
      console.error("Fetch User Chats error:", err);
      toast.error(err.response?.data?.message || "Failed to fetch chats");
      setChats([]);
      setSelectedChat(null);
    }
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
    createNewChat,
    loadingUser,
    fetchUserChats,
    axios,
    fetchUser,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
