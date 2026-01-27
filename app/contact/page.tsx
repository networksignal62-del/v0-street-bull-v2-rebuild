"use client";

import React from "react"

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Twitter,
  Instagram,
  Send,
  MessageSquare,
  Users,
  Briefcase,
} from "lucide-react";

const contactInfo = [
  {
    icon: MapPin,
    title: "Visit Us",
    details: ["123 Siaka Stevens Street", "Freetown, Sierra Leone"],
  },
  {
    icon: Phone,
    title: "Call Us",
    details: ["+232 76 123 456", "+232 78 789 012"],
  },
  {
    icon: Mail,
    title: "Email Us",
    details: ["info@streetbull.sl", "support@streetbull.sl"],
  },
  {
    icon: Clock,
    title: "Office Hours",
    details: ["Mon - Fri: 8:00 AM - 6:00 PM", "Sat: 9:00 AM - 2:00 PM"],
  },
];

const inquiryTypes = [
  { value: "general", label: "General Inquiry", icon: MessageSquare },
  { value: "player", label: "Player Registration", icon: Users },
  { value: "partnership", label: "Partnership Opportunity", icon: Briefcase },
  { value: "support", label: "Technical Support", icon: Mail },
];

const faqs = [
  {
    question: "How do I register as a player?",
    answer:
      "Click the 'Register' button, select 'Player' as your role, and fill out your profile information including your position, skills, and upload highlight videos.",
  },
  {
    question: "What are the fees for agents?",
    answer:
      "Agent accounts start at 200,000 SLL/month with full database access. Contact our sales team for custom enterprise plans.",
  },
  {
    question: "How does live streaming work?",
    answer:
      "Our live streaming system allows multiple camera operators to join a broadcast. The commentator controls which camera feed viewers see in real-time.",
  },
  {
    question: "Can international clubs access the platform?",
    answer:
      "Yes! Our platform is accessible globally. International clubs and agents can register and access our talent database.",
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    inquiryType: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setSubmitted(true);
  };

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
                Get in <span className="text-[#FF5722]">Touch</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-300">
                Have questions? We'd love to hear from you. Send us a message and
                we'll respond as soon as possible.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-12 -mt-12 relative z-20">
          <div className="container mx-auto px-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                return (
                  <Card
                    key={index}
                    className="bg-card border-border hover:border-[#FF5722] transition-colors"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-[#FF5722]/10">
                          <Icon className="h-5 w-5 text-[#FF5722]" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground mb-2">
                            {info.title}
                          </h3>
                          {info.details.map((detail, i) => (
                            <p key={i} className="text-sm text-muted-foreground">
                              {detail}
                            </p>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Contact Form & Map Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {/* Contact Form */}
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
                  Send us a Message
                </h2>

                {submitted ? (
                  <Card className="bg-green-500/10 border-green-500/30">
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Send className="h-8 w-8 text-green-500" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        Message Sent!
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Thank you for contacting us. We'll get back to you within
                        24-48 hours.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSubmitted(false);
                          setFormData({
                            name: "",
                            email: "",
                            phone: "",
                            inquiryType: "",
                            subject: "",
                            message: "",
                          });
                        }}
                      >
                        Send Another Message
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-card border-border">
                    <CardContent className="p-6">
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                              id="name"
                              placeholder="Your name"
                              value={formData.name}
                              onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                              }
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="your@email.com"
                              value={formData.email}
                              onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                              }
                              required
                            />
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                              id="phone"
                              type="tel"
                              placeholder="+232 XX XXX XXX"
                              value={formData.phone}
                              onChange={(e) =>
                                setFormData({ ...formData, phone: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="inquiryType">Inquiry Type</Label>
                            <Select
                              value={formData.inquiryType}
                              onValueChange={(value) =>
                                setFormData({ ...formData, inquiryType: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                {inquiryTypes.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="subject">Subject</Label>
                          <Input
                            id="subject"
                            placeholder="How can we help?"
                            value={formData.subject}
                            onChange={(e) =>
                              setFormData({ ...formData, subject: e.target.value })
                            }
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="message">Message</Label>
                          <Textarea
                            id="message"
                            placeholder="Tell us more about your inquiry..."
                            rows={5}
                            value={formData.message}
                            onChange={(e) =>
                              setFormData({ ...formData, message: e.target.value })
                            }
                            required
                          />
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-[#FF5722] hover:bg-[#E64A19] text-white"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>Sending...</>
                          ) : (
                            <>
                              Send Message
                              <Send className="h-4 w-4 ml-2" />
                            </>
                          )}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Map & Social */}
              <div className="space-y-8">
                {/* Map Placeholder */}
                <Card className="bg-card border-border overflow-hidden">
                  <div className="aspect-video bg-[#1E3A8A]/20 flex items-center justify-center">
                    <div className="text-center p-6">
                      <MapPin className="h-12 w-12 mx-auto mb-4 text-[#FF5722]" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Our Location
                      </h3>
                      <p className="text-muted-foreground">
                        123 Siaka Stevens Street, Freetown
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Social Media */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle>Follow Us</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Stay connected with us on social media for updates, player
                      highlights, and live match announcements.
                    </p>
                    <div className="flex gap-4">
                      <a
                        href="#"
                        className="p-3 rounded-lg bg-[#1877F2]/10 hover:bg-[#1877F2]/20 transition-colors"
                      >
                        <Facebook className="h-6 w-6 text-[#1877F2]" />
                      </a>
                      <a
                        href="#"
                        className="p-3 rounded-lg bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 transition-colors"
                      >
                        <Twitter className="h-6 w-6 text-[#1DA1F2]" />
                      </a>
                      <a
                        href="#"
                        className="p-3 rounded-lg bg-[#E4405F]/10 hover:bg-[#E4405F]/20 transition-colors"
                      >
                        <Instagram className="h-6 w-6 text-[#E4405F]" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Frequently Asked Questions
                </h2>
                <p className="text-lg text-muted-foreground">
                  Quick answers to common questions.
                </p>
              </div>

              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <Card key={index} className="bg-background border-border">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-foreground mb-2">
                        {faq.question}
                      </h3>
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
