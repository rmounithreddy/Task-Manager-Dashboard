import { useEffect, useState } from "react";
import { getTasks, deleteTask } from "../api/taskApi";
import TaskModal from "../components/TaskModal";

export default function TaskPage() {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const loadTasks = async () => {
    try {
      const res = await getTasks(page, search);
      setTasks(res.data.data);
      setTotal(res.data.total);
    } catch (err) {
      console.error("Error loading tasks:", err);
      alert("Failed to load tasks.");
    }
  };

  useEffect(() => {
    loadTasks();
  }, [page, search]);

  const openCreateModal = () => {
    setEditingTask(null);
    setShowModal(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteTask(id);
      await loadTasks();
    } catch (err) {
      console.error("Error deleting task:", err);
      alert("Failed to delete task.");
    }
  };

  const totalPages = Math.ceil(total / 5) || 1;

  return (
    <div className="space-y-4">
      {/* Tabs + header row */}
      <div className="flex items-center justify-between">
        <div className="inline-flex rounded-full bg-slate-900 border border-slate-800 p-1">
          <button className="px-4 py-1 text-xs rounded-full bg-slate-800 text-slate-100">
            Tasks
          </button>
          <button className="px-4 py-1 text-xs rounded-full text-slate-400 hover:text-slate-100">
            Audit Logs
          </button>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-sm font-medium text-white shadow-sm"
        >
          <span>＋</span>
          <span>Create Task</span>
        </button>
      </div>

      {/* Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {/* Search */}
        <div className="p-4 border-b border-slate-800">
          <input
            type="text"
            placeholder="Search by title or description"
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-slate-900/70 text-slate-400 text-xs uppercase tracking-wide">
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-left">Created At</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {tasks.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-slate-500"
                  >
                    No tasks found.
                  </td>
                </tr>
              )}

              {tasks.map((t) => (
                <tr
                  key={t.id}
                  className="hover:bg-slate-900/80 transition-colors"
                >
                  <td className="px-4 py-3 text-slate-300">
                    #{String(t.id).padStart(4, "0")}
                  </td>
                  <td className="px-4 py-3 text-slate-100">{t.title}</td>
                  <td className="px-4 py-3 text-slate-400 max-w-md">
                    {t.description}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {new Date(t.created_at).toISOString().split("T")[0]}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                    <button
                      className="inline-flex px-3 py-1 text-xs rounded-full bg-slate-800 text-slate-100 hover:bg-slate-700"
                      onClick={() => openEditModal(t)}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="inline-flex px-3 py-1 text-xs rounded-full bg-red-500 hover:bg-red-600 text-white"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer / pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800 text-xs text-slate-400">
          <span>
            Showing {Math.min(5, tasks.length)} of {total} tasks
          </span>
          <div className="inline-flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className={`px-3 py-1 rounded-full border border-slate-700 ${
                page === 1
                  ? "text-slate-600 cursor-not-allowed"
                  : "text-slate-200 hover:bg-slate-800"
              }`}
            >
              Prev
            </button>
            <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-100">
              Page {page}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className={`px-3 py-1 rounded-full border border-slate-700 ${
                page === totalPages
                  ? "text-slate-600 cursor-not-allowed"
                  : "text-slate-200 hover:bg-slate-800"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <TaskModal
          onClose={() => setShowModal(false)}
          reload={loadTasks}
          task={editingTask}
        />
      )}
    </div>
  );
}
