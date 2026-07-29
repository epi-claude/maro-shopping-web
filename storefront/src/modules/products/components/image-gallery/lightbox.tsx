"use client"

import { Dialog, Transition } from "@headlessui/react"
import { ChevronLeft, ChevronRight, X } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import { Fragment, useEffect, useState } from "react"

type LightboxProps = {
  images: HttpTypes.StoreProductImage[]
  initialIndex: number
  isOpen: boolean
  close: () => void
}

const Lightbox = ({ images, initialIndex, isOpen, close }: LightboxProps) => {
  const [index, setIndex] = useState(initialIndex)

  useEffect(() => {
    if (isOpen) {
      setIndex(initialIndex)
    }
  }, [isOpen, initialIndex])

  const goPrev = () => setIndex((i) => (i - 1 + images.length) % images.length)
  const goNext = () => setIndex((i) => (i + 1) % images.length)

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
      if (e.key === "ArrowLeft") goPrev()
      if (e.key === "ArrowRight") goNext()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, images.length])

  const active = images[index]

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[75]" onClose={close}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/90" />
        </Transition.Child>

        <div className="fixed inset-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="relative w-full h-full flex items-center justify-center">
              <button
                onClick={close}
                className="absolute top-4 right-4 z-10 text-white/80 hover:text-white p-2"
                aria-label="Close"
                data-testid="lightbox-close-button"
              >
                <X width={28} height={28} />
              </button>

              {images.length > 1 && (
                <button
                  onClick={goPrev}
                  className="absolute left-2 small:left-6 top-1/2 -translate-y-1/2 z-10 text-white/80 hover:text-white p-2"
                  aria-label="Previous image"
                  data-testid="lightbox-prev-button"
                >
                  <ChevronLeft width={32} height={32} />
                </button>
              )}

              <div className="relative w-[90vw] h-[80vh]">
                {!!active?.url && (
                  <Image
                    src={active.url}
                    alt={`Product image ${index + 1}`}
                    fill
                    sizes="90vw"
                    className="object-contain"
                    priority
                  />
                )}
              </div>

              {images.length > 1 && (
                <button
                  onClick={goNext}
                  className="absolute right-2 small:right-6 top-1/2 -translate-y-1/2 z-10 text-white/80 hover:text-white p-2"
                  aria-label="Next image"
                  data-testid="lightbox-next-button"
                >
                  <ChevronRight width={32} height={32} />
                </button>
              )}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}

export default Lightbox
