"use client"

import { HttpTypes } from "@medusajs/types"
import { Container, clx } from "@medusajs/ui"
import Image from "next/image"
import { useState } from "react"

import useToggleState from "@lib/hooks/use-toggle-state"
import Lightbox from "./lightbox"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
}

const ImageGallery = ({ images }: ImageGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const { state: lightboxOpen, open: openLightbox, close: closeLightbox } =
    useToggleState(false)

  if (!images.length) {
    return null
  }

  const selected = images[selectedIndex]

  return (
    <div className="flex flex-col small:flex-row items-start gap-4 relative">
      {images.length > 1 && (
        <div
          className="flex flex-row small:flex-col gap-3 order-2 small:order-1 overflow-x-auto small:overflow-x-visible small:overflow-y-auto small:max-h-[75vh] no-scrollbar"
          data-testid="product-thumbnails"
        >
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedIndex(index)}
              className={clx(
                "relative shrink-0 w-16 h-20 small:w-20 small:h-24 overflow-hidden rounded-rounded bg-ui-bg-subtle border",
                {
                  "border-ui-fg-base": index === selectedIndex,
                  "border-transparent": index !== selectedIndex,
                }
              )}
              data-testid="product-thumbnail"
              aria-label={`Show image ${index + 1}`}
            >
              {!!image.url && (
                <Image
                  src={image.url}
                  alt={`Product thumbnail ${index + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              )}
            </button>
          ))}
        </div>
      )}

      <Container
        className="relative aspect-[29/34] w-full flex-1 overflow-hidden bg-ui-bg-subtle order-1 small:order-2 cursor-zoom-in"
        onClick={openLightbox}
        data-testid="product-main-image"
      >
        {!!selected?.url && (
          <Image
            src={selected.url}
            priority
            className="absolute inset-0 rounded-rounded"
            alt="Product image"
            fill
            sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
            style={{
              objectFit: "contain",
            }}
          />
        )}
      </Container>

      <Lightbox
        images={images}
        initialIndex={selectedIndex}
        isOpen={lightboxOpen}
        close={closeLightbox}
      />
    </div>
  )
}

export default ImageGallery
