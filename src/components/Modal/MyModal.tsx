import "./ModalContext.scss";

export const MyModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>提示</h2>
        <p>你确定要进行此操作吗？</p>
        <div className="modal-actions">
          <button className="cancel" onClick={onClose}>
            取消
          </button>
          <button className="confirm" onClick={onClose}>
            确定
          </button>
        </div>
      </div>
    </div>
  );
};
