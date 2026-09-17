import { Mentor } from '../models/mentor.model.js';
import { MentorBooking } from '../models/mentorBooking.model.js';
import { PracticeStreak } from '../models/streak.model.js';
import { ApiError } from '../utils/ApiError.js';

export const listMentors = async () => {
  return await Mentor.find({ isActive: true }).select('-slots.isBooked');
};

export const getMentorSlots = async (mentorId) => {
  const mentor = await Mentor.findById(mentorId);
  if (!mentor) {
    throw new ApiError(404, 'Mentor not found');
  }

  const availableSlots = mentor.slots.filter((s) => !s.isBooked && new Date(s.startTime) > new Date());
  return {
    mentor: {
      _id: mentor._id,
      name: mentor.name,
      rankInfo: mentor.rankInfo,
      college: mentor.college,
      avatar: mentor.avatar,
      hourlyRate: mentor.hourlyRate,
    },
    slots: availableSlots,
  };
};

export const bookMentorSession = async (userId, { mentorId, slotId, paymentType = 'paid' }) => {
  const mentor = await Mentor.findById(mentorId);
  if (!mentor) {
    throw new ApiError(404, 'Mentor not found');
  }

  const slot = mentor.slots.id(slotId);
  if (!slot || slot.isBooked) {
    throw new ApiError(400, 'Slot is invalid or already booked');
  }

  let streak = await PracticeStreak.findOne({ userId });
  if (paymentType === 'free_streak_credit') {
    if (!streak || !streak.hasFreeMentorSessionCredit) {
      throw new ApiError(400, 'You do not have a free streak session credit available');
    }
    streak.hasFreeMentorSessionCredit = false;
    await streak.save();
  }

  slot.isBooked = true;
  await mentor.save();

  const booking = await MentorBooking.create({
    userId,
    mentorId,
    slotId,
    paymentType,
    status: 'confirmed',
  });

  return {
    bookingId: booking._id,
    mentor: { name: mentor.name, rankInfo: mentor.rankInfo },
    slot: { startTime: slot.startTime, endTime: slot.endTime },
    paymentType,
    meetingLink: booking.meetingLink,
  };
};

export const getUserStreak = async (userId) => {
  let streak = await PracticeStreak.findOne({ userId });
  if (!streak) {
    streak = await PracticeStreak.create({ userId, currentStreakDays: 0, todayMcqCount: 0 });
  }
  return streak;
};

export const recordMcqPractice = async (userId, count = 1) => {
  const today = new Date().toISOString().split('T')[0];
  let streak = await PracticeStreak.findOne({ userId });

  if (!streak) {
    streak = new PracticeStreak({ userId, currentStreakDays: 1, lastPracticedDate: today, todayMcqCount: count });
  } else {
    if (streak.lastPracticedDate === today) {
      streak.todayMcqCount += count;
    } else {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (streak.lastPracticedDate === yesterday && streak.todayMcqCount >= 20) {
        streak.currentStreakDays += 1;
      } else {
        streak.currentStreakDays = 1;
      }
      streak.lastPracticedDate = today;
      streak.todayMcqCount = count;
    }
  }

  if (streak.currentStreakDays >= 7 && !streak.hasFreeMentorSessionCredit) {
    streak.hasFreeMentorSessionCredit = true;
    streak.freeSessionEarnedAt = new Date();
  }

  await streak.save();
  return streak;
};

// Admin Methods
export const createAdminMentor = async (data) => {
  return await Mentor.create(data);
};

export const addMentorSlots = async (mentorId, slotsArray) => {
  const mentor = await Mentor.findById(mentorId);
  if (!mentor) {
    throw new ApiError(404, 'Mentor not found');
  }
  mentor.slots.push(...slotsArray);
  await mentor.save();
  return mentor;
};
