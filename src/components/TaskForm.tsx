import React, { useState } from 'react';
import { addTask } from '../firebase/tasks';
import { toast } from 'react-hot-toast';

const TaskForm: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addTask({ title, description });
      toast.success('Task added!');
      setTitle('');
      setDescription('');
    } catch (err) {
      console.error(err);
      toast.error('Failed to add task');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 space-y-4">
      <h2 className="text-xl font-bold text-[#3b2615]">Create Task</h2>
      <div className="grid grid-cols-2 gap-4">
        <input placeholder="Task Title" value={title} onChange={(e) => setTitle(e.target.value)} className="p-2 border rounded" />
        <input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="p-2 border rounded" />
      </div>
      <button type="submit" className="px-4 py-2 bg-[#5c3a21] text-white rounded hover:bg-[#3b2615]">
        Save Task
      </button>
    </form>
  );
};

export default TaskForm;
