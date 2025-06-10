import { useEffect } from "react";
import HeaderBar from "./HeaderBar";
import MainContent from "./MainContent";
import SideBar from "./SideBar";
import "./index.scss";
import { getActiveFile, getFileById } from "../api";
import { useEditorStore } from "../store";
function Layout() {
  const { reset } = useEditorStore();

  async function initState() {
    const fileMeta = await getActiveFile();
    if (fileMeta) {
      const fileContent = await getFileById(fileMeta.id);
      if (fileContent) {
        console.log(fileContent)
        reset(fileContent);
      }
    }
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
