import { useEffect, useRef, useState } from "react";
import { EditorState, TextSelection } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { schema } from "prosemirror-schema-basic";

import { history } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import { baseKeymap, toggleMark } from "prosemirror-commands";

import { Node as PMNode } from "prosemirror-model";
import FloatingToolbar from "./FloatingToolbar";
import "prosemirror-view/style/prosemirror.css";
import "./index.scss";
import { List } from "lucide-react";
import NodeActionsBar from "./NodeActionsBar";
import { extendedSchema } from "../../schema/extendedSchema";

function NoteNode(props: NoteNodeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const editView = useRef<EditorView | null>(null);
  const [selectionCoords, setSelectionCoords] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [actionVisible, setActionVisible] = useState(false);
  useEffect(() => {
    if (!editView.current) {
      const state = EditorState.create({
        schema: extendedSchema,
        doc: PMNode.fromJSON(schema, props.node.content),
        plugins: [
          history(),
          keymap({
            Enter() {
              props.onAddNode(props.node);
              return true;
            },
            Tab() {
              if (editView.current) {
                const selection = editView.current.state.selection;
                props.onTabNode(props.node, selection.toJSON());
              }
              return true;
            },
          }),
          keymap(baseKeymap),
        ],
      });

      editView.current = new EditorView(ref.current!, {
        state,
        dispatchTransaction(tr) {
          const newState = editView.current!.state.apply(tr);
          editView.current!.updateState(newState);
          props.node.content = newState.doc.toJSON();

          const { from, to } = newState.selection;
          if (from !== to) {
            const start = editView.current!.coordsAtPos(from);
            const end = editView.current!.coordsAtPos(to);
            console.log(start, end , 'ssssss')
            setSelectionCoords({
              top: Math.min(start.top, end.top) - 60,
              left: (start.left + end.left) / 2,
            });
          } else {
            setSelectionCoords(null);
          }
        },
        handleDOMEvents: {
          focus() {
            props.onFocuse(props.node);

            setActionVisible(false);
            return false;
          },
        },
      });

      if (props.focuseId === props.node.id) {
        if (props.node.selection && editView.current) {
          const state = editView.current.state;
          const selection = TextSelection.fromJSON(
            state.doc,
            props.node.selection
          );
          const newState = state.apply(state.tr.setSelection(selection));
          editView.current.updateState(newState);
        }
        editView.current.focus();
      }
    }
  }, []);

  const handleFormat = (type: FormatType, payload?: string) => {
    console.log(type, editView, )
    if (!editView.current) return;
    const view = editView.current;
    const markType = extendedSchema.marks[type];
    if (!markType) return;
    console.log(type, payload, 'ssss');
    if (type === "link" && payload) {
      const { from, to } = view.state.selection;
      const tr = view.state.tr;
      tr.addMark(from, to, markType.create({ href: payload }));
      view.dispatch(tr);
      view.focus();
    } else if (type === "color") {
      const markType = extendedSchema.marks.color;
      if (markType && editView.current) {
        const { state } = editView.current;
        const { empty } = state.selection;
        console.log(empty, state.selection);
        if (!empty) {
          toggleMark(markType, { color: payload })(
            state,
            editView.current.dispatch
          );
          editView.current.focus();
        } else {
          // 可选：处理 collapsed selection（比如下次输入生效）
          console.warn("空选择，颜色 mark 未应用");
        }
      }
    } else if (type !== "link") {
      toggleMark(markType)(view.state, view.dispatch);
      view.focus();
    }
  };

  const onActionClick = (id: ActionType) => {
    switch (id) {
      case "delete":
        props.onDeleteNode(props.node);
        break;
    }
  };
  return (
    <div className="NoteNode">
      <div className="NoteNode-block">
        <div className="NoteNode-replace">
          {props.focuseId === props.node.id && (
            <List
              onClick={() => setActionVisible(true)}
              size={12}
              cursor={"pointer"}
            />
          )}

          {props.focuseId === props.node.id && actionVisible && (
            <NodeActionsBar onClick={onActionClick} actions={[]} />
          )}
        </div>
        <div className="NoteNode-icon"></div>
        <div ref={ref} className="NoteNode-content"></div>
        {selectionCoords && props.focuseId === props.node.id && (
          <FloatingToolbar
            top={selectionCoords.top}
            left={selectionCoords.left}
            onFormat={handleFormat}
          />
        )}
      </div>
      <div
        className="indent"
        style={{
          paddingLeft: `16px`,
        }}
      >
        {props.node.children.map((item) => (
          <NoteNode
            key={item.id}
            focuseId={props.focuseId}
            onAddNode={props.onAddNode}
            onTabNode={props.onTabNode}
            onFocuse={props.onFocuse}
            onDeleteNode={props.onDeleteNode}
            node={item}
          />
        ))}
      </div>
    </div>
  );
}

export default NoteNode;
