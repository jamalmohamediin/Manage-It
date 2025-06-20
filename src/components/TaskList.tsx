import React, { useEffect, useState, useContext } from 'react';
import { Task } from '../types';
import { getTasks } from '../firebase/tasks';
import { useBusinessId } from '../hooks/useBusinessId';
import localforage from 'localforage';
import FileUploaderModal from './FileUploaderModal';
import { UserContext } from '../contexts/UserContext';

const LOCAL_KEY_PREFIX = "tasks_cache_";

const TaskList: React.FC = () => {
  const businessId = useBusinessId();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const { userId, users } = useContext(UserContext);
  const uploaderName = users.find(u => u.id === userId)?.name || "Unknown";
  const userRole = users.find(u => u.id === userId)?.role || "guest"; // Get the user's role

  // Load from local cache first
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

  // Then load from Firestore
  useEffect(() => {
    if (!businessId) return;
    setLoading(true);
    getTasks(businessId)
      .then((data) => {
        setTasks(data);
        const key = LOCAL_KEY_PREFIX + businessId;
        localforage.setItem(key, data);
      })
      .catch(() => {})
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

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold text-[#3b2615]">Task List</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full border-collapse table-auto">
            <thead>
              <tr className="bg-[#f5f5f5] text-[#3b2615]">
                <th className="px-4 py-2 border">Title</th>
                <th className="px-4 py-2 border">Description</th>
                <th className="px-4 py-2 border">Assigned To</th>
                <th className="px-4 py-2 border">Due Date</th>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border">Notes</th>
                <th className="px-4 py-2 border">Files</th>
                {/* Conditional Column: Admins and Doctors can see the "Actions" button */}
                {(userRole === 'admin' || userRole === 'doctor') && (
                  <th className="px-4 py-2 border">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-[#f9f9f9]">
                  <td className="px-4 py-2 border">{task.title}</td>
                  <td className="px-4 py-2 border">{task.description || '-'}</td>
                  <td className="px-4 py-2 border">{task.assignedTo || '-'}</td>
                  <td className="px-4 py-2 border">{task.dueDate || '-'}</td>
                  <td className="px-4 py-2 border">{task.status || '—'}</td>
                  <td className="px-4 py-2 border">{task.notes || '—'}</td>
                  <td className="px-4 py-2 border">
                    <button
                      className="px-2 py-1 text-xs rounded bg-brown-200 hover:bg-brown-300"
                      onClick={() => openModal(task.id!)}
                    >
                      📎 Upload/View
                    </button>
                  </td>
                  {/* Show "Actions" button only for Admins and Doctors */}
                  {(userRole === 'admin' || userRole === 'doctor') && (
                    <td className="px-4 py-2 border">
                      <button
                        className="text-red-500 hover:underline"
                        onClick={() => console.log('Remove task')}
                      >
                        Remove
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* File Modal */}
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
