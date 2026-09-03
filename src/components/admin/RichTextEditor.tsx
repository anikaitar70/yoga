"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { inputClassName } from "@/lib/constants";
import { cn } from "@/lib/utils";

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  /** Minimum editor height in pixels (default 112). */
  minHeight?: number;
};

const ALIGN_COMMANDS = [
  { command: "justifyLeft", label: "L", title: "Align left" },
  { command: "justifyCenter", label: "C", title: "Align center" },
  { command: "justifyRight", label: "R", title: "Align right" },
  { command: "justifyFull", label: "J", title: "Justify" },
] as const;

type ActiveStates = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  ul: boolean;
  ol: boolean;
  justifyLeft: boolean;
  justifyCenter: boolean;
  justifyRight: boolean;
  justifyFull: boolean;
};

const EMPTY_ACTIVE: ActiveStates = {
  bold: false,
  italic: false,
  underline: false,
  ul: false,
  ol: false,
  justifyLeft: false,
  justifyCenter: false,
  justifyRight: false,
  justifyFull: false,
};

function queryActiveState(): ActiveStates {
  if (typeof document === "undefined") return EMPTY_ACTIVE;
  const state = (command: string) => {
    try {
      return document.queryCommandState(command);
    } catch {
      return false;
    }
  };
  return {
    bold: state("bold"),
    italic: state("italic"),
    underline: state("underline"),
    ul: state("insertUnorderedList"),
    ol: state("insertOrderedList"),
    justifyLeft: state("justifyLeft"),
    justifyCenter: state("justifyCenter"),
    justifyRight: state("justifyRight"),
    justifyFull: state("justifyFull"),
  };
}

/**
 * Lightweight WYSIWYG editor for CMS rich-text fields.
 * Toolbar: bold / italic / underline / highlight / lists / alignment.
 * Emits limited HTML — sanitized again server-side on save and render.
 */
export function RichTextEditor({
  value,
  onChange,
  label,
  placeholder,
  className,
  minHeight = 112,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const lastEmittedRef = useRef<string>("");
  const [active, setActive] = useState<ActiveStates>(EMPTY_ACTIVE);

  const emit = useCallback(() => {
    const next = editorRef.current?.innerHTML ?? "";
    if (next !== lastEmittedRef.current) {
      lastEmittedRef.current = next;
      onChange(next);
    }
  }, [onChange]);

  // Seed initial content once; re-sync only when the external value changes
  // outside the editor (avoids caret jumps on parent re-renders).
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (value !== lastEmittedRef.current && value !== el.innerHTML) {
      el.innerHTML = value ?? "";
      lastEmittedRef.current = value ?? "";
    }
  }, [value]);

  const rememberSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    if (editorRef.current?.contains(range.commonAncestorContainer)) {
      savedRangeRef.current = range.cloneRange();
    }
  }, []);

  useEffect(() => {
    const onSelectionChange = () => {
      rememberSelection();
      const selection = window.getSelection();
      if (selection && editorRef.current?.contains(selection.anchorNode)) {
        setActive(queryActiveState());
      }
    };
    document.addEventListener("selectionchange", onSelectionChange);
    return () => document.removeEventListener("selectionchange", onSelectionChange);
  }, [rememberSelection]);

  const applyCommand = useCallback(
    (command: string, commandValue?: string, useCss = false) => {
      const el = editorRef.current;
      if (!el) return;
      el.focus();
      const selection = window.getSelection();
      if (savedRangeRef.current && selection) {
        selection.removeAllRanges();
        selection.addRange(savedRangeRef.current);
      }
      try {
        document.execCommand("styleWithCSS", false, useCss ? "true" : "false");
        document.execCommand(command, false, commandValue);
        document.execCommand("styleWithCSS", false, "false");
      } catch {
        // Browser refused the command — ignore.
      }
      setActive(queryActiveState());
      emit();
    },
    [emit],
  );

  const handlePaste = useCallback(
    (event: React.ClipboardEvent<HTMLDivElement>) => {
      event.preventDefault();
      const text = event.clipboardData.getData("text/plain");
      if (!text) return;
      try {
        document.execCommand("insertText", false, text);
      } catch {
        // Fallback: insert at end.
        editorRef.current?.append(document.createTextNode(text));
      }
      emit();
    },
    [emit],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const meta = event.metaKey || event.ctrlKey;
      if (!meta) return;
      const key = event.key.toLowerCase();
      if (key === "b") {
        event.preventDefault();
        applyCommand("bold");
      } else if (key === "i") {
        event.preventDefault();
        applyCommand("italic");
      } else if (key === "u") {
        event.preventDefault();
        applyCommand("underline");
      }
    },
    [applyCommand],
  );

  return (
    <div className={className}>
      {label ? (
        <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">
          {label}
        </span>
      ) : null}
      <div className="overflow-hidden rounded-md border border-border bg-card">
        <div className="flex flex-wrap items-center gap-1 border-b border-border bg-surface-warm/40 px-2 py-1.5">
          <button
            type="button"
            title="Bold"
            aria-label="Bold"
            data-active={active.bold}
            className="rich-text-editor-toolbar-button font-bold"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => applyCommand("bold")}
          >
            B
          </button>
          <button
            type="button"
            title="Italic"
            aria-label="Italic"
            data-active={active.italic}
            className="rich-text-editor-toolbar-button italic"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => applyCommand("italic")}
          >
            I
          </button>
          <button
            type="button"
            title="Underline"
            aria-label="Underline"
            data-active={active.underline}
            className="rich-text-editor-toolbar-button underline"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => applyCommand("underline")}
          >
            U
          </button>

          <label
            title="Text color"
            aria-label="Text color"
            data-active={false}
            className="rich-text-editor-toolbar-button cursor-pointer"
          >
            <span aria-hidden className="mr-1 text-[10px]">A</span>
            <input
              type="color"
              className="h-4 w-4 cursor-pointer border-0 bg-transparent p-0"
              onChange={(event) => applyCommand("foreColor", event.target.value, true)}
              onMouseDown={() => {
                rememberSelection();
              }}
              defaultValue="#2a241f"
            />
          </label>
          <label
            title="Highlight color"
            aria-label="Highlight color"
            data-active={false}
            className="rich-text-editor-toolbar-button cursor-pointer"
          >
            <span aria-hidden className="mr-1">◍</span>
            <input
              type="color"
              className="h-4 w-4 cursor-pointer border-0 bg-transparent p-0"
              onChange={(event) => applyCommand("hiliteColor", event.target.value, true)}
              onMouseDown={() => {
                // Keep the current text selection usable when picking a color.
                rememberSelection();
              }}
              defaultValue="#f5d76e"
            />
          </label>

          <span className="mx-1 h-5 w-px bg-border" aria-hidden />

          <button
            type="button"
            title="Bullet list"
            aria-label="Bullet list"
            data-active={active.ul}
            className="rich-text-editor-toolbar-button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => applyCommand("insertUnorderedList")}
          >
            • ≡
          </button>
          <button
            type="button"
            title="Numbered list"
            aria-label="Numbered list"
            data-active={active.ol}
            className="rich-text-editor-toolbar-button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => applyCommand("insertOrderedList")}
          >
            1. ≡
          </button>

          <span className="mx-1 h-5 w-px bg-border" aria-hidden />

          {ALIGN_COMMANDS.map(({ command, label: alignLabel, title }) => (
            <button
              key={command}
              type="button"
              title={title}
              aria-label={title}
              data-active={active[command]}
              className="rich-text-editor-toolbar-button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => applyCommand(command)}
            >
              {alignLabel}
            </button>
          ))}

          <span className="mx-1 h-5 w-px bg-border" aria-hidden />

          <button
            type="button"
            title="Clear formatting"
            aria-label="Clear formatting"
            className="rich-text-editor-toolbar-button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => applyCommand("removeFormat")}
          >
            ⌫ᶠ
          </button>
        </div>
        <div
          ref={editorRef}
          role="textbox"
          aria-multiline="true"
          tabIndex={0}
          contentEditable
          suppressContentEditableWarning
          data-placeholder={placeholder}
          className={cn(inputClassName, "rich-text rich-text-editor-surface border-0 focus:ring-0")}
          style={{ minHeight: `${minHeight}px` }}
          onInput={emit}
          onBlur={() => {
            rememberSelection();
            emit();
          }}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          onMouseUp={rememberSelection}
          onKeyUp={rememberSelection}
        />
      </div>
    </div>
  );
}
