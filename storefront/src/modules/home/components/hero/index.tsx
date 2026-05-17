import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Hero = () => {
  return (
    <div className="h-[75vh] w-full flex flex-col justify-center items-center text-center p-8 gap-8 bg-maro-purple">
      <div className="flex flex-col items-center gap-4 max-w-2xl">
        <h1 className="text-5xl small:text-7xl text-white font-light tracking-widest uppercase">
          Maro.Shopping
        </h1>
        <p className="text-lg small:text-xl text-white/80 max-w-md">
          Trinidad&apos;s premier online shopping destination
        </p>
      </div>
      <LocalizedClientLink
        href="/store"
        className="bg-maro-yellow hover:bg-maro-yellow-dark text-maro-black font-semibold px-10 py-4 text-lg transition-colors rounded"
      >
        Shop Now
      </LocalizedClientLink>
    </div>
  )
}

export default Hero
