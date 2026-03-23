// frontend/src/components/Chat/MessageInput.jsx
import React, { useState } from "react";

function MessageInput({ onSendMessage }) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim() || sending) return;

    try {
      setSending(true);
      await onSendMessage(message.trim());
      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form className="message-input-form" onSubmit={handleSubmit}>
      <div className="input-container">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          rows={1}
          disabled={sending}
          className="message-textarea"
        />

        <button
          type="submit"
          disabled={!message.trim() || sending}
          className="send-button"
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </div>
    </form>
  );
}

export default MessageInput;
