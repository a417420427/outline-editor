import { Schema, type MarkSpec } from "prosemirror-model";
import { marks, nodes } from "prosemirror-schema-basic";

const colorMark: MarkSpec = {
  attrs: { color: {} },
  parseDOM: [
    {
      style: "color",
      getAttrs: (value: string) => ({ color: value }),
    },
  ],
  toDOM(mark) {
    return ["span", { style: `color: ${mark.attrs.color}` }, 0];
  },
};


export const extendedSchema = new Schema({
  nodes: nodes,
  marks: {
    ...marks,
    color: colorMark
  },
});
