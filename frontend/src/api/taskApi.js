import api from "./api";

export const getTasks = (page = 1, search = "") =>
  api.get(`/api/tasks?page=${page}&limit=5&search=${search}`);

export const createTask = (task) => api.post("/api/tasks", task);

export const deleteTask = (id) => api.delete(`/api/tasks/${id}`);

export const updateTask = (id, task) => api.put(`/api/tasks/${id}`, task);

export const getLogs = () => api.get("/api/logs");
