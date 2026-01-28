const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateUserRole() {
  try {
    const user = await prisma.user.update({
      where: { email: 'admin@drone.com' },
      data: { role: 'admin' }
    });
    console.log('User role updated:', user);
  } catch (error) {
    console.error('Error updating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserRole(); 