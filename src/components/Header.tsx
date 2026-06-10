import Image from "next/image";

export default function Header() {
  return (
    <header className="border-b border-amber-100/80 bg-white/70 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-md shadow-amber-500/30">
          <Image src="/logo.png" alt="Scrivly" width={40} height={40} className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-base font-bold leading-tight text-stone-900 sm:text-lg">
            Scrivly
          </h1>
          <p className="truncate text-xs text-stone-500">
            Generate SEO-optimized Etsy listings in seconds
          </p>
        </div>
      </div>
    </header>
  );
}
