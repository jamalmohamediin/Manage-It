import React, { useEffect, useState } from 'react';
import { Task } from '../types';
import { getTasks } from '../firebase/tasks';
import { useBusinessId } from '../hooks/useBusinessId';
import localforage from 'localforage';

const LOCAL_KEY_PREFIX = "tasks_cache_"; // Unique per business

const TaskList: React.FC = () => {
  const businessId = useBusinessId();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Load tasks from local cache first (for instant/offline display)
  useEffect(() => {
    if (!businessId) return;
    const key = LOCAL_KEY_PREFIX + businessId;
    localforage.getItem<Task[]>(key).then((cached) => {
      if (cached && Array.isArray(cached)) {
        setTasks(cached);
      }
      setLoading(false);
    });
  }, [businessId]);

  // Then fetch from Firestore and update cache
  useEffect(() => {
    if (!businessId) return;
    setLoading(true);
    getTasks(businessId)
      .then((remoteTasks) => {
        setTasks(remoteTasks);
        // Save latest to cache
        const key = LOCAL_KEY_PREFIX + businessId;
        localforage.setItem(key, remoteTasks);
      })
      .catch(() => {
        // If Firestore fails (offline), just keep local cache
      })
      .finally(() => setLoading(false));
  }, [businessId]);

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold text-[#3b2615]">Task List</h2>
      <div className="mt-4 overflow-x-auto">
        {loading ? (
          <div className="py-8 text-center text-gray-400">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="py-8 text-center text-gray-400">No tasks found.</div>
        ) : (
          <table className="min-w-full border-collapse table-auto">
            <thead>
              <tr className="bg-[#f5f5f5] text-[#3b2615]">
                <th className="px-4 py-2 border">Title</th>
                <th className="px-4 py-2 border">Description</th>
                <th className="px-4 py-2 border">Assigned To</th>
                <th className="px-4 py-2 border">Due Date</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-[#f9f9f9]">
                  <td className="px-4 py-2 border">{task.title}</td>
                  <td className="px-4 py-2 border">{task.description || '-'}</td>
                  <td className="px-4 py-2 border">{task.assignedTo || '-'}</td>
                  <td className="px-4 py-2 border">{task.dueDate || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TaskList;
