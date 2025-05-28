import DashboardNavbar from "@/components/dashboard-navbar";
import TimeBlockList from "@/components/time-block-list";
import TimeDistributionChart from "@/components/time-distribution-chart";
import { InfoIcon, UserCircle } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/server";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch user's time blocks for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data: timeBlocks, error: timeBlocksError } = await supabase
    .from("time_blocks")
    .select("*")
    .eq("user_id", user.id)
    .gte("start_time", today.toISOString())
    .lt("start_time", tomorrow.toISOString())
    .order("start_time", { ascending: true });

  if (timeBlocksError) {
    console.error("Error fetching time blocks:", timeBlocksError);
  }

  // Format time blocks for the components
  const formattedTimeBlocks =
    timeBlocks?.map((block) => ({
      id: block.id,
      startTime: new Date(block.start_time).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      endTime: new Date(block.end_time).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      category: block.category,
      notes: block.notes || "",
    })) || [];

  // Calculate time distribution for the chart
  const categoryMinutes: Record<string, number> = {};

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

  // Define colors for categories
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

  // Format data for the chart
  const chartData = Object.entries(categoryMinutes).map(
    ([category, minutes]) => ({
      category,
      minutes,
      color: categoryColors[category] || "#94a3b8", // Default color if category not in predefined list
    }),
  );

  // Get user's name from metadata or email
  const userName =
    user.user_metadata?.full_name || user.email?.split("@")[0] || "there";

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-background min-h-screen">
        <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
          {/* Header Section */}
          <header className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold">Welcome, {userName}!</h1>
            <p className="text-muted-foreground">
              Track your time and stay focused with FocusMeter.
            </p>
          </header>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Time Blocks Section */}
            <section className="bg-card rounded-xl p-6 border shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Today's Activities</h2>
              <TimeBlockList initialBlocks={formattedTimeBlocks} />
            </section>

            {/* Time Distribution Chart */}
            <section className="bg-card rounded-xl p-6 border shadow-sm flex flex-col items-center justify-center">
              <h2 className="text-xl font-semibold mb-4 self-start">
                Time Distribution
              </h2>
              {chartData.length > 0 ? (
                <TimeDistributionChart data={chartData} size={240} />
              ) : (
                <div className="text-center text-muted-foreground py-12">
                  <p>No time blocks recorded today.</p>
                  <p className="text-sm mt-2">
                    Add some time blocks to see your distribution.
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* User Profile Section - Moved to bottom */}
          <section className="bg-card rounded-xl p-6 border shadow-sm mt-4">
            <div className="flex items-center gap-4 mb-6">
              <UserCircle size={48} className="text-primary" />
              <div>
                <h2 className="font-semibold text-xl">User Profile</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 overflow-hidden">
              <pre className="text-xs font-mono max-h-48 overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
