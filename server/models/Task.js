import mongoose from 'mongoose';
import { createAdapter } from './dbAdapter.js';

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedDate: { type: Date, default: Date.now },
  dueDate: { type: String, required: true }, // Format: YYYY-MM-DD
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  status: { 
    type: String, 
    enum: ['Pending', 'In Progress', 'Submitted', 'Completed'], 
    default: 'Pending' 
  },
  createdAt: { type: Date, default: Date.now }
});

const MongooseTask = mongoose.models.Task || mongoose.model('Task', taskSchema);
export const Task = createAdapter('tasks', MongooseTask);
export default Task;
