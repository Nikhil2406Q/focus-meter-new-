"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useRouter, useSearchParams } from "next/navigation";

export function DateRangePicker() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse date range from query params or use default (last 7 days)
  const today = new Date();
  const defaultFrom = addDays(today, -7);

  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: fromParam ? new Date(fromParam) : defaultFrom,
    to: toParam ? new Date(toParam) : today,
  });

  // Predefined date ranges
  const selectPredefinedRange = (days: number) => {
    const to = new Date();
    const from = addDays(to, -days);
    setDate({ from, to });
    updateUrl(from, to);
  };

  // Update URL with selected date range
  const updateUrl = (from: Date, to: Date) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("from", from.toISOString().split("T")[0]);
    params.set("to", to.toISOString().split("T")[0]);
    router.push(`/stats?${params.toString()}`);
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => selectPredefinedRange(7)}
          className="text-xs"
        >
          Last 7 days
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => selectPredefinedRange(14)}
          className="text-xs"
        >
          Last 14 days
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => selectPredefinedRange(30)}
          className="text-xs"
        >
          Last 30 days
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const now = new Date();
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
            setDate({ from: firstDay, to: now });
            updateUrl(firstDay, now);
          }}
          className="text-xs"
        >
          This Month
        </Button>
      </div>

      <div className="grid gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} -{" "}
                    {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={(newDate) => {
                setDate(newDate);
                if (newDate?.from && newDate?.to) {
                  updateUrl(newDate.from, newDate.to);
                }
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
