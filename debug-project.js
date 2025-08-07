const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugProject() {
  try {
    const project = await prisma.project.findUnique({
      where: { id: 'cme0wz5a00003oz4u0loqt3jl' },
      include: {
        author: true,
      }
    })

    if (!project) {
      console.log('Project not found')
      return
    }

    console.log('Project found:')
    console.log('Title:', project.title)
    console.log('Technologies type:', typeof project.technologies)
    console.log('Technologies value:', project.technologies)
    console.log('Objectives type:', typeof project.objectives)
    console.log('Objectives value:', project.objectives)
    console.log('Challenges type:', typeof project.challenges)
    console.log('Challenges value:', project.challenges)
    console.log('Outcomes type:', typeof project.outcomes)
    console.log('Outcomes value:', project.outcomes)
    console.log('TeamMembers type:', typeof project.teamMembers)
    console.log('TeamMembers value:', project.teamMembers)
    console.log('Gallery type:', typeof project.gallery)
    console.log('Gallery value:', project.gallery)
    console.log('Resources type:', typeof project.resources)
    console.log('Resources value:', project.resources)

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugProject() 