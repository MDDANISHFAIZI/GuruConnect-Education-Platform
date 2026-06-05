import Notification from '../models/Notification.js';

// @desc    Get all notifications for logged-in user
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50); // Get recent 50 notifications
    res.json(notifications);
  } catch (error) {
    console.error('[GET NOTIFICATIONS ERROR]', error);
    res.status(500).json({ message: { en: 'Server error retrieving notifications', hi: 'सूचनाएं प्राप्त करने में सर्वर त्रुटि' } });
  }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/read/:id
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { read: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: { en: 'Notification not found', hi: 'सूचना नहीं मिली' } });
    }
    res.json(notification);
  } catch (error) {
    console.error('[MARK READ ERROR]', error);
    res.status(500).json({ message: { en: 'Server error updating notification', hi: 'सूचना को अपडेट करने में सर्वर त्रुटि' } });
  }
};

// @desc    Mark all notifications for logged-in user as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { read: true }
    );
    res.json({ success: true, message: { en: 'All notifications marked as read', hi: 'सभी सूचनाओं को पढ़ा गया चिह्नित किया गया' } });
  } catch (error) {
    console.error('[MARK ALL READ ERROR]', error);
    res.status(500).json({ message: { en: 'Server error updating notifications', hi: 'सूचनाओं को अपडेट करने में सर्वर त्रुटि' } });
  }
};
