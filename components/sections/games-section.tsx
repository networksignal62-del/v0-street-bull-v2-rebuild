"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const gameTypes = [
  {
    title: "Street 5-a-Side",
    description: "Fast-paced small-sided games showcasing technical skills and creativity.",
    image: "/images/street-5aside.jpg",
    players: "250+",
  },
  {
    title: "11-a-Side Matches",
    description: "Full format matches for complete tactical and physical assessment.",
    image: "/images/11aside.jpg",
    players: "180+",
  },
  {
    title: "Skills Challenges",
    description: "Individual skill competitions to showcase your technical abilities.",
    image: "/images/skills.jpg",
    players: "320+",
  },
];

export function GamesSection() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            <h2 className="text-3xl font-bold sm:text-4xl">
              TYPES OF <span className="text-primary">GAMES</span>
            </h2>
            <p className="mt-2 text-muted-foreground">
              Multiple formats to showcase different aspects of your talent.
            </p>
          </div>
          <Link href="/games">
            <Button variant="outline">
              View All Games
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {gameTypes.map((game) => (
            <div
              key={game.title}
              className="group relative overflow-hidden rounded-2xl bg-card"
            >
              {/* Image Placeholder */}
              <div className="aspect-[4/3] bg-gradient-to-br from-[#1E3A8A] to-[#0A1128]">
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto h-16 w-16 rounded-full bg-primary/20 p-4">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="h-full w-full text-primary"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <path
                          d="M12 6l-1.5 3.5L7 11l3.5 1.5L12 16l1.5-3.5L17 11l-3.5-1.5L12 6z"
                          fill="currentColor"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary">
                    {game.players} Players
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white">{game.title}</h3>
                <p className="mt-1 text-sm text-white/70">{game.description}</p>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <Button className="bg-primary text-primary-foreground">
                  Learn More
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
