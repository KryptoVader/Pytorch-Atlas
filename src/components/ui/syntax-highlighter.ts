import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import { nightOwl } from "react-syntax-highlighter/dist/esm/styles/prism";

SyntaxHighlighter.registerLanguage("python", python);
SyntaxHighlighter.registerLanguage("bash", bash);

export const darkTheme = nightOwl;
export const lightTheme = {
  ...nightOwl,
  'pre[class*="language-"]': {
    ...nightOwl['pre[class*="language-"]'],
    background: "transparent",
  },
  'code[class*="language-"]': {
    ...nightOwl['code[class*="language-"]'],
    color: "#dce5ef",
  },
  comment: { color: "#91a0b1", fontStyle: "italic" as const },
};

export default SyntaxHighlighter;