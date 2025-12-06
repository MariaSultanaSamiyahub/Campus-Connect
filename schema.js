// ============================================
// USERS COLLECTION
// ============================================
db.users.insertOne({
  _id: ObjectId(),
  user_id: "string",
  email: "string",
  password_hash: "string",
  role: "Enum", // buyer, seller, admin
  department: "string",
  is_verified: Boolean,
  rating: "Decimal",
  total_ratings: Int,
  is_approved: Boolean,
  created_at: Timestamp,
  updated_at: Timestamp,
  
  // Methods represented as application logic
  register: Function,
  login: Function,
  logout: Function,
  updateProfile: Function,
  changePassword: Function,
  calculateRating: Function,
  hasRole: Function,
  verifyEmail: Function
});

// ============================================
// USER PREFERENCES COLLECTION
// ============================================
db.userPreferences.insertOne({
  _id: ObjectId(),
  preference_id: "string",
  user_id: "string", // Reference to users
  dark_mode: Boolean,
  notifications: Boolean,
  language: "string",
  email_announcements: Boolean,
  email_order_updates: Boolean,
  email_reviews: Boolean,
  updated_at: Timestamp,
  
  // Embedded reference
  user: {
    _id: "ObjectId",
    user_id: "string",
    email: "string"
  }
});

// Index
db.userPreferences.createIndex({ user_id: 1 }, { unique: true });

// ============================================
// CONVERSATIONS COLLECTION
// ============================================
db.conversations.insertOne({
  _id: ObjectId(),
  conversation_id: "string",
  participant1: "string", // user_id
  participant2: "string", // user_id
  status: "Enum", // active, archived
  listing_type: "Enum",
  listing_id: "string",
  last_message: "text",
  last_message_by: "string",
  last_message_at: Timestamp,
  unread_count: Int,
  created_at: Timestamp,
  updated_at: Timestamp,
  
  // Embedded participant details
  participants: [
    {
      user_id: "string",
      name: "string",
      email: "string"
    }
  ],
  
  // Embedded messages (for recent messages)
  messages: [
    {
      message_id: "string",
      sender_id: "string",
      content: "text",
      is_read: Boolean,
      created_at: Timestamp
    }
  ]
});

// Indexes
db.conversations.createIndex({ participant1: 1, participant2: 1 });
db.conversations.createIndex({ updated_at: -1 });

// ============================================
// MESSAGES COLLECTION
// ============================================
db.messages.insertOne({
  _id: ObjectId(),
  message_id: "string",
  conversation_id: "string", // Reference to conversations
  sender_id: "string",
  content: "text",
  is_read: Boolean,
  created_at: Timestamp,
  
  // Embedded sender info
  sender: {
    user_id: "string",
    name: "string"
  }
});

// Indexes
db.messages.createIndex({ conversation_id: 1, created_at: -1 });
db.messages.createIndex({ sender_id: 1 });

// ============================================
// TRANSACTIONS COLLECTION
// ============================================
db.transactions.insertOne({
  _id: ObjectId(),
  transaction_id: "string",
  seller_id: "string",
  buyer_id: "string",
  seller_rating: Int,
  buyer_rating: Int,
  seller_review: "text",
  buyer_review: "text",
  seller_posted: "text",
  status: "Enum",
  completed_at: Timestamp,
  created_at: Timestamp,
  
  // Embedded user references
  seller: {
    user_id: "string",
    name: "string",
    email: "string"
  },
  buyer: {
    user_id: "string",
    name: "string",
    email: "string"
  }
});

// Indexes
db.transactions.createIndex({ seller_id: 1 });
db.transactions.createIndex({ buyer_id: 1 });
db.transactions.createIndex({ status: 1 });

// ============================================
// MARKETPLACE LISTINGS COLLECTION
// ============================================
db.marketplaceListings.insertOne({
  _id: ObjectId(),
  listing_id: "string",
  title: "string",
  description: "text",
  category: "string",
  price: "Decimal",
  condition: "string",
  images: ["string"], // Array of image URLs
  status: "Enum", // active, sold, removed
  seller_id: "string",
  is_featured: Boolean,
  view_count: Int,
  location: "string",
  thumbnail: "string",
  is_reserved: Boolean,
  created_at: Timestamp,
  updated_at: Timestamp,
  expires_at: Timestamp,
  
  // Embedded seller info
  seller: {
    user_id: "string",
    name: "string",
    email: "string",
    rating: "Decimal"
  },
  
  // Embedded favorite/saved info
  favorites: [
    {
      user_id: "string",
      saved_at: Timestamp
    }
  ]
});

// Indexes
db.marketplaceListings.createIndex({ seller_id: 1 });
db.marketplaceListings.createIndex({ status: 1, created_at: -1 });
db.marketplaceListings.createIndex({ category: 1 });
db.marketplaceListings.createIndex({ title: "text", description: "text" });

// ============================================
// LOST AND FOUND COLLECTION
// ============================================
db.lostAndFound.insertOne({
  _id: ObjectId(),
  item_id: "string",
  type: "Enum", // lost, found
  title: "string",
  description: "text",
  category: "string",
  location: "string",
  date: "string",
  images: ["string"],
  status: "Enum", // open, claimed, closed
  contact_info: "string",
  is_claimed: Boolean,
  claimed_by: "string",
  claimer_details: "string",
  posted_by: "string",
  created_at: Timestamp,
  updated_at: Timestamp,
  resolved_at: Timestamp,
  expires_at: Timestamp,
  
  // Embedded poster info
  poster: {
    user_id: "string",
    name: "string",
    email: "string"
  }
});

// Indexes
db.lostAndFound.createIndex({ posted_by: 1 });
db.lostAndFound.createIndex({ type: 1, status: 1 });
db.lostAndFound.createIndex({ title: "text", description: "text" });

// ============================================
// ANNOUNCEMENTS COLLECTION
// ============================================
db.announcements.insertOne({
  _id: ObjectId(),
  item_id: "string",
  title: "string",
  content: "text",
  category: "string",
  department: "string",
  posted_by: "string",
  is_pinned: Boolean,
  attachments: ["string"],
  view_count: Int,
  is_published: Boolean,
  created_at: Timestamp,
  updated_at: Timestamp,
  expires_at: Timestamp,
  
  // Embedded author info
  author: {
    user_id: "string",
    name: "string",
    role: "string"
  }
});

// Indexes
db.announcements.createIndex({ posted_by: 1 });
db.announcements.createIndex({ is_published: 1, created_at: -1 });
db.announcements.createIndex({ is_pinned: -1, created_at: -1 });

// ============================================
// NOTIFICATIONS COLLECTION
// ============================================
db.notifications.insertOne({
  _id: ObjectId(),
  notification_id: "string",
  user_id: "string",
  type: "Enum",
  title: "string",
  message: "text",
  reference_type: "string",
  reference_id: "string",
  is_read: Boolean,
  is_pushed: Boolean,
  created_at: Timestamp,
  read_at: Timestamp,
  
  // Embedded user reference
  user: {
    user_id: "string",
    email: "string"
  }
});

// Indexes
db.notifications.createIndex({ user_id: 1, created_at: -1 });
db.notifications.createIndex({ user_id: 1, is_read: 1 });

// ============================================
// SCHEDULED ITEMS COLLECTION
// ============================================
db.scheduledItems.insertOne({
  _id: ObjectId(),
  event_id: "string",
  user_id: "string",
  type: "Enum",
  content: "text",
  reason: "string",
  reason_details: "text",
  status: "string",
  created_at: Timestamp,
  
  // Embedded user reference
  user: {
    user_id: "string",
    name: "string"
  }
});

// Indexes
db.scheduledItems.createIndex({ user_id: 1 });
db.scheduledItems.createIndex({ status: 1, created_at: -1 });

// ============================================
// EVENT REGISTRATIONS COLLECTION
// ============================================
db.eventRegistrations.insertOne({
  _id: ObjectId(),
  registration_id: "string",
  event_id: "string",
  user_id: "string",
  status: "Enum", // registered, cancelled, attended
  reminder_at: Boolean,
  notes: "text",
  registered_at: Timestamp,
  
  // Embedded event and user info
  event: {
    event_id: "string",
    title: "string",
    date: Timestamp
  },
  user: {
    user_id: "string",
    name: "string",
    email: "string"
  }
});

// Indexes
db.eventRegistrations.createIndex({ event_id: 1, user_id: 1 }, { unique: true });
db.eventRegistrations.createIndex({ user_id: 1 });

// ============================================
// EVENTS COLLECTION
// ============================================
db.events.insertOne({
  _id: ObjectId(),
  event_id: "string",
  title: "string",
  description: "text",
  location: "string",
  date: Timestamp,
  organizer: "string",
  capacity: Int,
  repeat_interval: "string",
  repeat_on: Timestamp,
  reminder: Boolean,
  reminder_time: Int,
  created_at: Timestamp,
  updated_at: Timestamp,
  
  // Embedded organizer info
  organizer_info: {
    user_id: "string",
    name: "string",
    email: "string"
  },
  
  // Registration stats
  registrations_count: Int,
  attendees: [
    {
      user_id: "string",
      name: "string",
      registered_at: Timestamp
    }
  ]
});

// Indexes
db.events.createIndex({ organizer: 1 });
db.events.createIndex({ date: 1 });
db.events.createIndex({ title: "text", description: "text" });

// ============================================
// ADMIN ACTIONS COLLECTION
// ============================================
db.adminActions.insertOne({
  _id: ObjectId(),
  action_id: "string",
  admin_id: "string",
  action_type: "string",
  target_id: "string",
  target_type: "string",
  reason: "text",
  details: "text",
  created_at: Timestamp,
  
  // Embedded admin info
  admin: {
    user_id: "string",
    name: "string",
    email: "string"
  }
});

// Indexes
db.adminActions.createIndex({ admin_id: 1, created_at: -1 });
db.adminActions.createIndex({ target_id: 1, target_type: 1 });

// ============================================
// FLAGGED CONTENT COLLECTION
// ============================================
db.flaggedContent.insertOne({
  _id: ObjectId(),
  flag_id: "string",
  content_id: "string",
  content_type: "string",
  reported_by: "string",
  reason: "string",
  reason_details: "text",
  review_status: "Enum", // pending, reviewed, dismissed
  reviewer_notes: "text",
  reviewed_by: "string",
  reviewed_at: Timestamp,
  created_at: Timestamp,
  
  // Embedded reporter and reviewer info
  reporter: {
    user_id: "string",
    name: "string"
  },
  reviewer: {
    user_id: "string",
    name: "string"
  }
});

// Indexes
db.flaggedContent.createIndex({ review_status: 1, created_at: -1 });
db.flaggedContent.createIndex({ content_id: 1, content_type: 1 });

// ============================================
// EXAMPLE QUERIES
// ============================================

// 1. Find all active marketplace listings with seller info
db.marketplaceListings.find({
  status: "active"
}).sort({ created_at: -1 });

// 2. Get user's conversations with unread messages
db.conversations.find({
  $or: [
    { participant1: "user_id_here" },
    { participant2: "user_id_here" }
  ],
  unread_count: { $gt: 0 }
}).sort({ updated_at: -1 });

// 3. Find notifications for a user
db.notifications.find({
  user_id: "user_id_here",
  is_read: false
}).sort({ created_at: -1 });

// 4. Get upcoming events with registration count
db.events.aggregate([
  {
    $match: {
      date: { $gte: new Date() }
    }
  },
  {
    $lookup: {
      from: "eventRegistrations",
      localField: "event_id",
      foreignField: "event_id",
      as: "registrations"
    }
  },
  {
    $addFields: {
      registrations_count: { $size: "$registrations" }
    }
  },
  {
    $sort: { date: 1 }
  }
]);

// 5. Search marketplace listings by category and price range
db.marketplaceListings.find({
  category: "Electronics",
  price: { $gte: 100, $lte: 500 },
  status: "active"
}).sort({ created_at: -1 });

// 6. Get lost and found items by location
db.lostAndFound.find({
  location: { $regex: "Library", $options: "i" },
  status: "open"
}).sort({ created_at: -1 });

// 7. Admin dashboard - flagged content pending review
db.flaggedContent.find({
  review_status: "pending"
}).sort({ created_at: 1 });