"use client";

import React from "react"

import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { cn } from "@/lib/utils";

// Mock user data - in production this would come from auth
const mockUser = {
  name: "John Doe",
  email: "john@streetbull.com",
  role: "Admin",
  avatar: undefined,
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <DashboardSidebar
          role="admin"
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          user={mockUser}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed left-0 top-0 z-50 h-full lg:hidden">
            <DashboardSidebar
              role="admin"
              isCollapsed={false}
              user={mockUser}
            />
          </div>
        </>
      )}

      {/* Main Content */}
      <div
        className={cn(
          "min-h-screen transition-all duration-300",
          sidebarCollapsed ? "lg:pl-16" : "lg:pl-64"
        )}
      >
        <DashboardHeader
          onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          user={mockUser}
        />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
