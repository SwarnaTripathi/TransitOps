import { useState, useEffect } from "react";

export default function Toast({ message, type = "success", duration = 4000, onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  const icons = {
    success: "✨",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
  };

  return (
    <div className={`toast ${type === "error" ? "toast-error" : ""} ${type === "warning" ? "toast-warning" : ""}`}>
      <span>{icons[type] || icons.success}</span>
      <span>{message}</span>
      <button
        className="toast-close"
        onClick={() => {
          setVisible(false);
          if (onClose) onClose();
        }}
      >
        ✕
      </button>
    </div>
  );
}
