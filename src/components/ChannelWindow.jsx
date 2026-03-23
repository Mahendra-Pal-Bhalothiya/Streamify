// frontend/src/components/Chat/ChannelWindow.jsx
import React, { useState, useEffect, useRef } from "react";
import MessageInput from "./MessageInput";

function ChannelWindow({ channel, onSendMessage, currentUserId }) {
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const messageListRef = useRef(null);

  useEffect(() => {
    if (!channel) return;

    // Get existing messages
    setMessages(channel.state.messages);

    // Listen for new messages
    const handleNewMessage = (event) => {
      setMessages((prev) => [...prev, event.message]);
    };

    channel.on("message.new", handleNewMessage);

    return () => {
      channel.off("message.new", handleNewMessage);
    };
  }, [channel]);

  useEffect(() => {
    // Scroll to bottom on new messages
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  const groupMessagesByDate = () => {
    const groups = [];
    let currentDate = null;
    let currentGroup = [];

    messages.forEach((message) => {
      const messageDate = formatDate(message.created_at);

      if (messageDate !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({ date: currentDate, messages: currentGroup });
        }
        currentDate = messageDate;
        currentGroup = [message];
      } else {
        currentGroup.push(message);
      }
    });

    if (currentGroup.length > 0) {
      groups.push({ date: currentDate, messages: currentGroup });
    }

    return groups;
  };

  const messageGroups = groupMessagesByDate();

  return (
    <div className="channel-window">
      <div className="channel-header">
        <h3>{channel.data?.name || "Chat"}</h3>
        <div className="member-count">
          {Object.keys(channel.state.members).length} members
        </div>
      </div>

      <div className="message-list" ref={messageListRef}>
        {messageGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="message-group">
            <div className="date-divider">
              <span>{group.date}</span>
            </div>

            {group.messages.map((message, messageIndex) => {
              const isOwnMessage = message.user?.id === currentUserId;

              return (
                <div
                  key={message.id}
                  className={`message ${isOwnMessage ? "own-message" : "other-message"}`}
                >
                  {!isOwnMessage && (
                    <div className="message-sender">
                      {message.user?.name || message.user?.id}
                    </div>
                  )}

                  <div className="message-content">
                    <div className="message-bubble">{message.text}</div>
                    <div className="message-time">
                      {formatTime(message.created_at)}
                      {isOwnMessage && (
                        <span className="message-status">
                          {message.status === "read" ? "✓✓" : "✓"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput onSendMessage={onSendMessage} />
    </div>
  );
}

export default ChannelWindow;
