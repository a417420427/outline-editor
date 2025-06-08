// useProseMirrorEditor.ts
import { useEffect, useRef, useState } from "react";
import { EditorView } from "prosemirror-view";
import { EditorState, TextSelection } from "prosemirror-state";
import { history, undo, redo, undoDepth, redoDepth } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import { baseKeymap } from "prosemirror-commands";

import { extendedSchema } from "../../schema/extendedSchema";
import { useOutlineStore } from "../../store";

export function useProseMirrorEditor({
  docJSON,
  nodeId,
}: {
  docJSON: string;
  nodeId: string;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);

  const viewRef = useRef<EditorView | null>(null);
  const [selectionCoords, setSelectionCoords] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const setEditView = useOutlineStore((state) => state.setEditorView);
  const onSplitNode = useOutlineStore((state) => state.onSplitNode);
  const focusOffset = useOutlineStore((state) => state.focusOffset);

  const undoTree = useOutlineStore((state) => state.undoTree);
  const redoTree = useOutlineStore((state) => state.redoTree);
  const tabNode = useOutlineStore((state) => state.tabNode);
  const onTransaction = useOutlineStore((state) => state.onTransaction);

  useEffect(() => {
    if (mountedRef.current) return;

    if (editorRef.current) {
      const state = EditorState.create({
        schema: extendedSchema,
        doc: extendedSchema.nodeFromJSON(docJSON),
        selection: TextSelection.create(
          extendedSchema.nodeFromJSON(docJSON),
          focusOffset,
          focusOffset
        ),
        plugins: [
          history(),

          keymap({
            Enter: () => {
              onSplitNode(nodeId, viewRef.current!);
              return true;
            },
            Tab: () => {
              tabNode(nodeId, viewRef.current!);
              return true;
            },
            "Mod-z": () => {
              const view = viewRef.current;
              if (!view || !view.hasFocus()) return false;
              if (undoDepth(view.state) <= 0) {
                undoTree();
                return true;
              }
              undo(view.state, view.dispatch);
              return true;
            },
            "Mod-y": () => {
              const view = viewRef.current;
              if (!view || !view.hasFocus()) return false;
              if (redoDepth(view.state) <= 0) {
                redoTree();
                return true;
              }
              redo(view.state, view.dispatch);
              return true;
            },
          }),
          keymap(baseKeymap),
        ],
      });

      viewRef.current = new EditorView(editorRef.current, {
        state,
        dispatchTransaction(tr) {
          const newState = viewRef.current!.state.apply(tr);
          viewRef.current!.updateState(newState);
          onTransaction(newState.doc, newState.selection);

          // 计算选区位置，更新浮动工具栏坐标
          const { from, to } = newState.selection;
          if (from !== to) {
            const start = viewRef.current!.coordsAtPos(from);
            const end = viewRef.current!.coordsAtPos(to);
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
            // setFocusId(nodeId);
            // onFocus();
            return false;
          },
        },
      });

      viewRef.current.focus();
      setEditView(viewRef.current);
      return () => {
        viewRef.current?.destroy();
        viewRef.current = null;
        mountedRef.current = false;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    editorRef,
    selectionCoords,
    view: viewRef.current,
  };
}
