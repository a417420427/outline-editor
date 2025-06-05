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



function NoteNode(props: NoteNodeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const editView = useRef<EditorView | null>(null);
  const [selectionCoords, setSelectionCoords] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!editView.current) {
      const state = EditorState.create({
        schema,
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
            setSelectionCoords({
              top: Math.min(start.top, end.top) - 40,
              left: (start.left + end.left) / 2,
            });
          } else {
            setSelectionCoords(null);
          }
        },
      });

      if (props.focuseId === props.node.id) {
        if (props.node.selection && editView.current) {
          const state = editView.current.state;
          const selection = TextSelection.fromJSON(state.doc, props.node.selection);
          const newState = state.apply(state.tr.setSelection(selection));
          editView.current.updateState(newState);
        }
        editView.current.focus();
      }
    }
  }, []);

  
  const handleFormat = (type: FormatType, url?: string) => {
    if (!editView.current) return;
    const view = editView.current;
    const markType = schema.marks[type];
    if (!markType) return;

    if (type === "link" && url) {
      // Apply link mark with href attribute
      const { from, to } = view.state.selection;
      const tr = view.state.tr;
      tr.addMark(from, to, markType.create({ href: url }));
      view.dispatch(tr);
      view.focus();
    } else if (type !== "link") {
      // Toggle other marks (strong, em, code)
      toggleMark(markType)(view.state, view.dispatch);
      view.focus();
    }
  };

  return (
    <div className="NoteNode">
      <div className="NoteNode-block">
        <div className="NoteNode-icon"></div>
        <div ref={ref} className="NoteNode-content"></div>
        {selectionCoords && (
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
            node={item}
          />
        ))}
      </div>
    </div>
  );
}

export default NoteNode;
