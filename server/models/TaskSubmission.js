import mongoose from 'mongoose';
import { createAdapter } from './dbAdapter.js';

const submissionSchema = new mongoose.Schema({
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  internId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  submissionLink: { type: String, default: '' },
  remarks: { type: String, default: '' },
  submittedAt: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['Submitted', 'Approved', 'Needs Revision'], 
    default: 'Submitted' 
  },
  feedback: { type: String, default: '' }
});

const MongooseSubmission = mongoose.models.TaskSubmission || mongoose.model('TaskSubmission', submissionSchema);
export const TaskSubmission = createAdapter('submissions', MongooseSubmission);
export default TaskSubmission;
