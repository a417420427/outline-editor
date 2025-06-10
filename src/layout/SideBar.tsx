import { getFileList } from "../api";
import { useEffect, useState } from "react";

export default function SideBar() {
  const [files, setFles] = useState<{ name: string; id: string }[]>([]);

  useEffect(() => {
    getFileList().then((files) => {
      setFles(files);
    });
  }, []);
  return (
    <div className="SideBar">
      <div className="SideBar-header">
        <span className="SideBar-title">笔记列表</span>
      </div>
      <div className="SideBar-content">
        {files.map((file) => (
          <div key={file.id}>{file.name}</div>
        ))}
      </div>
    </div>
  );
}
