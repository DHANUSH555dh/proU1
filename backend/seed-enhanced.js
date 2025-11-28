const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Room = require('./models/Room');
const Booking = require('./models/Booking');

dotenv.config();

const sampleUsers = [
  { name: 'Admin User', email: 'admin@hotel.com', password: 'admin123', role: 'admin' },
  { name: 'John Doe', email: 'john@example.com', password: 'customer123', role: 'customer' },
  { name: 'Jane Smith', email: 'jane@example.com', password: 'customer123', role: 'customer' }
];

const expandedRooms = [
  // Single Rooms (10 rooms)
  { roomNumber: 101, type: 'Single', price: 75, capacity: 1, description: 'Cozy single room with city view. Perfect for solo business travelers.', images: ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=500'], amenities: ['WiFi', 'TV', 'Air Conditioning', 'Work Desk'], available: true },
  { roomNumber: 102, type: 'Single', price: 80, capacity: 1, description: 'Modern single room with comfortable bed and workspace.', images: ['https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=500'], amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Fridge'], available: true },
  { roomNumber: 103, type: 'Single', price: 85, capacity: 1, description: 'Premium single room with large window and natural light.', images: ['https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=500'], amenities: ['WiFi', 'TV', 'Air Conditioning', 'City View', 'Work Desk'], available: true },
  { roomNumber: 104, type: 'Single', price: 78, capacity: 1, description: 'Compact single room ideal for short stays.', images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500'], amenities: ['WiFi', 'TV', 'Air Conditioning'], available: true },
  { roomNumber: 105, type: 'Single', price: 90, capacity: 1, description: 'Deluxe single room with modern amenities.', images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=500'], amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Work Desk'], available: true },
  { roomNumber: 201, type: 'Single', price: 95, capacity: 1, description: 'Second floor single room with balcony.', images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=500'], amenities: ['WiFi', 'TV', 'Air Conditioning', 'Balcony'], available: true },
  { roomNumber: 202, type: 'Single', price: 82, capacity: 1, description: 'Quiet single room perfect for relaxation.', images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500'], amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Fridge'], available: true },
  { roomNumber: 203, type: 'Single', price: 88, capacity: 1, description: 'Elegant single room with modern decor.', images: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=500'], amenities: ['WiFi', 'TV', 'Air Conditioning', 'Work Desk'], available: true },
  { roomNumber: 301, type: 'Single', price: 92, capacity: 1, description: 'Top floor single room with panoramic views.', images: ['https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=500'], amenities: ['WiFi', 'TV', 'Air Conditioning', 'City View'], available: true },
  { roomNumber: 302, type: 'Single', price: 87, capacity: 1, description: 'Contemporary single room with all essentials.', images: ['https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=500'], amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar'], available: true },

  // Double Rooms (10 rooms)
  { roomNumber: 106, type: 'Double', price: 140, capacity: 2, description: 'Spacious double room with queen bed and city views.', images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=500'], amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'City View'], available: true },
  { roomNumber: 107, type: 'Double', price: 150, capacity: 2, description: 'Romantic double room perfect for couples.', images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500'], amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Balcony'], available: true },
  { roomNumber: 108, type: 'Double', price: 145, capacity: 2, description: 'Modern double room with elegant furnishings.', images: ['https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=500'], amenities: ['WiFi', 'TV', 'Air Conditioning', 'Room Service'], available: true },
  { roomNumber: 204, type: 'Double', price: 160, capacity: 2, description: 'Premium double room with ocean view.', images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=500'], amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Ocean View'], available: true },
  { roomNumber: 205, type: 'Double', price: 155, capacity: 2, description: 'Comfortable double room with all amenities.', images: ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=500'], amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Balcony'], available: true },
  { roomNumber: 206, type: 'Double', price: 165, capacity: 2, description: 'Luxurious double room with jacuzzi.', images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500'], amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Jacuzzi'], available: true },
  { roomNumber: 303, type: 'Double', price: 158, capacity: 2, description: 'Elegant double room on the top floor.', images: ['https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=500'], amenities: ['WiFi', 'TV', 'Air Conditioning', 'City View', 'Mini Bar'], available: true },
  { roomNumber: 304, type: 'Double', price: 148, capacity: 2, description: 'Cozy double room with modern decor.', images: ['https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=500'], amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar'], available: true },
  { roomNumber: 305, type: 'Double', price: 170, capacity: 2, description: 'Deluxe double room with premium bedding.', images: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=500'], amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Room Service'], available: true },
  { roomNumber: 306, type: 'Double', price: 152, capacity: 2, description: 'Charming double room with balcony access.', images: ['https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=500'], amenities: ['WiFi', 'TV', 'Air Conditioning', 'Balcony'], available: true },

  // Suite Rooms (8 rooms)
  { roomNumber: 401, type: 'Suite', price: 240, capacity: 3, description: 'Spacious suite with separate living area and modern kitchen.', images: ['https://images.unsplash.com/photo-1591088398332-8a7791972843?w=500'], amenities: ['WiFi', 'TV', 'Air Conditioning', 'Living Room', 'Kitchen', 'Mini Bar'], available: true },
  { roomNumber: 402, type: 'Suite', price: 250, capacity: 3, description: 'Family suite with multiple rooms and city views.', images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=500'], amenities: ['WiFi', 'TV', 'Air Conditioning', 'Living Room', 'City View'], available: true },
  { roomNumber: 403, type: 'Suite', price: 270, capacity: 4, description: 'Premium suite with ocean views and private balcony.', images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500'], amenities: ['WiFi', 'TV', 'Air Conditioning', 'Living Room', 'Ocean View', 'Balcony'], available: true },
  { roomNumber: 404, type: 'Suite', price: 260, capacity: 3, description: 'Elegant suite perfect for business or leisure.', images: ['https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=500'], amenities: ['WiFi', 'TV', 'Air Conditioning', 'Living Room', 'Work Desk'], available: true },
  { roomNumber: 405, type: 'Suite', price: 280, capacity: 4, description: 'Luxury suite with premium amenities and room service.', images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=500'], amenities: ['WiFi', 'TV', 'Air Conditioning', 'Living Room', 'Mini Bar', 'Room Service'], available: true },
  { roomNumber: 501, type: 'Suite', price: 290, capacity: 4, description: 'Penthouse suite with panoramic city views.', images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500'], amenities: ['WiFi', 'TV', 'Air Conditioning', 'Living Room', 'City View', 'Kitchen'], available: true },
  { roomNumber: 502, type: 'Suite', price: 275, capacity: 3, description: 'Modern suite with stylish furnishings.', images: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=500'], amenities: ['WiFi', 'TV', 'Air Conditioning', 'Living Room', 'Balcony'], available: true },
  { roomNumber: 503, type: 'Suite', price: 265, capacity: 3, description: 'Comfortable suite ideal for families.', images: ['https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=500'], amenities: ['WiFi', 'TV', 'Air Conditioning', 'Living Room', 'Mini Bar'], available: true },

  // Deluxe Rooms (6 rooms)
  { roomNumber: 601, type: 'Deluxe', price: 340, capacity: 3, description: 'Premium deluxe room with king bed and luxury bath.', images: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=500'], amenities: ['WiFi', 'TV', 'Air Conditioning', 'King Bed', 'Mini Bar', 'Jacuzzi'], available: true },
  { roomNumber: 602, type: 'Deluxe', price: 360, capacity: 4, description: 'Deluxe family room with premium amenities.', images: ['https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=500'], amenities: ['WiFi', 'TV', 'Air Conditioning', 'Multiple Beds', 'Room Service'], available: true },
  { roomNumber: 603, type: 'Deluxe', price: 380, capacity: 4, description: 'Luxurious deluxe room with ocean views.', images: ['https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=500'], amenities: ['WiFi', 'TV', 'Air Conditioning', 'Ocean View', 'Mini Bar', 'Balcony'], available: true },
  { roomNumber: 604, type: 'Deluxe', price: 350, capacity: 3, description: 'Elegant deluxe room with modern design.', images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500'], amenities: ['WiFi', 'TV', 'Air Conditioning', 'King Bed', 'City View'], available: true },
  { roomNumber: 605, type: 'Deluxe', price: 370, capacity: 4, description: 'Spacious deluxe room with entertainment system.', images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=500'], amenities: ['WiFi', 'TV', 'Air Conditioning', 'Game Console', 'Mini Bar'], available: true },
  { roomNumber: 606, type: 'Deluxe', price: 390, capacity: 4, description: 'Ultimate deluxe experience with butler service.', images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500'], amenities: ['WiFi', 'TV', 'Air Conditioning', 'Butler Service', 'Mini Bar'], available: true },

  // Presidential Suites (6 rooms)
  { roomNumber: 701, type: 'Presidential', price: 580, capacity: 4, description: 'Presidential suite with stunning views and exclusive amenities.', images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500'], amenities: ['WiFi', 'TV', 'Air Conditioning', 'Living Room', 'Butler Service', 'Private Terrace'], available: true },
  { roomNumber: 702, type: 'Presidential', price: 650, capacity: 5, description: 'Grand presidential suite with multiple rooms and dining area.', images: ['https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', 'https://images.unsplash.com/photo-1591088398332-8a7791972843?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'], amenities: ['WiFi', 'TV', 'Air Conditioning', 'Living Room', 'Dining Area', 'Kitchen'], available: true },
  { roomNumber: 703, type: 'Presidential', price: 720, capacity: 6, description: 'Luxury presidential suite with ocean views and private pool.', images: ['https://images.unsplash.com/photo-1591088398332-8a7791972843?w=500'], amenities: ['WiFi', 'TV', 'Air Conditioning', 'Multiple Bedrooms', 'Ocean View', 'Pool Access'], available: true },
  { roomNumber: 704, type: 'Presidential', price: 600, capacity: 4, description: 'Executive presidential suite perfect for VIPs.', images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=500'], amenities: ['WiFi', 'TV', 'Air Conditioning', 'Butler Service', 'City View'], available: true },
  { roomNumber: 705, type: 'Presidential', price: 680, capacity: 5, description: 'Premium presidential suite with spa and gym access.', images: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=500'], amenities: ['WiFi', 'TV', 'Air Conditioning', 'Spa', 'Gym Access', 'Butler Service'], available: true },
  { roomNumber: 706, type: 'Presidential', price: 750, capacity: 6, description: 'Ultimate presidential experience with chef and butler service.', images: ['https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=500'], amenities: ['WiFi', 'TV', 'Air Conditioning', 'Butler Service', 'Chef Service', 'Private Lounge'], available: true }
];

async function seedDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Room.deleteMany({});
    await Booking.deleteMany({});
    console.log('✅ Existing data cleared\n');

    console.log('👥 Creating users...');
    const users = await User.create(sampleUsers);
    console.log(`✅ Created ${users.length} users`);
    console.log('   - Admin: admin@hotel.com / admin123');
    console.log('   - Customer 1: john@example.com / customer123');
    console.log('   - Customer 2: jane@example.com / customer123\n');

    console.log('🏨 Creating rooms...');
    const rooms = await Room.create(expandedRooms);
    console.log(`✅ Created ${rooms.length} rooms`);
    
    const roomTypes = [...new Set(rooms.map(r => r.type))];
    roomTypes.forEach(type => {
      const typeRooms = rooms.filter(r => r.type === type);
      console.log(`   - ${type}: ${typeRooms.length} rooms ($${Math.min(...typeRooms.map(r => r.price))} - $${Math.max(...typeRooms.map(r => r.price))})`);
    });

    console.log('\n📅 Creating sample bookings...');
    const customerUser = users.find(u => u.email === 'john@example.com');
    const doubleRoom = rooms.find(r => r.roomNumber === 107);
    
    if (customerUser && doubleRoom) {
      const checkIn = new Date();
      checkIn.setDate(checkIn.getDate() + 2);
      
      const checkOut = new Date();
      checkOut.setDate(checkOut.getDate() + 5);
      
      const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      
      await Booking.create({
        userId: customerUser._id,
        roomId: doubleRoom._id,
        checkIn,
        checkOut,
        guests: 2,
        totalPrice: days * doubleRoom.price,
        status: 'confirmed'
      });
      
      console.log(`✅ Created sample booking (Room ${doubleRoom.roomNumber})\n`);
    }

    console.log('='.repeat(60));
    console.log('🎉 DATABASE SEEDED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log(`\n📊 Summary:`);
    console.log(`   - ${users.length} users created`);
    console.log(`   - ${rooms.length} rooms created`);
    console.log(`   - 1 sample booking created`);
    console.log(`\n🚀 You can now access the application!`);
    console.log(`   Frontend: http://localhost:5500`);
    console.log(`   Backend:  http://localhost:5000\n`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit();
  }
}

seedDatabase();
