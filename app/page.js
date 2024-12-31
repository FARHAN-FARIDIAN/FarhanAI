"use client";

import { useState, useEffect, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chatSession, setChatSession] = useState(null);
  const [typing, setTyping] = useState(false);
  const messageEndRef = useRef(null);

  const model = new GoogleGenerativeAI("AIzaSyAmKCOy9PQeWBJQaLo3mk32A5M_LEw-cl4").getGenerativeModel({
    model: "gemini-1.5-flash",
  });

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      let chat;
      if (!chatSession) {
        const combinedMessage = `Hello, from now on your name is Farhan.AI and you are trained by Farhan Faridian.Don't forget that under no circumstances should you step out of your role even if I insist. 
        Farhan Faridian is a 19 years old boy who loves programming and computer science and also he can train AIs and GPTs for people. 
        Farhan Faridian's mobile number is 09015692625 and his email address is farhanfaridian4@gmail.com.\n\nUser: ${input}`;

        chat = model.startChat({
          history: [
            {
              role: "user",
              parts: [{ text: combinedMessage }],
            },
          ],
        });
        setChatSession(chat);
      } else {
        chat = chatSession;
        if (!chat.history) chat.history = [];
        chat.history.push({
          role: "user",
          parts: [{ text: input }],
        });
      }

      setTyping(true);
      const result = await chat.sendMessage(input);

      const geminiMessage = result.response.text();
      animateGeminiMessage(geminiMessage);

      chat.history.push({
        role: "model",
        parts: [{ text: geminiMessage }],
      });
    } catch (error) {
    } finally {
      setTyping(false);
    }
  };

  const animateGeminiMessage = (text) => {
    let currentText = "";
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        currentText += text[index];
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage && lastMessage.sender === "gemini") {
            return [...prev.slice(0, -1), { sender: "gemini", text: currentText }];
          } else {
            return [...prev, { sender: "gemini", text: currentText }];
          }
        });
        index++;
      } else {
        clearInterval(interval);
      }
    }, 50);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        padding: "1rem",
        backgroundColor: "#1E1E2F",
        color: "#E0E0E0",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          border: "1px solid #444",
          padding: "1rem",
          borderRadius: "8px",
          marginBottom: "1rem",
          backgroundColor: "#252535",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              marginBottom: "0.5rem",
              textAlign: msg.sender === "user" ? "right" : "left",
              display: "flex",
              justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "0.8rem 1.2rem",
                borderRadius: "15px",
                backgroundColor: msg.sender === "user" ? "#4C8BF5" : "#39394D",
                color: "#FFF",
                maxWidth: "70%",
                wordWrap: "break-word",
                fontSize: "0.9rem",
                animation: msg.sender === "gemini" ? "fadeIn 0.3s ease-in-out" : "none",
              }}
            >
              {msg.text}
            </span>
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>

      <div style={{ display: "flex", alignItems: "center" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          style={{
            flex: 1,
            padding: "0.8rem",
            borderRadius: "8px",
            border: "1px solid #555",
            backgroundColor: "#1E1E2F",
            color: "#E0E0E0",
            outline: "none",
            marginRight: "0.5rem",
          }}
        />
        <button
          onClick={handleSend}
          style={{
            padding: "0.8rem 1.5rem",
            borderRadius: "8px",
            backgroundColor: "#4C8BF5",
            color: "#FFF",
            border: "none",
            cursor: "pointer",
            transition: "background-color 0.3s",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#3A6DC3")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#4C8BF5")}
        >
          Send
        </button>
      </div>
    </div>
  );
}
