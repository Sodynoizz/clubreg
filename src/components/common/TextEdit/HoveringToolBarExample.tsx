import React, { useMemo, useRef, useEffect } from "react"
import { Slate, Editable, withReact, useSlate, useFocused, ReactEditor } from "slate-react"
import { Editor, Transforms, Text, createEditor, Descendant, Range } from "slate"
import { css } from "@emotion/css"
import { withHistory } from "slate-history"

import { Icon, Button, Menu, Portal } from "./Items/Components"

const HoveringMenuExample = () => {
  const editor = useMemo(() => withHistory(withReact(createEditor() as ReactEditor)), [])

  return (
    <div className="w-[500px] rounded-md border border-gray-300 px-4 py-6">
      <Slate editor={editor} value={initialValue}>
        <HoveringToolbar />
        <Editable
          renderLeaf={(props) => <Leaf {...props} />}
          placeholder="Enter some text..."
          // onDOMBeforeInput={(event: InputEvent) => {
          //   event.preventDefault()
          //   switch (event.inputType) {
          //     case "formatBold":
          //       return toggleFormat(editor, "bold")
          //     case "formatItalic":
          //       return toggleFormat(editor, "italic")
          //     case "formatUnderline":
          //       return toggleFormat(editor, "underlined")
          //   }
          // }}
        />
      </Slate>
    </div>
  )
}

const toggleFormat = (editor, format) => {
  const isActive = isFormatActive(editor, format)
  Transforms.setNodes(editor, { [format]: isActive ? null : true }, { match: Text.isText, split: true })
}

const isFormatActive = (editor, format) => {
  //@ts-ignore
  const [match] = Editor.nodes(editor, {
    match: (n) => n[format] === true,
    mode: "all",
  })
  return !!match
}

const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>
  }

  if (leaf.italic) {
    children = <em>{children}</em>
  }

  if (leaf.underlined) {
    children = <u>{children}</u>
  }

  return <span {...attributes}>{children}</span>
}

const HoveringToolbar = () => {
  const ref = useRef<HTMLDivElement | null>()
  const editor = useSlate()
  const inFocus = useFocused()

  useEffect(() => {
    const el = ref.current
    const { selection } = editor

    if (!el) {
      return
    }

    if (!selection || !inFocus || Range.isCollapsed(selection) || Editor.string(editor, selection) === "") {
      el.removeAttribute("style")
      return
    }

    const domSelection = window.getSelection()
    const domRange = domSelection.getRangeAt(0)
    const rect = domRange.getBoundingClientRect()
    el.style.opacity = "1"
    el.style.top = `${rect.top + window.pageYOffset - el.offsetHeight}px`
    el.style.left = `${rect.left + window.pageXOffset - el.offsetWidth / 2 + rect.width / 2}px`
  })

  return (
    <Portal>
      <Menu
        ref={ref}
        className={css`
          display: flex;
          padding: 10px 20px;
          position: absolute;
          z-index: 1;
          top: -10000px;
          left: -10000px;
          margin-top: -6px;
          opacity: 0;
          background-color: #222;
          border-radius: 40px;
          transition: opacity 0.75s;
        `}
        onMouseDown={(e) => {
          // prevent toolbar from taking focus away from editor
          e.preventDefault()
        }}
      >
        <FormatButton format="bold" icon="format_bold" />
        <FormatButton format="italic" icon="format_italic" />
        <FormatButton format="underlined" icon="format_underlined" />
      </Menu>
    </Portal>
  )
}

const FormatButton = ({ format, icon }) => {
  const editor = useSlate()
  return (
    <Button id={icon} reversed active={isFormatActive(editor, format)} onClick={() => toggleFormat(editor, format)}>
      <Icon reversed active={isFormatActive(editor, format)}>
        {icon}
      </Icon>
    </Button>
  )
}

const initialValue: any[] = [
  {
    type: "paragraph",
    children: [
      {
        text: "This example shows how you can make a hovering menu appear above your content, which you can use to make text ",
      },
      { text: "bold", bold: true },
      { text: ", " },
      { text: "italic", italic: true },
      { text: ", or anything else you might want to do!" },
    ],
  },
  {
    type: "paragraph",
    children: [
      { text: "Try it out yourself! Just " },
      { text: "select any piece of text and the menu will appear", bold: true },
      { text: "." },
    ],
  },
]

export default HoveringMenuExample