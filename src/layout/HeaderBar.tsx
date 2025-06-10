
export default function HeaderBar() {

  const onSaveFile = () => {}
  return (
    <div className="HeaderBar">
      <div className="HeaderBar-left">
        <span className="HeaderBar-title">笔记</span>
      </div>
      <div className="HeaderBar-right">
        <span className="HeaderBar-action">新建</span>
        <span className="HeaderBar-action" onClick={onSaveFile}>保存</span>
        <span className="HeaderBar-action">设置</span>
      </div>
    </div>
  );
}
