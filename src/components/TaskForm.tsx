import React, { useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import { addTask } from '../firebase/tasks';
import { toast } from 'react-hot-toast';
import { useBusinesses } from '../hooks/useBusinesses';

// ✅ Define valid task statuses
type TaskStatus = 'Pending' | 'Done' | 'Delayed' | 'Cancelled';

const TaskForm: React.FC = () => {
  const { businesses } = useBusinesses();

  const [form, setForm] = useState({
    taskTitle: '',
    description: '',
    assignedTo: '',
    dueDate: '',
    notes: '',
    businessId: '',
    shopId: '',
    status: 'Pending' as TaskStatus,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addTask({
        ...form,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      toast.success('Task added!');
      setForm({
        taskTitle: '',
        description: '',
        assignedTo: '',
        dueDate: '',
        notes: '',
        businessId: '',
        shopId: '',
        status: 'Pending',
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to add task');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 space-y-4">
      <h2 className="text-xl font-bold text-[#3b2615]">Create Task</h2>

      <input
        type="text"
        placeholder="Task Title"
        value={form.taskTitle}
        onChange={(e) => setForm({ ...form, taskTitle: e.target.value })}
        className="w-full px-3 py-2 border rounded"
        required
      />

      <textarea
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        className="w-full px-3 py-2 border rounded"
      />

      <input
        type="text"
        placeholder="Assigned To (User ID)"
        value={form.assignedTo}
        onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
        className="w-full px-3 py-2 border rounded"
      />

      <input
        type="date"
        value={form.dueDate}
        onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
        className="w-full px-3 py-2 border rounded"
      />

      <select
        value={form.businessId}
        onChange={(e) => setForm({ ...form, businessId: e.target.value })}
        className="w-full px-3 py-2 border rounded"
        required
      >
        <option value="">Select Business</option>
        {businesses.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Shop ID"
        value={form.shopId}
        onChange={(e) => setForm({ ...form, shopId: e.target.value })}
        className="w-full px-3 py-2 border rounded"
      />

      <textarea
        placeholder="Notes (Optional)"
        value={form.notes}
        onChange={(e) => setForm({ ...form, notes: e.target.value })}
        className="w-full px-3 py-2 border rounded"
      />

      <select
        value={form.status}
        onChange={(e) => setForm({ ...form, status: e.target.value as TaskStatus })}
        className="w-full px-3 py-2 border rounded"
        required
      >
        <option value="Pending">Pending</option>
        <option value="Done">Done</option>
        <option value="Delayed">Delayed</option>
        <option value="Cancelled">Cancelled</option>
      </select>

      <button
        type="submit"
        className="bg-[#5c3a21] text-white px-6 py-2 rounded hover:bg-[#3b2615]"
      >
        Create Task
      </button>
    </form>
  );
};

export default TaskForm;
