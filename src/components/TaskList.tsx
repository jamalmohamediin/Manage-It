// src/components/TaskList.tsx
import React, { useEffect, useState } from 'react';
import { getAllTasks, updateTaskStatus } from '../firebase/tasks';
import { Task } from '../firebase/tasks';
import { toast } from 'react-hot-toast';

const TaskList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await getAllTasks(); // ✅ FIXED
        setTasks(data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        toast.error('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      toast.success('Status updated!');
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-bold text-[#3b2615] mb-4">All Tasks</h2>
        <p>Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-[#3b2615] mb-4">All Tasks</h2>
      {tasks.length === 0 ? (
        <p className="text-gray-600">No tasks found.</p>
      ) : (
        <ul className="space-y-4">
          {tasks.map((task) => (
            <li key={task.id} className="p-4 border rounded shadow bg-white/70">
              <h3 className="font-bold text-[#3b2615]">{task.taskTitle}</h3>
              <p className="mb-2 text-sm text-gray-700">{task.description}</p>
              <div className="grid grid-cols-2 gap-2 mb-2 text-sm">
                <p>Assigned to: <span className="font-medium">{task.assignedTo}</span></p>
                <p>Shop ID: <span className="font-medium">{task.shopId}</span></p>
              </div>
              <p className="mb-3 text-sm">
                Due: <span className="font-medium">{new Date(task.dueDate).toLocaleString()}</span>
              </p>
              {task.notes && (
                <p className="mb-3 text-sm text-gray-600">Notes: {task.notes}</p>
              )}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Status:</label>
                <select
                  value={task.status}
                  onChange={(e) =>
                    handleStatusChange(task.id!, e.target.value as Task['status'])
                  }
                  className="px-3 py-1 text-sm bg-white border rounded"
                >
                  <option value="Pending">Pending</option>
                  <option value="Done">Done</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Delayed">Delayed</option>
                </select>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                Created: {task.createdAt?.toDate().toLocaleString()}
                {task.updatedAt && (
                  <span className="ml-4">
                    Updated: {task.updatedAt.toDate().toLocaleString()}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskList;
