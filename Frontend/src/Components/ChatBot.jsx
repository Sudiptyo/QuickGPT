import React, { useEffect, useRef, useState } from "react";
import { useAppContext } from "../Context/AppContext";
import { assets } from "../assets/assets";
import Message from "./Message";
import toast from "react-hot-toast";

const ChatBot = () => {
  const { selectedChat, theme, user, axios, setUser } = useAppContext();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState("text");
  const [isPublished, setIsPublished] = useState(false);

  const containerRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!user) return toast("Login to use chatbot");
      setLoading(true);

      if (!selectedChat?._id) {
        return toast.error("Please select or create a chat first");
      }

      const userPrompt = prompt;

      // optimistic UI
      setMessages((prev) => [
        ...prev,
        { role: "user", content: userPrompt, timestamp: Date.now() },
      ]);

      setPrompt(""); // clear input AFTER storing value

      const { data } = await axios.post(`/api/v1/messages/${mode}`, {
        chatId: selectedChat._id,
        prompt: userPrompt, // ✅ ALWAYS correct
        isPublished,
      });

      console.log("Selected Chat:", selectedChat);
      console.log("Chat ID:", selectedChat?._id);

      if (data?.success) {
        toast.success(data.message);

        setMessages((prev) => [...prev, data.data]);

        setUser((prev) => ({
          ...prev,
          credits: data.credits,
        }));
      }
    } catch (err) {
      setMessages((prev) => prev.slice(0, -1));
      console.log("Chatbot error:", err);

      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedChat) {
      setMessages(selectedChat.messages);
    }
  }, [selectedChat]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  return (
    <>
      <div className="flex-1 flex flex-col justify-between m-5 md:m-10 xl:mx-30 max-md:mt-14 2xl:pr-40">
        {/* Chat Messages */}
        <div ref={containerRef} className="flex-1 mb-5 overflow-y-scroll">
          {messages.length === 0 && (
            <div className="h-full flex flex-col justify-center items-center gap-2 text-primary">
              <img
                src={
                  theme === "dark" ? assets.logo_full : assets.logo_full_dark
                }
                className="w-full max-w-56 sm:max-w-68"
                alt=""
              />
              <p className="mt-5 text-4xl sm:text-6xl text-center text-gray-400 dark:text-white">
                Ask Anything...
              </p>
            </div>
          )}
          {messages.map((msg, idx) => (
            <Message key={idx} message={msg} />
          ))}
          {/* Three Dots Loading Animation */}
          {loading && (
            <div className="loader flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce"></div>
            </div>
          )}
        </div>

        {mode === "image" && (
          <label
            className="inline-flex items-center gap-2 mb-3 text-sm mx-auto"
            htmlFor=""
          >
            <p className="text-xs">Published Generated Images to Community</p>
            <input
              type="checkbox"
              className="cursor-pointer"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
            />
          </label>
        )}

        {/* Prompt Input Box */}
        <form
          onSubmit={handleSubmit}
          className="bg-primary/20 dark:bg-[#583C79]/30 border border-primary dark:border-[#80609F]/30 rounded-full w-full max-w-2xl p-3 pl-4 mx-auto flex gap-4 items-center"
          action=""
        >
          <select
            onChange={(e) => setMode(e.target.value)}
            className="text-sm pl-3 outline-none"
            value={mode}
            name=""
            id=""
          >
            <option className="dark:bg-purple-900" value="text">
              Text
            </option>
            <option className="dark:bg-purple-900" value="image">
              Image
            </option>
          </select>
          <input
            onChange={(e) => setPrompt(e.target.value)}
            value={prompt}
            type="text"
            placeholder="Type your Prompt here..."
            className="flex-1 w-full text-sm outline-none"
            required
          />
          <button disabled={loading} type="submit">
            <img
              src={loading ? assets.stop_icon : assets.send_icon}
              className="w-8 cursor-pointer"
              alt=""
            />
          </button>
        </form>
      </div>
    </>
  );
};

export default ChatBot;
