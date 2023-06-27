"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { useState, useEffect, useTransition } from 'react'
import { TipTapEditorExtensions } from "./extension";
import { TipTapEditorProps } from "./props";
import { useRouter } from "next/navigation";
import { PatchDocType } from "@/app/api/documents/[publicId]/route";
import { useDebouncedCallback } from "use-debounce";


interface EditorProps {
  document: PatchDocType;
  publicId: string;
}

interface SavingStatus {
  status: "Saved" | "Waiting to save" | "Saving";
}
export default function Editor({
  document,
  publicId
}: EditorProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [saveStatus, setSaveStatus] = useState<SavingStatus['status']>("Saved")
  const [hydrated, setHydrated] = useState(false)
  const [content, setContent] = useState<PatchDocType["document"]>('')

  async function patchRequest(publicId: string, title: string, document: any) {
    const res = await fetch(`/api/documents/${publicId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title,
        document
      })
    })
    if (!res.ok) {
      setSaveStatus("Waiting to save")
      throw new Error("Failed to update document")
    }

    setSaveStatus("Saved")
    startTransition(() => {
      router.refresh()
    })
  }

  const debouncedUpdates = useDebouncedCallback(async ({ editor }) => {
    const json = editor.getJSON()
    setContent(json)
    await patchRequest(publicId, document.title, json)

    setTimeout(() => {
      setSaveStatus("Saved")
    }, 500)
  }, 1000)
  const editor = useEditor({
    extensions: [...TipTapEditorExtensions],
    content: content,
    editorProps: TipTapEditorProps,
    onUpdate: ({ editor }) => {
      setSaveStatus("Saving")
      debouncedUpdates({ editor })
    },
  });

  useEffect(() => {
    if (editor && document && !hydrated) {
      editor.commands.setContent(document.document)
      setHydrated(true)
    }
  }, [editor, document, hydrated])

  return (
    <div
      onClick={() => {
        editor?.chain().focus().run();
      }}
      className="relative flex min-h-screen w-full cursor-text flex-col items-center p-32"
    >
      <p className="absolute left-8 top-8 rounded-lg bg-gray-100 px-2 py-1 text-sm text-gray-400">
        {saveStatus}
      </p>
      <div className="relative w-full max-w-screen-lg">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
