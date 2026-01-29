import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background gradient - from dark gray at top to orange at bottom */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#4a4a4a] via-[#8b6b5a] to-[#FF5722]" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Large 404 background text */}
      <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none">
        <span
          className="text-[40vw] font-black leading-none tracking-tighter"
          style={{
            color: "rgba(50, 50, 50, 0.6)",
            fontFamily: "system-ui, -apple-system, sans-serif",
            WebkitTextStroke: "2px rgba(80, 80, 80, 0.3)",
          }}
        >
          404
        </span>
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 text-center">
        {/* 404 label */}
        <p className="mb-4 text-lg font-medium tracking-widest text-white/80">
          404
        </p>

        {/* Main heading */}
        <h1 className="mb-6 text-4xl font-black uppercase tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
          <span className="text-white/90">YOU MISSED</span>{" "}
          <span className="text-white">THE SHOT</span>
        </h1>

        {/* Description */}
        <p className="mb-8 max-w-md text-base text-white/80 sm:text-lg">
          {"Looks like the page you're looking for didn't make the play."}
          <br />
          {"No worries — the game's still on elsewhere."}
        </p>

        {/* Button */}
        <Link href="/">
          <Button
            size="lg"
            className="rounded-full bg-white px-8 py-6 text-base font-semibold text-gray-900 hover:bg-white/90"
          >
            Get Me Home
          </Button>
        </Link>
      </div>

      {/* Decorative cross/plus marks scattered */}
      <div className="absolute top-[15%] left-[10%] text-white/20 text-2xl">+</div>
      <div className="absolute top-[25%] right-[15%] text-white/20 text-2xl">+</div>
      <div className="absolute top-[45%] left-[5%] text-white/20 text-2xl">+</div>
      <div className="absolute top-[35%] right-[8%] text-white/20 text-2xl">+</div>
      <div className="absolute bottom-[30%] left-[12%] text-white/20 text-2xl">+</div>
      <div className="absolute bottom-[25%] right-[20%] text-white/20 text-2xl">+</div>
    </div>
  );
}
