// frontend/src/components/ChatContainer.jsx
import React from "react";
import { useStreamChat } from "../hooks/useStreamChat";
import ChannelList from "./ChannelList";
import ChannelWindow from "./ChannelWindow";
import LoadingSpinner from "./LoadingSpinner";

function ChatContainer({ user }) {
  const {
    channels,
    activeChannel,
    setActiveChannel,
    loading,
    error,
    connectionStatus,
    sendMessage,
    disconnect,
  } = useStreamChat(user);

  if (!user) {
    return <div className="chat-error">Please log in to use chat</div>;
  }

  if (loading) {
    return <LoadingSpinner message="Connecting to chat..." />;
  }

  if (error) {
    return (
      <div className="chat-error">
        <h3>Error: {error}</h3>
        <button onClick={() => window.location.reload()}>
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <div className="chat-header">
          <h2>Messages</h2>
          <div className={`connection-status ${connectionStatus}`}>
            {connectionStatus === "connected" ? "🟢 Online" : "🔴 Offline"}
          </div>
        </div>

        <ChannelList
          channels={channels}
          activeChannel={activeChannel}
          onChannelSelect={setActiveChannel}
          currentUserId={user.id}
        />

        <button onClick={disconnect} className="disconnect-btn">
          Disconnect
        </button>
      </div>

      <div className="chat-main">
        {activeChannel ? (
          <ChannelWindow
            channel={activeChannel}
            onSendMessage={sendMessage}
            currentUserId={user.id}
          />
        ) : (
          <div className="no-channel">
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatContainer;
