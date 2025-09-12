const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const opportunities = [
  {
    title: "Senior Agricultural Drone Pilot",
    company: "Rwanda AgriTech Solutions",
    description: "Lead our agricultural drone operations team, conducting crop monitoring flights, analyzing data, and providing insights to farmers across Rwanda. This is a full-time position with opportunities for growth and professional development in the rapidly expanding agri-tech sector. You'll work with cutting-edge drone technology and contribute to food security in Rwanda.",
    opportunityType: "Permanent Drone Operator",
    location: "Kigali, Rwanda",
    salary: "1,500,000 - 2,200,000 RWF per month",
    requirements: ["Valid drone pilot license", "5+ years experience in agricultural drone operations", "Experience with DJI drones", "Strong analytical skills", "Fluent in English and Kinyarwanda", "Knowledge of precision agriculture", "Leadership experience"],
    isUrgent: false,
    isRemote: false,
    tabCategory: "job",
    allowApplication: true
  },
  {
    title: "Aerial Photography Freelancer",
    company: "Kigali Creative Studios",
    description: "Join our creative team for exciting aerial photography and videography projects. We work with real estate, tourism, weddings, and corporate clients to capture stunning aerial footage. Perfect for experienced drone pilots looking for flexible work and creative expression. Work on diverse projects across Rwanda's beautiful landscapes.",
    opportunityType: "Freelance Drone Work",
    location: "Kigali, Rwanda",
    salary: "80,000 - 150,000 RWF per project",
    requirements: ["Part 107 license or equivalent", "Portfolio of aerial photography work", "Experience with professional cameras", "Creative eye for composition", "Reliable transportation", "Adobe Creative Suite skills", "Flexible schedule"],
    isUrgent: false,
    isRemote: false,
    tabCategory: "gig",
    allowApplication: true
  },
  {
    title: "Drone Technology Internship",
    company: "Rwanda Civil Aviation Authority",
    description: "Gain hands-on experience in commercial drone operations through our comprehensive 6-month internship program. Learn about regulations, safety procedures, and real-world applications in various industries. This program provides excellent networking opportunities and potential for future employment in Rwanda's growing drone industry.",
    opportunityType: "Internship Program",
    location: "Kigali, Rwanda",
    salary: "Unpaid - Training and certification provided",
    requirements: ["Basic understanding of aviation", "High school diploma", "Passion for technology", "Willingness to learn", "Good communication skills", "Commitment to 6-month program", "Computer literacy"],
    isUrgent: false,
    isRemote: false,
    tabCategory: "other",
    allowApplication: true
  },
  {
    title: "Emergency Response Drone Coordinator",
    company: "Rwanda Red Cross",
    description: "Coordinate emergency response drone operations for search and rescue, disaster assessment, and emergency medical deliveries. This is a contract position with on-call requirements. Make a real difference in saving lives during emergencies while working with cutting-edge drone technology in humanitarian operations.",
    opportunityType: "Contract Position",
    location: "Various locations in Rwanda",
    salary: "1,000,000 - 1,500,000 RWF per month",
    requirements: ["Advanced drone pilot license", "Emergency response experience", "Physical fitness for field work", "24/7 availability", "First aid certification", "Ability to work under pressure", "Leadership skills"],
    isUrgent: true,
    isRemote: false,
    tabCategory: "job",
    allowApplication: true
  },
  {
    title: "Construction Site Mapping Project",
    company: "Rwanda Infrastructure Group",
    description: "Short-term project to conduct comprehensive aerial surveys for a major infrastructure development in Musanze. We need a skilled drone pilot to map construction sites, provide accurate measurements, and create 3D models for project planning. This is a 3-week intensive project with potential for follow-up work.",
    opportunityType: "Short-term Project",
    location: "Musanze, Rwanda",
    salary: "400,000 - 600,000 RWF for 3-week project",
    requirements: ["Surveying experience", "Drone pilot license", "Experience with mapping software", "Attention to detail", "Ability to work in challenging terrain", "CAD software knowledge", "3D modeling skills"],
    isUrgent: false,
    isRemote: false,
    tabCategory: "gig",
    allowApplication: true
  },
  {
    title: "Wildlife Conservation Drone Specialist",
    company: "Akagera National Park",
    description: "Join our conservation team to monitor wildlife populations and track animal movements using advanced drone technology. This is a unique opportunity to contribute to wildlife conservation in Rwanda while working in one of Africa's most beautiful national parks. Work with researchers and conservationists to protect endangered species.",
    opportunityType: "Full-time Career Position",
    location: "Akagera National Park, Rwanda",
    salary: "1,200,000 - 1,800,000 RWF per month",
    requirements: ["Wildlife biology background preferred", "Drone pilot license", "Experience with wildlife monitoring", "Field research experience", "Passion for conservation", "Ability to work in remote locations", "Data analysis skills"],
    isUrgent: false,
    isRemote: false,
    tabCategory: "job",
    allowApplication: true
  },
  {
    title: "Drone Training Workshop Facilitator",
    company: "Rwanda Drone Academy",
    description: "Lead training workshops for aspiring drone pilots and professionals. Teach safety procedures, flight techniques, and regulatory compliance. This is a part-time position with flexible scheduling, perfect for experienced pilots who want to share their knowledge and contribute to Rwanda's drone education sector.",
    opportunityType: "Training Program",
    location: "Kigali, Rwanda",
    salary: "150,000 - 250,000 RWF per workshop",
    requirements: ["Certified flight instructor", "7+ years drone experience", "Teaching experience", "Excellent communication skills", "Patience with beginners", "Curriculum development skills", "Weekend availability"],
    isUrgent: false,
    isRemote: false,
    tabCategory: "other",
    allowApplication: true
  }
]

async function seedOpportunities() {
  try {
    console.log('🌱 Starting to seed 7 opportunities...')
    
    // Get the admin user
    const adminUser = await prisma.user.findFirst({
      where: { role: 'admin' }
    })
    
    if (!adminUser) {
      console.error('❌ No admin user found. Please create an admin user first.')
      return
    }
    
    console.log(`👤 Using admin user: ${adminUser.username} (${adminUser.email})`)
    
    // Get employment types and categories
    const employmentTypes = await prisma.employmentType.findMany()
    const categories = await prisma.opportunityCategory.findMany()
    
    console.log(`📊 Found ${employmentTypes.length} employment types and ${categories.length} categories`)
    
    // Clear existing opportunities
    await prisma.opportunity.deleteMany({})
    console.log('🗑️  Cleared existing opportunities')
    
    // Create opportunities
    for (let i = 0; i < opportunities.length; i++) {
      const opp = opportunities[i]
      
      // Find matching employment type
      const employmentType = employmentTypes.find(et => 
        et.name === opp.opportunityType && et.category === opp.tabCategory
      )
      
      // Find matching category based on content
      let category = null
      if (opp.title.toLowerCase().includes('agricultural') || opp.title.toLowerCase().includes('crop')) {
        category = categories.find(c => c.name === 'Agriculture')
      } else if (opp.title.toLowerCase().includes('photography') || opp.title.toLowerCase().includes('aerial')) {
        category = categories.find(c => c.name === 'Photography & Videography')
      } else if (opp.title.toLowerCase().includes('construction') || opp.title.toLowerCase().includes('mapping')) {
        category = categories.find(c => c.name === 'Construction & Surveying')
      } else if (opp.title.toLowerCase().includes('wildlife') || opp.title.toLowerCase().includes('conservation')) {
        category = categories.find(c => c.name === 'Conservation & Environment')
      } else if (opp.title.toLowerCase().includes('emergency') || opp.title.toLowerCase().includes('rescue')) {
        category = categories.find(c => c.name === 'Emergency & Rescue')
      } else if (opp.title.toLowerCase().includes('training') || opp.title.toLowerCase().includes('workshop')) {
        category = categories.find(c => c.name === 'Education & Training')
      } else {
        // Default to first category
        category = categories[0]
      }
      
      const opportunity = await prisma.opportunity.create({
        data: {
          title: opp.title,
          company: opp.company,
          description: opp.description,
          opportunityType: opp.opportunityType,
          employmentTypeId: employmentType?.id,
          categoryId: category?.id,
          location: opp.location,
          salary: opp.salary,
          requirements: opp.requirements,
          isUrgent: opp.isUrgent,
          isRemote: opp.isRemote,
          tabCategory: opp.tabCategory,
          allowApplication: opp.allowApplication,
          posterId: adminUser.id
        }
      })
      
      console.log(`✅ Created opportunity: ${opp.title} (${opp.tabCategory})`)
    }
    
    console.log('🎉 Successfully seeded 7 opportunities!')
    console.log(`📊 Total opportunities created: ${opportunities.length}`)
    
    // Show summary by category
    const jobCount = opportunities.filter(opp => opp.tabCategory === 'job').length
    const gigCount = opportunities.filter(opp => opp.tabCategory === 'gig').length
    const otherCount = opportunities.filter(opp => opp.tabCategory === 'other').length
    
    console.log(`📈 Summary:`)
    console.log(`   - Jobs: ${jobCount} opportunities`)
    console.log(`   - Gigs: ${gigCount} opportunities`)
    console.log(`   - Other: ${otherCount} opportunities`)
    
  } catch (error) {
    console.error('❌ Error seeding opportunities:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedOpportunities()
