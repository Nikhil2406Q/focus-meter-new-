import DashboardNavbar from "@/components/dashboard-navbar";
import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/server";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { UserCircle, Mail, User, Star } from "lucide-react";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Get user's name from metadata or email
  const userName =
    user.user_metadata?.full_name || user.email?.split("@")[0] || "User";

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-background min-h-screen">
        <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
          {/* Header Section */}
          <header className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account preferences
            </p>
          </header>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <div className="bg-card rounded-xl p-6 border shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <UserCircle size={48} className="text-primary" />
                  <div>
                    <h2 className="font-semibold text-xl">{userName}</h2>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                    <User size={16} />
                    <span>Account</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-md cursor-not-allowed">
                    <Star size={16} />
                    <span>Pro Features</span>
                    <span className="ml-auto text-xs bg-muted px-2 py-1 rounded">
                      Coming Soon
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="md:col-span-2">
              <div className="bg-card rounded-xl p-6 border shadow-sm">
                <h2 className="text-xl font-semibold mb-6">Account Settings</h2>

                {/* Profile Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4">Profile</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Full Name
                        </label>
                        <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/20">
                          <User size={16} className="text-muted-foreground" />
                          <span>
                            {user.user_metadata?.full_name || "Not set"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Email
                        </label>
                        <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/20">
                          <Mail size={16} className="text-muted-foreground" />
                          <span>{user.email}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Appearance Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4">Appearance</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Theme</p>
                      <p className="text-sm text-muted-foreground">
                        Select your preferred theme
                      </p>
                    </div>
                    <ThemeSwitcher />
                  </div>
                </div>

                {/* Pro Features Section */}
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-4">Pro Features</h3>
                  <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/30 dark:to-green-950/30 rounded-lg p-6 border border-blue-100 dark:border-blue-900">
                    <h4 className="text-lg font-semibold mb-2">
                      Upgrade to FocusMeter Pro
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Get access to advanced features like data export,
                      unlimited history, and more.
                    </p>
                    <div className="flex items-center gap-2">
                      <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md opacity-50 cursor-not-allowed">
                        Coming Soon
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
