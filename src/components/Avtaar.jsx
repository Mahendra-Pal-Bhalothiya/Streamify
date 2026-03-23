// frontend/src/components/common/Avatar.jsx
import React, { useState } from "react";

const Avatar = ({ src, alt, name, size = 32, className = "" }) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const getInitials = () => {
    if (!name) return "?";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  const getBackgroundColor = () => {
    const colors = [
      "#3b82f6",
      "#ef4444",
      "#10b981",
      "#f59e0b",
      "#8b5cf6",
      "#ec489a",
      "#06b6d4",
      "#84cc16",
      "#f97316",
      "#14b8a6",
      "#d946ef",
      "#f43f5e",
    ];
    const index = (name?.length || 0) % colors.length;
    return colors[index];
  };

  if (error || !src) {
    return (
      <div
        className={`avatar-fallback ${className}`}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          backgroundColor: getBackgroundColor(),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: "bold",
          fontSize: size * 0.4,
          flexShrink: 0,
          textTransform: "uppercase",
        }}
      >
        {getInitials()}
      </div>
    );
  }

  return (
    <div
      className={`avatar relative ${className}`}
      style={{ width: size, height: size, flexShrink: 0 }}
    >
      {loading && (
        <div
          className="avatar-loading"
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            backgroundColor: "#e5e7eb",
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
      )}
      <img
        src={src}
        alt={alt || "avatar"}
        onLoad={() => setLoading(false)}
        onError={() => setError(true)}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          objectFit: "cover",
          display: loading ? "none" : "block",
        }}
      />
    </div>
  );
};

export default Avatar;
