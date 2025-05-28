import DashboardNavbar from "@/components/dashboard-navbar";
import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/server";
import { DateRangePicker } from "@/components/date-range-picker";
import TimeDistributionChart from "@/components/time-distribution-chart";

export default async function StatsPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Parse date range from query params or use default (last 7 days)
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const defaultFromDate = new Date();
  defaultFromDate.setDate(defaultFromDate.getDate() - 7);
  defaultFromDate.setHours(0, 0, 0, 0);

  const fromDate = searchParams.from
    ? new Date(searchParams.from)
    : defaultFromDate;

  const toDate = searchParams.to ? new Date(searchParams.to) : today;

  // Fetch time blocks for the date range
  const { data: timeBlocks } = await supabase
    .from("time_blocks")
    .select("*")
    .eq("user_id", user.id)
    .gte("start_time", fromDate.toISOString())
    .lte("start_time", toDate.toISOString())
    .order("start_time", { ascending: true });

  // Calculate time distribution by category
  const categoryMinutes: Record<string, number> = {};
  const categoryColors: Record<string, string> = {
    Work: "#3b82f6",
    Meeting: "#8b5cf6",
    "Deep Work": "#22c55e",
    Lunch: "#eab308",
    Break: "#f97316",
    Personal: "#ec4899",
    Exercise: "#14b8a6",
    Study: "#6366f1",
  };

  timeBlocks?.forEach((block) => {
    const startTime = new Date(block.start_time);
    const endTime = new Date(block.end_time);
    const durationMinutes =
      (endTime.getTime() - startTime.getTime()) / (1000 * 60);

    if (categoryMinutes[block.category]) {
      categoryMinutes[block.category] += durationMinutes;
    } else {
      categoryMinutes[block.category] = durationMinutes;
    }
  });

  // Format data for the chart
  const chartData = Object.entries(categoryMinutes).map(
    ([category, minutes]) => ({
      category,
      minutes,
      color: categoryColors[category] || "#94a3b8", // Default color if category not in predefined list
    }),
  );

  // Calculate total time
  const totalMinutes = Object.values(categoryMinutes).reduce(
    (sum, minutes) => sum + minutes,
    0,
  );
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = Math.round(totalMinutes % 60);

  // Format date range for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year:
        date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    });
  };

  const dateRangeText = `${formatDate(fromDate)} - ${formatDate(toDate)}`;

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-background min-h-screen">
        <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
          {/* Header Section */}
          <header className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold">Time Statistics</h1>
            <p className="text-muted-foreground">
              Analyze your time usage patterns
            </p>
          </header>

          {/* Date Range Picker */}
          <div className="bg-card rounded-xl p-6 border shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Select Date Range</h2>
            <DateRangePicker />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Time Distribution Chart */}
            <section className="bg-card rounded-xl p-6 border shadow-sm flex flex-col items-center">
              <h2 className="text-xl font-semibold mb-4 self-start">
                Time Distribution
              </h2>
              <p className="text-sm text-muted-foreground self-start mb-4">
                {dateRangeText}
              </p>

              {chartData.length > 0 ? (
                <TimeDistributionChart data={chartData} size={240} />
              ) : (
                <div className="text-center text-muted-foreground py-12 w-full">
                  <p>No time blocks recorded in this period.</p>
                  <p className="text-sm mt-2">
                    Try selecting a different date range.
                  </p>
                </div>
              )}
            </section>

            {/* Summary Table */}
            <section className="bg-card rounded-xl p-6 border shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Time Summary</h2>
              <p className="text-sm text-muted-foreground mb-4">
                {dateRangeText}
              </p>

              {chartData.length > 0 ? (
                <>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-3 text-sm font-medium">
                            Category
                          </th>
                          <th className="text-right p-3 text-sm font-medium">
                            Time
                          </th>
                          <th className="text-right p-3 text-sm font-medium">
                            %
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {chartData
                          .sort((a, b) => b.minutes - a.minutes)
                          .map((item, index) => {
                            const hours = Math.floor(item.minutes / 60);
                            const minutes = Math.round(item.minutes % 60);
                            const timeText =
                              hours > 0
                                ? `${hours}h ${minutes}m`
                                : `${minutes}m`;
                            const percentage = Math.round(
                              (item.minutes / totalMinutes) * 100,
                            );

                            return (
                              <tr key={index} className="hover:bg-muted/30">
                                <td className="p-3 flex items-center">
                                  <div
                                    className="w-3 h-3 rounded-full mr-2"
                                    style={{ backgroundColor: item.color }}
                                  />
                                  {item.category}
                                </td>
                                <td className="p-3 text-right">{timeText}</td>
                                <td className="p-3 text-right">
                                  {percentage}%
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                      <tfoot className="bg-muted/50 font-medium">
                        <tr>
                          <td className="p-3">Total</td>
                          <td className="p-3 text-right">
                            {totalHours}h {remainingMinutes}m
                          </td>
                          <td className="p-3 text-right">100%</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </>
              ) : (
                <div className="text-center text-muted-foreground py-12">
                  <p>No time blocks recorded in this period.</p>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
