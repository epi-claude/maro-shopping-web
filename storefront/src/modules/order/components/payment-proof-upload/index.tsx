"use client"

import { useRef, useState } from "react"
import { Text } from "@medusajs/ui"
import { CheckCircleSolid } from "@medusajs/icons"
import Spinner from "@modules/common/icons/spinner"

const MEDUSA_BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

// Keep in sync with the multer config in backend/src/api/middlewares.ts
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]
const ACCEPTED_FORMATS_LABEL = "JPEG, PNG, WEBP, or HEIC"

type PaymentProofUploadProps = {
  orderId: string
  initialStatus?: string
}

const PaymentProofUpload = ({
  orderId,
  initialStatus,
}: PaymentProofUploadProps) => {
  const [status, setStatus] = useState<"idle" | "uploading" | "uploaded">(
    initialStatus === "pending_review" ? "uploaded" : "idle"
  )
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) {
      return
    }

    setError(null)

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setError(
        `That file type isn't supported. Please upload a ${ACCEPTED_FORMATS_LABEL} image.`
      )
      if (inputRef.current) {
        inputRef.current.value = ""
      }
      return
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError("That image is too large. Please upload a file under 8MB.")
      if (inputRef.current) {
        inputRef.current.value = ""
      }
      return
    }

    setStatus("uploading")

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch(
        `${MEDUSA_BACKEND_URL}/store/orders/${orderId}/payment-proof`,
        {
          method: "POST",
          headers: {
            "x-publishable-api-key":
              process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
          },
          body: formData,
        }
      )

      if (!res.ok) {
        throw new Error("Upload failed")
      }

      setStatus("uploaded")
    } catch {
      setStatus("idle")
      setError(
        "We couldn't upload that screenshot. Check your connection and try again."
      )
    } finally {
      if (inputRef.current) {
        inputRef.current.value = ""
      }
    }
  }

  if (status === "uploaded") {
    return (
      <div className="flex items-center gap-x-2 mt-4 rounded-lg border border-ui-border-base bg-ui-bg-subtle px-4 py-3">
        <CheckCircleSolid className="text-ui-fg-interactive shrink-0" />
        <div className="flex flex-col">
          <Text className="txt-medium-plus text-ui-fg-base">
            Screenshot received
          </Text>
          <Text className="txt-small text-ui-fg-subtle">
            We'll confirm your payment shortly.{" "}
            <button
              type="button"
              className="underline"
              onClick={() => setStatus("idle")}
            >
              Upload a different one
            </button>
          </Text>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-y-2 mt-4">
      <label
        htmlFor="payment-proof-upload"
        className="flex items-center justify-center gap-x-2 w-full rounded-lg border border-dashed border-ui-border-interactive bg-ui-bg-subtle px-4 py-4 text-center cursor-pointer active:bg-ui-bg-subtle-hover"
      >
        {status === "uploading" ? (
          <>
            <Spinner />
            <Text className="txt-medium-plus text-ui-fg-interactive">
              Uploading…
            </Text>
          </>
        ) : (
          <Text className="txt-medium-plus text-ui-fg-interactive">
            Paid already? Upload your payment screenshot
          </Text>
        )}
      </label>
      <input
        ref={inputRef}
        id="payment-proof-upload"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        capture="environment"
        className="hidden"
        disabled={status === "uploading"}
        onChange={handleFileChange}
        data-testid="payment-proof-input"
      />
      <Text className="txt-small text-ui-fg-subtle text-center">
        {ACCEPTED_FORMATS_LABEL} — up to 8MB
      </Text>
      {error && (
        <Text className="txt-small text-ui-fg-error">{error}</Text>
      )}
    </div>
  )
}

export default PaymentProofUpload
