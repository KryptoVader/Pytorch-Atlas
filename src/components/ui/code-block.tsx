import {
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Check, Copy, FileCode2, FileText } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

export interface CodeFile {
  title: string;
  code: string;
  language?: string;
}

interface CodeBlockProps {
  files: CodeFile[];
  defaultTitle?: string;
  className?: string;
}

const LazySyntaxHighlighter = lazy(async () => {
  const mod = await import("./syntax-highlighter");
  const Highlighter = mod.default;
  return {
    default: function HighlightingRenderer({
      language,
      source,
      isLight,
    }: {
      language: string;
      source: string;
      isLight: boolean;
    }) {
      const theme = isLight ? mod.lightTheme : mod.darkTheme;
      return (
        <Highlighter
          language={language}
          style={theme}
          showLineNumbers={source.split("\n").length > 5}
          lineNumberStyle={{
            color: "#657386",
            minWidth: "2.6em",
            paddingRight: "1em",
            userSelect: "none",
          }}
          customStyle={{
            margin: 0,
            padding: "18px 18px 20px",
            background: "transparent",
            fontSize: "12.5px",
            lineHeight: "1.8",
            overflow: "visible",
          }}
          codeTagProps={{
            style: { fontFamily: "var(--mono)" },
          }}
          wrapLongLines={false}
        >
          {source}
        </Highlighter>
      );
    },
  };
});

function inferLanguage(file: CodeFile) {
  if (file.language) return file.language;
  const ext = file.title.split('.').pop()?.toLowerCase();
  const map: Record<string, string> = { py: 'python', js: 'javascript', jsx: 'jsx', ts: 'typescript', tsx: 'tsx', css: 'css', json: 'json', sh: 'bash', bash: 'bash', yml: 'yaml', yaml: 'yaml' };
  return map[ext ?? ''] ?? 'python';
}

export function CodeBlock({
  files,
  defaultTitle,
  className,
}: CodeBlockProps) {
  const [activeTitle, setActiveTitle] = useState(
    defaultTitle ?? files[0]?.title ?? "example.py"
  );
  const [copied, setCopied] = useState(false);
  const [shouldHighlight, setShouldHighlight] = useState(false);

  const bodyRef = useRef<HTMLDivElement>(null);

  const activeFile =
    files.find((file) => file.title === activeTitle) ?? files[0];

  const language = activeFile ? inferLanguage(activeFile) : "python";

  const isLight =
    typeof document !== "undefined" &&
    document.documentElement.dataset.theme === "light";

  const tabs = useMemo(() => files.length > 1, [files.length]);
  const source = activeFile?.code.replace(/\n$/, "") ?? "";

  // Begin loading the highlighter shortly before the code enters view.
  useEffect(() => {
    if (shouldHighlight) return;

    const element = bodyRef.current;
    if (!element) return;

    if (typeof IntersectionObserver === "undefined") {
      setShouldHighlight(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldHighlight(true);
          observer.disconnect();
        }
      },
      { rootMargin: "240px 0px" }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [activeFile?.title, shouldHighlight]);

  const copyToClipboard = async () => {
    if (!activeFile) return;

    try {
      await navigator.clipboard.writeText(activeFile.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      const area = document.createElement("textarea");
      area.value = activeFile.code;
      area.style.position = "fixed";
      area.style.opacity = "0";

      document.body.appendChild(area);
      area.select();

      const success = document.execCommand("copy");
      area.remove();

      setCopied(success);
      window.setTimeout(() => setCopied(false), 1500);
    }
  };

  if (!activeFile) return null;

  const codeFallback = (
    <pre
      className={cn(
        "code-block-loading",
        isLight && "light"
      )}
    >
      {source}
    </pre>
  );

  return (
    <div className={cn("code-block-shell", className)}>
      <div className="code-block-toolbar">
        <div
          className="code-block-tabs"
          role="tablist"
          aria-label="Code examples"
        >
          {tabs ? (
            files.map((file) => (
              <button
                key={file.title}
                type="button"
                role="tab"
                aria-selected={file.title === activeTitle}
                className={cn(
                  "code-block-tab",
                  file.title === activeTitle && "active"
                )}
                onClick={() => {
                  setActiveTitle(file.title);
                  setCopied(false);
                }}
              >
                <FileText size={13} />
                <span>{file.title}</span>
              </button>
            ))
          ) : (
            <span className="code-block-file">
              <FileCode2 size={14} />
              {activeFile.title}
            </span>
          )}
        </div>

        <div className="code-block-actions">
          <span className="code-block-language">{language}</span>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className="code-copy-action"
            aria-label={copied ? "Code copied" : "Copy code"}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </Button>
        </div>
      </div>

      <div className="code-block-body" ref={bodyRef}>
        {!shouldHighlight ? (
          codeFallback
        ) : (
          <Suspense fallback={codeFallback}>
            <LazySyntaxHighlighter
              language={language}
              source={source}
              isLight={isLight}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}

export default CodeBlock;