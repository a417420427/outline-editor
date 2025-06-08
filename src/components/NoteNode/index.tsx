import { useEffect, useRef, useState } from "react";
import { EditorState, TextSelection } from "prosemirror-state";
import { EditorView } from "prosemirror-view";

import { history } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import { baseKeymap, toggleMark } from "prosemirror-commands";

import { DOMSerializer, Node as PMNode } from "prosemirror-model";
import FloatingToolbar from "./FloatingToolbar";
import "prosemirror-view/style/prosemirror.css";
import "./index.scss";
import { List } from "lucide-react";
import NodeActionsBar from "./NodeActionsBar";
import { extendedSchema } from "../../schema/extendedSchema";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderContentToHTML(content: any): string {
  const node = PMNode.fromJSON(extendedSchema, content);
  const fragment = DOMSerializer.fromSchema(extendedSchema).serializeFragment(
    node.content
  );

  const div = document.createElement("div");
  div.appendChild(fragment);

  return div.innerHTML;
}


function NoteNode(props: NoteNodeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const lastClickPos = useRef<{ node: Node; offset: number } | null>(null);

  const editView = useRef<EditorView | null>(null);
  const [selectionCoords, setSelectionCoords] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [actionVisible, setActionVisible] = useState(false);

  const onNodeFocuse = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      lastClickPos.current = {
        node: range.startContainer,
        offset: range.startOffset,
      };
    }
    console.log(lastClickPos.current, selection)
    props.onFocuse(props.node, editView.current!, lastClickPos.current?.offset);
  };
  const destroyEditor = () => {
    if (editView.current) {
      editView.current.destroy();
      editView.current = null;
    }
  };

  // 创建 EditorView
  const createEditor = (lastClick: { node: Node; offset: number } | null) => {
    if (ref.current && props.focuseId === props.node.id) {
      const state = EditorState.create({
        schema: extendedSchema,
        doc: PMNode.fromJSON(extendedSchema, props.node.content),
        plugins: [
          history(),
          keymap({
            Enter: () => {
              props.onAddNode(props.node, editView.current!);
              return true;
            },
            Tab: () => {
              if (editView.current) {
                props.onTabNode(
                  props.node,
                  editView.current
                );
              }
              return true;
            },
          }),
          keymap(baseKeymap),
        ],
      });

      editView.current = new EditorView(ref.current, {
        state,
        dispatchTransaction(tr) {
          const newState = editView.current!.state.apply(tr);
          editView.current!.updateState(newState);
          props.node.content = newState.doc.toJSON();

          const { from, to } = newState.selection;
          if (from !== to) {
            const start = editView.current!.coordsAtPos(from);
            const end = editView.current!.coordsAtPos(to);
            setSelectionCoords({
              top: Math.min(start.top, end.top) - 40,
              left: (start.left + end.left) / 2,
            });
          } else {
            setSelectionCoords(null);
          }
        },
        handleDOMEvents: {
          focus() {
            props.onFocuse(props.node, editView.current!);
            return false;
          },
        },
      });

      // focus + restore selection if exists
      if (props.node.selection) {
        const selection = TextSelection.fromJSON(
          editView.current.state.doc,
          props.node.selection
        );
        editView.current.updateState(
          editView.current.state.apply(
            editView.current.state.tr.setSelection(selection)
          )
        );
      }

      try {
        if (lastClick) {
          console.log(lastClick, 'ffff')
          const { offset } = lastClick;
          const pos = editView.current.posAtDOM(editView.current.dom, offset);
          const sel = TextSelection.create(editView.current.state.doc, pos);
          const tr = editView.current.state.tr.setSelection(sel);
          editView.current.dispatch(tr);
        }
      } catch (e) {
        console.warn("无法定位点击位置，可能点击在非内容区", e);
      }
      lastClickPos.current = null;

      editView.current.focus();
    }
  };

  useEffect(() => {
    destroyEditor();
    const timeout = setTimeout(() => {
      console.log(lastClickPos.current, 'lastClickPos')
      createEditor(lastClickPos.current);
    }, 0); // next tick

    return () => {
      clearTimeout(timeout);
      destroyEditor();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.focuseId]);

  const handleFormat = (type: FormatType, payload?: string) => {
    if (!editView.current) return;
    const view = editView.current;
    const markType = extendedSchema.marks[type];
    if (!markType) return;
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
        props.onDeleteNode(props.node, editView.current!);
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
        {props.focuseId === props.node.id ? (
          <div ref={ref} className="NoteNode-content"></div>
        ) : (
          <div
            className="NoteNode-readonly"
            contentEditable
            onClick={() => onNodeFocuse()}
            dangerouslySetInnerHTML={{
              __html: renderContentToHTML(props.node.content),
            }}
          />
        )}
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
