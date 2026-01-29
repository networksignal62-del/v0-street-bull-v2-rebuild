"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Users, Trophy, Tv } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] overflow-hidden bg-gradient-to-br from-[#0A1128] via-[#1E3A8A] to-[#0A1128]">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left Column - Text Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-white/90 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FF5722] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#FF5722]" />
              </span>
              Sierra Leone Football Talent Platform
            </div>

            <h1 className="mt-6 font-[var(--font-display)] text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              BECOME A{" "}
              <span className="bg-gradient-to-r from-[#FF5722] to-[#F59E0B] bg-clip-text text-transparent">
                LEGEND
              </span>
              <br />
              <span className="text-white/90">POWER</span>
            </h1>

            <p className="mt-6 text-lg text-white/70 sm:text-xl font-medium">
              From the streets of Freetown to professional stadiums worldwide.
              We connect talented players with agents, clubs, and opportunities
              that transform careers.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <Link href="/register">
                <Button
                  size="lg"
                  className="w-full bg-[#FF5722] text-white hover:bg-[#FF5722]/90 sm:w-auto"
                >
                  Join the Street
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/players">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-white/30 bg-white/10 text-white hover:bg-white/20 sm:w-auto"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Explore Players
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-4 border-t border-white/10 pt-8">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Users className="h-5 w-5 text-[#FF5722]" />
                  <span className="text-2xl font-bold text-white sm:text-3xl">500+</span>
                </div>
                <p className="mt-1 text-sm text-white/60">Players</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Trophy className="h-5 w-5 text-[#FF5722]" />
                  <span className="text-2xl font-bold text-white sm:text-3xl">50+</span>
                </div>
                <p className="mt-1 text-sm text-white/60">Agents</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Tv className="h-5 w-5 text-[#FF5722]" />
                  <span className="text-2xl font-bold text-white sm:text-3xl">1K+</span>
                </div>
                <p className="mt-1 text-sm text-white/60">Live Views</p>
              </div>
            </div>
          </div>

          {/* Right Column - Hero Image */}
          <div className="relative hidden md:block">
            <div className="relative flex items-center justify-center">
              {/* Player Image */}
              <img
                src="/images/image1.jpeg"
                alt="Sierra Leone Football Player"
                className="relative z-10 h-auto w-full max-w-md lg:max-w-lg object-contain drop-shadow-2xl"
              />

              {/* Floating Cards */}
              <div className="absolute left-0 top-1/4 z-20 rounded-xl bg-white/10 p-4 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#10B981]">
                    <Trophy className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Top Rated</p>
                    <p className="text-xs text-white/60">Player of the Week</p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-1/4 right-0 z-20 rounded-xl bg-white/10 p-4 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF5722]">
                    <Tv className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Live Now</p>
                    <p className="text-xs text-white/60">3 Active Streams</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
        >
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            className="fill-background"
          />
        </svg>
      </div>
    </section>
  );
}
