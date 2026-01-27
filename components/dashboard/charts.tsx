"use client";

import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// Players by position data
const positionData = [
  { position: "Forward", count: 145 },
  { position: "Midfielder", count: 180 },
  { position: "Defender", count: 120 },
  { position: "Goalkeeper", count: 55 },
];

// Player status distribution data
const statusData = [
  { name: "Available", value: 280, color: "#FF5722" },
  { name: "Assigned", value: 150, color: "#1E3A8A" },
  { name: "Signed", value: 70, color: "#10B981" },
];

export function PositionChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Players by Position</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            count: {
              label: "Players",
              color: "#FF5722",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={positionData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <XAxis
                dataKey="position"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
              />
              <Bar
                dataKey="count"
                radius={[4, 4, 0, 0]}
                fill="#FF5722"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function StatusChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Player Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            Available: { label: "Available", color: "#FF5722" },
            Assigned: { label: "Assigned", color: "#1E3A8A" },
            Signed: { label: "Signed", color: "#10B981" },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {statusData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          {statusData.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-muted-foreground">
                {item.name}: {item.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
