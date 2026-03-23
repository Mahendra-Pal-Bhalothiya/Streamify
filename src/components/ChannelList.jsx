// frontend/src/components/Chat/ChannelList.jsx
import React, { useState } from "react";

function ChannelList({
  channels,
  activeChannel,
  onChannelSelect,
  currentUserId,
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredChannels = channels.filter((channel) => {
    const channelName = channel.data?.name || "";
    return channelName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const formatChannelName = (channel) => {
    if (channel.data?.name) {
      return channel.data.name;
    }

    // For direct messages, show other user's name
    const otherMembers = Object.values(channel.state.members)
      .filter((member) => member.user_id !== currentUserId)
      .map((member) => member.user?.name || member.user_id);

    return otherMembers.join(", ") || "Unknown Chat";
  };

  const getLastMessage = (channel) => {
    const lastMessage =
      channel.state.messages[channel.state.messages.length - 1];
    if (!lastMessage) return "No messages yet";

    const sender =
      lastMessage.user?.id === currentUserId ? "You" : lastMessage.user?.name;
    const text = lastMessage.text?.substring(0, 30);
    return `${sender}: ${text}${lastMessage.text?.length > 30 ? "..." : ""}`;
  };

  const getUnreadCount = (channel) => {
    return channel.countUnread();
  };

  return (
    <div className="channel-list">
      <input
        type="text"
        placeholder="Search conversations..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />

      <div className="channels">
        {filteredChannels.map((channel) => (
          <div
            key={channel.cid}
            className={`channel-item ${activeChannel?.cid === channel.cid ? "active" : ""}`}
            onClick={() => onChannelSelect(channel)}
          >
            <div className="channel-info">
              <div className="channel-name">
                {formatChannelName(channel)}
                {getUnreadCount(channel) > 0 && (
                  <span className="unread-badge">
                    {getUnreadCount(channel)}
                  </span>
                )}
              </div>
              <div className="last-message">{getLastMessage(channel)}</div>
            </div>
          </div>
        ))}

        {filteredChannels.length === 0 && (
          <div className="no-channels">No conversations found</div>
        )}
      </div>
    </div>
  );
}

export default ChannelList;
