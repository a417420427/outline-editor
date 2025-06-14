import { useRef, useState } from "react";
import Input from "../components/Input";
import ModalWrapper from "../components/Modal/ModalWrapper";
import { useModal } from "../components/Modal/useModal";
import { getInitialState, useEditorStore } from "../store";
import { saveFile, saveFileContent } from "../api";

export default function HeaderBar() {
  const editorStore = useEditorStore();

  const { openModal, closeModal } = useModal();
  const tempFileName = useRef("");

  const ModalBody = (props: { name: string }) => {
    const [value, setValue] = useState(props.name);
    tempFileName.current = value;
    return (
      <Input
        value={value}
        onChange={(val) => {
          console.log(val);
          setValue(val);
        }}
        placeholder="文件名"
      />
    );
  };

  const onSaveFile = async () => {
    const { activeFile } = editorStore;
    const fileContent = {
      fileId: editorStore.fileId,
      title: editorStore.title,
      tree: editorStore.tree,
      // nodeMap: Record<string, OutlineNode>,
      focusId: editorStore.focusId,
      focusOffset: editorStore.focusOffset,
    };
    if (!activeFile!.id) {
      const { id } = await openModal(
        <ModalWrapper
          title="新建文件"
          showButtons={true}
          onConfirm={async () => {
            const ft = {
              ...fileContent,
              title: tempFileName.current,
            };
            const af = await saveFile(activeFile!.id, ft);
            closeModal(id);

            editorStore.updateState({
              activeFile: af,
            });
            editorStore.initFileList();
          }}
        >
          <ModalBody name={activeFile!.tempFileName!} />
        </ModalWrapper>
      );
    } else {
      saveFileContent(fileContent, activeFile!.id);
    }
  };
  const onCreateFile = async () => {
    const fileContent = getInitialState();
    const { id } = await openModal(
      <ModalWrapper
        title="新建文件"
        showButtons={true}
        onConfirm={async () => {
          const ft = {
            ...fileContent,
            title: tempFileName.current,
          };
          const af = await saveFile("", ft);
          closeModal(id);

          editorStore.reset({
            ...ft,
            activeFile: af,
          });
        }}
      >
        <ModalBody name="新建文件" />
      </ModalWrapper>
    );
  };
  return (
    <div className="HeaderBar">
      <div className="HeaderBar-left">
        <span className="HeaderBar-title">大纲笔记</span>
      </div>
      <div className="HeaderBar-right">
        <span className="HeaderBar-action" onClick={onCreateFile}>
          新建
        </span>
        <span className="HeaderBar-action" onClick={onSaveFile}>
          保存
        </span>
        <span className="HeaderBar-action">设置</span>
      </div>
    </div>
  );
}
