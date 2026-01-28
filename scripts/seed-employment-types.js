const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const employmentTypes = [
  // Job category
  {
    name: "Permanent Drone Operator",
    description: "Full-time permanent position for drone operations",
    category: "job",
    icon: "👨‍✈️",
    color: "#3B82F6",
    order: 1
  },
  {
    name: "Full-time Career Position",
    description: "Full-time career opportunity in drone industry",
    category: "job",
    icon: "💼",
    color: "#1E40AF",
    order: 2
  },
  {
    name: "Contract Position",
    description: "Fixed-term contract position for drone work",
    category: "job",
    icon: "📋",
    color: "#7C3AED",
    order: 3
  },
  {
    name: "Part-time Position",
    description: "Part-time drone operator position",
    category: "job",
    icon: "⏰",
    color: "#059669",
    order: 4
  },
  
  // Gig category
  {
    name: "Short-term Project",
    description: "Short-term drone project work",
    category: "gig",
    icon: "⚡",
    color: "#10B981",
    order: 1
  },
  {
    name: "Freelance Drone Work",
    description: "Freelance drone services and projects",
    category: "gig",
    icon: "🎯",
    color: "#F59E0B",
    order: 2
  },
  {
    name: "One-time Gig",
    description: "Single project or one-time drone work",
    category: "gig",
    icon: "🎪",
    color: "#EF4444",
    order: 3
  },
  {
    name: "Consulting Work",
    description: "Drone consulting and advisory services",
    category: "gig",
    icon: "💡",
    color: "#8B5CF6",
    order: 4
  },
  
  // Other category
  {
    name: "Internship Program",
    description: "Drone industry internship opportunity",
    category: "other",
    icon: "🎓",
    color: "#8B5CF6",
    order: 1
  },
  {
    name: "Training Program",
    description: "Drone training and certification program",
    category: "other",
    icon: "📚",
    color: "#06B6D4",
    order: 2
  },
  {
    name: "Volunteer Work",
    description: "Volunteer drone work for community projects",
    category: "other",
    icon: "🤝",
    color: "#10B981",
    order: 3
  },
  {
    name: "Research Opportunity",
    description: "Research and development opportunity in drone technology",
    category: "other",
    icon: "🔬",
    color: "#EC4899",
    order: 4
  },
  {
    name: "Competition/Contest",
    description: "Drone competition or contest participation",
    category: "other",
    icon: "🏆",
    color: "#F59E0B",
    order: 5
  }
]

async function seedEmploymentTypes() {
  try {
    console.log('🌱 Starting to seed employment types...')
    
    // Clear existing employment types
    await prisma.employmentType.deleteMany({})
    console.log('🗑️  Cleared existing employment types')
    
    // Create employment types
    for (const employmentType of employmentTypes) {
      await prisma.employmentType.create({
        data: employmentType
      })
      console.log(`✅ Created employment type: ${employmentType.name} (${employmentType.category})`)
    }
    
    console.log('🎉 Successfully seeded employment types!')
    console.log(`📊 Total employment types created: ${employmentTypes.length}`)
    
    // Show summary by category
    const jobCount = employmentTypes.filter(et => et.category === 'job').length
    const gigCount = employmentTypes.filter(et => et.category === 'gig').length
    const otherCount = employmentTypes.filter(et => et.category === 'other').length
    
    console.log(`📈 Summary:`)
    console.log(`   - Jobs: ${jobCount} employment types`)
    console.log(`   - Gigs: ${gigCount} employment types`)
    console.log(`   - Other: ${otherCount} employment types`)
    
  } catch (error) {
    console.error('❌ Error seeding employment types:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedEmploymentTypes()