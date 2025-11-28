const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Room = require('./models/Room');
const Booking = require('./models/Booking');

// Load environment variables
dotenv.config();

// Sample data
const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@hotel.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'customer123',
    role: 'customer'
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'customer123',
    role: 'customer'
  }
];

const sampleRooms = [
  {
    roomNumber: 101,
    type: 'Single',
    price: 80,
    capacity: 1,
    description: 'Cozy single room perfect for solo travelers. Features a comfortable bed, work desk, and modern amenities.',
    images: [
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=500',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=500'
    ],
    amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Fridge', 'Work Desk'],
    available: true
  },
  {
    roomNumber: 102,
    type: 'Single',
    price: 90,
    capacity: 1,
    description: 'Premium single room with city view. Elegant design with all modern conveniences.',
    images: [
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=500'
    ],
    amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'City View'],
    available: true
  },
  {
    roomNumber: 201,
    type: 'Double',
    price: 150,
    capacity: 2,
    description: 'Spacious double room with queen-size bed. Perfect for couples seeking comfort and luxury.',
    images: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=500',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500'
    ],
    amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Room Service', 'Balcony'],
    available: true
  },
  {
    roomNumber: 202,
    type: 'Double',
    price: 160,
    capacity: 2,
    description: 'Deluxe double room with ocean view. Experience luxury with premium bedding and spa bathroom.',
    images: [
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=500'
    ],
    amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Ocean View', 'Jacuzzi'],
    available: true
  },
  {
    roomNumber: 301,
    type: 'Suite',
    price: 250,
    capacity: 3,
    description: 'Luxury suite with separate living area. Ideal for families or extended stays with premium amenities.',
    images: [
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=500',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=500'
    ],
    amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Living Room', 'Kitchen', 'Balcony'],
    available: true
  },
  {
    roomNumber: 302,
    type: 'Suite',
    price: 280,
    capacity: 4,
    description: 'Executive suite with panoramic city views. Features luxurious furnishings and state-of-the-art technology.',
    images: [
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500'
    ],
    amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Living Room', 'City View', 'Work Area'],
    available: true
  },
  {
    roomNumber: 401,
    type: 'Deluxe',
    price: 350,
    capacity: 3,
    description: 'Premium deluxe room with king-size bed and luxury amenities. Experience ultimate comfort and elegance.',
    images: [
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=500',
      'https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=500'
    ],
    amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'King Bed', 'Premium Bath', 'Room Service'],
    available: true
  },
  {
    roomNumber: 402,
    type: 'Deluxe',
    price: 380,
    capacity: 4,
    description: 'Deluxe family room with multiple beds and spacious layout. Perfect for families seeking luxury.',
    images: [
      'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=500'
    ],
    amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Multiple Beds', 'Family Room', 'Game Console'],
    available: true
  },
  {
    roomNumber: 501,
    type: 'Presidential',
    price: 600,
    capacity: 4,
    description: 'Presidential suite with breathtaking views and exclusive services. The ultimate luxury experience.',
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500',
      'https://images.unsplash.com/photo-1631049035239-0fca50f5d5f8?w=500'
    ],
    amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Living Room', 'Dining Area', 'Butler Service', 'Private Terrace'],
    available: true
  },
  {
    roomNumber: 502,
    type: 'Presidential',
    price: 750,
    capacity: 6,
    description: 'Grand presidential suite with multiple bedrooms and private lounge. Unparalleled luxury and privacy.',
    images: [
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=500'
    ],
    amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Multiple Bedrooms', 'Private Lounge', 'Butler Service', 'Chef Service'],
    available: true
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('\n🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Room.deleteMany({});
    await Booking.deleteMany({});
    console.log('✅ Existing data cleared');

    // Insert users
    console.log('\n👥 Creating users...');
    const users = await User.create(sampleUsers);
    console.log(`✅ Created ${users.length} users`);
    console.log('   - Admin: admin@hotel.com / admin123');
    console.log('   - Customer 1: john@example.com / customer123');
    console.log('   - Customer 2: jane@example.com / customer123');

    // Insert rooms
    console.log('\n🏨 Creating rooms...');
    const rooms = await Room.create(sampleRooms);
    console.log(`✅ Created ${rooms.length} rooms`);
    rooms.forEach(room => {
      console.log(`   - Room ${room.roomNumber}: ${room.type} - $${room.price}/night`);
    });

    // Create a sample booking (John books Room 201)
    console.log('\n📅 Creating sample booking...');
    const customerUser = users.find(u => u.email === 'john@example.com');
    const doubleRoom = rooms.find(r => r.roomNumber === 201);
    
    if (customerUser && doubleRoom) {
      const checkIn = new Date();
      checkIn.setDate(checkIn.getDate() + 2); // 2 days from now
      
      const checkOut = new Date();
      checkOut.setDate(checkOut.getDate() + 5); // 5 days from now
      
      const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      
      const sampleBooking = await Booking.create({
        userId: customerUser._id,
        roomId: doubleRoom._id,
        checkIn: checkIn,
        checkOut: checkOut,
        guests: 2,
        totalPrice: days * doubleRoom.price,
        status: 'confirmed'
      });
      
      console.log(`✅ Created sample booking:`);
      console.log(`   - User: ${customerUser.name}`);
      console.log(`   - Room: ${doubleRoom.roomNumber} (${doubleRoom.type})`);
      console.log(`   - Check-in: ${checkIn.toDateString()}`);
      console.log(`   - Check-out: ${checkOut.toDateString()}`);
      console.log(`   - Total: $${sampleBooking.totalPrice}`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎉 DATABASE SEEDED SUCCESSFULLY!');
    console.log('='.repeat(50));
    console.log('\n📊 Summary:');
    console.log(`   - ${users.length} users created`);
    console.log(`   - ${rooms.length} rooms created`);
    console.log(`   - 1 sample booking created`);
    console.log('\n🚀 You can now start the server and use the application!');
    console.log('   Run: npm start\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit();
  }
}

// Run the seed function
seedDatabase();
