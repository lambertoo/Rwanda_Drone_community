const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function setupAdminUser() {
  try {
    console.log('🔧 Setting up admin user for production...');
    
    // Desired admin credentials
    const targetEmail = 'admin@uav.rw'
    const targetPassword = 'PassAdmin@123!'

    // Check if an admin user exists (by role or email)
    const existingAdmin = await prisma.user.findFirst({
      where: {
        OR: [
          { email: targetEmail },
          { role: 'admin' }
        ]
      }
    });

    const hashedPassword = await bcrypt.hash(targetPassword, 12);

    let adminUser;
    if (existingAdmin) {
      // Update existing admin to the requested credentials
      adminUser = await prisma.user.update({
        where: { id: existingAdmin.id },
        data: {
          username: existingAdmin.username || 'admin',
          email: targetEmail,
          password: hashedPassword,
          fullName: existingAdmin.fullName || 'System Administrator',
          role: 'admin',
          isVerified: true,
          isActive: true,
        }
      })
      console.log('✅ Admin user updated successfully!')
    } else {
      // Create admin user
      adminUser = await prisma.user.create({
        data: {
          username: 'admin',
          email: targetEmail,
          password: hashedPassword,
          fullName: 'System Administrator',
          role: 'admin',
          isVerified: true,
          isActive: true,
          reputation: 100,
          location: 'UNKNOWN',
          bio: 'System Administrator for Rwanda Drone Community Platform',
          website: 'https://rwandadrone.com'
        }
      });
      console.log('✅ Admin user created successfully!');
    }

    console.log('👤 Username:', adminUser.username);
    console.log('📧 Email:', adminUser.email);
    console.log('🔑 Password: PassAdmin@123!');
    
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