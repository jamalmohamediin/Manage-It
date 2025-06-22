// src/components/TaskList.tsx
import React, { useEffect, useState } from 'react';
import { Task } from '../types';
import { getTasks, updateTask } from '../firebase/tasks';
import { useBusinessId } from '../hooks/useBusinessId';
import localforage from 'localforage';
import FileUploaderModal from './FileUploaderModal';
import { useUserContext } from '../contexts/UserContext';
import { toast } from 'react-hot-toast';

const LOCAL_KEY_PREFIX = "tasks_cache_";

const TaskList: React.FC = () => {
  const businessId = useBusinessId();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const { userId, users } = useUserContext();
  const uploaderName = users.find((u) => u.id === userId)?.name || "Unknown";

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

  useEffect(() => {
    if (!businessId) return;
    setLoading(true);
    getTasks(businessId)
      .then((data) => {
        if (!data || data.length === 0) {
          const dummyTasks: Task[] = [
            {
              id: 'task-1',
              title: 'Prepare onboarding for Bob The Builder',
              assignedTo: 'Admin',
              notes: 'Send welcome package and schedule orientation.',
              status: 'in progress' as Task['status'],
              businessId,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: 'task-2',
              title: 'Finalize Q3 budget report for Naim Investments',
              assignedTo: 'Admin',
              notes: 'Needs to be sent to finance by EOD Friday.',
              status: 'pending' as Task['status'],
              businessId,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: 'task-3',
              title: 'Review new job description for Marketing Lead',
              assignedTo: 'Admin',
              notes: 'Final review before posting.',
              status: 'done' as Task['status'],
              businessId,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ];
          setTasks(dummyTasks);
          localforage.setItem(LOCAL_KEY_PREFIX + businessId, dummyTasks);
        } else {
          setTasks(data);
          localforage.setItem(LOCAL_KEY_PREFIX + businessId, data);
        }
      })
      .finally(() => setLoading(false));
  }, [businessId]);

  const openModal = (taskId: string) => {
    setSelectedTaskId(taskId);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedTaskId(null);
  };

  const getStatusStyles = (status: Task['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-200 text-gray-800 border-gray-300';
      case 'in progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'done':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    if (!businessId) return;

    try {
      await updateTask(taskId, { status: newStatus }, businessId);
      const updated = tasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      );
      setTasks(updated);
      localforage.setItem(LOCAL_KEY_PREFIX + businessId, updated);
      toast.success('Status updated successfully');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold text-brown-700">Task List</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="mt-4 space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-start justify-between p-4 border rounded-lg shadow-sm bg-gray-50"
            >
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-brown-700">{task.title}</h3>
                <p className="mb-1 text-sm text-gray-600">Assigned To: {task.assignedTo || '—'}</p>
                <p className="mb-1 text-sm text-gray-600">Note: {task.notes || '—'}</p>
              </div>
              <div className="flex-shrink-0 ml-4">
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id!, e.target.value as Task['status'])}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border cursor-pointer appearance-none min-w-[120px] text-center ${getStatusStyles(task.status)}`}
                  style={{
                    backgroundImage:
                      `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 8px center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '16px',
                    paddingRight: '32px',
                  }}
                >
                  <option value="pending">Pending</option>
                  <option value="in progress">In Progress</option>
                  <option value="done">Done</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
      {modalOpen && selectedTaskId && businessId && (
        <FileUploaderModal
          itemId={selectedTaskId}
          businessId={businessId}
          context="tasks"
          open={modalOpen}
          onClose={closeModal}
          userId={userId}
          uploaderName={uploaderName}
        />
      )}
    </div>
  );
};

export default TaskList;
