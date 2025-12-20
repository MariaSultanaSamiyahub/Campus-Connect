const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const MarketplaceListing = require('./models/MarketplaceListing');

const bcrypt = require('bcryptjs');

const generateUserId = () => `USER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const generateListingId = () => `LST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const users = [
  {
    user_id: generateUserId(),
    name: 'Alice Johnson',
    email: 'alice@example.com',
    password_hash: 'password123',
    role: 'seller',
    is_verified: true,
    is_approved: true,
    rating: 4.8,
    total_ratings: 15
  },
  {
    user_id: generateUserId(),
    name: 'Bob Smith',
    email: 'bob@example.com',
    password_hash: 'password123',
    role: 'buyer',
    is_verified: true,
    is_approved: true,
    rating: 4.5,
    total_ratings: 8
  },
  {
    user_id: generateUserId(),
    name: 'Carol White',
    email: 'carol@example.com',
    password_hash: 'password123',
    role: 'seller',
    is_verified: true,
    is_approved: true,
    rating: 4.9,
    total_ratings: 22
  },
  {
    user_id: generateUserId(),
    name: 'David Brown',
    email: 'david@example.com',
    password_hash: 'password123',
    role: 'buyer',
    is_verified: true,
    is_approved: true,
    rating: 4.2,
    total_ratings: 5
  },
  {
    user_id: generateUserId(),
    name: 'Emma Davis',
    email: 'emma@example.com',
    password_hash: 'password123',
    role: 'seller',
    is_verified: true,
    is_approved: true,
    rating: 4.7,
    total_ratings: 18
  }
];

const listings = [
  {
    listing_id: generateListingId(),
    title: 'iPhone 13 Pro - Mint Condition',
    description: 'Barely used iPhone 13 Pro, 256GB, Space Gray. Comes with original box and charger.',
    category: 'Electronics',
    price: 899,
    condition: 'Like New',
    location: 'Campus Library',
    status: 'active',
    seller_id: users[0].user_id,
    seller: {
      user_id: users[0].user_id,
      name: users[0].name,
      email: users[0].email,
      rating: users[0].rating
    },
    view_count: 45,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  },
  {
    listing_id: generateListingId(),
    title: 'Introduction to Algorithms - CLRS',
    description: 'Excellent condition textbook, great for DSA preparation. Minimal markings.',
    category: 'Books',
    price: 45,
    condition: 'Good',
    location: 'Engineering Building',
    status: 'active',
    seller_id: users[2].user_id,
    seller: {
      user_id: users[2].user_id,
      name: users[2].name,
      email: users[2].email,
      rating: users[2].rating
    },
    view_count: 23,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  },
  {
    listing_id: generateListingId(),
    title: 'Wooden Study Desk',
    description: 'Solid wooden desk, perfect for dorm room. 4ft x 2ft. Minor scratches.',
    category: 'Furniture',
    price: 120,
    condition: 'Good',
    location: 'Dormitory A',
    status: 'active',
    seller_id: users[4].user_id,
    seller: {
      user_id: users[4].user_id,
      name: users[4].name,
      email: users[4].email,
      rating: users[4].rating
    },
    view_count: 67,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  },
  {
    listing_id: generateListingId(),
    title: 'Sony WH-1000XM4 Headphones',
    description: 'Premium noise-canceling headphones. Original owner, excellent condition.',
    category: 'Electronics',
    price: 280,
    condition: 'Like New',
    location: 'Student Center',
    status: 'active',
    seller_id: users[0].user_id,
    seller: {
      user_id: users[0].user_id,
      name: users[0].name,
      email: users[0].email,
      rating: users[0].rating
    },
    view_count: 89,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  },
  {
    listing_id: generateListingId(),
    title: 'Winter Jacket - Size M',
    description: 'Warm waterproof winter jacket, barely worn. Perfect for campus winters.',
    category: 'Clothing',
    price: 50,
    condition: 'Like New',
    location: 'Fashion Block',
    status: 'active',
    seller_id: users[2].user_id,
    seller: {
      user_id: users[2].user_id,
      name: users[2].name,
      email: users[2].email,
      rating: users[2].rating
    },
    view_count: 34,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  },
  {
    listing_id: generateListingId(),
    title: 'MacBook Pro 13" M1 2020',
    description: 'Apple MacBook Pro 13-inch M1, 8GB RAM, 256GB SSD. Perfect working condition.',
    category: 'Electronics',
    price: 950,
    condition: 'Good',
    location: 'Tech Building',
    status: 'active',
    seller_id: users[4].user_id,
    seller: {
      user_id: users[4].user_id,
      name: users[4].name,
      email: users[4].email,
      rating: users[4].rating
    },
    view_count: 156,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  },
  {
    listing_id: generateListingId(),
    title: 'Calculus Textbook',
    description: 'Stewart Calculus textbook, 8th edition. Used but in good condition.',
    category: 'Books',
    price: 35,
    condition: 'Good',
    location: 'Science Library',
    status: 'active',
    seller_id: users[0].user_id,
    seller: {
      user_id: users[0].user_id,
      name: users[0].name,
      email: users[0].email,
      rating: users[0].rating
    },
    view_count: 12,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  },
  {
    listing_id: generateListingId(),
    title: 'Gaming Keyboard RGB',
    description: 'Mechanical gaming keyboard with RGB lighting. Like new condition.',
    category: 'Electronics',
    price: 75,
    condition: 'Like New',
    location: 'Gaming Lounge',
    status: 'active',
    seller_id: users[2].user_id,
    seller: {
      user_id: users[2].user_id,
      name: users[2].name,
      email: users[2].email,
      rating: users[2].rating
    },
    view_count: 42,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  },
  {
    listing_id: generateListingId(),
    title: 'Basketball - Spalding Official',
    description: 'Official Spalding basketball, barely used. Perfect for courts.',
    category: 'Sports',
    price: 55,
    condition: 'New',
    location: 'Sports Complex',
    status: 'active',
    seller_id: users[4].user_id,
    seller: {
      user_id: users[4].user_id,
      name: users[4].name,
      email: users[4].email,
      rating: users[4].rating
    },
    view_count: 28,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  },
  {
    listing_id: generateListingId(),
    title: 'Notebook Set - 5 Pack',
    description: 'High quality spiral notebooks, brand new. Great for notes.',
    category: 'Stationery',
    price: 12,
    condition: 'New',
    location: 'Bookstore',
    status: 'active',
    seller_id: users[0].user_id,
    seller: {
      user_id: users[0].user_id,
      name: users[0].name,
      email: users[0].email,
      rating: users[0].rating
    },
    view_count: 15,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Hash passwords
    for (let user of users) {
      const salt = await bcrypt.genSalt(10);
      user.password_hash = await bcrypt.hash(user.password_hash, salt);
    }

    // Clear existing data
    await User.deleteMany({});
    await MarketplaceListing.deleteMany({});
    console.log('🗑️ Cleared existing data');

    // Insert users
    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Insert listings
    const createdListings = await MarketplaceListing.insertMany(listings);
    console.log(`✅ Created ${createdListings.length} listings`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\nTest Accounts:');
    console.log('1. alice@example.com / password123 (Seller)');
    console.log('2. bob@example.com / password123 (Buyer)');
    console.log('3. carol@example.com / password123 (Seller)');
    console.log('4. david@example.com / password123 (Buyer)');
    console.log('5. emma@example.com / password123 (Seller)');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
}

seedDatabase();