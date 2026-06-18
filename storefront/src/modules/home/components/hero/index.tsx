import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Hero = () => {
  return (
    <div className="relative h-[75vh] w-full flex overflow-hidden">
      {/* Left: text panel */}
      <div className="flex flex-col justify-center px-10 small:px-16 gap-6 w-full small:w-[55%] bg-gradient-to-br from-maro-purple-dark via-maro-purple to-[#d4bcee]">
        <span className="text-white/60 text-xs tracking-[0.3em] uppercase font-light">
          Trinidad&apos;s Online Store
        </span>
        <h1 className="font-display text-6xl small:text-7xl text-white font-light tracking-wide leading-none">
          Maro.Shopping
        </h1>
        <p className="text-base text-white/75 max-w-xs font-light leading-relaxed">
          Curated fashion &amp; lifestyle, delivered across Trinidad
        </p>
        <LocalizedClientLink
          href="/store"
          className="self-start bg-maro-yellow hover:bg-maro-yellow-dark text-maro-black font-semibold px-10 py-4 text-sm tracking-widest uppercase transition-colors rounded"
        >
          Shop Now
        </LocalizedClientLink>
      </div>

      {/* Right: model image — hidden on mobile */}
      <div className="hidden small:block small:w-[45%] relative bg-[#F5EDE0]">
        <Image
          src="/images/hero/boho-highlight.png"
          alt="Boho fashion at Maro Shopping"
          fill
          className="object-cover object-center"
          priority
        />
      </div>
    </div>
  )
}

export default Hero
