import { getFileById } from "../api";
import { useEditorStore } from "../store";

export default function SideBar() {
  const {fileList, reset} = useEditorStore()
  console.log(fileList)

  const onSwitchActiveFile = async (file: FileMeta) => {
    const f = await getFileById(file.id);
    if (f) {
      reset({
        ...f,
        activeFile: file
      })
    }
  }
  return (
    <div className="SideBar">
      <div className="SideBar-header">
        <span className="SideBar-title">笔记列表</span>
      </div>
      <div className="SideBar-content">
        {fileList.map((file) => (
          <div onClick={() => onSwitchActiveFile(file)} key={file.id}>{file.name}</div>
        ))}
      </div>
    </div>
  );
}
