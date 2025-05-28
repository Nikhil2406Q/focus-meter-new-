import Footer from "@/components/footer";
import Hero from "@/components/hero";
import Navbar from "@/components/navbar";
import {
  ArrowUpRight,
  Clock,
  PieChart,
  ListTodo,
  Moon,
  Sun,
  Plus,
} from "lucide-react";
import { createClient } from "../../supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      <Hero />

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Simple Time Tracking</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              FocusMeter helps you track your time with a clean, minimalist
              interface that keeps you focused on what matters.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Clock className="w-6 h-6" />,
                title: "Time Blocks",
                description:
                  "Easily log your daily activities with start and end times",
              },
              {
                icon: <PieChart className="w-6 h-6" />,
                title: "Visual Insights",
                description:
                  "See your time distribution with beautiful pie charts",
              },
              {
                icon: <ListTodo className="w-6 h-6" />,
                title: "Categories",
                description:
                  "Organize your activities by customizable categories",
              },
              {
                icon: <Plus className="w-6 h-6" />,
                title: "Quick Add",
                description:
                  "Add new time blocks in seconds with our simple modal",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-blue-500 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* App Preview Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Today's Activities</h3>
                  <div className="flex space-x-2">
                    <Sun className="w-5 h-5 text-gray-400" />
                    <Moon className="w-5 h-5 text-gray-600" />
                  </div>
                </div>
                <div className="space-y-4 mb-6">
                  {[
                    {
                      time: "8:00 - 9:30",
                      category: "Work",
                      color: "bg-blue-100 border-blue-300",
                    },
                    {
                      time: "9:45 - 10:30",
                      category: "Meeting",
                      color: "bg-purple-100 border-purple-300",
                    },
                    {
                      time: "10:45 - 12:30",
                      category: "Deep Work",
                      color: "bg-green-100 border-green-300",
                    },
                    {
                      time: "13:00 - 14:00",
                      category: "Lunch",
                      color: "bg-yellow-100 border-yellow-300",
                    },
                  ].map((block, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border-l-4 ${block.color}`}
                    >
                      <div className="font-medium">{block.time}</div>
                      <div className="text-sm text-gray-600">
                        {block.category}
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-gray-500 flex items-center justify-center">
                  <Plus className="w-4 h-4 mr-2" /> Add Time Block
                </button>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-3xl font-bold mb-4">
                Clean, Focused Interface
              </h2>
              <p className="text-gray-600 mb-6">
                FocusMeter's minimalist design helps you focus on tracking your
                time without distractions.
              </p>
              <ul className="space-y-3">
                {[
                  "Vertical list of today's time blocks",
                  "Pie chart showing time distribution",
                  "Simple modal for adding new blocks",
                  "Light/Dark mode for comfortable viewing",
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className="mr-3 mt-1">
                      <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Start Tracking Your Time</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join users who are taking control of their time with FocusMeter's
            clean tracking interface.
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Get Started Free
            <ArrowUpRight className="ml-2 w-4 h-4" />
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
