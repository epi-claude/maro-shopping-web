"use client"

import { useState } from "react"
import { Text } from "@medusajs/ui"
import { CheckCircleSolid, SquareTwoStack } from "@medusajs/icons"

type CopyFieldProps = {
  label: string
  value: string
  monospace?: boolean
}

const CopyField = ({ label, value, monospace }: CopyFieldProps) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard unavailable — user can still select the text manually
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex items-center justify-between w-full gap-x-3 rounded-lg border border-ui-border-base bg-ui-bg-subtle px-4 py-3 text-left active:bg-ui-bg-subtle-hover"
      data-testid={`copy-field-${label.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <span className="flex flex-col min-w-0">
        <Text className="txt-small text-ui-fg-subtle">{label}</Text>
        <Text
          className={`txt-medium-plus text-ui-fg-base break-all ${
            monospace ? "font-mono" : ""
          }`}
        >
          {value}
        </Text>
      </span>
      <span className="shrink-0 flex items-center gap-x-1 text-ui-fg-interactive">
        {copied ? (
          <>
            <CheckCircleSolid />
            <Text className="txt-small">Copied</Text>
          </>
        ) : (
          <>
            <SquareTwoStack />
            <Text className="txt-small">Copy</Text>
          </>
        )}
      </span>
    </button>
  )
}

export default CopyField
