const mongoose = require('mongoose');
const Event = require('./models/Event');
const User = require('./models/User');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Sample events data
const getSampleEvents = (organizerId, organizerName) => {
  const now = new Date();
  
  return [
    // Academic Events
    {
      title: 'AI & Machine Learning Workshop',
      description: 'Hands-on workshop covering fundamentals of AI, neural networks, and practical ML applications. Bring your laptop!',
      date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      venue: 'Computer Science Lab, Room 301',
      organizer: organizerId,
      organizerName: organizerName,
      category: 'Workshop',
      capacity: 50,
      status: 'upcoming'
    },
    {
      title: 'Research Paper Presentation: Climate Change',
      description: 'PhD candidates present their latest research findings on climate change impacts and sustainable solutions.',
      date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
      venue: 'Main Auditorium',
      organizer: organizerId,
      organizerName: organizerName,
      category: 'Seminar',
      capacity: 200,
      status: 'upcoming'
    },
    {
      title: 'Career Fair 2025',
      description: 'Meet recruiters from top tech companies including Google, Microsoft, Amazon, and local startups. Bring your resume!',
      date: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days
      venue: 'University Sports Complex',
      organizer: organizerId,
      organizerName: organizerName,
      category: 'Academic',
      capacity: 500,
      status: 'upcoming'
    },
    {
      title: 'Hackathon 2025: Code for Good',
      description: '48-hour hackathon focused on building solutions for social impact. Form teams of 4-5 members. Prizes worth $10,000!',
      date: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000), // 15 days
      venue: 'Engineering Building',
      organizer: organizerId,
      organizerName: organizerName,
      category: 'Workshop',
      capacity: 100,
      status: 'upcoming'
    },

    // Cultural Events
    {
      title: 'Spring Cultural Night',
      description: 'Celebrate diversity with music, dance, and performances from students representing 30+ countries. Free food!',
      date: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000), // 12 days
      venue: 'Open Air Theater',
      organizer: organizerId,
      organizerName: organizerName,
      category: 'Cultural',
      capacity: 300,
      status: 'upcoming'
    },
    {
      title: 'Photography Exhibition: Campus Life',
      description: 'Student photography showcase capturing everyday moments and hidden beauty of campus life.',
      date: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000), // 8 days
      venue: 'Art Gallery, Student Center',
      organizer: organizerId,
      organizerName: organizerName,
      category: 'Cultural',
      capacity: null, // unlimited
      status: 'upcoming'
    },
    {
      title: 'Battle of the Bands',
      description: 'Annual music competition featuring student bands across all genres. Vote for your favorite!',
      date: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000), // 20 days
      venue: 'Multipurpose Hall',
      organizer: organizerId,
      organizerName: organizerName,
      category: 'Cultural',
      capacity: 250,
      status: 'upcoming'
    },

    // Sports Events
    {
      title: 'Inter-Department Cricket Tournament',
      description: 'Annual cricket championship. 8 teams competing for the trophy. All matches are open to spectators.',
      date: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000), // 6 days
      venue: 'University Cricket Ground',
      organizer: organizerId,
      organizerName: organizerName,
      category: 'Sports',
      capacity: null,
      status: 'upcoming'
    },
    {
      title: 'Marathon for Mental Health',
      description: '5K run to raise awareness about mental health. All fitness levels welcome. Registration includes free t-shirt!',
      date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days
      venue: 'Campus Main Gate (Start Point)',
      organizer: organizerId,
      organizerName: organizerName,
      category: 'Sports',
      capacity: 200,
      status: 'upcoming'
    },
    {
      title: 'Basketball League Finals',
      description: 'Championship match between CS Department vs Business School. Don\'t miss the most anticipated game of the year!',
      date: new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000), // 9 days
      venue: 'Indoor Basketball Court',
      organizer: organizerId,
      organizerName: organizerName,
      category: 'Sports',
      capacity: 150,
      status: 'upcoming'
    },

    // Social Events
    {
      title: 'Freshers Welcome Party',
      description: 'Official welcome party for new students. Meet seniors, make friends, enjoy music and food. Dress code: Smart casual.',
      date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days
      venue: 'Student Lounge',
      organizer: organizerId,
      organizerName: organizerName,
      category: 'Social',
      capacity: 200,
      status: 'upcoming'
    },
    {
      title: 'Board Game Night',
      description: 'Chill evening with classic and modern board games. Pizza and snacks provided. Bring your competitive spirit!',
      date: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000), // 4 days
      venue: 'Recreation Room, Student Center',
      organizer: organizerId,
      organizerName: organizerName,
      category: 'Social',
      capacity: 40,
      status: 'upcoming'
    },
    {
      title: 'Alumni Networking Mixer',
      description: 'Connect with successful alumni from various industries. Great opportunity for mentorship and career advice.',
      date: new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000), // 18 days
      venue: 'Grand Hall',
      organizer: organizerId,
      organizerName: organizerName,
      category: 'Social',
      capacity: 150,
      status: 'upcoming'
    },

    // Seminars & Workshops
    {
      title: 'Entrepreneurship Bootcamp',
      description: 'Learn how to turn your ideas into successful startups. Guest speakers from YCombinator and local accelerators.',
      date: new Date(now.getTime() + 11 * 24 * 60 * 60 * 1000), // 11 days
      venue: 'Innovation Hub',
      organizer: organizerId,
      organizerName: organizerName,
      category: 'Seminar',
      capacity: 80,
      status: 'upcoming'
    },
    {
      title: 'Mental Health Awareness Workshop',
      description: 'Interactive session on stress management, mindfulness, and building resilience. Free counseling resources available.',
      date: new Date(now.getTime() + 13 * 24 * 60 * 60 * 1000), // 13 days
      venue: 'Wellness Center',
      organizer: organizerId,
      organizerName: organizerName,
      category: 'Workshop',
      capacity: 60,
      status: 'upcoming'
    },
    {
      title: 'Public Speaking Masterclass',
      description: 'Overcome stage fright and master the art of presentations. Practical exercises and personalized feedback included.',
      date: new Date(now.getTime() + 16 * 24 * 60 * 60 * 1000), // 16 days
      venue: 'Conference Room B',
      organizer: organizerId,
      organizerName: organizerName,
      category: 'Workshop',
      capacity: 30,
      status: 'upcoming'
    },

    // Other
    {
      title: 'Blood Donation Camp',
      description: 'Donate blood, save lives. Mobile blood donation unit on campus. All healthy students encouraged to participate.',
      date: new Date(now.getTime() + 17 * 24 * 60 * 60 * 1000), // 17 days
      venue: 'Medical Center Parking',
      organizer: organizerId,
      organizerName: organizerName,
      category: 'Other',
      capacity: 100,
      status: 'upcoming'
    },
    {
      title: 'Campus Clean-Up Drive',
      description: 'Join us in keeping our campus beautiful! Gloves and supplies provided. Community service hours available.',
      date: new Date(now.getTime() + 19 * 24 * 60 * 60 * 1000), // 19 days
      venue: 'Meet at Central Plaza',
      organizer: organizerId,
      organizerName: organizerName,
      category: 'Other',
      capacity: null,
      status: 'upcoming'
    }
  ];
};

// Seed function
const seedEvents = async () => {
  try {
    await connectDB();

    // Get the first user from database to use as organizer
    const user = await User.findOne();
    
    if (!user) {
      console.log('❌ No users found in database. Please create a user first.');
      process.exit(1);
    }

    console.log(`📝 Using organizer: ${user.name} (${user.email})`);

    // Clear existing events (optional - comment out if you want to keep old events)
    await Event.deleteMany({});
    console.log('🗑️  Cleared existing events');

    // Create sample events
    const sampleEvents = getSampleEvents(user._id, user.name);
    const createdEvents = await Event.insertMany(sampleEvents);

    console.log(`✅ Successfully created ${createdEvents.length} events!`);
    console.log('\n📅 Events created:');
    createdEvents.forEach((event, index) => {
      console.log(`${index + 1}. ${event.title} - ${event.category} - ${event.date.toLocaleDateString()}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding events:', error);
    process.exit(1);
  }
};

// Run the seed function
seedEvents();