import { useEffect, useState } from "react";
import { getLogs } from "../api/taskApi";

export default function LogsPage() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const res = await getLogs();
      setLogs(res.data);
    } catch (error) {
      console.error("Error loading logs:", error);
      alert("Failed to load logs.");
    }
  };

  const badgeClasses = (action) => {
    if (action.includes("Create")) return "bg-emerald-500/15 text-emerald-300";
    if (action.includes("Update")) return "bg-yellow-500/15 text-yellow-300";
    return "bg-red-500/15 text-red-300";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Audit Logs</h3>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-slate-900/70 text-slate-400 text-xs uppercase tracking-wide">
                <th className="px-4 py-3 text-left">Timestamp</th>
                <th className="px-4 py-3 text-left">Action</th>
                <th className="px-4 py-3 text-left">Task ID</th>
                <th className="px-4 py-3 text-left">Updated Content</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {logs.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-slate-500"
                  >
                    No logs yet.
                  </td>
                </tr>
              )}

              {logs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-slate-900/80 transition-colors"
                >
                  <td className="px-4 py-3 text-slate-300">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${badgeClasses(
                        log.action
                      )}`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    #{String(log.task_id).padStart(4, "0")}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {log.updated_content ? (
                      <div className="space-y-1 text-xs">
                        {Object.entries(log.updated_content).map(
                          ([key, value]) => (
                            <div key={key}>
                              <span className="text-slate-500 mr-1">
                                {key}:
                              </span>
                              <span className="text-slate-100">{value}</span>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
