import React, { useState } from "react";
import { Bold, Italic, Code, Link, Palette } from "lucide-react";
import "./FloatingToolbar.scss";
import { FONT_COLORS } from "../../constants/command";

interface FloatingToolbarProps {
  top: number;
  left: number;
  onFormat: (type: FormatType, payload?: string) => void;
}

const colors = FONT_COLORS.map((color) => color.color);
const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  top,
  left,
  onFormat,
}) => {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const applyLink = () => {
    onFormat("link", linkUrl);
    setShowLinkInput(false);
    setLinkUrl("");
  };

  const applyColor = (color: string) => {
    onFormat("color", color);
    setShowColors(false);
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
      <div className="external-field">
        {showLinkInput ? (
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <input
              type="text"
              placeholder="输入链接地址，然后回车"
              value={linkUrl}
              onKeyUp={(e) => e.key === "Enter" && applyLink()}
              onChange={(e) => setLinkUrl(e.target.value)}
              style={{ width: 150, fontSize: 14 }}
              autoFocus
            />
          </div>
        ) : null}

        {showColors ? (
          <div className="color-picker">
            {colors.map((c) => (
              <span
                key={c}
                className="color-item"
                style={{ background: c }}
                onClick={() => applyColor(c)}
              ></span>
            ))}
          </div>
        ) : null}
      </div>
      <button
        onClick={() => onFormat("strong")}
        title="Bold (Ctrl+B)"
        type="button"
      >
        <Bold size={16} />
      </button>
      <button
        onClick={() => onFormat("em")}
        title="Italic (Ctrl+I)"
        type="button"
      >
        <Italic size={16} />
      </button>
      <button onClick={() => onFormat("code")} title="Code" type="button">
        <Code size={16} />
      </button>
      <button onClick={() => setShowColors(true)} title="Palette" type="button">
        <Palette size={16} />
      </button>

      <button
        onClick={() => setShowLinkInput(true)}
        title="Insert Link"
        type="button"
      >
        <Link size={16} />
      </button>
    </div>
  );
};

export default FloatingToolbar;
