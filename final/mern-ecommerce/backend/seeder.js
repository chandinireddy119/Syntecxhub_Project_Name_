const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

const users = [
  { name: 'Admin User', email: 'admin@example.com', password: 'admin123', isAdmin: true },
  { name: 'John Doe', email: 'john@example.com', password: 'john1234', isAdmin: false },
];

const sampleProducts = (adminId) => [
  {
    user: adminId,
    name: 'Classic Leather Tote',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600',
    category: 'Bags',
    brand: 'Fieldnote',
    description: 'Full-grain leather tote with brass hardware, hand-stitched in small batches.',
    price: 189.0,
    discountPrice: 0,
    countInStock: 12,
    rating: 4.5,
    numReviews: 8,
  },
  {
    user: adminId,
    name: 'Merino Wool Sweater',
    image: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600',
    category: 'Apparel',
    brand: 'Northloom',
    description: 'Breathable merino wool crewneck, ribbed cuffs, machine washable.',
    price: 98.0,
    discountPrice: 79.0,
    countInStock: 20,
    rating: 4.7,
    numReviews: 15,
  },
  {
    user: adminId,
    name: 'Ceramic Pour-Over Set',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600',
    category: 'Home',
    brand: 'Kettlecraft',
    description: 'Hand-glazed ceramic dripper and carafe set for slow-brewed coffee.',
    price: 64.0,
    discountPrice: 0,
    countInStock: 30,
    rating: 4.2,
    numReviews: 6,
  },
  {
    user: adminId,
    name: 'Suede Chelsea Boots',
    image: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600',
    category: 'Footwear',
    brand: 'Fieldnote',
    description: 'Water-resistant suede Chelsea boots with elastic side panels.',
    price: 165.0,
    discountPrice: 0,
    countInStock: 15,
    rating: 4.6,
    numReviews: 11,
  },
  {
    user: adminId,
    name: 'Brass Desk Lamp',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600',
    category: 'Home',
    brand: 'Kettlecraft',
    description: 'Adjustable brass desk lamp with a warm dimmable LED bulb.',
    price: 112.0,
    discountPrice: 95.0,
    countInStock: 18,
    rating: 4.4,
    numReviews: 9,
  },
  {
    user: adminId,
    name: 'Organic Cotton Tee',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
    category: 'Apparel',
    brand: 'Northloom',
    description: 'GOTS-certified organic cotton tee, garment-dyed, relaxed fit.',
    price: 34.0,
    discountPrice: 0,
    countInStock: 50,
    rating: 4.1,
    numReviews: 22,
  },
  {
    user: adminId,
    name: 'Canvas Weekender Bag',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600',
    category: 'Bags',
    brand: 'Fieldnote',
    description: 'Waxed canvas weekender with leather trim and a detachable strap.',
    price: 145.0,
    discountPrice: 0,
    countInStock: 10,
    rating: 4.8,
    numReviews: 13,
  },
  {
    user: adminId,
    name: 'Wool Blend Overcoat',
    image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600',
    category: 'Apparel',
    brand: 'Northloom',
    description: 'Tailored wool-blend overcoat with a half-belt back detail.',
    price: 245.0,
    discountPrice: 199.0,
    countInStock: 8,
    rating: 4.6,
    numReviews: 5,
  },
];

const importData = async () => {
  try {
    await connectDB();
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    const createdUsers = await User.create(users);
    const adminUser = createdUsers[0]._id;

    await Product.insertMany(sampleProducts(adminUser));

    console.log('Data imported successfully!');
    console.log('Admin login -> email: admin@example.com | password: admin123');
    console.log('User login  -> email: john@example.com  | password: john1234');
    process.exit();
  } catch (error) {
    console.error(`Error importing data: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    console.log('Data destroyed successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error destroying data: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
