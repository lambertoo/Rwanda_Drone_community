import { PrismaClient, UserRole, Region, ProjectStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clear existing data
  await prisma.rsvp.deleteMany()
  await prisma.jobApplication.deleteMany()
  await prisma.opportunity.deleteMany()
  await prisma.resource.deleteMany()
  await prisma.service.deleteMany()
  await prisma.event.deleteMany()
  await prisma.project.deleteMany()
  await prisma.projectCategory.deleteMany()
  await prisma.eventCategory.deleteMany()
  await prisma.forumComment.deleteMany()
  await prisma.forumPost.deleteMany()
  await prisma.forumCategory.deleteMany()
  await prisma.user.deleteMany()

  console.log('🗑️  Cleared existing data')

  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 12)
  const userPassword = await bcrypt.hash('password123', 12)

  // Create users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@drone.com',
        password: adminPassword,
        fullName: 'Admin User',
        avatar: '/placeholder-user.jpg',
        bio: 'Platform administrator',
        location: Region.KIGALI_NYARUGENGE,
        role: UserRole.admin,
        reputation: 1000,
        isVerified: true,
        organization: 'Rwanda Drone Community',
        experience: '10+ years in drone technology',
        specializations: ['Administration', 'Platform Management'],
        certifications: ['Admin Certification'],
      }
    }),
    prisma.user.create({
      data: {
        username: 'hobbyist_john',
        email: 'hobbyist@drone.com',
        password: userPassword,
        fullName: 'John Hobbyist',
        avatar: '/placeholder-user.jpg',
        bio: 'Drone photography enthusiast',
        location: Region.KIGALI_GASABO,
        role: UserRole.hobbyist,
        reputation: 150,
        isVerified: false,
        experience: '2 years',
        specializations: ['Photography', 'Videography'],
        certifications: [],
      }
    }),
    prisma.user.create({
      data: {
        username: 'pilot_sarah',
        email: 'pilot@drone.com',
        password: userPassword,
        fullName: 'Sarah Pilot',
        avatar: '/placeholder-user.jpg',
        bio: 'Commercial drone pilot',
        location: Region.KIGALI_KICUKIRO,
        role: UserRole.pilot,
        reputation: 450,
        isVerified: true,
        pilotLicense: 'RW-PILOT-2024-001',
        organization: 'SkyTech Rwanda',
        experience: '5 years',
        specializations: ['Aerial Surveying', 'Delivery'],
        certifications: ['Commercial Pilot License', 'RCAA Certified'],
      }
    }),
    prisma.user.create({
      data: {
        username: 'regulator_mike',
        email: 'regulator@drone.com',
        password: userPassword,
        fullName: 'Mike Regulator',
        avatar: '/placeholder-user.jpg',
        bio: 'RCAA Regulatory Officer',
        location: Region.KIGALI_NYARUGENGE,
        role: UserRole.regulator,
        reputation: 800,
        isVerified: true,
        organization: 'Rwanda Civil Aviation Authority',
        experience: '8 years in aviation regulation',
        specializations: ['Regulation', 'Compliance'],
        certifications: ['Aviation Regulation Certification'],
      }
    }),
    prisma.user.create({
      data: {
        username: 'student_emma',
        email: 'student@drone.com',
        password: userPassword,
        fullName: 'Emma Student',
        avatar: '/placeholder-user.jpg',
        bio: 'Computer Science student interested in drone technology',
        location: Region.SOUTH_HUYE,
        role: UserRole.student,
        reputation: 75,
        isVerified: false,
        organization: 'University of Rwanda',
        experience: '1 year',
        specializations: ['Programming', 'AI'],
        certifications: ['Student ID'],
      }
    }),
    prisma.user.create({
      data: {
        username: 'service_david',
        email: 'service@drone.com',
        password: userPassword,
        fullName: 'David Service',
        avatar: '/placeholder-user.jpg',
        bio: 'Drone repair and maintenance specialist',
        location: Region.KIGALI_GASABO,
        role: UserRole.service_provider,
        reputation: 320,
        isVerified: true,
        organization: 'DroneFix Rwanda',
        experience: '6 years',
        specializations: ['Repairs', 'Maintenance', 'Training'],
        certifications: ['Technical Certification', 'Service Provider License'],
      }
    })
  ])

  console.log('👥 Created users')

  // Create forum categories
  const categories = await Promise.all([
    prisma.forumCategory.create({
      data: {
        name: 'General Discussion',
        description: 'General drone discussions, news, and community conversations',
        slug: 'general',
        color: '#3B82F6',
      }
    }),
    prisma.forumCategory.create({
      data: {
        name: 'Technical Support',
        description: 'Get help with drone repairs, maintenance tips, and technical troubleshooting',
        slug: 'technical',
        color: '#10B981',
      }
    }),
    prisma.forumCategory.create({
      data: {
        name: 'Showcase',
        description: 'Share aerial photography tips, showcase work, and discuss camera equipment',
        slug: 'showcase',
        color: '#F59E0B',
      }
    }),
    prisma.forumCategory.create({
      data: {
        name: 'Regulations & Legal',
        description: 'Discuss RCAA regulations, legal requirements, and compliance',
        slug: 'regulations',
        color: '#EF4444',
      }
    }),
    prisma.forumCategory.create({
      data: {
        name: 'Events & Meetups',
        description: 'Organize and discover drone community events, workshops, and meetups',
        slug: 'events',
        color: '#8B5CF6',
      }
    }),
    prisma.forumCategory.create({
      data: {
            name: 'Jobs & Opportunities',
    description: 'Find drone-related job opportunities and freelance projects in Rwanda',
    slug: 'opportunities',
        color: '#06B6D4',
      }
    })
  ])

  console.log('📂 Created forum categories')

  // Create project categories
  const projectCategories = await Promise.all([
    prisma.projectCategory.create({
      data: {
        name: 'Agriculture',
        description: 'Drone projects related to precision agriculture, crop monitoring, and farming',
        slug: 'agriculture',
        icon: '🌾',
        color: '#10B981',
      }
    }),
    prisma.projectCategory.create({
      data: {
        name: 'Photography & Videography',
        description: 'Aerial photography, videography, and cinematography projects',
        slug: 'photography',
        icon: '📸',
        color: '#F59E0B',
      }
    }),
    prisma.projectCategory.create({
      data: {
        name: 'Mapping & Surveying',
        description: '3D mapping, land surveying, and GIS applications',
        slug: 'mapping',
        icon: '🗺️',
        color: '#3B82F6',
      }
    }),
    prisma.projectCategory.create({
      data: {
        name: 'Delivery & Logistics',
        description: 'Drone delivery services and logistics applications',
        slug: 'delivery',
        icon: '📦',
        color: '#8B5CF6',
      }
    }),
    prisma.projectCategory.create({
      data: {
        name: 'Search & Rescue',
        description: 'Emergency response, search and rescue operations',
        slug: 'search-rescue',
        icon: '🚨',
        color: '#EF4444',
      }
    }),
    prisma.projectCategory.create({
      data: {
        name: 'Research & Development',
        description: 'Academic research, innovation, and experimental projects',
        slug: 'research',
        icon: '🔬',
        color: '#06B6D4',
      }
    })
  ])

  console.log('🚁 Created project categories')

  // Create event categories
  const eventCategories = await Promise.all([
    prisma.eventCategory.create({
      data: {
        name: 'Conference',
        description: 'Professional conferences, seminars, and industry events',
        slug: 'conference',
        icon: '🎤',
        color: '#3B82F6',
      }
    }),
    prisma.eventCategory.create({
      data: {
        name: 'Training',
        description: 'Educational training programs and workshops',
        slug: 'training',
        icon: '🎓',
        color: '#10B981',
      }
    }),
    prisma.eventCategory.create({
      data: {
        name: 'Workshop',
        description: 'Hands-on workshops and practical sessions',
        slug: 'workshop',
        icon: '🛠️',
        color: '#F59E0B',
      }
    }),
    prisma.eventCategory.create({
      data: {
        name: 'Hackathon',
        description: 'Innovation competitions and hackathons',
        slug: 'hackathon',
        icon: '💻',
        color: '#8B5CF6',
      }
    }),
    prisma.eventCategory.create({
      data: {
        name: 'Networking',
        description: 'Networking events and meetups',
        slug: 'networking',
        icon: '🤝',
        color: '#06B6D4',
      }
    }),
    prisma.eventCategory.create({
      data: {
        name: 'Competition',
        description: 'Drone competitions and challenges',
        slug: 'competition',
        icon: '🏆',
        color: '#EF4444',
      }
    })
  ])

  console.log('🎯 Created event categories')

  // Create forum posts
  const posts = await Promise.all([
    prisma.forumPost.create({
      data: {
        title: 'Welcome to Rwanda Drone Community!',
        content: 'Welcome everyone to our new drone community platform! This is a place where we can share knowledge, experiences, and help each other grow in the drone industry.',
        categoryId: categories[0].id, // General
        authorId: users[0].id, // Admin
        tags: ['welcome', 'community', 'introduction'],
        viewsCount: 45,
        repliesCount: 3,
      }
    }),
    prisma.forumPost.create({
      data: {
        title: 'RCAA Registration Process - Complete Guide',
        content: 'Here\'s a complete guide to registering your drone with RCAA. The process involves several steps including documentation, training, and inspection.',
        categoryId: categories[3].id, // Regulations
        authorId: users[3].id, // Regulator
        tags: ['RCAA', 'registration', 'legal', 'guide'],
        viewsCount: 123,
        repliesCount: 8,
        isPinned: true,
      }
    }),
    prisma.forumPost.create({
      data: {
        title: 'Best Drone for Aerial Photography in Rwanda',
        content: 'Looking for recommendations for the best drone for aerial photography. Budget is around $500-1000. Any suggestions?',
        categoryId: categories[2].id, // Showcase
        authorId: users[1].id, // Hobbyist
        tags: ['photography', 'recommendations', 'aerial'],
        viewsCount: 67,
        repliesCount: 5,
      }
    }),
    prisma.forumPost.create({
      data: {
        title: 'Drone Repair Services in Kigali',
        content: 'I offer professional drone repair and maintenance services in Kigali. Specializing in DJI, Parrot, and other popular brands.',
        categoryId: categories[1].id, // Technical
        authorId: users[5].id, // Service Provider
        tags: ['repair', 'maintenance', 'services', 'kigali'],
        viewsCount: 89,
        repliesCount: 2,
      }
    })
  ])

  console.log('📝 Created forum posts')

  // Create forum comments
  await Promise.all([
    prisma.forumComment.create({
      data: {
        content: 'Thanks for the warm welcome! Looking forward to learning from everyone here.',
        postId: posts[0].id,
        authorId: users[1].id,
      }
    }),
    prisma.forumComment.create({
      data: {
        content: 'Great to be part of this community! I\'m a student and excited to learn more about drones.',
        postId: posts[0].id,
        authorId: users[4].id,
      }
    }),
    prisma.forumComment.create({
      data: {
        content: 'This guide is very helpful! I just completed my registration last week.',
        postId: posts[1].id,
        authorId: users[2].id,
      }
    })
  ])

  console.log('💬 Created forum comments')

  // Create projects
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        title: 'Agricultural Drone Mapping Project',
        description: 'Using drones for precision agriculture mapping in rural Rwanda',
        fullDescription: 'This project aims to help farmers improve crop yields through aerial mapping and analysis.',
        categoryId: projectCategories[0].id, // Agriculture
        status: ProjectStatus.in_progress,
        authorId: users[2].id,
        location: 'Southern Province',
        duration: '6 months',
        startDate: '2024-01-15',
        endDate: '2024-07-15',
        funding: 'Government Grant',
        technologies: ['DJI Phantom 4', 'Agisoft Metashape', 'QGIS'],
        objectives: ['Crop monitoring', 'Yield prediction', 'Resource optimization'],
        challenges: ['Weather conditions', 'Battery limitations'],
        outcomes: ['Improved crop yields', 'Reduced water usage'],
        teamMembers: ['Sarah Pilot', 'Agricultural Experts', 'Data Analysts'],
        gallery: ['/project1-image1.jpg', '/project1-image2.jpg'],
        viewsCount: 156,
        likesCount: 23,
        isFeatured: true,
      }
    }),
    prisma.project.create({
      data: {
        title: 'Drone Delivery Network',
        description: 'Establishing a drone delivery network for medical supplies',
        fullDescription: 'Creating a network of drones to deliver essential medical supplies to remote areas.',
        categoryId: projectCategories[3].id, // Delivery & Logistics
        status: ProjectStatus.planning,
        authorId: users[0].id,
        location: 'Rural Rwanda',
        duration: '12 months',
        startDate: '2024-03-01',
        endDate: '2025-03-01',
        funding: 'Private Investment',
        technologies: JSON.stringify(['Autonomous drones', 'GPS navigation', 'Medical containers']),
        objectives: JSON.stringify(['Fast delivery', 'Cost reduction', 'Accessibility']),
        challenges: JSON.stringify(['Regulatory approval', 'Infrastructure', 'Weather']),
        outcomes: JSON.stringify(['Improved healthcare access', 'Reduced delivery times']),
        teamMembers: JSON.stringify(['Healthcare professionals', 'Engineers', 'Pilots']),
        gallery: JSON.stringify([]),
        viewsCount: 89,
        likesCount: 15,
        isFeatured: false,
      }
    }),
    prisma.project.create({
      data: {
        title: 'Wildlife Conservation Drone Monitoring',
        description: 'Using drones for wildlife monitoring and anti-poaching in national parks',
        fullDescription: 'Advanced drone surveillance system for wildlife protection and population monitoring in Rwanda\'s national parks.',
        categoryId: projectCategories[4].id, // Search & Rescue
        status: ProjectStatus.completed,
        authorId: users[1].id,
        location: 'Akagera National Park',
        duration: '8 months',
        startDate: '2023-08-01',
        endDate: '2024-04-01',
        funding: 'Conservation Grant',
        technologies: JSON.stringify(['Fixed-wing drones', 'Thermal imaging', 'AI detection']),
        objectives: JSON.stringify(['Wildlife monitoring', 'Anti-poaching', 'Population tracking']),
        challenges: JSON.stringify(['Long flight times', 'Weather conditions', 'Animal behavior']),
        outcomes: JSON.stringify(['Reduced poaching', 'Better population data', 'Improved park security']),
        teamMembers: JSON.stringify(['Conservation experts', 'Drone pilots', 'Data scientists']),
        gallery: JSON.stringify(['/wildlife1.jpg', '/wildlife2.jpg', '/wildlife3.jpg']),
        viewsCount: 342,
        likesCount: 67,
        isFeatured: true,
      }
    }),
    prisma.project.create({
      data: {
        title: 'Urban Infrastructure Inspection',
        description: 'Drone-based inspection of urban infrastructure and buildings',
        fullDescription: 'Comprehensive drone inspection system for urban infrastructure including bridges, buildings, and utilities.',
        categoryId: projectCategories[2].id, // Mapping & Surveying
        status: ProjectStatus.in_progress,
        authorId: users[3].id,
        location: 'Kigali City',
        duration: '4 months',
        startDate: '2024-02-01',
        endDate: '2024-06-01',
        funding: 'City Government',
        technologies: JSON.stringify(['DJI Matrice 300', 'High-resolution cameras', '3D modeling software']),
        objectives: JSON.stringify(['Infrastructure assessment', 'Safety monitoring', 'Maintenance planning']),
        challenges: JSON.stringify(['Urban airspace', 'Regulatory compliance', 'Data processing']),
        outcomes: JSON.stringify(['Improved safety', 'Cost savings', 'Better maintenance']),
        teamMembers: JSON.stringify(['Civil engineers', 'Drone operators', 'Safety inspectors']),
        gallery: JSON.stringify(['/infrastructure1.jpg', '/infrastructure2.jpg']),
        viewsCount: 189,
        likesCount: 34,
        isFeatured: true,
      }
    }),
    prisma.project.create({
      data: {
        title: 'Precision Agriculture Implementation',
        description: 'Implementing precision agriculture techniques using drone technology',
        fullDescription: 'Large-scale implementation of precision agriculture using drones for crop monitoring and management.',
        categoryId: projectCategories[0].id, // Agriculture
        status: ProjectStatus.planning,
        authorId: users[4].id,
        location: 'Eastern Province',
        duration: '18 months',
        startDate: '2024-05-01',
        endDate: '2025-11-01',
        funding: 'Agricultural Development Fund',
        technologies: JSON.stringify(['Multispectral drones', 'Soil sensors', 'AI analytics']),
        objectives: JSON.stringify(['Crop optimization', 'Resource efficiency', 'Yield improvement']),
        challenges: JSON.stringify(['Farmer adoption', 'Technology training', 'Data integration']),
        outcomes: JSON.stringify(['Increased yields', 'Reduced costs', 'Sustainable farming']),
        teamMembers: JSON.stringify(['Agricultural experts', 'Technology specialists', 'Local farmers']),
        gallery: JSON.stringify(['/agriculture1.jpg', '/agriculture2.jpg']),
        viewsCount: 156,
        likesCount: 28,
        isFeatured: false,
      }
    })
  ])

  console.log('🚀 Created projects')

  // Create events
  const events = await Promise.all([
    prisma.event.create({
      data: {
        title: 'Rwanda Drone Technology Conference 2024',
        description: 'Annual conference bringing together drone enthusiasts, professionals, and regulators',
        fullDescription: 'Join us for the biggest drone event in Rwanda featuring workshops, presentations, and networking opportunities.',
        categoryId: eventCategories[0].id, // Conference
        startDate: new Date('2024-06-15T09:00:00Z'),
        endDate: new Date('2024-06-17T18:00:00Z'),
        location: 'Kigali Convention Centre',
        venue: 'Main Hall',
        capacity: 500,
        price: 25000,
        currency: 'RWF',
        registrationDeadline: new Date('2024-06-10T23:59:59Z'),
        requirements: ['Registration required', 'Business casual dress'],
        tags: ['conference', 'networking', 'workshops'],
        speakers: ['Dr. Jean Claude', 'Sarah Pilot', 'Mike Regulator'],
        agenda: ['Day 1: Keynotes', 'Day 2: Workshops', 'Day 3: Networking'],
        gallery: [],
        organizerId: users[0].id,
        isPublic: true,
        allowRegistration: true,
        viewsCount: 234,
        registeredCount: 45,
        isPublished: true,
        isFeatured: true,
      }
    }),
    prisma.event.create({
      data: {
        title: 'Drone Photography Workshop',
        description: 'Learn aerial photography techniques from professional drone photographers',
        fullDescription: 'Hands-on workshop covering composition, camera settings, and post-processing for aerial photography.',
        categoryId: eventCategories[2].id, // Workshop
        startDate: new Date('2024-04-20T10:00:00Z'),
        endDate: new Date('2024-04-20T16:00:00Z'),
        location: 'Kigali',
        venue: 'TBD',
        capacity: 20,
        price: 15000,
        currency: 'RWF',
        registrationDeadline: new Date('2024-04-18T23:59:59Z'),
        requirements: ['Bring your own drone', 'Basic photography knowledge'],
        tags: ['photography', 'workshop', 'hands-on'],
        speakers: ['John Hobbyist', 'Professional Photographers'],
        agenda: ['Morning: Theory', 'Afternoon: Practical'],
        gallery: [],
        organizerId: users[1].id,
        isPublic: true,
        allowRegistration: true,
        viewsCount: 67,
        registeredCount: 12,
        isPublished: true,
        isFeatured: false,
      }
    }),
    prisma.event.create({
      data: {
        title: 'Agricultural Drone Training Program',
        description: 'Comprehensive training program for agricultural drone applications',
        fullDescription: 'Learn how to use drones for precision agriculture, crop monitoring, and agricultural mapping.',
        categoryId: eventCategories[1].id, // Training
        startDate: new Date('2024-05-15T08:00:00Z'),
        endDate: new Date('2024-05-17T17:00:00Z'),
        location: 'Musanze District',
        venue: 'Agricultural Training Center',
        capacity: 30,
        price: 35000,
        currency: 'RWF',
        registrationDeadline: new Date('2024-05-10T23:59:59Z'),
        requirements: JSON.stringify(['Basic drone knowledge', 'Agricultural background preferred']),
        tags: JSON.stringify(['agriculture', 'training', 'drones']),
        speakers: JSON.stringify(['Agricultural Experts', 'Drone Specialists']),
        agenda: JSON.stringify(['Day 1: Theory', 'Day 2: Practical', 'Day 3: Field Work']),
        gallery: JSON.stringify([]),
        organizerId: users[2].id,
        isPublic: true,
        allowRegistration: true,
        viewsCount: 89,
        registeredCount: 18,
        isPublished: true,
        isFeatured: true,
      }
    }),
    prisma.event.create({
      data: {
        title: 'Drone Innovation Hackathon',
        description: '48-hour hackathon to develop innovative drone solutions',
        fullDescription: 'Join developers, engineers, and drone enthusiasts for a weekend of innovation and collaboration.',
        categoryId: eventCategories[3].id, // Hackathon
        startDate: new Date('2024-04-12T18:00:00Z'),
        endDate: new Date('2024-04-14T18:00:00Z'),
        location: 'Kigali Innovation City',
        venue: 'Innovation Hub',
        capacity: 100,
        price: 0,
        currency: 'RWF',
        registrationDeadline: new Date('2024-04-10T23:59:59Z'),
        requirements: JSON.stringify(['Programming skills', 'Team of 2-4 people']),
        tags: JSON.stringify(['hackathon', 'innovation', 'technology']),
        speakers: JSON.stringify(['Tech Leaders', 'Industry Experts']),
        agenda: JSON.stringify(['Friday: Kickoff', 'Saturday: Development', 'Sunday: Presentations']),
        gallery: JSON.stringify([]),
        organizerId: users[0].id,
        isPublic: true,
        allowRegistration: true,
        viewsCount: 156,
        registeredCount: 67,
        isPublished: true,
        isFeatured: false,
      }
    })
  ])

  console.log('📅 Created events')

  // Create services
  await Promise.all([
    prisma.service.create({
      data: {
        title: 'Rwanda Aerial Solutions',
        description: 'Professional drone mapping and surveying services for construction, agriculture, and land management.',
        category: 'Mapping & Surveying',
        region: Region.KIGALI_GASABO,
        contact: 'Rwanda Aerial Solutions',
        phone: '+250 788 123 456',
        email: 'info@rwandaaerial.com',
        website: 'www.rwandaaerial.com',
        services: ['3D Mapping', 'Land Surveying', 'Construction Monitoring', 'Agricultural Analysis'],
        rating: 4.8,
        reviewCount: 24,
        isApproved: true,
        isFeatured: true,
        providerId: users[2].id,
      }
    }),
    prisma.service.create({
      data: {
        title: 'SkyView Photography',
        description: 'Creative aerial photography and videography for events, real estate, and commercial projects.',
        category: 'Photography & Videography',
        region: Region.KIGALI_KICUKIRO,
        contact: 'SkyView Photography',
        phone: '+250 788 234 567',
        email: 'hello@skyviewrw.com',
        website: 'www.skyviewrw.com',
        services: JSON.stringify(['Event Photography', 'Real Estate', 'Commercial Videos', 'Wedding Photography']),
        rating: 4.9,
        reviewCount: 18,
        isApproved: true,
        isFeatured: true,
        providerId: users[1].id,
      }
    }),
    prisma.service.create({
      data: {
        title: 'AgriDrone Rwanda',
        description: 'Specialized agricultural drone services including crop monitoring, precision spraying, and yield analysis.',
        category: 'Agriculture',
        region: Region.NORTH_MUSANZE,
        contact: 'AgriDrone Rwanda',
        phone: '+250 788 345 678',
        email: 'contact@agridrone.rw',
        website: 'www.agridrone.rw',
        services: JSON.stringify(['Crop Monitoring', 'Precision Spraying', 'Yield Analysis', 'Soil Mapping']),
        rating: 4.7,
        reviewCount: 31,
        isApproved: true,
        isFeatured: true,
        providerId: users[4].id,
      }
    }),
    prisma.service.create({
      data: {
        title: 'DroneRepair Pro',
        description: 'Expert drone repair and maintenance services for all major drone brands and models.',
        category: 'Repair & Maintenance',
        region: Region.KIGALI_GASABO,
        contact: 'DroneRepair Pro',
        phone: '+250 788 456 789',
        email: 'support@dronerepairpro.rw',
        website: 'www.dronerepairpro.rw',
        services: JSON.stringify(['Hardware Repair', 'Software Updates', 'Preventive Maintenance', 'Parts Replacement']),
        rating: 4.6,
        reviewCount: 42,
        isApproved: true,
        isFeatured: false,
        providerId: users[5].id,
      }
    }),
    prisma.service.create({
      data: {
        title: 'Rwanda Drone Academy',
        description: 'Comprehensive drone training programs from beginner to professional pilot certification.',
        category: 'Training & Education',
        region: Region.KIGALI_NYARUGENGE,
        contact: 'Rwanda Drone Academy',
        phone: '+250 788 567 890',
        email: 'info@rwandadroneacademy.com',
        website: 'www.rwandadroneacademy.com',
        services: JSON.stringify(['Pilot Training', 'Safety Courses', 'Commercial Certification', 'Workshops']),
        rating: 4.9,
        reviewCount: 67,
        isApproved: true,
        isFeatured: true,
        providerId: users[3].id,
      }
    }),
    prisma.service.create({
      data: {
        title: 'InspectAir Rwanda',
        description: 'Professional drone inspection services for infrastructure, buildings, and industrial facilities.',
        category: 'Inspection Services',
        region: Region.SOUTH_HUYE,
        contact: 'InspectAir Rwanda',
        phone: '+250 788 678 901',
        email: 'inspections@inspectair.rw',
        website: 'www.inspectair.rw',
        services: JSON.stringify(['Building Inspection', 'Infrastructure Assessment', 'Solar Panel Inspection', 'Tower Inspection']),
        rating: 4.5,
        reviewCount: 19,
        isApproved: true,
        isFeatured: false,
        providerId: users[0].id,
      }
    })
  ])

  console.log('🔧 Created services')

  // Create opportunities
  const opportunities = await Promise.all([
    prisma.opportunity.create({
      data: {
        title: 'Drone Pilot for Agricultural Mapping',
        description: 'Seeking experienced drone pilot for agricultural mapping projects across Northern Province. Must have RCAA certification and experience with multispectral imaging.',
        company: 'AgriTech Solutions Rwanda',
        opportunityType: 'Full-time',
        category: 'Agriculture',
        location: 'Musanze',
        salary: '800,000 - 1,200,000 RWF',
        requirements: [
          'RCAA Drone Pilot License',
          '2+ years experience',
          'Agricultural knowledge preferred',
          'Own drone equipment'
        ],
        isUrgent: false,
        tabCategory: 'job',
        posterId: users[2].id,
      }
    }),
    prisma.opportunity.create({
      data: {
        title: 'Aerial Photography Specialist',
        description: 'Looking for creative drone photographer for real estate and event photography. Portfolio required.',
        company: 'SkyView Media',
        opportunityType: 'Urgent',
        category: 'Photography',
        location: 'Kigali',
        salary: 'Per project basis',
        requirements: JSON.stringify([
          'Professional photography experience',
          'High-quality drone equipment',
          'Portfolio of aerial work',
          'Flexible schedule'
        ]),
        isUrgent: true,
        tabCategory: 'gig',
        posterId: users[5].id,
      }
    }),
    prisma.opportunity.create({
      data: {
        title: 'Construction Site Surveyor',
        description: 'Part-time position for drone-based construction site surveying and progress monitoring.',
        company: 'BuildRight Construction',
        opportunityType: 'Part-time',
        category: 'Construction',
        location: 'Kigali',
        salary: '600,000 - 800,000 RWF',
        requirements: JSON.stringify([
          'Surveying background',
          'Drone mapping experience',
          'CAD software knowledge',
          'Available weekends'
        ]),
        isUrgent: false,
        tabCategory: 'job',
        posterId: users[3].id,
      }
    }),
    prisma.opportunity.create({
      data: {
        title: 'Drone Maintenance Technician',
        description: 'Technical role maintaining and repairing various drone models. Electronics background required.',
        company: 'Rwanda Drone Services',
        opportunityType: 'Full-time',
        category: 'Technical',
        location: 'Kigali',
        salary: '500,000 - 700,000 RWF',
        requirements: JSON.stringify([
          'Electronics/Engineering degree',
          'Drone repair experience',
          'Problem-solving skills',
          'Tool proficiency'
        ]),
        isUrgent: false,
        tabCategory: 'job',
        posterId: users[4].id,
      }
    }),
    prisma.opportunity.create({
      data: {
        title: 'Wildlife Conservation Drone Operator',
        description: 'Operate drones for wildlife monitoring and anti-poaching efforts in national parks.',
        company: 'Rwanda Wildlife Conservation',
        opportunityType: 'Contract',
        category: 'Conservation',
        location: 'Akagera National Park',
        salary: 'Competitive',
        requirements: JSON.stringify([
          'Conservation experience',
          'Long-range drone operation',
          'Wildlife knowledge',
          'Physical fitness'
        ]),
        isUrgent: false,
        tabCategory: 'other',
        posterId: users[1].id,
      }
    }),
    prisma.opportunity.create({
      data: {
        title: 'Drone Training Instructor',
        description: 'Teach drone operation and safety courses. RCAA instructor certification required.',
        company: 'Rwanda Aviation Academy',
        opportunityType: 'Full-time',
        category: 'Education',
        location: 'Kigali',
        salary: '900,000 - 1,300,000 RWF',
        requirements: JSON.stringify([
          'RCAA Instructor License',
          'Teaching experience',
          'Excellent communication',
          'Curriculum development'
        ]),
        isUrgent: false,
        tabCategory: 'other',
        posterId: users[0].id,
      }
    }),
    prisma.opportunity.create({
      data: {
        title: 'Real Estate Drone Photographer',
        description: 'Capture stunning aerial photos and videos for real estate listings. Experience with real estate photography preferred.',
        company: 'Rwanda Real Estate Media',
        opportunityType: 'Part-time',
        category: 'Photography',
        location: 'Kigali',
        salary: '400,000 - 600,000 RWF',
        requirements: JSON.stringify([
          'Real estate photography experience',
          'High-quality drone equipment',
          'Portfolio of property photos',
          'Flexible weekday availability'
        ]),
        isUrgent: false,
        tabCategory: 'gig',
        posterId: users[3].id,
      }
    }),
    prisma.opportunity.create({
      data: {
        title: 'Emergency Response Drone Pilot',
        description: 'Urgent need for drone pilot to assist in emergency response and disaster assessment operations.',
        company: 'Rwanda Emergency Services',
        opportunityType: 'Urgent',
        category: 'Technical',
        location: 'Kigali',
        salary: '1,000,000 - 1,500,000 RWF',
        requirements: JSON.stringify([
          'RCAA Commercial Pilot License',
          'Emergency response experience',
          'Available 24/7 for emergencies',
          'Strong communication skills'
        ]),
        isUrgent: true,
        tabCategory: 'job',
        posterId: users[2].id,
      }
    }),
    prisma.opportunity.create({
      data: {
        title: 'Agricultural Drone Consultant',
        description: 'Provide consulting services for agricultural drone implementation and precision farming solutions.',
        company: 'AgriTech Consulting Rwanda',
        opportunityType: 'Contract',
        category: 'Agriculture',
        location: 'Huye',
        salary: 'Per project basis',
        requirements: JSON.stringify([
          'Agricultural engineering degree',
          'Drone technology expertise',
          'Consulting experience',
          'Knowledge of precision farming'
        ]),
        isUrgent: false,
        tabCategory: 'gig',
        posterId: users[5].id,
      }
    }),
    prisma.opportunity.create({
      data: {
        title: 'Drone Software Developer',
        description: 'Develop software solutions for drone operations, including flight planning and data analysis tools.',
        company: 'Rwanda Drone Tech Solutions',
        opportunityType: 'Full-time',
        category: 'Technical',
        location: 'Kigali',
        salary: '1,200,000 - 1,800,000 RWF',
        requirements: JSON.stringify([
          'Computer Science degree',
          'Python/JavaScript experience',
          'Drone API knowledge',
          'GIS software experience'
        ]),
        isUrgent: false,
        tabCategory: 'job',
        posterId: users[4].id,
      }
    })
  ])

  console.log('💼 Created opportunities')

  // Create job applications
  await Promise.all([
    prisma.jobApplication.create({
      data: {
        opportunityId: opportunities[0].id,
        applicantId: users[1].id,
        message: 'I have 2 years of experience in drone photography and would love to expand into commercial operations.',
      }
    }),
    prisma.jobApplication.create({
      data: {
        opportunityId: opportunities[1].id,
        applicantId: users[4].id,
        message: 'I am a student with strong technical skills and would like to learn drone repair.',
      }
    })
  ])

  console.log('📝 Created job applications')

  // Create RSVPs
  await Promise.all([
    prisma.rsvp.create({
      data: {
        userId: users[1].id,
        eventId: events[0].id,
      }
    }),
    prisma.rsvp.create({
      data: {
        userId: users[2].id,
        eventId: events[0].id,
      }
    }),
    prisma.rsvp.create({
      data: {
        userId: users[4].id,
        eventId: events[1].id,
      }
    })
  ])

  console.log('✅ Created RSVPs')

  // Update category post counts
  await Promise.all([
    prisma.forumCategory.update({
      where: { id: categories[0].id },
      data: { 
        postCount: 1,
        lastPostAt: posts[0].createdAt
      }
    }),
    prisma.forumCategory.update({
      where: { id: categories[3].id },
      data: { 
        postCount: 1,
        lastPostAt: posts[1].createdAt
      }
    }),
    prisma.forumCategory.update({
      where: { id: categories[2].id },
      data: { 
        postCount: 1,
        lastPostAt: posts[2].createdAt
      }
    }),
    prisma.forumCategory.update({
      where: { id: categories[1].id },
      data: { 
        postCount: 1,
        lastPostAt: posts[3].createdAt
      }
    })
  ])

  console.log('📊 Updated category statistics')

  // Create sample resources
  console.log("Creating sample resources...")
  
  const sampleResources = [
    {
      title: "RCAA Drone Registration Guidelines",
      description: "Complete guide for registering your drone with Rwanda Civil Aviation Authority",
      fileUrl: "https://example.com/rcaa-registration-guide.pdf",
      fileType: "PDF",
      fileSize: "2.4 MB",
      category: "REGULATIONS",
      isRegulation: true,
      downloads: 1247,
      views: 2156,
      userId: users[0].id // Admin
    },
    {
      title: "Commercial Drone Operations Manual",
      description: "Requirements and procedures for commercial drone operations in Rwanda",
      fileUrl: "https://example.com/commercial-operations.pdf",
      fileType: "PDF",
      fileSize: "3.1 MB",
      category: "REGULATIONS",
      isRegulation: true,
      downloads: 892,
      views: 1543,
      userId: users[3].id // Regulator
    },
    {
      title: "Pre-Flight Safety Checklist",
      description: "Essential safety checks before every drone flight",
      fileUrl: "https://example.com/safety-checklist.pdf",
      fileType: "PDF",
      fileSize: "1.2 MB",
      category: "SAFETY",
      isRegulation: false,
      downloads: 3421,
      views: 5678,
      userId: users[1].id // Hobbyist
    },
    {
      title: "Flight Log Template",
      description: "Standard template for recording flight activities",
      fileUrl: "https://example.com/flight-log.xlsx",
      fileType: "Excel",
      fileSize: "0.5 MB",
      category: "TEMPLATES",
      isRegulation: false,
      downloads: 2847,
      views: 4231,
      userId: users[2].id // Pilot
    },
    {
      title: "Getting Started with Drone Photography",
      description: "Learn the basics of aerial photography and composition",
      fileUrl: "https://example.com/photography-tutorial.mp4",
      fileType: "Video",
      fileSize: "45.2 MB",
      category: "TUTORIALS",
      isRegulation: false,
      downloads: 5432,
      views: 8765,
      userId: users[5].id // Service Provider
    }
  ]

  for (const resourceData of sampleResources) {
    await prisma.resource.create({
      data: resourceData
    })
  }

  console.log("✅ Sample resources created successfully!")

  console.log('🎉 Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 