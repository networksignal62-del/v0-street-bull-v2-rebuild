"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import {
  Users,
  Target,
  Award,
  Globe,
  Heart,
  TrendingUp,
  MapPin,
  Calendar,
} from "lucide-react";

const stats = [
  { label: "Players Registered", value: "500+", icon: Users },
  { label: "Agents Connected", value: "50+", icon: Target },
  { label: "Successful Placements", value: "120+", icon: Award },
  { label: "Countries Reached", value: "15+", icon: Globe },
];

const values = [
  {
    title: "Passion for Football",
    description:
      "We believe in the power of football to transform lives and create opportunities for talented individuals.",
    icon: Heart,
  },
  {
    title: "Equal Opportunity",
    description:
      "Every street player deserves a chance to showcase their talent, regardless of their background or location.",
    icon: Users,
  },
  {
    title: "Professional Growth",
    description:
      "We provide the tools, connections, and support needed for players to develop professionally.",
    icon: TrendingUp,
  },
  {
    title: "Local Focus, Global Reach",
    description:
      "Rooted in Sierra Leone, we connect local talent with opportunities across the globe.",
    icon: Globe,
  },
];

const team = [
  {
    name: "Mohamed Kamara",
    role: "Founder & CEO",
    description: "Former professional player with 15+ years in football management",
  },
  {
    name: "Fatima Sesay",
    role: "Head of Operations",
    description: "Expert in sports administration and player development",
  },
  {
    name: "Ibrahim Bangura",
    role: "Chief Scout",
    description: "Extensive network across Sierra Leone's football community",
  },
  {
    name: "Aminata Conteh",
    role: "Player Relations Manager",
    description: "Dedicated to supporting players throughout their journey",
  },
];

const milestones = [
  { year: "2020", event: "Street Bull founded in Freetown" },
  { year: "2021", event: "First 100 players registered" },
  { year: "2022", event: "Partnership with international agencies" },
  { year: "2023", event: "Launch of live streaming platform" },
  { year: "2024", event: "Expanded to 5 districts" },
  { year: "2025", event: "Street Bull v2 platform launched" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0A1128] via-[#1E3A8A] to-[#0A1128] py-24">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                About <span className="text-[#FF5722]">Street Bull</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-300 mb-8">
                Connecting street football talent with professional opportunities
                across Sierra Leone and beyond. We believe every talented player
                deserves a chance to shine.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/register">
                  <Button size="lg" className="bg-[#FF5722] hover:bg-[#E64A19] text-white">
                    Join Our Community
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 bg-transparent">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index} className="text-center p-6 bg-background border-border">
                    <CardContent className="p-0">
                      <Icon className="h-10 w-10 mx-auto mb-4 text-[#FF5722]" />
                      <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                        {stat.value}
                      </div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Our Mission
                </h2>
                <p className="text-lg text-muted-foreground">
                  To discover, develop, and connect talented street football players
                  with professional opportunities that can change their lives and
                  communities.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {values.map((value, index) => {
                  const Icon = value.icon;
                  return (
                    <Card key={index} className="p-6 bg-card border-border hover:border-[#FF5722] transition-colors">
                      <CardContent className="p-0">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-lg bg-[#FF5722]/10">
                            <Icon className="h-6 w-6 text-[#FF5722]" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-foreground mb-2">
                              {value.title}
                            </h3>
                            <p className="text-muted-foreground">{value.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Meet Our Team
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                A dedicated team of football professionals committed to developing
                talent in Sierra Leone.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {team.map((member, index) => (
                <Card key={index} className="p-6 text-center bg-background border-border hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#1E3A8A] to-[#FF5722] flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {member.name.split(" ").map((n) => n[0]).join("")}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {member.name}
                    </h3>
                    <p className="text-sm text-[#FF5722] mb-3">{member.role}</p>
                    <p className="text-sm text-muted-foreground">{member.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Our Journey
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                From humble beginnings to becoming Sierra Leone's premier football
                talent platform.
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-border md:-translate-x-0.5" />

                {milestones.map((milestone, index) => (
                  <div
                    key={index}
                    className={`relative flex items-center mb-8 ${
                      index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                    }`}
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-4 md:left-1/2 w-3 h-3 bg-[#FF5722] rounded-full md:-translate-x-1.5 z-10" />

                    {/* Content */}
                    <div
                      className={`ml-12 md:ml-0 md:w-1/2 ${
                        index % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"
                      }`}
                    >
                      <Card className="p-4 bg-card border-border inline-block">
                        <CardContent className="p-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="h-4 w-4 text-[#FF5722]" />
                            <span className="font-bold text-[#FF5722]">
                              {milestone.year}
                            </span>
                          </div>
                          <p className="text-foreground">{milestone.event}</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Location Section */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <MapPin className="h-12 w-12 mx-auto mb-6 text-[#FF5722]" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Based in Freetown, Sierra Leone
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Our headquarters is located in the heart of Freetown, with scouts
                and representatives across all districts of Sierra Leone.
              </p>
              <Link href="/contact">
                <Button size="lg" className="bg-[#FF5722] hover:bg-[#E64A19] text-white">
                  Visit Our Office
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
