import Notification from '../models/Notification.js';
import Enrollment from '../models/Enrollment.js';

/**
 * Utility to create a single notification for a specific user
 */
export const createNotification = async ({ userId, title, message, type, link }) => {
  try {
    if (!userId) return null;
    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type,
      link: link || ''
    });
    return notification;
  } catch (error) {
    console.error('[Notification helper create error]', error);
    return null;
  }
};

/**
 * Utility to create notifications for all students of a teacher (optionally filtered by class)
 */
export const notifyStudents = async ({ teacherId, className, title, message, type, link }) => {
  try {
    const query = { teacher: teacherId, status: 'active' };
    if (className && className !== 'All') {
      query.class = className;
    }
    const enrollments = await Enrollment.find(query).populate('student');
    
    // Get unique student user IDs
    const studentUserIds = new Set();
    for (const enr of enrollments) {
      if (enr.student && enr.student.user) {
        studentUserIds.add(enr.student.user.toString());
      }
    }

    const notifications = Array.from(studentUserIds).map(userId => ({
      user: userId,
      title,
      message,
      type,
      link: link || ''
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
      console.log(`[BULK NOTIFICATION] Created ${notifications.length} notifications of type ${type}`);
    }
  } catch (error) {
    console.error('[Notification helper notifyStudents error]', error);
  }
};
