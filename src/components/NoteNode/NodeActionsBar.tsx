import { Trash2, Tag, UploadCloud, Download } from "lucide-react";

export interface ActionItem {
  id: string;
  label: string;
  icon?: React.ReactNode; // lucide-react 的图标组件实例

  disabled?: boolean;
}

const actions: ActionItem[] = [
  {
    id: "delete" as ActionType,
    label: "删除",
    icon: <Trash2 size={16} />,
  },
  {
    id: "mark" as ActionType,
    label: "标记",
    icon: <Tag size={16} />,
  },
  {
    id: "import" as ActionType,
    label: "导入",
    icon: <UploadCloud size={16} />,
  },
  {
    id: "export" as ActionType,
    label: "导出",
    icon: <Download size={16} />,
  },
];

interface NodeActionsBarProps {
  actions: ActionItem[];
  onClick: (id: ActionType) => void;
  style?: React.CSSProperties;
}

const NodeActionsBar: React.FC<NodeActionsBarProps> = ({ style, onClick }) => {
  return (
    <div className="NodeActionsBar" style={{ ...style }}>
      {actions.map(({ id, label, icon, disabled }) => (
        <button
          key={id}
          disabled={disabled}
          style={{
            marginRight: 8,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
          title={label}
          onClick={() => onClick(id as ActionType,)}
        >
          {icon}
          {label}
        </button>
      ))}
    </div>
  );
};

export default NodeActionsBar;
