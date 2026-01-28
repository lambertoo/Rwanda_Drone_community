const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// User roles to create (excluding admin)
const roles = ['hobbyist', 'pilot', 'regulator', 'student', 'service_provider'];

// Sample data for each role
const userData = {
  hobbyist: [
    { fullName: 'Jean Baptiste', email: 'jean.hobbyist1@uav.rw', username: 'jean_hobby1', location: 'KIGALI_GASABO', bio: 'Drone photography enthusiast from Kigali' },
    { fullName: 'Marie Claire', email: 'marie.hobbyist2@uav.rw', username: 'marie_hobby2', location: 'KIGALI_KICUKIRO', bio: 'Love flying drones for fun and capturing beautiful landscapes' },
    { fullName: 'Paul Nkurunziza', email: 'paul.hobbyist3@uav.rw', username: 'paul_hobby3', location: 'SOUTH_MUHANGA', bio: 'Hobbyist drone pilot exploring Rwanda from above' },
    { fullName: 'Grace Mukamana', email: 'grace.hobbyist4@uav.rw', username: 'grace_hobby4', location: 'WEST_RUBAVU', bio: 'Passionate about drone videography and aerial photography' },
    { fullName: 'David Nsengimana', email: 'david.hobbyist5@uav.rw', username: 'david_hobby5', location: 'EAST_KAYONZA', bio: 'Drone hobbyist sharing experiences with the community' },
  ],
  pilot: [
    { fullName: 'Captain James Uwimana', email: 'james.pilot1@uav.rw', username: 'james_pilot1', location: 'KIGALI_NYARUGENGE', bio: 'Commercial drone pilot with 5+ years experience', pilotLicense: 'RWA-PLT-2021-001', experience: 'expert', organization: 'Rwanda Aerial Services' },
    { fullName: 'Captain Sarah Mutoni', email: 'sarah.pilot2@uav.rw', username: 'sarah_pilot2', location: 'KIGALI_GASABO', bio: 'Certified commercial pilot specializing in agricultural drones', pilotLicense: 'RWA-PLT-2020-045', experience: 'expert', organization: 'AgriDrone Rwanda' },
    { fullName: 'Captain Peter Hakizimana', email: 'peter.pilot3@uav.rw', username: 'peter_pilot3', location: 'NORTH_MUSANZE', bio: 'Professional drone pilot for mapping and surveying', pilotLicense: 'RWA-PLT-2022-078', experience: 'advanced', organization: 'GeoSurvey Solutions' },
    { fullName: 'Captain Alice Uwase', email: 'alice.pilot4@uav.rw', username: 'alice_pilot4', location: 'SOUTH_HUYE', bio: 'Commercial pilot with expertise in cinematography', pilotLicense: 'RWA-PLT-2021-112', experience: 'advanced', organization: 'Cinematic Drones Ltd' },
    { fullName: 'Captain Robert Nkurunziza', email: 'robert.pilot5@uav.rw', username: 'robert_pilot5', location: 'WEST_KARONGI', bio: 'Experienced pilot for inspection and monitoring services', pilotLicense: 'RWA-PLT-2020-089', experience: 'expert', organization: 'Inspection Drones Rwanda' },
  ],
  regulator: [
    { fullName: 'Dr. Emmanuel Nkurunziza', email: 'emmanuel.regulator1@uav.rw', username: 'emmanuel_reg1', location: 'KIGALI_GASABO', bio: 'Senior Regulatory Officer - Rwanda Civil Aviation Authority', organization: 'Rwanda Civil Aviation Authority' },
    { fullName: 'Dr. Josephine Mukamana', email: 'josephine.regulator2@uav.rw', username: 'josephine_reg2', location: 'KIGALI_KICUKIRO', bio: 'Regulatory Compliance Specialist', organization: 'Rwanda Civil Aviation Authority' },
    { fullName: 'Eng. Patrick Nsengimana', email: 'patrick.regulator3@uav.rw', username: 'patrick_reg3', location: 'KIGALI_NYARUGENGE', bio: 'Aviation Safety Inspector', organization: 'Rwanda Civil Aviation Authority' },
    { fullName: 'Dr. Immaculee Uwimana', email: 'immaculee.regulator4@uav.rw', username: 'immaculee_reg4', location: 'KIGALI_GASABO', bio: 'Policy Development Officer for Drone Regulations', organization: 'Rwanda Civil Aviation Authority' },
    { fullName: 'Eng. Jean Baptiste', email: 'jb.regulator5@uav.rw', username: 'jb_reg5', location: 'KIGALI_KICUKIRO', bio: 'Licensing and Certification Officer', organization: 'Rwanda Civil Aviation Authority' },
  ],
  student: [
    { fullName: 'Aime Nkurunziza', email: 'aime.student1@uav.rw', username: 'aime_student1', location: 'KIGALI_GASABO', bio: 'Computer Science student learning drone programming', organization: 'University of Rwanda' },
    { fullName: 'Ange Mukamana', email: 'ange.student2@uav.rw', username: 'ange_student2', location: 'SOUTH_HUYE', bio: 'Engineering student interested in drone technology', organization: 'University of Rwanda' },
    { fullName: 'Eric Nsengimana', email: 'eric.student3@uav.rw', username: 'eric_student3', location: 'NORTH_MUSANZE', bio: 'Aviation student pursuing drone pilot certification', organization: 'Rwanda Aviation Academy' },
    { fullName: 'Diane Uwimana', email: 'diane.student4@uav.rw', username: 'diane_student4', location: 'EAST_KAYONZA', bio: 'Geography student using drones for research projects', organization: 'University of Rwanda' },
    { fullName: 'Fabrice Hakizimana', email: 'fabrice.student5@uav.rw', username: 'fabrice_student5', location: 'WEST_RUBAVU', bio: 'Mechanical engineering student building custom drones', organization: 'University of Rwanda' },
  ],
  service_provider: [
    { fullName: 'Rwanda Aerial Services', email: 'contact.service1@uav.rw', username: 'ras_services', location: 'KIGALI_GASABO', bio: 'Professional drone services for mapping, surveying, and inspection', organization: 'Rwanda Aerial Services', website: 'https://ras.rw', phone: '+250788123456' },
    { fullName: 'AgriDrone Solutions', email: 'info.service2@uav.rw', username: 'agridrone_rw', location: 'SOUTH_MUHANGA', bio: 'Agricultural drone services for crop monitoring and spraying', organization: 'AgriDrone Solutions', website: 'https://agridrone.rw', phone: '+250788234567' },
    { fullName: 'Cinematic Drones Rwanda', email: 'hello.service3@uav.rw', username: 'cinematic_drones', location: 'KIGALI_NYARUGENGE', bio: 'Professional aerial cinematography and photography services', organization: 'Cinematic Drones Rwanda', website: 'https://cinematic.rw', phone: '+250788345678' },
    { fullName: 'GeoSurvey Drones', email: 'survey.service4@uav.rw', username: 'geosurvey_rw', location: 'NORTH_MUSANZE', bio: 'Land surveying and mapping services using advanced drone technology', organization: 'GeoSurvey Drones', website: 'https://geosurvey.rw', phone: '+250788456789' },
    { fullName: 'Inspection Pro Drones', email: 'inspect.service5@uav.rw', username: 'inspection_pro', location: 'WEST_KARONGI', bio: 'Infrastructure inspection and monitoring services', organization: 'Inspection Pro Drones', website: 'https://inspectpro.rw', phone: '+250788567890' },
  ],
};

// Default password for all test users
const defaultPassword = 'TestUser123!';

async function seedUsers() {
  try {
    console.log('🌱 Starting user seeding process...\n');
    
    let totalCreated = 0;
    let totalSkipped = 0;

    for (const role of roles) {
      console.log(`\n📋 Creating users for role: ${role.toUpperCase()}`);
      console.log('─'.repeat(50));
      
      const users = userData[role];
      
      for (let i = 0; i < users.length; i++) {
        const userInfo = users[i];
        const email = userInfo.email;
        const username = userInfo.username;
        
        // Check if user already exists
        const existing = await prisma.user.findFirst({
          where: {
            OR: [
              { email },
              { username }
            ]
          }
        });

        if (existing) {
          console.log(`⏭️  Skipped: ${email} (already exists)`);
          totalSkipped++;
          continue;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(defaultPassword, 12);

        // Prepare user data
        const userDataToCreate = {
          username,
          email,
          password: hashedPassword,
          fullName: userInfo.fullName,
          role,
          isVerified: true,
          isActive: true,
          reputation: Math.floor(Math.random() * 50) + 10, // Random reputation between 10-60
          location: userInfo.location || 'UNKNOWN',
          bio: userInfo.bio || null,
          organization: userInfo.organization || null,
          website: userInfo.website || null,
          phone: userInfo.phone || null,
          pilotLicense: userInfo.pilotLicense || null,
          experience: userInfo.experience || null,
          specializations: userInfo.specializations ? JSON.stringify(userInfo.specializations) : null,
          certifications: userInfo.certifications ? JSON.stringify(userInfo.certifications) : null,
        };

        // Create user
        const user = await prisma.user.create({
          data: userDataToCreate
        });

        console.log(`✅ Created: ${user.fullName} (${email})`);
        totalCreated++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 Seeding Summary:');
    console.log('='.repeat(50));
    console.log(`✅ Users Created: ${totalCreated}`);
    console.log(`⏭️  Users Skipped: ${totalSkipped}`);
    console.log(`📝 Total Processed: ${totalCreated + totalSkipped}`);
    console.log('\n🔑 Default Password for all users: TestUser123!');
    console.log('\n🎉 User seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  seedUsers()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 User seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedUsers };
