"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export function NewsletterSection() {
  return (
    <section className="bg-gradient-to-br from-[#0A1128] to-[#1E3A8A] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Contact Info */}
          <div>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              GET IN <span className="text-[#FF5722]">TOUCH</span>
            </h2>
            <p className="mt-4 text-lg text-white/70">
              Have questions about joining Street Bull? Want to learn more about
              our platform? Reach out to us.
            </p>

            <div className="mt-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FF5722]/20">
                  <Mail className="h-5 w-5 text-[#FF5722]" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Email Us</p>
                  <p className="font-medium text-white">contact@streetbull.com</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FF5722]/20">
                  <Phone className="h-5 w-5 text-[#FF5722]" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Call Us</p>
                  <p className="font-medium text-white">+232 76 123 456</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FF5722]/20">
                  <MapPin className="h-5 w-5 text-[#FF5722]" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Visit Us</p>
                  <p className="font-medium text-white">Freetown, Sierra Leone</p>
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter Form */}
          <div className="rounded-2xl bg-white/10 p-8 backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-white">
              Subscribe to Our Newsletter
            </h3>
            <p className="mt-2 text-white/70">
              Stay updated with the latest player profiles, tournaments, and
              opportunities.
            </p>

            <form className="mt-6 space-y-4">
              <div>
                <label htmlFor="name" className="sr-only">
                  Full Name
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your Full Name"
                  className="border-white/20 bg-white/10 text-white placeholder:text-white/50 focus:border-[#FF5722]"
                />
              </div>
              <div>
                <label htmlFor="email" className="sr-only">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Your Email Address"
                  className="border-white/20 bg-white/10 text-white placeholder:text-white/50 focus:border-[#FF5722]"
                />
              </div>
              <div>
                <label htmlFor="interest" className="sr-only">
                  Interest
                </label>
                <select
                  id="interest"
                  className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50 focus:border-[#FF5722] focus:outline-none focus:ring-2 focus:ring-[#FF5722]/50"
                >
                  <option value="" className="bg-[#0A1128]">
                    I am interested in...
                  </option>
                  <option value="player" className="bg-[#0A1128]">
                    Becoming a Player
                  </option>
                  <option value="agent" className="bg-[#0A1128]">
                    Becoming an Agent
                  </option>
                  <option value="club" className="bg-[#0A1128]">
                    Club Management
                  </option>
                  <option value="general" className="bg-[#0A1128]">
                    General Information
                  </option>
                </select>
              </div>
              <Button
                type="submit"
                className="w-full bg-[#FF5722] text-white hover:bg-[#FF5722]/90"
              >
                <Send className="mr-2 h-4 w-4" />
                Subscribe Now
              </Button>
            </form>

            <p className="mt-4 text-center text-xs text-white/50">
              By subscribing, you agree to our Privacy Policy and consent to
              receive updates.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
