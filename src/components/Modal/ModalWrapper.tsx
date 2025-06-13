import { useRef, type ReactNode } from "react";
import "./ModalContext.scss";

const ModalWrapper: React.FC<{
  onClose?: () => void;
  showButtons?: boolean;
  title?: string;
  children?: ReactNode | ReactNode[];
  closeOnClickModal?: boolean;
  onConfirm: () => void;
}> = ({
  onClose,
  onConfirm,
  showButtons,
  title,
  children,
  closeOnClickModal = true,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // 如果点击的是内容区外的区域，关闭模态框
    if (
      contentRef.current &&
      !contentRef.current.contains(e.target as Node) &&
      closeOnClickModal &&
      onClose
    ) {
      onClose();
    }
  };

  return (
    <div onClick={handleOverlayClick} className="modal-overlay">
      <div ref={contentRef} className="modal-content">
        <h2>{title || "提示"}</h2>
        <div className="modal-body">{children}</div>
        {showButtons ? (
          <div className="modal-actions">
            <button className="cancel" onClick={onClose}>
              取消
            </button>
            <button className="confirm" onClick={onConfirm}>
              确定
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ModalWrapper;
