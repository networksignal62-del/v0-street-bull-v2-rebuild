"use client";

import { Users, Trophy, Target, Tv } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Community Challenges",
    description:
      "Compete in weekly challenges against players from across Sierra Leone. Show your skills and climb the leaderboard.",
  },
  {
    icon: Trophy,
    title: "Build Your Legend",
    description:
      "Create your player profile, showcase your highlights, and attract attention from professional scouts and agents.",
  },
  {
    icon: Target,
    title: "Street Tournaments",
    description:
      "Participate in organized street football tournaments. Win prizes and gain exposure to professional opportunities.",
  },
  {
    icon: Tv,
    title: "Live Broadcasting",
    description:
      "Stream your matches live for scouts, agents, and fans worldwide. Get discovered from anywhere in the world.",
  },
];

export function FeaturesSection() {
  return (
    <section className="bg-[#0A1128] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            THE STREET ENERGY WILL{" "}
            <span className="text-[#FF5722]">CONTINUE</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/60">
            Everything you need to transform your street football talent into a
            professional career.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative rounded-2xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:border-[#FF5722]/50 hover:bg-white/10"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FF5722]/20 text-[#FF5722] transition-colors group-hover:bg-[#FF5722] group-hover:text-white">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-white/60">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
