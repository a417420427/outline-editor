import { useEffect } from "react";
import HeaderBar from "./HeaderBar";
import MainContent from "./MainContent";
import SideBar from "./SideBar";
import "./index.scss";
import { getActiveFile, getFileById } from "../api";
import { getInitialState, useEditorStore } from "../store";
function Layout() {
  const { reset , initFileList} = useEditorStore();

  async function initState() {
    const fileMeta = await getActiveFile();
    if (fileMeta) {
      const fileContent = await getFileById(fileMeta.id);

      if (fileContent) {
        reset({
          ...fileContent,
          activeFile: fileMeta,
        });
      }
    } else {
      const s = getInitialState();
      reset({
        ...s,
        activeFile: {
          tempFileName: "新建文件",
          name: "",
          id: "",
        },
      });
    }
    initFileList()
  }
  useEffect(() => {
    initState();
  }, []);

  return (
    <div className="Layout">
      <HeaderBar />
      <MainContent />
      <SideBar />
    </div>
  );
}

export default Layout;
