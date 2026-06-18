import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Hero = () => {
  return (
    <div className="h-[75vh] w-full flex flex-col justify-center items-center text-center p-8 gap-10 bg-gradient-to-br from-maro-purple-dark via-maro-purple to-[#d4bcee]">
      <div className="flex flex-col items-center gap-5 max-w-2xl">
        <span className="text-white/60 text-xs tracking-[0.3em] uppercase font-light">
          Trinidad&apos;s Online Store
        </span>
        <h1 className="font-display text-7xl small:text-9xl text-white font-light tracking-wide leading-none">
          Maro.Shopping
        </h1>
        <p className="text-base small:text-lg text-white/75 max-w-sm font-light">
          Curated fashion &amp; lifestyle, delivered across Trinidad
        </p>
      </div>
      <LocalizedClientLink
        href="/store"
        className="bg-maro-yellow hover:bg-maro-yellow-dark text-maro-black font-semibold px-10 py-4 text-sm tracking-widest uppercase transition-colors rounded"
      >
        Shop Now
      </LocalizedClientLink>
    </div>
  )
}

export default Hero
