const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const categories = [
  {
    name: "Agriculture",
    description: "Drone opportunities in agriculture, farming, and crop monitoring",
    color: "#22C55E",
    icon: "🌾"
  },
  {
    name: "Construction & Surveying",
    description: "Construction monitoring, land surveying, and mapping services",
    color: "#F59E0B",
    icon: "🏗️"
  },
  {
    name: "Conservation & Environment",
    description: "Wildlife monitoring, environmental research, and conservation work",
    color: "#10B981",
    icon: "🌿"
  },
  {
    name: "Emergency & Rescue",
    description: "Search and rescue, disaster response, and emergency services",
    color: "#EF4444",
    icon: "🚨"
  },
  {
    name: "Photography & Videography",
    description: "Aerial photography, videography, and creative media services",
    color: "#8B5CF6",
    icon: "📸"
  },
  {
    name: "Delivery & Logistics",
    description: "Package delivery, logistics, and transportation services",
    color: "#06B6D4",
    icon: "📦"
  },
  {
    name: "Education & Training",
    description: "Drone training, education, and certification programs",
    color: "#F97316",
    icon: "🎓"
  },
  {
    name: "Real Estate",
    description: "Property photography, virtual tours, and real estate marketing",
    color: "#84CC16",
    icon: "🏠"
  },
  {
    name: "Security & Surveillance",
    description: "Security monitoring, surveillance, and safety inspections",
    color: "#6B7280",
    icon: "🔒"
  },
  {
    name: "Research & Development",
    description: "Scientific research, testing, and development projects",
    color: "#EC4899",
    icon: "🔬"
  }
]

async function seedCategories() {
  try {
    console.log('🌱 Starting to seed opportunity categories...')
    
    // Clear existing categories
    await prisma.opportunityCategory.deleteMany({})
    console.log('🗑️  Cleared existing categories')
    
    // Create categories
    for (const category of categories) {
      await prisma.opportunityCategory.create({
        data: category
      })
      console.log(`✅ Created category: ${category.name}`)
    }
    
    console.log('🎉 Successfully seeded opportunity categories!')
    console.log(`📊 Total categories created: ${categories.length}`)
    
  } catch (error) {
    console.error('❌ Error seeding categories:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedCategories()