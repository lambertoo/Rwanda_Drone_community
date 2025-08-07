const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugProjects() {
  try {
    console.log('=== DEBUGGING PROJECTS ===')
    
    // Check all projects
    const projects = await prisma.project.findMany({
      include: {
        author: true,
        category: true,
      }
    })

    console.log(`Total projects: ${projects.length}`)
    
    projects.forEach((project, index) => {
      console.log(`\nProject ${index + 1}:`)
      console.log(`  ID: ${project.id}`)
      console.log(`  Title: ${project.title}`)
      console.log(`  categoryId: ${project.categoryId}`)
      console.log(`  category: ${project.category?.name || 'null'}`)
    })

    // Check if categories exist
    const categories = await prisma.projectCategory.findMany()
    console.log(`\nAvailable categories: ${categories.length}`)
    categories.forEach(cat => {
      console.log(`  - ${cat.id}: ${cat.name}`)
    })

    // Fix any projects without categories
    const projectsToFix = projects.filter(p => !p.categoryId)
    console.log(`\nProjects without categories: ${projectsToFix.length}`)
    
    if (projectsToFix.length > 0) {
      console.log('Fixing projects...')
      
      const categoryMap = {
        'Precision Agriculture Implementation': 'Agriculture',
        'Agricultural Drone Mapping Project': 'Agriculture',
        'Urban Infrastructure Inspection': 'Mapping & Surveying',
        'Wildlife Conservation Drone Monitoring': 'Search & Rescue',
        'Drone Delivery Network': 'Delivery & Logistics'
      }

      for (const project of projectsToFix) {
        const categoryName = categoryMap[project.title]
        if (categoryName) {
          const category = categories.find(c => c.name === categoryName)
          if (category) {
            await prisma.project.update({
              where: { id: project.id },
              data: { categoryId: category.id }
            })
            console.log(`✅ Fixed: "${project.title}" -> "${categoryName}"`)
          }
        }
      }
    }

    console.log('\n=== DONE ===')
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugProjects() 