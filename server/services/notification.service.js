import Notification from '../models/notification.model.js';
import User from '../models/user.model.js';

export const createNotification = async (userId, type, data) => {
  const notification = new Notification({
    user: userId,
    type,
    data,
    read: false
  });
  
  await notification.save();
  
  // Real-time push would happen here
  return notification;
};

export const getUnreadNotifications = async (userId) => {
  return Notification.find({ user: userId, read: false })
    .sort({ createdAt: -1 })
    .limit(20);
};

export const markAsRead = async (notificationId) => {
  await Notification.findByIdAndUpdate(notificationId, { read: true });
};

// Automated notification triggers
export const notifyEvents = {
  TRANSACTION: (userId, amount, currency) => createNotification(
    userId,
    'transaction',
    { message: `You received ${amount} ${currency}` }
  ),
  
  MINING: (userId, amount) => createNotification(
    userId,
    'mining',
    { message: `You earned ${amount} MZLx from mining` }
  ),
  
  ESCROW: (userId, status) => createNotification(
    userId,
    'escrow',
    { message: `Escrow ${status}` }
  )
};
