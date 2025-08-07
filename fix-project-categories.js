const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixProjectCategories() {
  try {
    // Get all project categories
    const categories = await prisma.projectCategory.findMany()
    console.log('Available categories:', categories.map(c => c.name))

    // Get all projects
    const projects = await prisma.project.findMany()
    console.log('Total projects:', projects.length)

    // Map project titles to categories
    const categoryMap = {
      'Precision Agriculture Implementation': 'Agriculture',
      'Agricultural Drone Mapping Project': 'Agriculture',
      'Urban Infrastructure Inspection': 'Mapping & Surveying',
      'Wildlife Conservation Drone Monitoring': 'Search & Rescue',
      'Drone Delivery Network': 'Delivery & Logistics'
    }

    // Update each project with the appropriate category
    for (const project of projects) {
      const categoryName = categoryMap[project.title]
      if (categoryName) {
        const category = categories.find(c => c.name === categoryName)
        if (category) {
          await prisma.project.update({
            where: { id: project.id },
            data: { categoryId: category.id }
          })
          console.log(`Updated project "${project.title}" with category "${categoryName}"`)
        }
      }
    }

    console.log('Project categories updated successfully!')
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixProjectCategories() 