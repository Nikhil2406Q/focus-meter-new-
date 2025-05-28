"use client";

import { useState, useEffect } from "react";
import { Edit2, Trash2 } from "lucide-react";
import TimeBlockModal from "./time-block-modal";
import { createClient } from "../../supabase/client";

export interface TimeBlock {
  id: string;
  startTime: string;
  endTime: string;
  category: string;
  notes?: string;
}

interface TimeBlockListProps {
  initialBlocks?: TimeBlock[];
}

export default function TimeBlockList({
  initialBlocks = [],
}: TimeBlockListProps) {
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>(initialBlocks);
  const supabase = createClient();

  useEffect(() => {
    setTimeBlocks(initialBlocks);
  }, [initialBlocks]);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Work: "bg-blue-100 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700",
      Meeting:
        "bg-purple-100 border-purple-300 dark:bg-purple-900/30 dark:border-purple-700",
      "Deep Work":
        "bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-700",
      Lunch:
        "bg-yellow-100 border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-700",
      Break:
        "bg-orange-100 border-orange-300 dark:bg-orange-900/30 dark:border-orange-700",
      Personal:
        "bg-pink-100 border-pink-300 dark:bg-pink-900/30 dark:border-pink-700",
      Exercise:
        "bg-teal-100 border-teal-300 dark:bg-teal-900/30 dark:border-teal-700",
      Study:
        "bg-indigo-100 border-indigo-300 dark:bg-indigo-900/30 dark:border-indigo-700",
    };

    return (
      colors[category] ||
      "bg-gray-100 border-gray-300 dark:bg-gray-800/50 dark:border-gray-700"
    );
  };

  const handleAddTimeBlock = async (data: {
    startTime: string;
    endTime: string;
    category: string;
    notes: string;
  }) => {
    try {
      // Format the times to ISO strings
      const today = new Date();
      const [startHours, startMinutes] = data.startTime.split(":").map(Number);
      const [endHours, endMinutes] = data.endTime.split(":").map(Number);

      const startDate = new Date(today);
      startDate.setHours(startHours, startMinutes, 0, 0);

      const endDate = new Date(today);
      endDate.setHours(endHours, endMinutes, 0, 0);

      // If end time is earlier than start time, assume it's for the next day
      if (endDate < startDate) {
        endDate.setDate(endDate.getDate() + 1);
      }

      // Format category (capitalize first letter)
      const formattedCategory =
        data.category.charAt(0).toUpperCase() + data.category.slice(1);

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.error("User not authenticated");
        return;
      }

      // Insert into Supabase
      const { data: newBlock, error } = await supabase
        .from("time_blocks")
        .insert({
          user_id: user.id,
          start_time: startDate.toISOString(),
          end_time: endDate.toISOString(),
          category: formattedCategory,
          notes: data.notes || null,
        })
        .select()
        .single();

      if (error) {
        console.error("Error adding time block:", error);
        return;
      }

      // Add to local state
      const newTimeBlock: TimeBlock = {
        id: newBlock.id,
        startTime: new Date(newBlock.start_time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        endTime: new Date(newBlock.end_time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        category: newBlock.category,
        notes: newBlock.notes || "",
      };

      setTimeBlocks([...timeBlocks, newTimeBlock]);
    } catch (error) {
      console.error("Error in handleAddTimeBlock:", error);
    }
  };

  const handleDeleteBlock = async (id: string) => {
    try {
      const { error } = await supabase
        .from("time_blocks")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting time block:", error);
        return;
      }

      setTimeBlocks(timeBlocks.filter((block) => block.id !== id));
    } catch (error) {
      console.error("Error in handleDeleteBlock:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4 mb-6">
        {timeBlocks.length > 0 ? (
          timeBlocks.map((block) => (
            <div
              key={block.id}
              className={`p-3 rounded-lg border-l-4 ${getCategoryColor(block.category)} relative group`}
            >
              <div className="font-medium">
                {block.startTime} - {block.endTime}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {block.category}
              </div>
              {block.notes && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {block.notes}
                </div>
              )}

              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  className="p-1 text-gray-400 hover:text-red-500"
                  onClick={() => handleDeleteBlock(block.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No time blocks recorded today.</p>
            <p className="text-sm mt-1">Add your first time block below.</p>
          </div>
        )}
      </div>

      <TimeBlockModal onSave={handleAddTimeBlock} />
    </div>
  );
}
