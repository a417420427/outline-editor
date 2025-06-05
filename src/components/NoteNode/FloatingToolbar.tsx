import React, { useState } from "react";
import { Bold, Italic, Code, Link } from "lucide-react";
import "./FloatingToolbar.scss";

interface FloatingToolbarProps {
  top: number;
  left: number;
  onFormat: (type: FormatType, href?: string) => void;
}

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({ top, left, onFormat }) => {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const applyLink = () => {
    onFormat("link", linkUrl);
    setShowLinkInput(false);
    setLinkUrl("");
  };

  return (
    <div
      className="floating-toolbar"
      style={{
        top,
        left,
        position: "absolute",
        zIndex: 10,
        background: "white",
        border: "1px solid #ccc",
        borderRadius: 4,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        padding: "4px 8px",
        display: "flex",
        gap: "8px",
        alignItems: "center",
      }}
    >
      <button onClick={() => onFormat("strong")} title="Bold (Ctrl+B)" type="button">
        <Bold size={16} />
      </button>
      <button onClick={() => onFormat("em")} title="Italic (Ctrl+I)" type="button">
        <Italic size={16} />
      </button>
      <button onClick={() => onFormat("code")} title="Code" type="button">
        <Code size={16} />
      </button>
      {!showLinkInput ? (
        <button
          onClick={() => setShowLinkInput(true)}
          title="Insert Link"
          type="button"
        >
          <Link size={16} />
        </button>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <input
            type="text"
            placeholder="Enter URL"
            value={linkUrl}
            onKeyUp={(e) => e.key === "Enter" && applyLink()}
            onChange={(e) => setLinkUrl(e.target.value)}
            style={{ width: 150, fontSize: 14 }}
            autoFocus
          />
         
        </div>
      )}
    </div>
  );
};

export default FloatingToolbar;
