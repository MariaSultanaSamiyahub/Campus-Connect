const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const { MarketplaceListing } = require('./models/marketplace');
const LostAndFound = require('./models/LostAndFound');
const Announcement = require('./models/Announcement');
const Event = require('./models/Event');
const Notification = require('./models/Notification');

const bcrypt = require('bcryptjs');

// ============================================
// HELPER FUNCTIONS
// ============================================
const generateUserId = () => `USER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const generateListingId = () => `LST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const generateItemId = () => `ITEM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const generateEventId = () => `EVT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const generateAnnouncementId = () => `ANN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const getRandomDate = (daysOffset) => {
  return new Date(Date.now() + daysOffset * 24 * 60 * 60 * 1000);
};

const getRandomRating = () => parseFloat((3.5 + Math.random() * 1.5).toFixed(1));
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ============================================
// EXPANDED USER DATA (30 users)
// ============================================
const firstNames = ['Alice', 'Bob', 'Carol', 'David', 'Emma', 'Frank', 'Grace', 'Henry', 'Isabella', 'Jack', 
                     'Kate', 'Liam', 'Mia', 'Noah', 'Olivia', 'Peter', 'Quinn', 'Rachel', 'Sam', 'Tara',
                     'Uma', 'Victor', 'Wendy', 'Xavier', 'Yara', 'Zack', 'Ava', 'Ben', 'Chloe', 'Dylan'];

const lastNames = ['Johnson', 'Smith', 'White', 'Brown', 'Davis', 'Wilson', 'Taylor', 'Anderson', 'Thomas', 'Moore',
                   'Martin', 'Lee', 'Walker', 'Hall', 'Allen', 'Young', 'King', 'Wright', 'Lopez', 'Hill',
                   'Scott', 'Green', 'Adams', 'Baker', 'Nelson', 'Carter', 'Mitchell', 'Roberts', 'Turner', 'Phillips'];

const departments = ['Computer Science', 'Electrical Engineering', 'Mechanical Engineering', 'Business Administration', 
                     'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History'];

const roles = ['buyer', 'seller', 'seller', 'buyer', 'seller']; // More sellers than buyers

const users = firstNames.map((firstName, index) => ({
  user_id: generateUserId(),
  name: `${firstName} ${lastNames[index]}`,
  email: `${firstName.toLowerCase()}${index}@example.com`,
  password_hash: 'password123',
  role: getRandomElement(roles),
  department: getRandomElement(departments),
  is_verified: Math.random() > 0.1, // 90% verified
  is_approved: Math.random() > 0.05, // 95% approved
  rating: getRandomRating(),
  total_ratings: getRandomInt(0, 50)
}));

// ============================================
// EXPANDED MARKETPLACE LISTINGS (300+ listings)
// ============================================
const categories = {
  Electronics: [
    { name: 'iPhone 14 Pro Max', price: [950, 1200], condition: ['Like New', 'Good'] },
    { name: 'Samsung Galaxy S23', price: [800, 1000], condition: ['Like New', 'Good'] },
    { name: 'iPad Air', price: [500, 700], condition: ['Good', 'Like New'] },
    { name: 'MacBook Pro 16"', price: [1800, 2200], condition: ['Good', 'Like New'] },
    { name: 'Dell XPS 15', price: [1200, 1500], condition: ['Good', 'Like New'] },
    { name: 'Sony WH-1000XM5', price: [320, 380], condition: ['New', 'Like New'] },
    { name: 'AirPods Pro', price: [200, 250], condition: ['Good', 'Like New'] },
    { name: 'Gaming Mouse Logitech', price: [50, 80], condition: ['Like New', 'Good'] },
    { name: 'Mechanical Keyboard', price: [60, 120], condition: ['Like New', 'Good'] },
    { name: 'Monitor 27" 4K', price: [350, 500], condition: ['Good', 'Like New'] },
    { name: 'Webcam HD 1080p', price: [60, 90], condition: ['New', 'Like New'] },
    { name: 'USB-C Hub', price: [30, 50], condition: ['New', 'Like New'] },
    { name: 'Portable SSD 1TB', price: [100, 150], condition: ['New', 'Like New'] },
    { name: 'Gaming Headset', price: [80, 120], condition: ['Good', 'Like New'] },
    { name: 'Smart Watch', price: [200, 350], condition: ['Good', 'Like New'] },
    { name: 'Bluetooth Speaker JBL', price: [80, 130], condition: ['Good', 'Like New'] },
    { name: 'E-Reader Kindle', price: [90, 140], condition: ['Good', 'Like New'] },
    { name: 'Graphics Tablet Wacom', price: [150, 300], condition: ['Good', 'Like New'] },
    { name: 'Drone DJI Mini', price: [400, 600], condition: ['Good', 'Like New'] },
    { name: 'Action Camera GoPro', price: [250, 400], condition: ['Good', 'Like New'] }
  ],
  Books: [
    { name: 'Introduction to Algorithms', price: [40, 60], condition: ['Good', 'Fair'] },
    { name: 'Clean Code', price: [25, 40], condition: ['Good', 'Like New'] },
    { name: 'Design Patterns', price: [30, 50], condition: ['Good', 'Fair'] },
    { name: 'Calculus Textbook', price: [30, 50], condition: ['Good', 'Fair'] },
    { name: 'Organic Chemistry', price: [80, 120], condition: ['Good', 'Fair'] },
    { name: 'Physics for Scientists', price: [60, 90], condition: ['Good', 'Fair'] },
    { name: 'Linear Algebra', price: [35, 55], condition: ['Good', 'Fair'] },
    { name: 'Data Structures & Algorithms', price: [45, 65], condition: ['Good', 'Fair'] },
    { name: 'Operating Systems', price: [40, 60], condition: ['Good', 'Fair'] },
    { name: 'Database Systems', price: [50, 70], condition: ['Good', 'Fair'] },
    { name: 'Microeconomics Textbook', price: [45, 75], condition: ['Good', 'Fair'] },
    { name: 'Anatomy & Physiology', price: [80, 130], condition: ['Good', 'Fair'] },
    { name: 'Engineering Mechanics', price: [55, 85], condition: ['Good', 'Fair'] },
    { name: 'Python Programming', price: [30, 50], condition: ['Good', 'Like New'] }
  ],
  Furniture: [
    { name: 'Study Desk Wooden', price: [100, 180], condition: ['Good', 'Fair'] },
    { name: 'Ergonomic Chair', price: [150, 250], condition: ['Good', 'Like New'] },
    { name: 'Bookshelf 5-Tier', price: [60, 100], condition: ['Good', 'Fair'] },
    { name: 'Twin Bed Frame', price: [120, 200], condition: ['Good', 'Fair'] },
    { name: 'Desk Lamp LED', price: [20, 40], condition: ['Good', 'Like New'] },
    { name: 'Mini Fridge', price: [80, 150], condition: ['Good', 'Like New'] },
    { name: 'Nightstand', price: [40, 70], condition: ['Good', 'Fair'] },
    { name: 'Storage Cabinet', price: [70, 120], condition: ['Good', 'Fair'] },
    { name: 'Floor Lamp Modern', price: [35, 60], condition: ['Good', 'Like New'] },
    { name: 'Coffee Table', price: [60, 120], condition: ['Good', 'Fair'] },
    { name: 'TV Stand', price: [80, 150], condition: ['Good', 'Fair'] },
    { name: 'Bean Bag Chair', price: [40, 80], condition: ['Good', 'Like New'] }
  ],
  Clothing: [
    { name: 'Winter Jacket', price: [40, 80], condition: ['Good', 'Like New'] },
    { name: 'Hoodie University Logo', price: [25, 45], condition: ['Good', 'Like New'] },
    { name: 'Sneakers Nike', price: [60, 100], condition: ['Good', 'Like New'] },
    { name: 'Backpack North Face', price: [50, 90], condition: ['Good', 'Like New'] },
    { name: 'Jeans Levi\'s', price: [30, 50], condition: ['Good', 'Like New'] },
    { name: 'Dress Shirt', price: [20, 35], condition: ['Good', 'Like New'] },
    { name: 'Running Shoes Adidas', price: [50, 90], condition: ['Good', 'Like New'] },
    { name: 'Leather Jacket', price: [80, 150], condition: ['Good', 'Like New'] },
    { name: 'Sweater Wool', price: [30, 60], condition: ['Good', 'Like New'] },
    { name: 'Rain Boots', price: [25, 45], condition: ['Good', 'Like New'] },
    { name: 'Formal Dress', price: [40, 90], condition: ['Good', 'Like New'] },
    { name: 'Scarf Cashmere', price: [20, 40], condition: ['Good', 'Like New'] },
    { name: 'Winter Gloves', price: [15, 30], condition: ['Good', 'Like New'] },
    { name: 'Sun Hat', price: [12, 25], condition: ['Good', 'Like New'] }
  ],
  Makeup: [
    { name: 'Eyeshadow Palette Urban Decay', price: [30, 50], condition: ['Like New', 'Good'] },
    { name: 'Foundation Fenty Beauty', price: [25, 40], condition: ['Like New', 'Good'] },
    { name: 'Lipstick Set MAC', price: [35, 55], condition: ['Like New', 'Good'] },
    { name: 'Mascara Benefit', price: [15, 25], condition: ['New', 'Like New'] },
    { name: 'Blush Palette NARS', price: [28, 45], condition: ['Like New', 'Good'] },
    { name: 'Eyeliner Collection', price: [20, 35], condition: ['New', 'Like New'] },
    { name: 'Makeup Brushes Set', price: [40, 70], condition: ['Good', 'Like New'] },
    { name: 'Setting Spray Urban Decay', price: [18, 30], condition: ['Like New', 'Good'] },
    { name: 'Highlighter Palette', price: [25, 40], condition: ['Like New', 'Good'] },
    { name: 'Contour Kit Anastasia', price: [30, 50], condition: ['Like New', 'Good'] },
    { name: 'Nail Polish Set OPI', price: [20, 35], condition: ['New', 'Like New'] },
    { name: 'Makeup Organizer', price: [25, 45], condition: ['Good', 'Like New'] }
  ],
  'Beauty & Skincare': [
    { name: 'Facial Cleanser CeraVe', price: [12, 20], condition: ['New', 'Like New'] },
    { name: 'Moisturizer Neutrogena', price: [15, 25], condition: ['New', 'Like New'] },
    { name: 'Sunscreen SPF 50', price: [10, 18], condition: ['New', 'Like New'] },
    { name: 'Face Masks Pack', price: [15, 28], condition: ['New'] },
    { name: 'Serum Vitamin C', price: [20, 35], condition: ['New', 'Like New'] },
    { name: 'Hair Straightener', price: [35, 60], condition: ['Good', 'Like New'] },
    { name: 'Hair Dryer Dyson', price: [250, 380], condition: ['Good', 'Like New'] },
    { name: 'Perfume Designer', price: [45, 90], condition: ['Good', 'Like New'] },
    { name: 'Body Lotion Set', price: [18, 30], condition: ['New', 'Like New'] },
    { name: 'Electric Shaver', price: [50, 90], condition: ['Good', 'Like New'] }
  ],
  'Food & Snacks': [
    { name: 'Protein Bars Box 12ct', price: [15, 25], condition: ['New'] },
    { name: 'Instant Noodles Pack 24ct', price: [18, 30], condition: ['New'] },
    { name: 'Coffee Beans 1lb Bag', price: [12, 22], condition: ['New'] },
    { name: 'Tea Variety Pack', price: [15, 25], condition: ['New'] },
    { name: 'Energy Drinks Case', price: [20, 35], condition: ['New'] },
    { name: 'Snack Mix Bundle', price: [18, 30], condition: ['New'] },
    { name: 'Protein Powder 2lb', price: [30, 50], condition: ['New', 'Like New'] },
    { name: 'Granola Bars 18ct', price: [12, 20], condition: ['New'] },
    { name: 'Dark Chocolate Bar Pack', price: [10, 18], condition: ['New'] },
    { name: 'Dried Fruit Mix', price: [12, 22], condition: ['New'] }
  ],
  'Kitchen & Dining': [
    { name: 'Coffee Maker Keurig', price: [60, 100], condition: ['Good', 'Like New'] },
    { name: 'Blender Ninja', price: [50, 90], condition: ['Good', 'Like New'] },
    { name: 'Air Fryer', price: [70, 120], condition: ['Good', 'Like New'] },
    { name: 'Microwave Compact', price: [50, 90], condition: ['Good', 'Fair'] },
    { name: 'Toaster 4-Slice', price: [30, 50], condition: ['Good', 'Like New'] },
    { name: 'Electric Kettle', price: [25, 45], condition: ['Good', 'Like New'] },
    { name: 'Cookware Set 10-Piece', price: [80, 140], condition: ['Good', 'Like New'] },
    { name: 'Dinnerware Set', price: [40, 70], condition: ['Good', 'Like New'] },
    { name: 'Water Bottle Hydro Flask', price: [25, 40], condition: ['Good', 'Like New'] },
    { name: 'Lunch Box Set', price: [15, 28], condition: ['Good', 'Like New'] }
  ],
  Sports: [
    { name: 'Basketball Spalding', price: [30, 55], condition: ['Good', 'New'] },
    { name: 'Yoga Mat Premium', price: [20, 40], condition: ['Like New', 'New'] },
    { name: 'Dumbbells Set 20lb', price: [40, 70], condition: ['Good', 'Like New'] },
    { name: 'Tennis Racket', price: [60, 100], condition: ['Good', 'Like New'] },
    { name: 'Soccer Ball FIFA', price: [25, 45], condition: ['Good', 'New'] },
    { name: 'Bicycle Mountain Bike', price: [200, 400], condition: ['Good', 'Fair'] },
    { name: 'Running Watch Garmin', price: [150, 280], condition: ['Good', 'Like New'] },
    { name: 'Resistance Bands Set', price: [15, 30], condition: ['New', 'Like New'] },
    { name: 'Jump Rope Speed', price: [12, 22], condition: ['New', 'Like New'] },
    { name: 'Gym Bag Nike', price: [30, 55], condition: ['Good', 'Like New'] },
    { name: 'Boxing Gloves', price: [40, 70], condition: ['Good', 'Like New'] },
    { name: 'Swimming Goggles', price: [15, 28], condition: ['New', 'Like New'] }
  ],
  Stationery: [
    { name: 'Notebook Set 5-Pack', price: [10, 18], condition: ['New'] },
    { name: 'Pens Box 50ct', price: [8, 15], condition: ['New'] },
    { name: 'Planner 2024', price: [15, 25], condition: ['New', 'Like New'] },
    { name: 'Sticky Notes Bundle', price: [12, 20], condition: ['New'] },
    { name: 'Binder Set', price: [18, 30], condition: ['New', 'Like New'] },
    { name: 'Highlighters 12-Pack', price: [10, 18], condition: ['New'] },
    { name: 'Mechanical Pencils Set', price: [12, 20], condition: ['New', 'Like New'] },
    { name: 'Desk Organizer', price: [15, 28], condition: ['Good', 'Like New'] },
    { name: 'Whiteboard Small', price: [20, 35], condition: ['Good', 'Like New'] }
  ],
  'Musical Instruments': [
    { name: 'Acoustic Guitar Yamaha', price: [150, 280], condition: ['Good', 'Like New'] },
    { name: 'Electric Guitar Fender', price: [300, 500], condition: ['Good', 'Like New'] },
    { name: 'Keyboard Piano 61-Key', price: [120, 220], condition: ['Good', 'Like New'] },
    { name: 'Ukulele Soprano', price: [50, 90], condition: ['Good', 'Like New'] },
    { name: 'Drum Set Electronic', price: [400, 700], condition: ['Good', 'Fair'] },
    { name: 'Violin 4/4 Size', price: [150, 300], condition: ['Good', 'Like New'] },
    { name: 'Microphone USB Condenser', price: [70, 120], condition: ['Good', 'Like New'] },
    { name: 'Guitar Amplifier', price: [100, 180], condition: ['Good', 'Fair'] }
  ],
  'Art Supplies': [
    { name: 'Acrylic Paint Set 24ct', price: [25, 45], condition: ['New', 'Like New'] },
    { name: 'Watercolor Set Professional', price: [35, 60], condition: ['New', 'Like New'] },
    { name: 'Sketch Pad A3 Size', price: [15, 28], condition: ['New'] },
    { name: 'Canvas Panels 12-Pack', price: [25, 40], condition: ['New', 'Like New'] },
    { name: 'Colored Pencils 72ct', price: [30, 50], condition: ['New', 'Like New'] },
    { name: 'Paint Brushes Set', price: [20, 35], condition: ['New', 'Like New'] },
    { name: 'Easel Adjustable', price: [40, 70], condition: ['Good', 'Like New'] },
    { name: 'Markers Set Copic', price: [50, 90], condition: ['Good', 'Like New'] }
  ],
  'Pet Supplies': [
    { name: 'Dog Bed Medium', price: [30, 55], condition: ['Good', 'Like New'] },
    { name: 'Cat Tree Tower', price: [50, 90], condition: ['Good', 'Fair'] },
    { name: 'Pet Carrier', price: [35, 60], condition: ['Good', 'Like New'] },
    { name: 'Dog Leash & Collar Set', price: [15, 30], condition: ['Good', 'Like New'] },
    { name: 'Fish Tank 20 Gallon', price: [80, 140], condition: ['Good', 'Fair'] },
    { name: 'Pet Food Bowls Set', price: [12, 22], condition: ['Good', 'Like New'] },
    { name: 'Cat Litter Box', price: [20, 40], condition: ['Good', 'Like New'] },
    { name: 'Bird Cage Large', price: [60, 110], condition: ['Good', 'Fair'] }
  ],
  'Home Decor': [
    { name: 'Wall Art Canvas', price: [25, 50], condition: ['Good', 'Like New'] },
    { name: 'Throw Pillows Set', price: [20, 40], condition: ['Good', 'Like New'] },
    { name: 'Area Rug 5x7', price: [60, 120], condition: ['Good', 'Fair'] },
    { name: 'Curtains Blackout', price: [30, 55], condition: ['Good', 'Like New'] },
    { name: 'Mirror Full Length', price: [40, 70], condition: ['Good', 'Fair'] },
    { name: 'Desk Clock Digital', price: [15, 28], condition: ['Good', 'Like New'] },
    { name: 'Vase Ceramic Set', price: [20, 35], condition: ['Good', 'Like New'] },
    { name: 'String Lights LED', price: [12, 25], condition: ['New', 'Like New'] }
  ],
  'Gaming': [
    { name: 'PlayStation 5', price: [450, 550], condition: ['Good', 'Like New'] },
    { name: 'Xbox Series X', price: [450, 550], condition: ['Good', 'Like New'] },
    { name: 'Nintendo Switch OLED', price: [300, 380], condition: ['Good', 'Like New'] },
    { name: 'Gaming Chair RGB', price: [150, 280], condition: ['Good', 'Fair'] },
    { name: 'VR Headset Meta Quest', price: [350, 450], condition: ['Good', 'Like New'] },
    { name: 'Gaming Monitor 144Hz', price: [250, 400], condition: ['Good', 'Like New'] },
    { name: 'Controller PS5 DualSense', price: [50, 70], condition: ['Good', 'Like New'] },
    { name: 'Gaming Desk RGB', price: [180, 300], condition: ['Good', 'Fair'] }
  ]
};

const locations = ['Campus Library', 'Engineering Building', 'Student Center', 'Dormitory A', 'Dormitory B',
                   'Science Building', 'Tech Lab', 'Sports Complex', 'Cafeteria', 'Arts Building',
                   'Business School', 'Medical Center', 'Main Hall', 'Recreation Center', 'Parking Lot C'];

const listings = [];
const sellers = users.filter(u => u.role === 'seller');

Object.entries(categories).forEach(([category, items]) => {
  items.forEach(item => {
    // Create 2-3 listings per item type
    const numListings = getRandomInt(2, 3);
    for (let i = 0; i < numListings; i++) {
      const seller = getRandomElement(sellers);
      const priceRange = item.price;
      const price = getRandomInt(priceRange[0], priceRange[1]);
      const condition = getRandomElement(item.condition);
      
      // Generate placeholder image URLs
      const imageUrl = `https://picsum.photos/400/300?random=${Math.floor(Math.random() * 1000)}`;
      const thumbnailUrl = `https://picsum.photos/200/150?random=${Math.floor(Math.random() * 1000)}`;
      
      listings.push({
        listing_id: generateListingId(),
        title: item.name,
        description: `${condition} condition ${item.name}. ${category === 'Books' ? 'Great for studying.' : category === 'Electronics' ? 'Excellent working condition.' : 'Well maintained.'} Available for pickup.`,
        category: category,
        price: price,
        condition: condition,
        location: getRandomElement(locations),
        images: [imageUrl],
        thumbnail: thumbnailUrl,
        stock: getRandomInt(1, 5),
        quantity: 1,
        status: Math.random() > 0.1 ? 'active' : 'sold', // 90% active
        seller_id: seller.user_id,
        seller: {
          user_id: seller.user_id,
          name: seller.name,
          email: seller.email
        },
        view_count: getRandomInt(5, 200),
        is_featured: Math.random() > 0.9, // 10% featured
        expires_at: getRandomDate(getRandomInt(15, 60))
      });
    }
  });
});

// ============================================
// LOST AND FOUND ITEMS (40 items)
// ============================================
const lostFoundItems = [
  { type: 'lost', title: 'Black Wallet', category: 'Personal Items', location: 'Library 3rd Floor' },
  { type: 'found', title: 'Blue Water Bottle', category: 'Personal Items', location: 'Gym' },
  { type: 'lost', title: 'Silver iPhone', category: 'Electronics', location: 'Cafeteria' },
  { type: 'found', title: 'Keys with Red Keychain', category: 'Personal Items', location: 'Parking Lot' },
  { type: 'lost', title: 'Laptop Charger', category: 'Electronics', location: 'Computer Lab' },
  { type: 'found', title: 'Textbook - Calculus', category: 'Books', location: 'Math Building' },
  { type: 'lost', title: 'Glasses in Black Case', category: 'Personal Items', location: 'Student Center' },
  { type: 'found', title: 'Umbrella - Red', category: 'Personal Items', location: 'Main Entrance' },
  { type: 'lost', title: 'Backpack - North Face', category: 'Personal Items', location: 'Sports Complex' },
  { type: 'found', title: 'USB Flash Drive', category: 'Electronics', location: 'Library' }
];

// Map categories to valid enum values
const categoryMap = {
  'Personal Items': 'Accessories',
  'Electronics': 'Electronics',
  'Books': 'Books',
  'Clothing': 'Clothing',
  'Keys': 'Keys',
  'ID Cards': 'ID Cards',
  'Bags': 'Bags',
  'Sports Equipment': 'Sports Equipment',
  'Other': 'Other'
};

const lostAndFoundData = [];
for (let i = 0; i < 4; i++) { // 4x each item
  lostFoundItems.forEach(item => {
    const poster = getRandomElement(users);
    lostAndFoundData.push({
      type: item.type,
      title: item.title,
      description: `${item.type === 'lost' ? 'Lost' : 'Found'} ${item.title}. Please contact if you have information.`,
      category: categoryMap[item.category] || 'Other',
      location: item.location,
      status: Math.random() > 0.3 ? 'active' : 'claimed', // 70% active
      contact_info: poster.email,
      expires_at: getRandomDate(30)
    });
  });
}

// ============================================
// ANNOUNCEMENTS (25 announcements)
// ============================================
// Valid categories: 'Academic', 'General', 'Event', 'Important', 'Other'
const announcementTemplates = [
  { title: 'Campus Maintenance Notice', category: 'General', dept: 'Facilities' },
  { title: 'Holiday Schedule Update', category: 'Academic', dept: 'Administration' },
  { title: 'New Parking Regulations', category: 'Important', dept: 'Security' },
  { title: 'Career Fair Next Week', category: 'Event', dept: 'Career Services' },
  { title: 'Library Hours Extended', category: 'Academic', dept: 'Library' },
  { title: 'Campus WiFi Upgrade', category: 'General', dept: 'IT Services' },
  { title: 'Student Health Center Hours', category: 'Important', dept: 'Health Services' },
  { title: 'Scholarship Application Deadline', category: 'Important', dept: 'Financial Aid' },
  { title: 'Guest Lecture Series', category: 'Academic', dept: 'Computer Science' },
  { title: 'Sports Tournament Registration', category: 'Event', dept: 'Athletics' }
];

const announcements = [];
const admins = users.slice(0, 5); // First 5 users as admins

announcementTemplates.forEach((template, index) => {
  // 2-3 announcements per template
  for (let i = 0; i < getRandomInt(2, 3); i++) {
    const author = getRandomElement(admins);
    announcements.push({
      announcement_id: generateAnnouncementId(),
      title: template.title,
      content: `Important update regarding ${template.title.toLowerCase()}. Please read carefully and take necessary action. More details will be provided soon.`,
      category: template.category,
      department: template.dept,
      posted_by: author.user_id,
      author: {
        user_id: author.user_id,
        name: author.name,
        role: 'admin'
      },
      is_pinned: i === 0 && Math.random() > 0.7, // First of each type, 30% pinned
      is_published: true,
      view_count: getRandomInt(50, 500),
      expires_at: getRandomDate(getRandomInt(30, 90))
    });
  }
});

// ============================================
// EVENTS (30 events)
// ============================================
const eventTemplates = [
  { title: 'Coding Workshop', location: 'Computer Lab 101', capacity: 30 },
  { title: 'Career Networking Night', location: 'Student Center Hall', capacity: 100 },
  { title: 'Hackathon 2024', location: 'Engineering Building', capacity: 50 },
  { title: 'Study Group - Algorithms', location: 'Library Room 204', capacity: 15 },
  { title: 'Basketball Tournament', location: 'Sports Arena', capacity: 200 },
  { title: 'Art Exhibition', location: 'Arts Gallery', capacity: 80 },
  { title: 'Guest Speaker: AI & Ethics', location: 'Auditorium', capacity: 150 },
  { title: 'Movie Night', location: 'Student Center Theater', capacity: 60 },
  { title: 'Yoga Class', location: 'Recreation Center', capacity: 25 },
  { title: 'Book Club Meeting', location: 'Library Lounge', capacity: 20 }
];

const events = [];
eventTemplates.forEach(template => {
  for (let i = 0; i < 3; i++) {
    const organizer = getRandomElement(users);
    events.push({
      event_id: generateEventId(),
      title: template.title,
      description: `Join us for ${template.title}. All students welcome! Register early to secure your spot.`,
      location: template.location,
      date: getRandomDate(getRandomInt(1, 60)),
      organizer: organizer.user_id,
      organizer_info: {
        user_id: organizer.user_id,
        name: organizer.name,
        email: organizer.email
      },
      capacity: template.capacity,
      registrations_count: getRandomInt(0, Math.floor(template.capacity * 0.8))
    });
  }
});

// ============================================
// DATABASE SEEDING FUNCTION
// ============================================
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
    if (LostAndFound) await LostAndFound.deleteMany({});
    if (Announcement) await Announcement.deleteMany({});
    if (Event) await Event.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Insert users
    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Insert marketplace listings
    const createdListings = await MarketplaceListing.insertMany(listings);
    console.log(`✅ Created ${createdListings.length} marketplace listings`);

    // Insert lost and found items (if model exists)
    if (LostAndFound) {
      // Map user_id to ObjectId for posted_by
      const lostFoundWithObjectIds = lostAndFoundData.map(item => {
        const poster = createdUsers.find(u => u.email === item.contact_info) || createdUsers[0];
        return {
          ...item,
          posted_by: poster._id
        };
      });
      const createdLostFound = await LostAndFound.insertMany(lostFoundWithObjectIds);
      console.log(`✅ Created ${createdLostFound.length} lost & found items`);
    }

    // Insert announcements (if model exists)
    let createdAnnouncements = [];
    if (Announcement) {
      createdAnnouncements = await Announcement.insertMany(announcements);
      console.log(`✅ Created ${createdAnnouncements.length} announcements`);
    }

    // Insert events (if model exists)
    if (Event) {
      // Fix event structure to match model
      const formattedEvents = events.map(event => ({
        title: event.title,
        description: event.description,
        date: event.date,
        venue: event.location,
        organizer: createdUsers.find(u => u.user_id === event.organizer)?._id || createdUsers[0]._id,
        organizerName: event.organizer_info.name,
        category: event.category || 'Other',
        capacity: event.capacity,
        status: 'upcoming'
      }));
      const createdEvents = await Event.insertMany(formattedEvents);
      console.log(`✅ Created ${createdEvents.length} events`);
    }

    // Create notifications for some announcements
    const notificationPromises = [];
    if (createdAnnouncements && createdAnnouncements.length > 0) {
      const sampleAnnouncement = createdAnnouncements[0];
      const usersToNotify = createdUsers.slice(0, 10); // Notify first 10 users
      
      for (const user of usersToNotify) {
        notificationPromises.push(
          Notification.create({
            notification_id: `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            user_id: user.user_id,
            type: 'announcement',
            title: `📢 ${sampleAnnouncement.title}`,
            message: sampleAnnouncement.content.substring(0, 200),
            reference_type: 'announcement',
            reference_id: sampleAnnouncement.announcement_id,
            priority: sampleAnnouncement.is_pinned ? 'urgent' : 'normal',
            user: {
              user_id: user.user_id,
              email: user.email
            }
          })
        );
      }
    }
    
    if (notificationPromises.length > 0) {
      await Promise.all(notificationPromises);
      console.log(`✅ Created ${notificationPromises.length} notifications`);
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Listings: ${listings.length}`);
    console.log(`   Lost & Found: ${lostAndFoundData.length}`);
    console.log(`   Announcements: ${announcements.length}`);
    console.log(`   Events: ${events.length}`);
    console.log('\n👤 Sample Test Accounts:');
    console.log('   alice0@example.com / password123');
    console.log('   bob1@example.com / password123');
    console.log('   carol2@example.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
}

seedDatabase();