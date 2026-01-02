const Notification = require('../models/Notification');
const User = require('../models/User');

// Generate unique notification ID
const generateNotificationId = () => {
  return `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// ========== EMAIL SERVICE FUNCTIONS ==========

/**
 * Send email notification to user
 * @param {String} userEmail - User's email address
 * @param {String} subject - Email subject
 * @param {String} htmlContent - Email HTML content
 * @param {String} textContent - Email plain text content (optional)
 */
const sendEmail = async (userEmail, subject, htmlContent, textContent = null) => {
  try {
    // TODO: Integrate with email service provider
    // Options:
    // 1. Nodemailer (for SMTP)
    // 2. SendGrid API
    // 3. AWS SES
    // 4. Mailgun
    
    // For now, we'll log the email (replace with actual email service)
    console.log('📧 Email Notification:');
    console.log('To:', userEmail);
    console.log('Subject:', subject);
    console.log('Content:', textContent || htmlContent);
    console.log('---');
    
    // Example with Nodemailer (uncomment and configure):
    /*
    const nodemailer = require('nodemailer');
    
    const transporter = nodemailer.createTransport({
      service: 'gmail', // or your email service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@campusconnect.com',
      to: userEmail,
      subject: subject,
      html: htmlContent,
      text: textContent || htmlContent.replace(/<[^>]*>/g, '')
    };
    
    await transporter.sendMail(mailOptions);
    */
    
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('❌ Email sending error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send announcement notification email
 */
const sendAnnouncementEmail = async (userEmail, announcement) => {
  const subject = announcement.is_pinned 
    ? `🔔 URGENT: ${announcement.title}`
    : `📢 New Announcement: ${announcement.title}`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(to right, #2563eb, #4f46e5); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; margin: 5px 5px 5px 0; }
        .category { background: #dbeafe; color: #1e40af; }
        .pinned { background: #fef3c7; color: #92400e; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${announcement.is_pinned ? '📌 Pinned Announcement' : '📢 New Announcement'}</h1>
        </div>
        <div class="content">
          <h2>${announcement.title}</h2>
          <div>
            ${announcement.category ? `<span class="badge category">${announcement.category}</span>` : ''}
            ${announcement.is_pinned ? '<span class="badge pinned">📌 Pinned</span>' : ''}
            ${announcement.department ? `<span class="badge">${announcement.department}</span>` : ''}
          </div>
          <div style="margin: 20px 0; white-space: pre-wrap;">${announcement.content}</div>
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p><strong>Posted by:</strong> ${announcement.author?.name || 'Admin'}</p>
            <p><strong>Date:</strong> ${new Date(announcement.created_at).toLocaleString()}</p>
          </div>
        </div>
        <div class="footer">
          <p>Campus Connect - Your campus community platform</p>
          <p>View this announcement: <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/announcements">Click here</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const textContent = `
${announcement.is_pinned ? '🔔 URGENT ANNOUNCEMENT' : '📢 New Announcement'}

${announcement.title}

${announcement.content}

Posted by: ${announcement.author?.name || 'Admin'}
Date: ${new Date(announcement.created_at).toLocaleString()}

View on Campus Connect: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/announcements
  `;
  
  return await sendEmail(userEmail, subject, htmlContent, textContent);
};

// ========== NOTIFICATION FUNCTIONS ==========

/**
 * Create a notification for a user
 */
const createNotification = async (userId, notificationData) => {
  try {
    const user = await User.findOne({ user_id: userId });
    if (!user) {
      throw new Error('User not found');
    }

    const notification = await Notification.create({
      notification_id: generateNotificationId(),
      user_id: userId,
      type: notificationData.type || 'system',
      title: notificationData.title,
      message: notificationData.message,
      reference_type: notificationData.reference_type || null,
      reference_id: notificationData.reference_id || null,
      priority: notificationData.priority || 'normal',
      user: {
        user_id: userId,
        email: user.email
      }
    });

    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    throw error;
  }
};

/**
 * Create notifications for multiple users (bulk)
 */
const createBulkNotifications = async (userIds, notificationData) => {
  const notifications = [];
  
  for (const userId of userIds) {
    try {
      const notification = await createNotification(userId, notificationData);
      notifications.push(notification);
    } catch (error) {
      console.error(`Failed to create notification for user ${userId}:`, error);
    }
  }
  
  return notifications;
};

/**
 * Send announcement notifications to all users (or filtered by department)
 */
exports.sendAnnouncementNotifications = async (announcement, departmentFilter = null) => {
  try {
    // Find all users to notify
    let userQuery = { is_approved: true };
    
    // If announcement is department-specific, only notify users in that department
    if (announcement.department && announcement.department.trim() !== '') {
      userQuery.department = announcement.department.trim();
    }
    
    const users = await User.find(userQuery).select('user_id email department');
    
    if (users.length === 0) {
      return { success: true, count: 0, message: 'No users to notify' };
    }

    const userIds = users.map(u => u.user_id);
    const priority = announcement.is_pinned ? 'urgent' : announcement.category === 'Important' ? 'high' : 'normal';
    
    // Create in-app notifications
    const notifications = await createBulkNotifications(userIds, {
      type: 'announcement',
      title: announcement.is_pinned ? `🔔 URGENT: ${announcement.title}` : `📢 ${announcement.title}`,
      message: announcement.content.substring(0, 200) + (announcement.content.length > 200 ? '...' : ''),
      reference_type: 'announcement',
      reference_id: announcement.announcement_id,
      priority: priority
    });

    // Send email notifications (only for urgent/pinned or important announcements)
    let emailResults = [];
    if (announcement.is_pinned || announcement.category === 'Important' || priority === 'urgent') {
      for (const user of users) {
        if (user.email) {
          try {
            const emailResult = await sendAnnouncementEmail(user.email, announcement);
            emailResults.push({ user_id: user.user_id, ...emailResult });
            
            // Mark notification as emailed
            const notification = await Notification.findOne({ 
              user_id: user.user_id, 
              reference_id: announcement.announcement_id 
            });
            if (notification) {
              notification.is_emailed = emailResult.success;
              await notification.save();
            }
          } catch (error) {
            console.error(`Failed to send email to ${user.email}:`, error);
          }
        }
      }
    }

    return {
      success: true,
      notifications_created: notifications.length,
      emails_sent: emailResults.filter(r => r.success).length,
      total_users: users.length
    };
  } catch (error) {
    console.error('Send announcement notifications error:', error);
    throw error;
  }
};

// @desc    Get user's notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const { type, is_read, limit = 50, page = 1 } = req.query;
    
    const filter = { user_id: userId };
    if (type) filter.type = type;
    if (is_read !== undefined) filter.is_read = is_read === 'true';

    const skip = (Number(page) - 1) * Number(limit);

    const notifications = await Notification.find(filter)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({ user_id: userId, is_read: false });

    res.json({
      success: true,
      data: notifications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      },
      unread_count: unreadCount
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    const notificationId = req.params.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const notification = await Notification.findOne({
      notification_id: notificationId,
      user_id: userId
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    await notification.markAsRead();

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user?.user_id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const result = await Notification.updateMany(
      { user_id: userId, is_read: false },
      { is_read: true, read_at: new Date() }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`,
      count: result.modifiedCount
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
  try {
    const userId = req.user?.user_id;
    const notificationId = req.params.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const notification = await Notification.findOne({
      notification_id: notificationId,
      user_id: userId
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    await notification.deleteOne();

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user?.user_id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const count = await Notification.countDocuments({ user_id: userId, is_read: false });

    res.json({
      success: true,
      unread_count: count
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

