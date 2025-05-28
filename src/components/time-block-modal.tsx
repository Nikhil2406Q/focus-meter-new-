"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Plus } from "lucide-react";

interface TimeBlockModalProps {
  onSave?: (data: {
    startTime: string;
    endTime: string;
    category: string;
    notes: string;
  }) => void;
}

export default function TimeBlockModal({
  onSave = () => {},
}: TimeBlockModalProps) {
  const [open, setOpen] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const validateForm = () => {
    if (!startTime) {
      setError("Start time is required");
      return false;
    }
    if (!endTime) {
      setError("End time is required");
      return false;
    }
    if (!category) {
      setError("Category is required");
      return false;
    }

    try {
      // Convert times to comparable format
      const [startHours, startMinutes] = startTime.split(":").map(Number);
      const [endHours, endMinutes] = endTime.split(":").map(Number);

      if (
        isNaN(startHours) ||
        isNaN(startMinutes) ||
        isNaN(endHours) ||
        isNaN(endMinutes)
      ) {
        setError("Invalid time format");
        return false;
      }

      const startDate = new Date();
      startDate.setHours(startHours, startMinutes, 0, 0);

      const endDate = new Date();
      endDate.setHours(endHours, endMinutes, 0, 0);

      // If end time is earlier than start time, assume it's for the next day
      if (endDate < startDate) {
        endDate.setDate(endDate.getDate() + 1);
      }

      setError(null);
      return true;
    } catch (error) {
      setError("Invalid time format");
      return false;
    }
  };

  const handleSave = () => {
    if (!validateForm()) return;

    onSave({
      startTime,
      endTime,
      category,
      notes,
    });
    setOpen(false);
    // Reset form
    setStartTime("");
    setEndTime("");
    setCategory("");
    setNotes("");
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full flex items-center justify-center gap-2 border-dashed"
        >
          <Plus className="h-4 w-4" /> Add Time Block
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Time Block</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {error && (
            <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded-md">
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="start-time">Start Time</Label>
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="end-time">End Time</Label>
              <Input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="deep work">Deep Work</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="break">Break</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="exercise">Exercise</SelectItem>
                <SelectItem value="study">Study</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
