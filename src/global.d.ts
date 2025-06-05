import type { JSONContent } from "@tiptap/core"; // 或者使用 ProseMirror 的 Node JSON 类型


declare global {
  interface OutlineNode {
    id: string; // 唯一标识符
    content: JSONContent; // ProseMirror 文档内容的 JSON 表示
    children: OutlineNode[]; // 子节点数组
    selection?: string;
    collapsed?: boolean; // 可选，指示子节点是否折叠
    parentId?: string; // 可选，父节点的 ID
    createdAt?: string; // 可选，创建时间
    updatedAt?: string; // 可选，更新时间
  }
  interface NoteNodeProps {
    node: OutlineNode;
    focuseId: string;
    onAddNode: (node:OutlineNode) => void;
    onTabNode: (node:OutlineNode, selection?: string) => void;
  }

  type FormatType = "strong" | "em" | "code" | "link";

}
