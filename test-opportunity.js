const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTestOpportunity() {
  try {
    console.log('🌱 Creating test opportunity...')
    
    // Get admin user
    const adminUser = await prisma.user.findFirst({
      where: { role: 'admin' }
    })
    
    if (!adminUser) {
      console.error('❌ No admin user found')
      return
    }
    
    // Get categories and employment types
    const categories = await prisma.opportunityCategory.findMany()
    const employmentTypes = await prisma.employmentType.findMany()
    
    console.log(`📊 Found ${categories.length} categories and ${employmentTypes.length} employment types`)
    
    // Create test opportunity
    const opportunity = await prisma.opportunity.create({
      data: {
        title: "Test Agricultural Drone Pilot",
        company: "Test AgriTech Solutions",
        description: "Test opportunity for agricultural drone operations",
        opportunityType: "Permanent Drone Operator",
        employmentTypeId: employmentTypes.find(et => et.name === "Permanent Drone Operator")?.id,
        categoryId: categories.find(c => c.name === "Agriculture")?.id,
        location: "Kigali, Rwanda",
        salary: "1,000,000 - 1,500,000 RWF per month",
        requirements: ["Valid drone pilot license", "3+ years experience"],
        isUrgent: false,
        isRemote: false,
        tabCategory: "job",
        allowApplication: true,
        posterId: adminUser.id
      }
    })
    
    console.log('✅ Test opportunity created:', opportunity.id)
    console.log('🔗 Test URL: http://localhost/opportunities/' + opportunity.id)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestOpportunity()
