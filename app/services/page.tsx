"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Users,
  Video,
  FileText,
  Trophy,
  Handshake,
  GraduationCap,
  BarChart3,
  Globe,
  Shield,
  Zap,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

const services = [
  {
    title: "Player Registration & Profiling",
    description:
      "Create comprehensive digital profiles showcasing your skills, stats, and highlight videos to attract scouts and agents.",
    icon: Users,
    features: [
      "Professional player profiles",
      "Video highlight uploads",
      "Skills assessment",
      "Performance statistics",
    ],
    forWho: "Players",
  },
  {
    title: "Live Match Broadcasting",
    description:
      "Stream live street football matches with multi-camera angles, real-time commentary, and audience engagement features.",
    icon: Video,
    features: [
      "Multi-camera streaming",
      "Real-time commentary",
      "Live chat interaction",
      "Match recording & replays",
    ],
    forWho: "Broadcasters",
  },
  {
    title: "Talent Scouting Network",
    description:
      "Access our extensive database of verified players across Sierra Leone with advanced search and filtering capabilities.",
    icon: Trophy,
    features: [
      "Advanced player search",
      "Position-based filtering",
      "Performance analytics",
      "Direct player contact",
    ],
    forWho: "Scouts & Agents",
  },
  {
    title: "Contract Management",
    description:
      "Manage player contracts, agreements, and documentation with our secure digital contract system.",
    icon: FileText,
    features: [
      "Digital contracts",
      "E-signatures",
      "Document storage",
      "Compliance tracking",
    ],
    forWho: "Agents & Clubs",
  },
  {
    title: "Player Development Programs",
    description:
      "Access training resources, coaching tips, and development pathways to improve your game and career prospects.",
    icon: GraduationCap,
    features: [
      "Training tutorials",
      "Fitness programs",
      "Career guidance",
      "Mental coaching",
    ],
    forWho: "Players",
  },
  {
    title: "Analytics & Reports",
    description:
      "Detailed performance analytics, match statistics, and comprehensive reports for informed decision-making.",
    icon: BarChart3,
    features: [
      "Performance dashboards",
      "Match statistics",
      "Progress tracking",
      "Custom reports",
    ],
    forWho: "Everyone",
  },
];

const pricingPlans = [
  {
    name: "Free",
    price: "0",
    description: "For players just getting started",
    features: [
      "Basic player profile",
      "Up to 3 video uploads",
      "Public profile listing",
      "Match participation",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro Player",
    price: "50,000",
    period: "SLL/month",
    description: "For serious players seeking opportunities",
    features: [
      "Enhanced player profile",
      "Unlimited video uploads",
      "Priority in search results",
      "Direct agent messaging",
      "Performance analytics",
      "Verified badge",
    ],
    cta: "Upgrade to Pro",
    popular: true,
  },
  {
    name: "Agent",
    price: "200,000",
    period: "SLL/month",
    description: "For scouts and agents",
    features: [
      "Full player database access",
      "Advanced search filters",
      "Unlimited player contacts",
      "Contract management tools",
      "Analytics dashboard",
      "Priority support",
    ],
    cta: "Start Scouting",
    popular: false,
  },
  {
    name: "Club",
    price: "500,000",
    period: "SLL/month",
    description: "For clubs and academies",
    features: [
      "Everything in Agent plan",
      "Multi-user accounts",
      "Squad management",
      "Live streaming access",
      "Custom branding",
      "API access",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const benefits = [
  {
    icon: Shield,
    title: "Verified Profiles",
    description: "All players and agents go through our verification process",
  },
  {
    icon: Zap,
    title: "Fast Connections",
    description: "Connect directly with players, scouts, and clubs instantly",
  },
  {
    icon: Globe,
    title: "Global Reach",
    description: "Showcase your talent to opportunities worldwide",
  },
  {
    icon: Handshake,
    title: "Trusted Platform",
    description: "Join thousands of satisfied users across Sierra Leone",
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0A1128] via-[#1E3A8A] to-[#0A1128] py-24">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <Badge className="mb-4 bg-[#FF5722]/20 text-[#FF5722] border-[#FF5722]/30">
                Our Services
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Everything You Need to{" "}
                <span className="text-[#FF5722]">Succeed</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-300 mb-8">
                From player registration to live streaming, we provide
                comprehensive services for players, agents, and clubs.
              </p>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => {
                const Icon = service.icon;
                return (
                  <Card
                    key={index}
                    className="bg-card border-border hover:border-[#FF5722] transition-all hover:shadow-xl group"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-lg bg-[#FF5722]/10 group-hover:bg-[#FF5722]/20 transition-colors">
                          <Icon className="h-6 w-6 text-[#FF5722]" />
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {service.forWho}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl text-foreground">
                        {service.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        {service.description}
                      </p>
                      <ul className="space-y-2">
                        {service.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Why Choose Street Bull?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We're committed to providing the best experience for our users.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div key={index} className="text-center p-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FF5722]/10 flex items-center justify-center">
                      <Icon className="h-8 w-8 text-[#FF5722]" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Choose the plan that's right for you. All plans include our core
                features.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {pricingPlans.map((plan, index) => (
                <Card
                  key={index}
                  className={`relative p-6 ${
                    plan.popular
                      ? "border-[#FF5722] bg-gradient-to-b from-[#FF5722]/5 to-transparent"
                      : "bg-card border-border"
                  }`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FF5722] text-white">
                      Most Popular
                    </Badge>
                  )}
                  <CardContent className="p-0">
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {plan.name}
                    </h3>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-foreground">
                        {plan.price === "0" ? "Free" : plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-sm text-muted-foreground ml-1">
                          {plan.period}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-6">
                      {plan.description}
                    </p>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href="/register">
                      <Button
                        className={`w-full ${
                          plan.popular
                            ? "bg-[#FF5722] hover:bg-[#E64A19] text-white"
                            : ""
                        }`}
                        variant={plan.popular ? "default" : "outline"}
                      >
                        {plan.cta}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-[#0A1128] via-[#1E3A8A] to-[#0A1128]">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-lg text-gray-300 mb-8">
                Join thousands of players and agents already using Street Bull to
                connect and grow.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/register">
                  <Button size="lg" className="bg-[#FF5722] hover:bg-[#E64A19] text-white">
                    Create Free Account
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 bg-transparent">
                    Contact Sales
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
