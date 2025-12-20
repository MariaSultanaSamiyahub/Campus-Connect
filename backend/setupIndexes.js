const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    const db = mongoose.connection.db;

    try {
      // Users indexes
      await db.collection('users').createIndex({ user_id: 1 }, { unique: true });
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
      await db.collection('users').createIndex({ role: 1 });

      // Conversations indexes
      await db.collection('conversations').createIndex({ participant1: 1, participant2: 1 });
      await db.collection('conversations').createIndex({ updated_at: -1 });
      await db.collection('conversations').createIndex({ conversation_id: 1 }, { unique: true });

      // Messages indexes
      await db.collection('messages').createIndex({ conversation_id: 1, created_at: -1 });
      await db.collection('messages').createIndex({ sender_id: 1 });
      await db.collection('messages').createIndex({ message_id: 1 }, { unique: true });

      // Transactions indexes
      await db.collection('transactions').createIndex({ seller_id: 1 });
      await db.collection('transactions').createIndex({ buyer_id: 1 });
      await db.collection('transactions').createIndex({ status: 1 });
      await db.collection('transactions').createIndex({ transaction_id: 1 }, { unique: true });

      // Marketplace Listings indexes
      await db.collection('marketplaceListings').createIndex({ seller_id: 1 });
      await db.collection('marketplaceListings').createIndex({ status: 1, created_at: -1 });
      await db.collection('marketplaceListings').createIndex({ category: 1 });
      await db.collection('marketplaceListings').createIndex({ title: "text", description: "text" });
      await db.collection('marketplaceListings').createIndex({ listing_id: 1 }, { unique: true });

      // Lost and Found indexes
      await db.collection('lostAndFound').createIndex({ posted_by: 1 });
      await db.collection('lostAndFound').createIndex({ type: 1, status: 1 });
      await db.collection('lostAndFound').createIndex({ title: "text", description: "text" });
      await db.collection('lostAndFound').createIndex({ item_id: 1 }, { unique: true });

      // Announcements indexes
      await db.collection('announcements').createIndex({ posted_by: 1 });
      await db.collection('announcements').createIndex({ is_published: 1, created_at: -1 });
      await db.collection('announcements').createIndex({ is_pinned: -1, created_at: -1 });
      await db.collection('announcements').createIndex({ item_id: 1 }, { unique: true });

      // Notifications indexes
      await db.collection('notifications').createIndex({ user_id: 1, created_at: -1 });
      await db.collection('notifications').createIndex({ user_id: 1, is_read: 1 });
      await db.collection('notifications').createIndex({ notification_id: 1 }, { unique: true });

      // Scheduled Items indexes
      await db.collection('scheduledItems').createIndex({ user_id: 1 });
      await db.collection('scheduledItems').createIndex({ status: 1, created_at: -1 });
      await db.collection('scheduledItems').createIndex({ event_id: 1 }, { unique: true });

      // Event Registrations indexes
      await db.collection('eventRegistrations').createIndex({ event_id: 1, user_id: 1 }, { unique: true });
      await db.collection('eventRegistrations').createIndex({ user_id: 1 });
      await db.collection('eventRegistrations').createIndex({ registration_id: 1 }, { unique: true });

      // Events indexes
      await db.collection('events').createIndex({ organizer: 1 });
      await db.collection('events').createIndex({ date: 1 });
      await db.collection('events').createIndex({ title: "text", description: "text" });
      await db.collection('events').createIndex({ event_id: 1 }, { unique: true });

      // Admin Actions indexes
      await db.collection('adminActions').createIndex({ admin_id: 1, created_at: -1 });
      await db.collection('adminActions').createIndex({ target_id: 1, target_type: 1 });
      await db.collection('adminActions').createIndex({ action_id: 1 }, { unique: true });

      // Flagged Content indexes
      await db.collection('flaggedContent').createIndex({ review_status: 1, created_at: -1 });
      await db.collection('flaggedContent').createIndex({ content_id: 1, content_type: 1 });
      await db.collection('flaggedContent').createIndex({ flag_id: 1 }, { unique: true });

      // User Preferences indexes
      await db.collection('userPreferences').createIndex({ user_id: 1 }, { unique: true });

      console.log('✅ All indexes created successfully!');
      process.exit(0);
    } catch (err) {
      console.log('❌ Error creating indexes:', err.message);
      process.exit(1);
    }
  })
  .catch(err => {
    console.log('❌ Connection Error:', err.message);
    process.exit(1);
  });