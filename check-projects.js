const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkProjects() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        author: true,
        category: true,
      }
    })

    console.log('Projects in database:')
    projects.forEach((project, index) => {
      console.log(`\nProject ${index + 1}:`)
      console.log(`  ID: ${project.id}`)
      console.log(`  Title: ${project.title}`)
      console.log(`  Category: ${project.category?.name || 'null'}`)
      console.log(`  Technologies type: ${typeof project.technologies}`)
      console.log(`  Technologies value: ${project.technologies}`)
      console.log(`  Technologies parsed:`, JSON.parse(project.technologies || '[]'))
    })

    console.log('\nTotal projects:', projects.length)
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkProjects() 