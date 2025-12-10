
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TaskForm } from "./task-form";

export function CreateTaskDialog({ isOpen, onOpenChange, onTaskCreate, onTaskUpdate, task }) {

  const handleSubmit = (data) => {
    if (task) {
      onTaskUpdate(data);
    } else {
      onTaskCreate(data);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Create New Task'}</DialogTitle>
        </DialogHeader>
        <TaskForm 
          onSubmit={handleSubmit} 
          task={task} 
        />
      </DialogContent>
    </Dialog>
  );
}
