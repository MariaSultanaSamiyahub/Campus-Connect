const mongoose = require('mongoose');
require('dotenv').config();

const dropIndex = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get the events collection
    const eventsCollection = mongoose.connection.collection('events');
    
    // List all indexes
    const indexes = await eventsCollection.indexes();
    console.log('\n📋 Current indexes:');
    indexes.forEach(index => {
      console.log(`   - ${index.name}`);
    });
    
    // Drop the problematic event_id_1 index
    try {
      await eventsCollection.dropIndex('event_id_1');
      console.log('\n✅ Successfully dropped event_id_1 index');
    } catch (error) {
      if (error.code === 27) {
        console.log('\n⚠️  event_id_1 index not found (already dropped or doesn\'t exist)');
      } else {
        throw error;
      }
    }
    
    // Show remaining indexes
    const remainingIndexes = await eventsCollection.indexes();
    console.log('\n📋 Remaining indexes:');
    remainingIndexes.forEach(index => {
      console.log(`   - ${index.name}`);
    });
    
    console.log('\n✅ Done! You can now run the seed script.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

dropIndex();