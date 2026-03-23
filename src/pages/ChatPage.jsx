// pages/ChatPage.jsx
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import streamChatService from "../lib/streamChatService";
import ChatContainer from "../components/ChatContainer";

function ChatPage({ chatInitialized, chatError }) {
  const { id } = useParams(); // Channel or user ID

  useEffect(() => {
    if (chatError) {
      console.error("Chat error:", chatError);
      // Show error toast
    }
  }, [chatError]);

  if (!chatInitialized) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Connecting to chat...</p>
        </div>
      </div>
    );
  }

  if (chatError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-red-600">
          <p>Failed to connect to chat</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return <ChatContainer channelId={id} />;
}

export default ChatPage;
