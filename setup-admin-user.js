const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function setupAdminUser() {
  try {
    console.log('🔧 Setting up admin user for production...');
    
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'admin@rwandadrone.com' },
          { role: 'ADMIN' }
        ]
      }
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists:', existingAdmin.email);
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('Admin@2024!', 12);
    
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@rwandadrone.com',
        password: hashedPassword,
        name: 'System Administrator',
        role: 'ADMIN',
        emailVerified: true,
        profile: {
          create: {
            bio: 'System Administrator for Rwanda Drone Community Platform',
            location: 'Rwanda',
            website: 'https://rwandadrone.com',
            avatar: null
          }
        }
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminUser.email);
    console.log('🔑 Password: Admin@2024!');
    console.log('⚠️  Please change this password after first login!');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  setupAdminUser()
    .then(() => {
      console.log('🎉 Admin user setup completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Admin user setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupAdminUser }; 