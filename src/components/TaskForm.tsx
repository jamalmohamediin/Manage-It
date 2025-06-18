// src/components/TaskForm.tsx
import React, { useState } from 'react';
import { addTask } from '../firebase/tasks';
import { useBusinessId } from '../hooks/useBusinessId';
import { toast } from 'react-hot-toast';

const TaskForm: React.FC = () => {
  const businessId = useBusinessId();
  const [title, setTitle] = useState('');
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addTask({ title }, businessId);
      toast.success('Task added');
      setTitle('');
    } catch {
      toast.error('Error saving task');
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task Title" />
      <button type="submit">Save</button>
    </form>
  );
};
export default TaskForm;
