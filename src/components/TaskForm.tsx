import React, { useState } from 'react';
import { addTask } from '../firebase/tasks';
import { useBusinessId } from '../hooks/useBusinessId';
import { toast } from 'react-hot-toast';

const TaskForm: React.FC = () => {
  const businessId = useBusinessId();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<'pending' | 'in progress' | 'done'>('pending');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return toast.error('Please select a business first');
    setSubmitting(true);
    try {
      const uploadedBy = 'user-id'; // Replace with actual user ID
      const uploadedAt = new Date(); // Set current date as uploadedAt
      await addTask({ title, description, assignedTo, dueDate, status, notes, businessId }, businessId, uploadedBy, uploadedAt);
      toast.success('Task created!');
      setTitle('');
      setDescription('');
      setAssignedTo('');
      setDueDate('');
      setStatus('pending');
      setNotes('');
    } catch (err) {
      console.error(err);
      toast.error('Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold text-[#3b2615]">New Task</h2>
      <input
        type="text"
        placeholder="Task Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full p-2 border rounded"
        rows={3}
      />
      <input
        type="text"
        placeholder="Assigned To"
        value={assignedTo}
        onChange={(e) => setAssignedTo(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        className="w-full p-2 border rounded"
      />
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as 'pending' | 'in progress' | 'done')}
        className="w-full p-2 border rounded"
      >
        <option value="pending">Pending</option>
        <option value="in progress">In Progress</option>
        <option value="done">Done</option>
      </select>
      <textarea
        placeholder="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full p-2 border rounded"
        rows={3}
      />
      <button
        type="submit"
        disabled={submitting}
        className="px-6 py-2 text-white bg-[#5c3a21] rounded hover:bg-[#3b2615] disabled:opacity-50"
      >
        {submitting ? 'Saving...' : 'Save Task'}
      </button>
    </form>
  );
};

export default TaskForm;
