"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

export interface TimeCategory {
  category: string;
  minutes: number;
  color: string;
}

interface TimeDistributionChartProps {
  data?: TimeCategory[];
  size?: number;
}

export default function TimeDistributionChart({
  data = [],
  size = 200,
}: TimeDistributionChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!canvasRef.current || !data || data.length === 0) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    // Calculate total minutes
    const totalMinutes = data.reduce(
      (sum, item) => sum + (item.minutes || 0),
      0,
    );
    if (totalMinutes === 0) return;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Draw pie chart
    let startAngle = -0.5 * Math.PI; // Start at top (12 o'clock position)

    data.forEach((item) => {
      if (!item.minutes) return;

      const sliceAngle = (item.minutes / totalMinutes) * 2 * Math.PI;

      ctx.beginPath();
      ctx.moveTo(size / 2, size / 2);
      ctx.arc(
        size / 2,
        size / 2,
        size / 2 - 10,
        startAngle,
        startAngle + sliceAngle,
      );
      ctx.closePath();

      ctx.fillStyle = item.color || "#94a3b8";
      ctx.fill();

      // Add a subtle border
      ctx.lineWidth = 1;
      ctx.strokeStyle = theme === "dark" ? "#1f2937" : "#ffffff";
      ctx.stroke();

      startAngle += sliceAngle;
    });

    // Draw center circle (donut hole)
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 4, 0, 2 * Math.PI);
    ctx.fillStyle = theme === "dark" ? "#1f2937" : "#ffffff";
    ctx.fill();

    // Add total time in the center
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    const timeText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    ctx.font = "bold 16px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = theme === "dark" ? "#e5e7eb" : "#1f2937";
    ctx.fillText(timeText, size / 2, size / 2 - 10);

    ctx.font = "12px Inter, sans-serif";
    ctx.fillStyle = theme === "dark" ? "#9ca3af" : "#6b7280";
    ctx.fillText("Total", size / 2, size / 2 + 10);
  }, [data, size, theme]);

  // Format minutes for display
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative mb-4">
        {data.length > 0 ? (
          <canvas
            ref={canvasRef}
            width={size}
            height={size}
            className="rounded-full"
          />
        ) : (
          <div
            className="flex items-center justify-center bg-muted/30 rounded-full"
            style={{ width: size, height: size }}
          >
            <p className="text-muted-foreground text-sm">No data</p>
          </div>
        )}
      </div>

      {data.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 w-full max-w-md">
          {data.map((item, index) => (
            <div
              key={index}
              className="flex items-center text-sm justify-between"
            >
              <div className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate">{item.category}</span>
              </div>
              <span className="text-muted-foreground ml-2 flex-shrink-0">
                {formatTime(item.minutes)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
