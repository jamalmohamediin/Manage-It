// src/components/TaskList.tsx
import React, { useEffect, useState } from 'react';
import localforage from 'localforage';
import { getTasks, deleteTask } from '../firebase/tasks';
import { Task } from '../types';
import FileUploader from './FileUploader';
import { useBusinessId } from '../hooks/useBusinessId';
import { toast } from 'react-hot-toast';

const TASKS_CACHE_KEY = 'cachedTasks';

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [online, setOnline] = useState(navigator.onLine);
  const [loading, setLoading] = useState(true);
  const businessId = useBusinessId();
  const role = 'Doctor';

  useEffect(() => {
    const updateStatus = () => setOnline(navigator.onLine);
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  useEffect(() => {
    const loadTasks = async () => {
      if (online) {
        try {
          const fetched = await getTasks(businessId);
          setTasks(fetched);
          await localforage.setItem(TASKS_CACHE_KEY, fetched);
        } catch (err) {
          toast.error('Failed to fetch tasks online. Using cached data.');
          const cached = await localforage.getItem<Task[]>(TASKS_CACHE_KEY);
          if (cached) setTasks(cached);
        } finally {
          setLoading(false);
        }
      } else {
        const cached = await localforage.getItem<Task[]>(TASKS_CACHE_KEY);
        if (cached) setTasks(cached);
        setLoading(false);
      }
    };

    loadTasks();
  }, [online, businessId]);

  // Fixed: Remove the second parameter (businessId) from deleteTask call
  const handleRemove = async (id: string | undefined) => {
    if (!id) return;
    try {
      await deleteTask(id); // Only pass the taskId
      const updated = tasks.filter((t) => t.id !== id);
      setTasks(updated);
      await localforage.setItem(TASKS_CACHE_KEY, updated);
      toast.success('Task removed');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  if (loading) return <p>Loading tasks...</p>;

  return (
    <div>
      <h2 className="text-xl font-bold text-[#3b2615] mb-4">
        Task List {online ? '(Online)' : '(Offline)'}
      </h2>
      {tasks.length === 0 ? (
        <p className="text-gray-500">No tasks available.</p>
      ) : (
        <ul className="space-y-4">
          {tasks.map((task) => (
            <li key={task.id} className="p-4 bg-white border rounded shadow">
              <p><strong>{task.title}</strong></p>
              <p>{task.description}</p>
              <FileUploader
                userId={task.id ?? ''}
                role={role}
                businessId={businessId}
                context="task"
              />
              <button
                onClick={() => handleRemove(task.id)}
                className="mt-2 text-red-600 hover:underline"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskList;