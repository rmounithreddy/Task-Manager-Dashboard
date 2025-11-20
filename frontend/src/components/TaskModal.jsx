import { useEffect, useState } from "react";
import { createTask, updateTask } from "../api/taskApi";

export default function TaskModal({ onClose, reload, task }) {
  const isEdit = !!task;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (isEdit) {
      setTitle(task.title || "");
      setDescription(task.description || "");
    }
  }, [isEdit, task]);

  const handleSubmit = async () => {
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle || !trimmedDescription) {
      alert("Title and Description must not be empty.");
      return;
    }
    if (trimmedTitle.length > 100) {
      alert("Title must be at most 100 characters.");
      return;
    }
    if (trimmedDescription.length > 500) {
      alert("Description must be at most 500 characters.");
      return;
    }

    try {
      if (isEdit) {
        await updateTask(task.id, {
          title: trimmedTitle,
          description: trimmedDescription,
        });
      } else {
        await createTask({
          title: trimmedTitle,
          description: trimmedDescription,
        });
      }

      await reload();
      onClose();
    } catch (err) {
      console.error("Error saving task:", err);
      alert("Failed to save task. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-4">
          {isEdit ? "Edit Task" : "Create Task"}
        </h2>

        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Title
            </label>
            <input
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter task title"
              value={title}
              maxLength={100}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Description
            </label>
            <textarea
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter task description"
              rows={4}
              value={description}
              maxLength={500}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-full border border-slate-600 text-slate-200 hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm rounded-full bg-blue-500 hover:bg-blue-600 text-white"
          >
            {isEdit ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
