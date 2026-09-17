import { AarambhPulse } from '../models/aarambhPulse.model.js';
import { ApiError } from '../utils/ApiError.js';

export const getTodayAarambhPulse = async () => {
  const today = new Date().toISOString().split('T')[0];
  let pulse = await AarambhPulse.findOne({ date: today, isActive: true });

  if (!pulse) {
    pulse = await AarambhPulse.findOne({ isActive: true }).sort({ date: -1 });
  }

  if (!pulse) {
    throw new ApiError(404, 'No active Aarambh Pulse workout available for today');
  }

  return pulse;
};

// Admin Methods
export const createAdminAarambhPulse = async (data) => {
  const existing = await AarambhPulse.findOne({ date: data.date });
  if (existing) {
    throw new ApiError(409, `Aarambh Pulse for date ${data.date} already exists`);
  }
  return await AarambhPulse.create(data);
};
