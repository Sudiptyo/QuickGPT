import React, { useState } from "react";
import { useAppContext } from "../Context/AppContext";
import { assets } from "../assets/assets.js";
import moment from "moment";
import toast from "react-hot-toast";

const SideBar = ({ isMenuOpen, setIsMenuOpen }) => {
  const {
    Chats,
    selectedChat,
    setSelectedChat,
    navigate,
    user,
    setUser,
    theme,
    setTheme,
    axios,
    createNewChat,
    setChats,
    fetchUserChats,
  } = useAppContext();

  const [search, setSearch] = useState("");
  const chats = Array.isArray(Chats) ? Chats : [];

  const logout = async () => {
    try {
      const { data } = await axios.post("/api/v1/users/logout");
      if (data?.success) {
        toast.success(data.message || "User logged out successfully");
        setUser(null);
        navigate("/login");
      }
    } catch (err) {
      console.log("Log out error: ", err);
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      }
    }
  };

  const deleteChat = async (e, chatId) => {
    try {
      e.stopPropagation(); // prevent the click event from bubbling up to the parent element
      const confirm = window.confirm(
        "Are you sure you want to delete this chat?"
      );
      if (!confirm) return;
      const { data } = await axios.delete(`/api/v1/chats/delete/${chatId}`);
      if (data?.success) {
        setChats((prev) => prev.filter((chat) => chat._id !== chatId));
        toast.success(data?.message || "Chat deleted successfully");
        await fetchUserChats();
      }
    } catch (err) {
      console.log("Delete chat error: ", err);
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      }
    }
  };

  return (
    <>
      <div
        className={`flex flex-col h-screen min-w-72 p-5 dark:bg-linear-to-b from-[#242124]/30 to-[#000000]/30 border-r border-[#80609F]/30 backdrop-blur-3xl transition-all duration-500 max-md:absolute left-0 z-1 ${
          !isMenuOpen && `max-md:-translate-x-full`
        } max-md:h-full`}
      >
        {/* LOGO */}
        <img
          src={theme === "dark" ? assets.logo_full : assets.logo_full_dark}
          alt=""
          className="w-full max-w-48"
        />

        {/* NEW CHAT BUTTON */}
        <button
          onClick={createNewChat}
          className="flex justify-center items-center w-full py-2 mt-10 text-white bg-linear-to-r from-[#A456F7] to-[#3D81D6] text-sm cursor-pointer rounded-md"
        >
          <span className="mr-2 text-xl">+</span> New Chat
        </button>

        {/* SEARCH BAR */}
        <div className="flex items-center gap-2 p-3 mt-4 border border-gray-400 rounded-md dark:border-white/20">
          <img
            src={assets.search_icon}
            alt=""
            className="w-4 not-dark:invert"
          />
          <input
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Search..."
            className="text-xs placeholder:text-gray-400 outline-none"
            value={search}
          />
        </div>

        {/* CHAT LIST */}
        {chats.length > 0 && <p className="mt-4 text-sm">Recent Chats</p>}

        <div className="flex-1 overflow-y-scroll mt-3 text-sm space-y-3">
          {chats.length > 0 &&
            chats
              .filter((chat) => {
                if (search.length > 0) {
                  return chat.name.toLowerCase().includes(search.toLowerCase());
                }
                return chat;
              })
              .map((chat) => (
                <div
                  key={chat._id}
                  onClick={() => {
                    navigate("/");
                    setSelectedChat(chat);
                    setIsMenuOpen(false);
                  }}
                  className={`p-2 px-4 dark:bg-linear-to-b from-[#57317C]/10 dark:border-[#80609F]/15 rounded-md cursor-pointer flex flex-col group ${
                    chat._id === selectedChat?._id
                      ? "bg-linear-to-r from-[#A456F7] to-[#3D81D6] text-white"
                      : "text-gray-400"
                  }`}
                >
                  {/* TOP ROW: TEXT (flex-1) + BIN ICON (self-center) */}
                  <div className="flex items-center justify-between w-full gap-2">
                    <p className="truncate flex-1">
                      {chat?.messages?.length > 0
                        ? chat.messages[0].content.slice(0, 32)
                        : chat.name}
                    </p>

                    <img
                      onClick={(e) => deleteChat(e, chat._id)}
                      src={assets.bin_icon}
                      className="hidden group-hover:block w-4 h-4 self-center cursor-pointer not-dark:invert"
                      alt=""
                    />
                  </div>

                  {/* DATE BELOW */}
                  <p className="text-xs text-gray-500 dark:text-[#B1A6C0] mt-1">
                    {moment(chat.updatedAt).fromNow()}
                  </p>
                </div>
              ))}
        </div>

        {/* Community Images */}
        <div
          onClick={() => {
            navigate("/community");
            setIsMenuOpen(false);
          }}
          className="flex items-center gap-2 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md cursor-pointer hover:scale-105 transition-all"
        >
          <img
            src={assets.gallery_icon}
            className="w-4.5 not-dark:invert"
            alt=""
          />
          <div className="flex flex-col text-sm">
            <p>Community Images</p>
          </div>
        </div>

        {/* Credit Purchase Options */}
        <div
          onClick={() => {
            navigate("/credits");
            setIsMenuOpen(false);
          }}
          className="flex items-center gap-2 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md cursor-pointer hover:scale-105 transition-all"
        >
          <img src={assets.diamond_icon} className="w-4.5 dark:invert" alt="" />
          <div className="flex flex-col text-sm">
            <p>Credit : {user?.credits}</p>
            <p className="text-xs text-gray-400">
              Purchase Credits to use QuickGPT
            </p>
          </div>
        </div>

        {/* Dark Mode Toggle */}
        <div className="flex items-center justify-between gap-2 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md">
          <div className="flex items-center gap-2 text-sm">
            <img
              src={assets.theme_icon}
              className="w-4 not-dark:invert"
              alt=""
            />
            <p>Dark Mode</p>
          </div>
          <label
            htmlFor="theme-toggle"
            className="relative inline-flex cursor-pointer"
          >
            <input
              id="theme-toggle"
              onChange={() => setTheme(theme === "dark" ? "light" : "dark")}
              type="checkbox"
              className="sr-only peer"
              checked={theme === "dark"}
            />
            <div className="w-9 h-5 bg-gray-400 rounded-full peer-checked:bg-purple-600 transition-all"></div>
            <span className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-4"></span>
          </label>
        </div>

        {/* User Account */}
        <div className="flex items-center gap-3 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md cursor-pointer group">
          <img src={assets.user_icon} className="w-7 rounded-full" alt="" />
          <p className="flex-1 text-sm dark:text-primary truncate">
            {user ? user.username : "Login to QuickGPT"}
          </p>
          {user && (
            <img
              onClick={logout}
              src={assets.logout_icon}
              className="h-5 cursor-pointer hidden not-dark:invert group-hover:block"
              alt=""
            />
          )}
        </div>
        <img
          onClick={() => setIsMenuOpen(false)}
          src={assets.close_icon}
          className="absolute top-3 right-3 z-50 w-5 h-5 cursor-pointer md:hidden not-dark:inert"
          alt=""
        />
      </div>
    </>
  );
};

export default SideBar;
