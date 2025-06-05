// commands.ts
export const Commands = {
  InsertNodeBelow: "insertNodeBelow",
  InsertNodeAbove: "insertNodeAbove",
  InsertChildNode: "insertChildNode",
  DeleteNode: "deleteNode",
  DuplicateNode: "duplicateNode",
  MoveNodeUp: "moveNodeUp",
  MoveNodeDown: "moveNodeDown",
  IndentNode: "indentNode",
  OutdentNode: 'OutdentNode',
  UnindentNode: "unindentNode",
  CollapseNode: "collapseNode",
  ExpandNode: "expandNode",
  ToggleCollapse: "toggleCollapse",
  FocusNextNode: "focusNextNode",
  FocusPrevNode: "focusPrevNode",
  FocusParentNode: "focusParentNode",
  FocusFirstChild: "focusFirstChild",
} as const;

export type Command = keyof typeof Commands;


export const FONT_COLORS = [
  { name: "Black", color: "#000000" },
  { name: "Dark Gray", color: "#4A4A4A" },
  { name: "Gray", color: "#808080" },
  { name: "Red", color: "#E53935" },
  { name: "Orange", color: "#FB8C00" },
  { name: "Yellow", color: "#FDD835" },
  { name: "Green", color: "#43A047" },
  { name: "Blue", color: "#1E88E5" },
  { name: "Purple", color: "#8E24AA" },
  { name: "Pink", color: "#EC407A" },
]