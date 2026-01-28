// Load environment variables
require('dotenv').config({ path: '.env.production' });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Event categories to create if they don't exist
const categories = [
  {
    name: "Workshop",
    description: "Hands-on training workshops and skill-building sessions",
    slug: "workshop",
    icon: "🔧",
    color: "#3B82F6"
  },
  {
    name: "Conference",
    description: "Industry conferences and professional gatherings",
    slug: "conference",
    icon: "🎤",
    color: "#8B5CF6"
  },
  {
    name: "Networking",
    description: "Community networking events and meetups",
    slug: "networking",
    icon: "🤝",
    color: "#10B981"
  },
  {
    name: "Training",
    description: "Professional training and certification programs",
    slug: "training",
    icon: "📚",
    color: "#F59E0B"
  },
  {
    name: "Exhibition",
    description: "Technology exhibitions and showcases",
    slug: "exhibition",
    icon: "🎨",
    color: "#EF4444"
  }
];

// Helper function to get future dates
function getFutureDate(daysFromNow, hour = 9, minute = 0) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hour, minute, 0, 0);
  return date;
}

// 10 future events about Drone ecosystem and community in Rwanda
const events = [
  {
    title: "Rwanda Drone Community Annual Conference 2026",
    description: "Join us for the premier annual gathering of Rwanda's drone community. Featuring keynote speakers, technical workshops, networking opportunities, and the latest innovations in drone technology.",
    fullDescription: `The Rwanda Drone Community Annual Conference is the largest gathering of drone professionals, enthusiasts, researchers, and policymakers in East Africa. This year's conference promises to be our biggest yet, with over 300 expected attendees from across the region.

**Key Highlights:**
- Keynote presentations from industry leaders and government officials
- Technical workshops on drone operations, regulations, and applications
- Exhibition showcasing latest drone technologies and services
- Networking sessions with industry professionals
- Panel discussions on the future of drones in Rwanda
- Awards ceremony recognizing outstanding contributions to the community

**Who Should Attend:**
- Drone pilots and operators
- Researchers and academics
- Government officials and regulators
- Entrepreneurs and business owners
- Students and aspiring professionals
- Service providers and technology companies

**What to Expect:**
The conference will feature a diverse program covering topics from agricultural applications to infrastructure inspection, from regulatory compliance to business development. Whether you're a seasoned professional or just starting your journey in the drone industry, there's something for everyone.

**Registration:**
Early bird registration is available until March 15th. Group discounts are available for organizations registering 5 or more attendees.`,
    categorySlug: "conference",
    startDate: getFutureDate(45, 8, 0), // 45 days from now, 8 AM
    endDate: getFutureDate(45, 18, 0), // Same day, 6 PM
    location: "Kigali, Rwanda",
    venue: "Kigali Convention Centre",
    capacity: 300,
    price: 25000,
    currency: "RWF",
    registrationDeadline: getFutureDate(30, 23, 59), // 30 days from now
    speakers: [
      "Dr. Jean-Baptiste Nkurunziza - Director, Rwanda Civil Aviation Authority",
      "Sarah Mukamana - CEO, Rwanda Drone Services",
      "Dr. Paul Kagame - Research Director, University of Rwanda",
      "Marie Uwimana - Founder, AgriDrone Solutions"
    ],
    agenda: [
      "08:00 - 09:00: Registration and Networking Breakfast",
      "09:00 - 09:30: Opening Ceremony and Welcome Address",
      "09:30 - 10:30: Keynote: The Future of Drones in Rwanda",
      "10:30 - 11:00: Coffee Break and Exhibition Viewing",
      "11:00 - 12:30: Panel Discussion: Regulatory Landscape and Opportunities",
      "12:30 - 13:30: Lunch Break",
      "13:30 - 15:00: Technical Workshops (Parallel Sessions)",
      "15:00 - 15:30: Afternoon Break",
      "15:30 - 17:00: Industry Showcase and Case Studies",
      "17:00 - 18:00: Networking Reception and Awards Ceremony"
    ],
    requirements: [
      "Valid identification required",
      "Professional attire recommended",
      "Laptops/tablets welcome for workshops"
    ],
    tags: ["conference", "networking", "workshop", "industry", "innovation"]
  },
  {
    title: "Advanced Drone Piloting Workshop",
    description: "Intensive hands-on training workshop for experienced pilots looking to enhance their skills in advanced flight operations, safety protocols, and commercial applications.",
    fullDescription: `This comprehensive workshop is designed for pilots who already have basic certification and want to advance their skills. The program covers advanced flight techniques, emergency procedures, commercial operations, and regulatory compliance.

**Workshop Topics:**
- Advanced flight maneuvers and precision operations
- Emergency procedures and risk management
- Beyond Visual Line of Sight (BVLOS) operations
- Commercial operations and business development
- Maintenance and troubleshooting
- Weather assessment and flight planning
- Regulatory compliance and documentation

**Practical Training:**
Participants will have hands-on experience with various drone platforms, practice advanced maneuvers, and learn from experienced instructors. The workshop includes both classroom sessions and field exercises.

**Certification:**
Upon completion, participants will receive a certificate of advanced training that can support commercial pilot applications and insurance requirements.

**Prerequisites:**
- Basic drone pilot certification
- Minimum 20 hours of flight experience
- Own drone equipment (or rental available)`,
    categorySlug: "workshop",
    startDate: getFutureDate(20, 9, 0),
    endDate: getFutureDate(22, 17, 0), // 3-day workshop
    location: "Kigali, Rwanda",
    venue: "Rwanda Aviation Training Centre",
    capacity: 25,
    price: 150000,
    currency: "RWF",
    registrationDeadline: getFutureDate(10, 23, 59),
    speakers: [
      "Captain James Uwimana - Certified Flight Instructor",
      "David Nsengimana - Commercial Drone Operations Expert"
    ],
    agenda: [
      "Day 1: Advanced Flight Techniques and Safety",
      "Day 2: Commercial Operations and Regulations",
      "Day 3: Practical Exercises and Certification"
    ],
    requirements: [
      "Basic pilot certification required",
      "Bring your own drone (or rent on-site)",
      "Laptop for flight planning software",
      "Safety equipment provided"
    ],
    tags: ["training", "piloting", "certification", "advanced", "commercial"]
  },
  {
    title: "Drone Technology for Agriculture: Field Day",
    description: "Join us for a practical field demonstration of drone applications in agriculture, including crop monitoring, precision spraying, and data analysis.",
    fullDescription: `This field day event brings together farmers, agricultural extension officers, and drone service providers to explore practical applications of drone technology in agriculture.

**Field Demonstrations:**
- Multispectral imaging for crop health assessment
- Precision spraying and application techniques
- Crop counting and yield estimation
- Field mapping and boundary delineation
- Data analysis and interpretation

**Hands-On Experience:**
Participants will have the opportunity to see drones in action, interact with service providers, and learn how to interpret agricultural data collected by drones.

**Target Audience:**
- Smallholder and commercial farmers
- Agricultural extension officers
- Agricultural cooperatives
- Agribusiness professionals
- Students of agriculture

**What to Bring:**
- Comfortable field clothing
- Sun protection
- Notebook for taking notes
- Questions about your specific farming challenges`,
    categorySlug: "workshop",
    startDate: getFutureDate(35, 8, 0),
    endDate: getFutureDate(35, 15, 0),
    location: "Eastern Province, Rwanda",
    venue: "Agricultural Demonstration Farm",
    capacity: 50,
    price: 0,
    currency: "RWF",
    registrationDeadline: getFutureDate(25, 23, 59),
    speakers: [
      "Dr. Grace Mukamana - Agricultural Technology Specialist",
      "Eric Nkurunziza - Precision Agriculture Consultant"
    ],
    agenda: [
      "08:00 - 08:30: Registration and Welcome",
      "08:30 - 09:30: Introduction to Agricultural Drones",
      "09:30 - 12:00: Field Demonstrations",
      "12:00 - 13:00: Lunch Break",
      "13:00 - 14:30: Data Analysis Workshop",
      "14:30 - 15:00: Q&A and Networking"
    ],
    requirements: [
      "Field-appropriate clothing",
      "Transportation to venue (carpooling available)"
    ],
    tags: ["agriculture", "field-day", "demonstration", "farming", "technology"]
  },
  {
    title: "Women in Drones: Networking and Mentorship Event",
    description: "An exclusive networking event celebrating and supporting women in Rwanda's drone industry. Connect with mentors, share experiences, and build your professional network.",
    fullDescription: `This special event is designed to bring together women working in or interested in the drone industry. The event provides opportunities for networking, mentorship, and professional development.

**Event Highlights:**
- Panel discussion with successful women in the industry
- Speed networking sessions
- Mentorship matching opportunities
- Career development workshops
- Community building activities

**Featured Speakers:**
Hear from women leaders who have built successful careers in drone technology, from pilots to entrepreneurs, researchers to regulators.

**Mentorship Program:**
Connect with experienced professionals who can provide guidance on career development, business growth, and industry navigation.

**Why Attend:**
- Build meaningful professional relationships
- Learn from successful women in the field
- Find mentors and mentees
- Share challenges and solutions
- Grow your professional network

**Open to:**
- Women currently working in drone-related fields
- Women interested in entering the industry
- Students and recent graduates
- Entrepreneurs and business owners`,
    categorySlug: "networking",
    startDate: getFutureDate(28, 17, 0),
    endDate: getFutureDate(28, 20, 0),
    location: "Kigali, Rwanda",
    venue: "Innovation Hub Kigali",
    capacity: 60,
    price: 0,
    currency: "RWF",
    registrationDeadline: getFutureDate(20, 23, 59),
    speakers: [
      "Sarah Mukamana - CEO, Rwanda Drone Services",
      "Diane Uwimana - Commercial Pilot and Instructor",
      "Grace Nkurunziza - Drone Technology Researcher"
    ],
    agenda: [
      "17:00 - 17:30: Registration and Welcome Reception",
      "17:30 - 18:30: Panel Discussion: Women Leading in Drones",
      "18:30 - 19:00: Speed Networking",
      "19:00 - 19:30: Mentorship Matching",
      "19:30 - 20:00: Networking and Refreshments"
    ],
    requirements: [
      "Open to women only",
      "Business casual attire",
      "Bring business cards"
    ],
    tags: ["networking", "women", "mentorship", "community", "professional-development"]
  },
  {
    title: "Drone Regulations and Compliance Training",
    description: "Comprehensive training on Rwanda's drone regulations, compliance requirements, and best practices for safe and legal operations.",
    fullDescription: `Understanding and complying with regulations is essential for anyone operating drones in Rwanda. This training provides detailed guidance on regulatory requirements, compliance procedures, and best practices.

**Training Topics:**
- Overview of Rwanda Civil Aviation Authority (RCAA) regulations
- Registration requirements and procedures
- Operational limitations and restrictions
- Commercial operations and permits
- Insurance requirements
- Safety protocols and emergency procedures
- Documentation and record-keeping
- Recent regulatory updates and changes

**Who Should Attend:**
- New drone operators seeking certification
- Commercial operators requiring permits
- Organizations using drones for business
- Regulatory compliance officers
- Anyone needing to understand drone regulations

**Benefits:**
- Clear understanding of regulatory requirements
- Guidance on compliance procedures
- Updates on recent regulatory changes
- Q&A with regulatory experts
- Compliance checklist and resources

**Certification:**
Participants will receive a certificate of completion that can support regulatory compliance documentation.`,
    categorySlug: "training",
    startDate: getFutureDate(40, 9, 0),
    endDate: getFutureDate(40, 16, 0),
    location: "Kigali, Rwanda",
    venue: "RCAA Training Facility",
    capacity: 40,
    price: 50000,
    currency: "RWF",
    registrationDeadline: getFutureDate(30, 23, 59),
    speakers: [
      "Representative from Rwanda Civil Aviation Authority",
      "Legal Expert in Aviation Regulations",
      "Compliance Consultant"
    ],
    agenda: [
      "09:00 - 09:30: Registration",
      "09:30 - 10:30: Overview of RCAA Regulations",
      "10:30 - 11:00: Break",
      "11:00 - 12:30: Registration and Certification Requirements",
      "12:30 - 13:30: Lunch",
      "13:30 - 15:00: Operational Compliance and Best Practices",
      "15:00 - 15:30: Break",
      "15:30 - 16:00: Q&A and Compliance Resources"
    ],
    requirements: [
      "Valid identification",
      "Notebook for taking notes",
      "Questions about specific compliance scenarios"
    ],
    tags: ["training", "regulations", "compliance", "RCAA", "certification"]
  },
  {
    title: "Drone Technology Exhibition and Innovation Showcase",
    description: "Explore the latest drone technologies, innovations, and services from local and international companies. See live demonstrations and meet industry leaders.",
    fullDescription: `This exhibition brings together drone manufacturers, service providers, and technology companies to showcase the latest innovations in drone technology.

**Exhibition Highlights:**
- Live drone demonstrations
- Latest drone models and equipment
- Software and data analysis tools
- Service provider showcases
- Innovation competitions
- Networking opportunities

**Featured Exhibitors:**
- Leading drone manufacturers
- Local service providers
- Software and technology companies
- Training organizations
- Research institutions

**What to Expect:**
- See cutting-edge drone technology up close
- Watch live flight demonstrations
- Learn about new products and services
- Meet industry professionals
- Discover business opportunities
- Network with potential partners

**Special Features:**
- Innovation pitch competition
- Student project showcase
- Startup corner
- Technology demonstrations
- Expert consultations

**Who Should Attend:**
- Drone enthusiasts and hobbyists
- Business owners exploring drone services
- Researchers and developers
- Investors and entrepreneurs
- Students and educators
- Government officials`,
    categorySlug: "exhibition",
    startDate: getFutureDate(50, 10, 0),
    endDate: getFutureDate(50, 18, 0),
    location: "Kigali, Rwanda",
    venue: "Kigali Exhibition Centre",
    capacity: 500,
    price: 10000,
    currency: "RWF",
    registrationDeadline: getFutureDate(40, 23, 59),
    speakers: [
      "Industry Leaders Panel",
      "Innovation Showcase Presenters",
      "Technology Demonstrators"
    ],
    agenda: [
      "10:00 - 11:00: Opening Ceremony",
      "11:00 - 13:00: Exhibition Viewing and Demonstrations",
      "13:00 - 14:00: Lunch Break",
      "14:00 - 15:30: Innovation Pitch Competition",
      "15:30 - 17:00: Exhibition Continues",
      "17:00 - 18:00: Networking Reception"
    ],
    requirements: [
      "Valid identification",
      "Comfortable walking shoes",
      "Camera/phone for photos (permitted areas)"
    ],
    tags: ["exhibition", "technology", "innovation", "showcase", "networking"]
  },
  {
    title: "Youth Drone Training Program",
    description: "Free training program for young people (ages 16-25) interested in learning about drones. Introduction to drone technology, basic operations, and career opportunities.",
    fullDescription: `This special program is designed to introduce young people to drone technology and inspire the next generation of drone professionals. The program is completely free and open to youth aged 16-25.

**Program Content:**
- Introduction to drone technology
- Basic flight operations and safety
- Career opportunities in the drone industry
- Hands-on flight experience
- Industry mentorship
- Career guidance and support

**Program Goals:**
- Inspire interest in drone technology
- Provide basic skills and knowledge
- Connect youth with industry professionals
- Identify and support talented individuals
- Create pathways to careers in drones

**What Participants Will Learn:**
- How drones work and their applications
- Basic flight operations and safety
- Career paths in the drone industry
- Skills needed for success
- How to get started in the field

**Special Features:**
- Free training and materials
- Hands-on flight experience
- Industry mentorship opportunities
- Career guidance sessions
- Certificate of participation

**Eligibility:**
- Ages 16-25
- Interest in technology and innovation
- Commitment to attend all sessions
- No prior experience required`,
    categorySlug: "training",
    startDate: getFutureDate(60, 9, 0),
    endDate: getFutureDate(62, 16, 0), // 3-day program
    location: "Kigali, Rwanda",
    venue: "Youth Innovation Centre",
    capacity: 30,
    price: 0,
    currency: "RWF",
    registrationDeadline: getFutureDate(45, 23, 59),
    speakers: [
      "Experienced Drone Instructors",
      "Industry Professionals",
      "Career Guidance Counselors"
    ],
    agenda: [
      "Day 1: Introduction to Drones and Technology",
      "Day 2: Basic Operations and Safety",
      "Day 3: Career Opportunities and Next Steps"
    ],
    requirements: [
      "Ages 16-25 only",
      "Valid identification",
      "Parental consent for participants under 18",
      "Commitment to attend all sessions"
    ],
    tags: ["training", "youth", "education", "career", "free"]
  },
  {
    title: "Drone Applications in Healthcare: Workshop and Discussion",
    description: "Explore how drones are transforming healthcare delivery in Rwanda. Learn about medical supply delivery, emergency response, and future healthcare applications.",
    fullDescription: `This workshop explores the innovative use of drones in healthcare, focusing on Rwanda's experience with medical supply delivery and potential future applications.

**Workshop Topics:**
- Medical supply delivery systems
- Emergency response applications
- Laboratory sample transport
- Public health surveillance
- Future healthcare applications
- Regulatory considerations
- Implementation challenges and solutions

**Case Studies:**
- Zipline's medical delivery network
- Emergency response systems
- Laboratory sample transport
- Public health monitoring

**Panel Discussion:**
Experts from healthcare, technology, and regulatory sectors will discuss opportunities, challenges, and the future of drones in healthcare.

**Who Should Attend:**
- Healthcare professionals
- Public health officials
- Technology developers
- Policy makers
- Researchers
- Service providers

**Learning Objectives:**
- Understand current healthcare drone applications
- Learn about implementation challenges
- Explore future opportunities
- Network with healthcare and technology professionals`,
    categorySlug: "workshop",
    startDate: getFutureDate(55, 9, 0),
    endDate: getFutureDate(55, 16, 0),
    location: "Kigali, Rwanda",
    venue: "Ministry of Health Conference Hall",
    capacity: 80,
    price: 20000,
    currency: "RWF",
    registrationDeadline: getFutureDate(45, 23, 59),
    speakers: [
      "Dr. Marie Uwimana - Ministry of Health",
      "Healthcare Technology Expert",
      "Medical Supply Chain Specialist"
    ],
    agenda: [
      "09:00 - 09:30: Registration",
      "09:30 - 10:30: Overview of Healthcare Drone Applications",
      "10:30 - 11:00: Break",
      "11:00 - 12:30: Case Studies and Best Practices",
      "12:30 - 13:30: Lunch",
      "13:30 - 15:00: Panel Discussion: Future of Drones in Healthcare",
      "15:00 - 15:30: Break",
      "15:30 - 16:00: Q&A and Networking"
    ],
    requirements: [
      "Professional attire",
      "Valid identification",
      "Interest in healthcare technology"
    ],
    tags: ["workshop", "healthcare", "medical", "technology", "public-health"]
  },
  {
    title: "Regional Drone Community Meetup - Northern Province",
    description: "Monthly community meetup for drone enthusiasts in the Northern Province. Share experiences, learn from each other, and build the regional drone community.",
    fullDescription: `This monthly meetup brings together drone enthusiasts, pilots, and professionals from the Northern Province for networking, knowledge sharing, and community building.

**Meetup Format:**
- Casual networking and introductions
- Featured presentation or demonstration
- Open discussion and Q&A
- Community announcements
- Informal networking

**This Month's Focus:**
Each meetup features a different topic or activity. This month, we'll focus on agricultural applications and hear from local farmers using drone technology.

**What to Expect:**
- Meet fellow drone enthusiasts
- Learn something new
- Share your experiences
- Get answers to your questions
- Build your local network

**Who Should Attend:**
- Drone pilots and operators
- Hobbyists and enthusiasts
- Service providers
- Farmers and agricultural professionals
- Anyone interested in drones

**Community Building:**
These meetups are essential for building a strong regional drone community. Come share your passion, learn from others, and help grow the community.`,
    categorySlug: "networking",
    startDate: getFutureDate(15, 18, 0),
    endDate: getFutureDate(15, 20, 0),
    location: "Musanze, Northern Province, Rwanda",
    venue: "Community Innovation Hub",
    capacity: 40,
    price: 0,
    currency: "RWF",
    registrationDeadline: getFutureDate(10, 23, 59),
    speakers: [
      "Local Drone Operators",
      "Agricultural Technology Experts",
      "Community Members"
    ],
    agenda: [
      "18:00 - 18:30: Networking and Introductions",
      "18:30 - 19:30: Featured Presentation: Agricultural Applications",
      "19:30 - 20:00: Open Discussion and Q&A"
    ],
    requirements: [
      "Open to all",
      "Casual attire",
      "Bring your questions and experiences"
    ],
    tags: ["meetup", "networking", "community", "regional", "agriculture"]
  },
  {
    title: "Drone Business Development Workshop",
    description: "Learn how to start and grow a drone business in Rwanda. Topics include business planning, market analysis, service offerings, pricing strategies, and client acquisition.",
    fullDescription: `This comprehensive workshop is designed for entrepreneurs and business owners looking to start or grow a drone services business in Rwanda.

**Workshop Topics:**
- Market analysis and opportunity identification
- Business planning and financial modeling
- Service offerings and pricing strategies
- Marketing and client acquisition
- Operations and team building
- Regulatory compliance for businesses
- Scaling and growth strategies
- Case studies of successful drone businesses

**Who Should Attend:**
- Aspiring drone entrepreneurs
- Existing business owners exploring drone services
- Service providers looking to grow
- Business consultants
- Investors interested in drone businesses

**Workshop Format:**
- Interactive presentations
- Case study analysis
- Group exercises
- One-on-one consultations
- Networking opportunities

**Takeaways:**
- Business plan template
- Market analysis framework
- Pricing strategy guide
- Marketing resources
- Regulatory compliance checklist
- Network of fellow entrepreneurs

**Special Features:**
- Guest speakers from successful drone businesses
- Investor pitch session (optional)
- Business mentorship matching`,
    categorySlug: "workshop",
    startDate: getFutureDate(70, 9, 0),
    endDate: getFutureDate(71, 17, 0), // 2-day workshop
    location: "Kigali, Rwanda",
    venue: "Business Development Centre",
    capacity: 35,
    price: 75000,
    currency: "RWF",
    registrationDeadline: getFutureDate(60, 23, 59),
    speakers: [
      "Successful Drone Business Owners",
      "Business Development Experts",
      "Financial Planning Consultants",
      "Marketing Specialists"
    ],
    agenda: [
      "Day 1: Business Planning and Market Analysis",
      "Day 2: Operations, Marketing, and Growth Strategies"
    ],
    requirements: [
      "Business idea or existing business",
      "Laptop for business planning exercises",
      "Notebook for taking notes"
    ],
    tags: ["workshop", "business", "entrepreneurship", "startup", "development"]
  }
];

async function seedEvents() {
  try {
    console.log('🌱 Starting to seed events...\n');

    // Step 1: Create or get event categories
    console.log('📁 Creating event categories...');
    const categoryMap = {};
    for (const cat of categories) {
      // Check if category exists by name (since slug might not be unique in schema)
      const existing = await prisma.eventCategory.findFirst({
        where: { name: cat.name }
      });
      
      if (existing) {
        categoryMap[cat.slug] = existing.id;
        console.log(`   ✓ Category "${cat.name}" already exists`);
      } else {
        const created = await prisma.eventCategory.create({
          data: {
            name: cat.name,
            description: cat.description,
            slug: cat.slug,
            icon: cat.icon,
            color: cat.color
          }
        });
        categoryMap[cat.slug] = created.id;
        console.log(`   ✓ Created category: ${cat.name}`);
      }
    }

    // Step 2: Get all non-admin users
    console.log('\n👥 Fetching users...');
    const users = await prisma.user.findMany({
      where: { role: { not: 'admin' } },
      select: { id: true, username: true, role: true }
    });
    console.log(`   ✓ Found ${users.length} users`);

    if (users.length === 0) {
      console.log('   ⚠️  No users found. Please seed users first.');
      return;
    }

    // Step 3: Create events
    console.log('\n📅 Creating events...');
    const createdEvents = [];
    
    for (let i = 0; i < events.length; i++) {
      const eventData = events[i];
      const categoryId = categoryMap[eventData.categorySlug];
      const organizer = users[i % users.length]; // Distribute events across users
      
      const event = await prisma.event.create({
        data: {
          title: eventData.title,
          description: eventData.description,
          fullDescription: eventData.fullDescription,
          categoryId: categoryId,
          organizerId: organizer.id,
          startDate: eventData.startDate,
          endDate: eventData.endDate,
          location: eventData.location,
          venue: eventData.venue,
          capacity: eventData.capacity,
          price: eventData.price,
          currency: eventData.currency,
          registrationDeadline: eventData.registrationDeadline,
          speakers: eventData.speakers,
          agenda: eventData.agenda,
          requirements: eventData.requirements,
          tags: eventData.tags,
          isPublished: true,
          isApproved: true,
          approvedAt: new Date(),
          viewsCount: Math.floor(Math.random() * 200) + 50,
        }
      });

      // Update user's events count
      await prisma.user.update({
        where: { id: organizer.id },
        data: { eventsCount: { increment: 1 } }
      });

      createdEvents.push(event);
      console.log(`   ✓ Created event: "${event.title.substring(0, 50)}..." (${eventData.startDate.toLocaleDateString()})`);
    }

    // Summary
    console.log('\n✅ Successfully seeded events!');
    console.log(`\n📊 Summary:`);
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Events: ${createdEvents.length}`);
    console.log(`   - All events scheduled in the future`);
    
    // Show upcoming events
    console.log(`\n📅 Upcoming Events:`);
    createdEvents.forEach((event, index) => {
      const startDate = new Date(event.startDate);
      console.log(`   ${index + 1}. ${event.title.substring(0, 45)}... - ${startDate.toLocaleDateString()}`);
    });

  } catch (error) {
    console.error('❌ Error seeding events:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedEvents()
    .then(() => {
      console.log('\n🎉 Seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedEvents };
