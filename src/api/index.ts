/**
 * 模拟数据更新逻辑
 */

const activeFileIdKey = "activeFileIdKey";
const fileListKey = "fileListKey";

export async function getActiveFile(): Promise<FileMeta> {
  const activeFile = localStorage.getItem(activeFileIdKey);
  const fileList = await getFileList();

  const file = fileList.find((f) => f.id === activeFile);
  return file || fileList[0];
}

export async function getFileList(): Promise<FileMeta[]> {
  try {
    const json = localStorage.getItem(fileListKey);
    if (!json) return [];
    return JSON.parse(json) as FileMeta[];
  } catch (_) {
    console.log(_);
    return [];
  }
}

export async function getFileById(id: string) {
  try {
    const json = localStorage.getItem(id);
    if (!json) return null;
    return JSON.parse(json) as FileContent;
  } catch (_) {
    console.log(_);
    return null;
  }
}

export async function saveFile(i: string, fileContent: FileContent) {
  const id = i || Date.now().toString();
  // TODO 新建逻辑
  localStorage.setItem(activeFileIdKey, id);

  localStorage.setItem(id, JSON.stringify(fileContent));
  try {
    const fileList = await getFileList();
    const has = !!fileList.find((f) => f.id === id);
    if (!has) {
      fileList.push({
        name: fileContent.title || "新建笔记",
        id,
      });
      localStorage.setItem(fileListKey, JSON.stringify(fileList));
    }
  } catch (_) {
    console.log(_);
  }
  return {
    name: fileContent.title || "新建笔记",
    id,
  };
}

export async function deleteFile(id: string) {
  localStorage.removeItem(id);
  const fileList = await getFileList();
  const filtered = fileList.filter((f) => f.id !== id);
  localStorage.setItem(fileListKey, JSON.stringify(filtered));
}

export async function saveFileContent(fileContent: FileContent, id: string) {
  localStorage.setItem(id, JSON.stringify(fileContent));
}
