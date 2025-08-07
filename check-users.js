const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkUsers() {
  try {
    console.log('=== CHECKING USERS ===')
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isVerified: true
      }
    })

    console.log(`Total users: ${users.length}`)
    
    users.forEach((user, index) => {
      console.log(`\nUser ${index + 1}:`)
      console.log(`  ID: ${user.id}`)
      console.log(`  Username: ${user.username}`)
      console.log(`  Email: ${user.email}`)
      console.log(`  Role: ${user.role}`)
      console.log(`  Verified: ${user.isVerified}`)
    })

    // Check which roles can create projects
    const projectRoles = ["hobbyist", "pilot", "student", "service_provider"]
    console.log(`\nRoles that can create projects: ${projectRoles.join(', ')}`)
    
    const usersWhoCanCreateProjects = users.filter(user => projectRoles.includes(user.role))
    console.log(`\nUsers who can create projects: ${usersWhoCanCreateProjects.length}`)
    usersWhoCanCreateProjects.forEach(user => {
      console.log(`  - ${user.username} (${user.role})`)
    })

    console.log('\n=== DONE ===')
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers() 