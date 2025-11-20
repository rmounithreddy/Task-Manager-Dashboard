import { useState } from "react";
import TaskPage from "./pages/TaskPage";
import LogsPage from "./pages/LogsPage";

export default function App() {
  const [tab, setTab] = useState("tasks");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="px-6 py-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-blue-500 flex items-center justify-center text-xs font-semibold">
              TM
            </div>
            <div>
              <h1 className="text-lg font-semibold">Task Manager</h1>
              <p className="text-xs text-slate-400">Mini Dashboard</p>
            </div>
          </div>
        </div>

        <nav className="px-3 pt-6 flex-1">
          <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Main
          </p>
          <button
            onClick={() => setTab("tasks")}
            className={`w-full flex items-center rounded-xl px-3 py-2 text-sm mb-1 transition ${
              tab === "tasks"
                ? "bg-slate-800 text-slate-50"
                : "text-slate-400 hover:bg-slate-800/70 hover:text-slate-100"
            }`}
          >
            <span className="mr-2">✅</span>
            <span>Tasks</span>
          </button>
          <button
            onClick={() => setTab("logs")}
            className={`w-full flex items-center rounded-xl px-3 py-2 text-sm transition ${
              tab === "logs"
                ? "bg-slate-800 text-slate-50"
                : "text-slate-400 hover:bg-slate-800/70 hover:text-slate-100"
            }`}
          >
            <span className="mr-2">📝</span>
            <span>Audit Logs</span>
          </button>
        </nav>

        <div className="px-6 py-4 border-t border-slate-800 text-xs text-slate-500">
          <div className="flex items-center justify-between">
            <span>Version</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              v1.0
            </span>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <main className="flex-1 px-8 py-6">
        {/* Top header bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold">
              {tab === "tasks" ? "Tasks" : "Audit Logs"}
            </h2>
            <p className="text-sm text-slate-400">
              Manage tasks and track changes in your system.
            </p>
          </div>
          <div className="text-xs text-slate-500">
            {new Date().toLocaleDateString()}
          </div>
        </div>

        {tab === "tasks" ? <TaskPage /> : <LogsPage />}
      </main>
    </div>
  );
}
