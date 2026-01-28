// Load environment variables
require('dotenv').config({ path: '.env.production' });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Project categories to create if they don't exist
const categories = [
  {
    name: "Agriculture",
    description: "Agricultural monitoring, crop analysis, and farming applications",
    slug: "agriculture",
    icon: "🌾",
    color: "#22C55E"
  },
  {
    name: "Delivery & Logistics",
    description: "Package delivery, medical supplies, and logistics services",
    slug: "delivery-logistics",
    icon: "📦",
    color: "#06B6D4"
  },
  {
    name: "Mapping & Surveying",
    description: "Land surveying, mapping, and geographic information systems",
    slug: "mapping-surveying",
    icon: "🗺️",
    color: "#3B82F6"
  },
  {
    name: "Photography & Videography",
    description: "Aerial photography, videography, and creative media",
    slug: "photography-videography",
    icon: "📸",
    color: "#8B5CF6"
  },
  {
    name: "Research & Development",
    description: "Scientific research, testing, and technology development",
    slug: "research-development",
    icon: "🔬",
    color: "#F59E0B"
  },
  {
    name: "Search & Rescue",
    description: "Emergency response, search and rescue operations",
    slug: "search-rescue",
    icon: "🚨",
    color: "#EF4444"
  },
  {
    name: "Infrastructure Inspection",
    description: "Building inspection, infrastructure monitoring, and maintenance",
    slug: "infrastructure-inspection",
    icon: "🏗️",
    color: "#F97316"
  },
  {
    name: "Environmental Monitoring",
    description: "Wildlife monitoring, environmental research, and conservation",
    slug: "environmental-monitoring",
    icon: "🌿",
    color: "#10B981"
  }
];

// 25 long-form projects about Drone ecosystem and community in Rwanda
const projects = [
  {
    title: "Precision Agriculture Monitoring System for Smallholder Farmers in Rwanda",
    description: "A comprehensive drone-based agricultural monitoring system designed to help smallholder farmers optimize crop yields through advanced multispectral imaging and data analytics.",
    fullDescription: `This project aims to revolutionize agricultural practices in Rwanda by providing smallholder farmers with affordable access to precision agriculture technologies. Using drones equipped with multispectral cameras, we capture detailed crop health data that helps farmers make informed decisions about irrigation, fertilization, and pest management.

The system operates through a service model where farmers can request monitoring flights for their fields. Our team of certified pilots conducts regular surveys during critical growth stages, providing farmers with actionable insights through a user-friendly mobile application.

Key features include early disease detection, nutrient deficiency identification, and yield prediction models. The data collected helps farmers reduce input costs while maximizing productivity, contributing to food security and economic stability in rural communities.

We've successfully piloted this project with 50 farmers across three districts, resulting in an average yield increase of 23% and a 30% reduction in fertilizer usage. The positive impact has attracted interest from agricultural cooperatives and government extension services.

The project is currently expanding to serve 200 additional farmers in the Eastern Province, with plans to scale nationwide. We're also developing partnerships with financial institutions to make the service more accessible through microfinance options.

Challenges include weather dependency, limited technical knowledge among farmers, and the need for reliable internet connectivity in remote areas. We're addressing these through farmer training programs and offline-capable mobile applications.`,
    categorySlug: "agriculture",
    status: "in_progress",
    location: "Eastern Province, Rwanda",
    duration: "18 months",
    startDate: "2024-06-01",
    endDate: "2025-12-31",
    funding: "RWF 45,000,000 (Grant from Ministry of Agriculture)",
    technologies: ["DJI Phantom 4 Multispectral", "Agisoft Metashape", "Custom Analytics Platform", "Mobile App (React Native)"],
    objectives: [
      "Increase crop yields by 20% for participating farmers",
      "Reduce agricultural input costs by 25%",
      "Train 100 farmers in precision agriculture techniques",
      "Create 15 jobs for drone pilots and data analysts"
    ],
    challenges: [
      "Weather conditions affecting flight schedules",
      "Limited technical knowledge among target farmers",
      "Internet connectivity issues in remote areas",
      "Initial resistance to new technology adoption"
    ],
    outcomes: [
      "50 farmers successfully using the system",
      "Average yield increase of 23%",
      "30% reduction in fertilizer usage",
      "Positive feedback from 95% of participants"
    ],
    methodology: "We conduct bi-weekly drone flights during growing seasons, process imagery using photogrammetry software, and deliver insights through our mobile platform. Farmers receive alerts for issues requiring immediate attention.",
    results: "Pilot phase completed successfully with measurable improvements in crop yields and cost savings. Expansion phase initiated with strong farmer interest and government support."
  },
  {
    title: "Medical Supply Delivery Network for Remote Health Centers",
    description: "Establishing a drone delivery network to transport essential medical supplies, vaccines, and laboratory samples to remote health facilities across Rwanda.",
    fullDescription: `Inspired by Zipline's success, this project focuses on creating a complementary medical supply delivery network specifically designed for smaller health centers and clinics that may not be covered by existing infrastructure. Our system uses smaller, more agile drones capable of landing at facilities without dedicated infrastructure.

The project addresses critical gaps in healthcare delivery, particularly for time-sensitive supplies like blood products, vaccines requiring cold chain maintenance, and emergency medications. We've developed specialized containers that maintain temperature control during transport.

Our network currently serves 12 health centers in the Northern and Western Provinces, areas with challenging terrain that makes traditional road transport slow and unreliable. The drones can reach these facilities in 15-30 minutes, compared to 2-4 hours by road.

Key achievements include reducing delivery times by 85%, maintaining 100% cold chain compliance, and enabling same-day delivery of laboratory results. This has directly improved patient outcomes, particularly for emergency cases requiring blood transfusions.

We're working closely with the Ministry of Health and Rwanda Biomedical Center to ensure regulatory compliance and integration with existing supply chain systems. The project has received strong support from health workers who report improved service delivery capabilities.

Future plans include expanding to 30 additional health centers and adding capacity for transporting larger medical equipment. We're also exploring partnerships with pharmaceutical companies to optimize supply routes.`,
    categorySlug: "delivery-logistics",
    status: "in_progress",
    location: "Northern and Western Provinces, Rwanda",
    duration: "24 months",
    startDate: "2024-03-15",
    endDate: "2026-03-15",
    funding: "RWF 120,000,000 (Public-Private Partnership)",
    technologies: ["Custom Delivery Drones", "Temperature-Controlled Containers", "Flight Management System", "Health Center Integration Platform"],
    objectives: [
      "Serve 30 health centers by end of project",
      "Reduce delivery times by 80%",
      "Maintain 100% cold chain compliance",
      "Transport 500+ medical supplies monthly"
    ],
    challenges: [
      "Regulatory approval for BVLOS operations",
      "Weather conditions affecting flight schedules",
      "Integration with existing health systems",
      "Cost optimization for sustainable operations"
    ],
    outcomes: [
      "12 health centers currently served",
      "85% reduction in delivery times",
      "Zero cold chain violations",
      "Improved patient outcomes reported by health workers"
    ],
    methodology: "We operate scheduled flights three times weekly, with on-demand emergency deliveries available 24/7. Each health center has a designated landing zone, and staff are trained in receiving and handling deliveries.",
    results: "Successfully operational with measurable improvements in healthcare delivery. Strong stakeholder support and clear path to expansion."
  },
  {
    title: "3D Mapping and Land Surveying for Urban Planning in Kigali",
    description: "Creating high-resolution 3D maps and digital elevation models of Kigali to support urban planning, infrastructure development, and disaster risk assessment.",
    fullDescription: `This comprehensive mapping project uses advanced photogrammetry and LiDAR technologies to create detailed 3D models of Kigali's urban landscape. The resulting data supports multiple applications including urban planning, infrastructure development, flood risk assessment, and property valuation.

We've mapped over 200 square kilometers of the city, capturing buildings, roads, vegetation, and terrain features with centimeter-level accuracy. The 3D models enable planners to visualize proposed developments, assess environmental impacts, and optimize infrastructure placement.

The project has been particularly valuable for flood risk assessment, identifying areas prone to water accumulation during heavy rains. This information has informed drainage system improvements and building code updates in vulnerable zones.

Key stakeholders include the City of Kigali, Rwanda Housing Authority, and various construction companies. The data is accessible through a web-based platform that allows users to query specific areas, generate reports, and export data for use in CAD and GIS software.

We're currently expanding coverage to include peri-urban areas experiencing rapid development. The mapping data is updated quarterly to reflect new construction and infrastructure changes.

The project has created employment opportunities for 8 surveyors, 5 drone pilots, and 3 GIS specialists. We're also training local university students in modern surveying techniques, building capacity for future projects.`,
    categorySlug: "mapping-surveying",
    status: "completed",
    location: "Kigali, Rwanda",
    duration: "12 months",
    startDate: "2023-09-01",
    endDate: "2024-09-01",
    funding: "RWF 85,000,000 (City of Kigali)",
    technologies: ["DJI Matrice 300 RTK", "LiDAR Sensors", "Agisoft Metashape", "ArcGIS Pro", "Web Mapping Platform"],
    objectives: [
      "Map 200+ square kilometers of Kigali",
      "Create centimeter-accurate 3D models",
      "Support urban planning initiatives",
      "Build local technical capacity"
    ],
    challenges: [
      "Weather conditions affecting data collection",
      "Processing large volumes of data",
      "Ensuring data accuracy and quality control",
      "Coordinating with multiple stakeholders"
    ],
    outcomes: [
      "Successfully mapped 220 square kilometers",
      "Created detailed 3D models for entire city",
      "Supported 15+ urban planning projects",
      "Trained 20 students in modern surveying"
    ],
    methodology: "We conducted systematic flights following grid patterns, capturing overlapping imagery for photogrammetry processing. LiDAR data was collected for areas requiring high precision. All data was processed, validated, and integrated into our mapping platform.",
    results: "Project completed successfully with all objectives met. Data is actively being used by city planners and developers. Ongoing maintenance and updates continue."
  },
  {
    title: "Aerial Photography and Videography for Tourism Promotion",
    description: "Creating stunning aerial content showcasing Rwanda's natural beauty, cultural heritage, and tourism destinations to promote the country as a premier travel destination.",
    fullDescription: `This creative project produces high-quality aerial photography and videography content for Rwanda's tourism industry. We capture breathtaking footage of national parks, cultural sites, urban landscapes, and natural features that showcase the country's unique appeal.

Our content has been used in tourism marketing campaigns, travel documentaries, and promotional materials for hotels and tour operators. The aerial perspective provides viewers with a unique view of Rwanda's diverse landscapes, from the rolling hills of the countryside to the vibrant streets of Kigali.

We've produced content for major tourism campaigns including "Visit Rwanda" initiatives, national park promotions, and cultural festival coverage. Our work has been featured in international travel publications and social media campaigns reaching millions of viewers.

The project has created opportunities for local videographers, editors, and content creators. We're building a library of stock footage that can be licensed for various uses, creating a sustainable revenue stream while promoting Rwanda globally.

Key achievements include producing 50+ promotional videos, 200+ high-resolution photographs, and content that has generated over 10 million views across various platforms. This has contributed to increased tourism interest and bookings.

We're expanding our services to include live streaming capabilities for events and real-time social media content. We're also developing virtual reality experiences that allow potential visitors to explore destinations before traveling.`,
    categorySlug: "photography-videography",
    status: "in_progress",
    location: "Nationwide, Rwanda",
    duration: "Ongoing",
    startDate: "2023-01-15",
    endDate: null,
    funding: "RWF 35,000,000 (Tourism Revenue)",
    technologies: ["DJI Mavic 3 Cine", "DJI Inspire 2", "Professional Camera Gimbals", "Adobe Creative Suite", "Color Grading Software"],
    objectives: [
      "Produce 100+ promotional videos",
      "Create comprehensive photo library",
      "Reach 50 million viewers globally",
      "Support tourism industry growth"
    ],
    challenges: [
      "Weather conditions affecting shoots",
      "Obtaining permits for restricted areas",
      "Maintaining creative quality at scale",
      "Competing with international content creators"
    ],
    outcomes: [
      "50+ videos produced and published",
      "200+ high-resolution photographs",
      "10+ million views across platforms",
      "Increased tourism interest and bookings"
    ],
    methodology: "We conduct location scouting, plan shoots around optimal lighting conditions, capture footage using multiple camera systems, and produce polished content through professional editing and color grading.",
    results: "Ongoing project with strong performance metrics. Content continues to generate engagement and support tourism promotion efforts."
  },
  {
    title: "Drone Technology Research and Development Laboratory",
    description: "Establishing a state-of-the-art R&D facility for developing and testing new drone technologies tailored to African contexts and local needs.",
    fullDescription: `This research and development project creates a dedicated laboratory for advancing drone technology in Rwanda and the broader African context. The facility focuses on developing solutions that address local challenges including weather conditions, terrain, regulatory requirements, and economic constraints.

Our research areas include developing weather-resistant drone designs, creating cost-effective sensor packages, advancing battery technology for longer flight times, and developing AI systems for automated data analysis. We're also researching materials and manufacturing techniques that could enable local production of drone components.

The laboratory collaborates with universities, international research institutions, and industry partners. We've established partnerships with institutions in Kenya, South Africa, and Europe to share knowledge and resources.

Key research projects include developing drones optimized for high-altitude operations (important in Rwanda's mountainous terrain), creating payload systems for specific agricultural applications, and advancing swarm technology for coordinated operations.

The facility has created opportunities for 12 researchers, engineers, and technicians. We're also providing internship programs for university students and supporting graduate research projects.

Achievements include filing 3 patents for innovative drone designs, publishing 8 research papers, and developing 5 prototype systems that are being tested in real-world applications. The laboratory has become a hub for innovation in the regional drone ecosystem.`,
    categorySlug: "research-development",
    status: "in_progress",
    location: "Kigali, Rwanda",
    duration: "36 months",
    startDate: "2024-01-01",
    endDate: "2027-01-01",
    funding: "RWF 200,000,000 (Research Grants and Private Investment)",
    technologies: ["3D Printing Facilities", "Electronics Lab", "Testing Equipment", "CAD Software", "Simulation Tools"],
    objectives: [
      "Develop 10+ innovative drone technologies",
      "File 5+ patents",
      "Publish 15+ research papers",
      "Train 50+ researchers and engineers"
    ],
    challenges: [
      "Access to specialized equipment and materials",
      "Attracting and retaining research talent",
      "Balancing research with commercial viability",
      "Navigating intellectual property issues"
    ],
    outcomes: [
      "3 patents filed",
      "8 research papers published",
      "5 prototype systems developed",
      "12 researchers employed"
    ],
    methodology: "We follow a structured R&D process including problem identification, concept development, prototyping, testing, and iteration. Research is conducted in collaboration with academic and industry partners.",
    results: "Laboratory operational with active research programs. Early achievements demonstrate strong potential for innovation and impact."
  },
  {
    title: "Search and Rescue Operations Support System",
    description: "Developing a drone-based search and rescue system to assist emergency services in locating missing persons, assessing disaster areas, and coordinating rescue operations.",
    fullDescription: `This critical project creates a comprehensive search and rescue support system using drones equipped with thermal imaging, high-resolution cameras, and communication equipment. The system assists emergency services in locating missing persons, assessing disaster areas, and coordinating rescue operations.

We've trained emergency response teams in drone operations and established protocols for rapid deployment during emergencies. The drones can cover large areas quickly, providing real-time video feeds to command centers and enabling faster response times.

The system has been deployed in several real-world scenarios including missing person searches, flood assessment, and post-disaster damage evaluation. In one case, a drone located a missing hiker in the Virunga Mountains within 2 hours, compared to what would have been a multi-day ground search.

Key capabilities include thermal imaging for night operations, loudspeakers for communication with subjects, and payload delivery systems for emergency supplies. We're also developing AI systems to automatically detect people in imagery, reducing search times.

The project operates in coordination with Rwanda National Police, Rwanda Defense Force, and disaster management authorities. We maintain 24/7 readiness for emergency deployments and conduct regular training exercises.

Future enhancements include integrating with emergency communication systems, developing autonomous search patterns, and expanding coverage to include water rescue operations.`,
    categorySlug: "search-rescue",
    status: "in_progress",
    location: "Nationwide, Rwanda",
    duration: "Ongoing",
    startDate: "2023-06-01",
    endDate: null,
    funding: "RWF 60,000,000 (Government Emergency Services)",
    technologies: ["DJI Matrice 30T (Thermal)", "FLIR Thermal Cameras", "Communication Systems", "Emergency Response Software"],
    objectives: [
      "Reduce search times by 70%",
      "Support 50+ rescue operations annually",
      "Train 30+ emergency responders",
      "Maintain 24/7 operational readiness"
    ],
    challenges: [
      "Weather conditions limiting operations",
      "Regulatory restrictions in emergency situations",
      "Coordination with multiple agencies",
      "Maintaining equipment readiness"
    ],
    outcomes: [
      "Successfully deployed in 15+ operations",
      "Average search time reduction of 65%",
      "30 emergency responders trained",
      "Improved coordination and response capabilities"
    ],
    methodology: "We maintain rapid deployment capabilities with trained pilots on standby. Operations follow established protocols for coordination with emergency services, ensuring safety and effectiveness.",
    results: "System operational and actively supporting emergency services. Proven effectiveness in real-world scenarios with strong stakeholder support."
  },
  {
    title: "Bridge and Infrastructure Inspection Program",
    description: "Systematic inspection of bridges, buildings, and critical infrastructure using drones to identify maintenance needs, structural issues, and safety hazards.",
    fullDescription: `This infrastructure inspection program uses drones equipped with high-resolution cameras, thermal imaging, and specialized sensors to inspect bridges, buildings, and other critical infrastructure. The program helps identify maintenance needs early, preventing costly repairs and ensuring public safety.

We've inspected over 50 bridges across Rwanda, providing detailed reports on structural conditions, identifying cracks, corrosion, and other issues that require attention. The drone-based approach is safer, faster, and more cost-effective than traditional inspection methods requiring scaffolding or cranes.

The inspection data is processed to create 3D models and detailed reports that help engineers prioritize maintenance work. We've identified several critical issues that were addressed before they became safety hazards.

Key advantages include accessing difficult-to-reach areas, capturing high-resolution imagery for detailed analysis, and creating historical records for tracking changes over time. The data supports maintenance planning and budget allocation.

The program works with the Ministry of Infrastructure, Rwanda Transport Development Agency, and local governments. We're expanding to include inspection of water treatment facilities, power lines, and other critical infrastructure.

Future plans include developing automated defect detection using AI, creating predictive maintenance models, and establishing regular inspection schedules for all critical infrastructure.`,
    categorySlug: "infrastructure-inspection",
    status: "in_progress",
    location: "Nationwide, Rwanda",
    duration: "24 months",
    startDate: "2024-02-01",
    endDate: "2026-02-01",
    funding: "RWF 95,000,000 (Ministry of Infrastructure)",
    technologies: ["DJI Matrice 300 RTK", "Thermal Cameras", "Photogrammetry Software", "Structural Analysis Tools"],
    objectives: [
      "Inspect 100+ infrastructure assets",
      "Identify critical maintenance needs",
      "Create comprehensive inspection database",
      "Support infrastructure maintenance planning"
    ],
    challenges: [
      "Accessing restricted areas",
      "Weather conditions affecting inspections",
      "Processing and analyzing large datasets",
      "Coordinating with infrastructure owners"
    ],
    outcomes: [
      "50+ bridges inspected",
      "15 critical issues identified and addressed",
      "Comprehensive inspection database created",
      "Improved maintenance planning capabilities"
    ],
    methodology: "We conduct systematic inspections following industry standards, capture high-resolution imagery and thermal data, process information using specialized software, and provide detailed reports with recommendations.",
    results: "Program progressing well with significant infrastructure coverage. Inspection data is actively used for maintenance planning and safety improvements."
  },
  {
    title: "Wildlife Monitoring and Anti-Poaching Initiative",
    description: "Using drones for wildlife monitoring, anti-poaching operations, and habitat assessment in Rwanda's national parks and protected areas.",
    fullDescription: `This conservation project uses drones to monitor wildlife populations, detect poaching activities, and assess habitat conditions in Rwanda's national parks. The system supports conservation efforts while minimizing disturbance to animals.

We conduct regular monitoring flights to track animal movements, count populations, and identify changes in habitat. The drones are equipped with thermal imaging for night operations, helping detect poaching activities that often occur after dark.

The project has been particularly effective in monitoring mountain gorilla populations, providing data that supports conservation management decisions. We've also used drones to assess habitat quality and identify areas requiring restoration.

Key achievements include detecting and preventing several poaching attempts, providing data that informed conservation strategies, and supporting research on animal behavior and habitat use. The non-invasive monitoring approach is preferred over traditional ground-based methods.

We work closely with the Rwanda Development Board, park rangers, and conservation organizations. The data collected supports research, management decisions, and conservation planning.

Future enhancements include developing AI systems for automatic animal detection and counting, expanding coverage to additional protected areas, and integrating with other conservation technologies.`,
    categorySlug: "environmental-monitoring",
    status: "in_progress",
    location: "Volcanoes National Park, Akagera National Park, Rwanda",
    duration: "Ongoing",
    startDate: "2023-09-01",
    endDate: null,
    funding: "RWF 75,000,000 (Conservation Grants and Government Support)",
    technologies: ["DJI Matrice 30T", "Thermal Imaging", "Wildlife Tracking Software", "Conservation Database"],
    objectives: [
      "Monitor wildlife populations regularly",
      "Detect and prevent poaching activities",
      "Support conservation research",
      "Assess habitat conditions"
    ],
    challenges: [
      "Minimizing disturbance to wildlife",
      "Operating in challenging terrain",
      "Weather conditions affecting flights",
      "Coordinating with park operations"
    ],
    outcomes: [
      "Regular wildlife monitoring established",
      "Several poaching attempts detected and prevented",
      "Data supporting conservation decisions",
      "Improved habitat assessment capabilities"
    ],
    methodology: "We conduct scheduled monitoring flights following protocols designed to minimize wildlife disturbance. Thermal imaging is used for night operations, and all data is integrated into conservation databases.",
    results: "Project successfully supporting conservation efforts with measurable impact on wildlife protection and research."
  },
  {
    title: "Crop Insurance Assessment and Damage Evaluation",
    description: "Using drones to assess crop damage for insurance claims, helping farmers receive fair compensation and insurance companies make accurate assessments.",
    fullDescription: `This innovative project uses drone technology to assess crop damage for insurance purposes, providing accurate and timely evaluations that help farmers receive fair compensation. The system addresses challenges in traditional damage assessment methods that are often slow, subjective, and costly.

We conduct damage assessments following weather events, pest outbreaks, or other incidents affecting crops. Drones capture detailed imagery that is analyzed to quantify damage extent, estimate yield losses, and determine compensation amounts.

The project has processed over 200 insurance claims, reducing assessment time from weeks to days and providing more accurate damage quantification. This has improved trust between farmers and insurance companies while speeding up compensation payments.

Key advantages include objective damage assessment, comprehensive coverage of large fields, historical comparison capabilities, and detailed documentation for insurance records. The system also helps identify patterns that can inform risk management strategies.

We work with agricultural insurance companies, farmer cooperatives, and government agricultural agencies. The service is becoming standard practice for crop insurance assessments in Rwanda.

Future plans include developing automated damage detection algorithms, expanding to additional crop types, and creating predictive models for risk assessment.`,
    categorySlug: "agriculture",
    status: "in_progress",
    location: "Nationwide, Rwanda",
    duration: "18 months",
    startDate: "2024-04-01",
    endDate: "2025-10-01",
    funding: "RWF 40,000,000 (Insurance Industry Partnership)",
    technologies: ["Multispectral Cameras", "Damage Assessment Software", "Insurance Integration Platform", "Mobile Reporting App"],
    objectives: [
      "Process 500+ insurance assessments",
      "Reduce assessment time by 80%",
      "Improve assessment accuracy",
      "Support fair compensation for farmers"
    ],
    challenges: [
      "Standardizing damage assessment criteria",
      "Weather conditions affecting assessments",
      "Coordinating with multiple insurance companies",
      "Training assessors in new methodologies"
    ],
    outcomes: [
      "200+ assessments completed",
      "70% reduction in assessment time",
      "Improved accuracy and farmer satisfaction",
      "Standardized assessment protocols established"
    ],
    methodology: "We deploy drones immediately after damage events, capture comprehensive imagery, analyze data using specialized software, and provide detailed assessment reports to insurance companies and farmers.",
    results: "Project successfully improving insurance assessment processes with strong adoption by insurance companies and positive feedback from farmers."
  },
  {
    title: "Urban Air Quality Monitoring Network",
    description: "Deploying drones equipped with air quality sensors to monitor pollution levels across Kigali and other urban areas, supporting environmental health initiatives.",
    fullDescription: `This environmental monitoring project uses drones equipped with air quality sensors to measure pollution levels across urban areas. The system provides real-time data on air quality that supports public health initiatives and environmental policy.

We conduct regular monitoring flights at different times of day and locations to build comprehensive air quality maps. The data helps identify pollution sources, track changes over time, and assess the effectiveness of environmental interventions.

The project has revealed important insights about air quality patterns, including peak pollution times and areas with consistently poor air quality. This information has informed policy decisions and public health advisories.

Key capabilities include measuring multiple pollutants (PM2.5, PM10, NO2, O3), creating pollution maps, tracking changes over time, and providing data for public health research. The system complements ground-based monitoring stations.

We work with the Rwanda Environment Management Authority, Ministry of Health, and research institutions. The data is made available through public dashboards and supports academic research.

Future enhancements include expanding sensor capabilities, increasing monitoring frequency, developing pollution prediction models, and integrating with traffic and weather data for comprehensive analysis.`,
    categorySlug: "environmental-monitoring",
    status: "planning",
    location: "Kigali and Urban Centers, Rwanda",
    duration: "24 months",
    startDate: "2025-01-01",
    endDate: "2027-01-01",
    funding: "RWF 55,000,000 (Environmental Grants)",
    technologies: ["Air Quality Sensors", "Data Logging Systems", "Environmental Monitoring Platform", "Public Dashboard"],
    objectives: [
      "Establish comprehensive air quality monitoring",
      "Create pollution maps for urban areas",
      "Support environmental policy development",
      "Provide data for public health research"
    ],
    challenges: [
      "Sensor calibration and accuracy",
      "Weather conditions affecting operations",
      "Data processing and analysis",
      "Public communication of results"
    ],
    outcomes: [],
    methodology: "We will conduct systematic monitoring flights following established routes and schedules. Data will be collected, validated, processed, and made available through public platforms.",
    results: "Project in planning phase with strong stakeholder support and clear implementation roadmap."
  },
  {
    title: "Disaster Response and Damage Assessment System",
    description: "Rapid deployment drone system for assessing damage after natural disasters, supporting emergency response and recovery planning.",
    fullDescription: `This emergency response project provides rapid damage assessment capabilities following natural disasters such as floods, landslides, and storms. Drones are deployed immediately after events to assess damage, identify affected areas, and support emergency response coordination.

The system has been deployed following several flood events and landslides, providing critical information that guided emergency response efforts. The rapid assessment capabilities help prioritize rescue operations and resource allocation.

Key capabilities include rapid deployment (within hours of events), comprehensive area coverage, detailed damage documentation, and support for recovery planning. The system provides both real-time video feeds and detailed post-flight analysis.

We work with disaster management authorities, emergency services, and humanitarian organizations. The rapid assessment data supports decision-making during critical response phases.

The project has improved response times and coordination during emergencies. Detailed damage documentation also supports insurance claims and recovery planning efforts.

Future enhancements include developing automated damage detection algorithms, expanding coverage capabilities, and integrating with emergency communication systems for real-time coordination.`,
    categorySlug: "search-rescue",
    status: "in_progress",
    location: "Nationwide, Rwanda",
    duration: "Ongoing",
    startDate: "2023-11-01",
    endDate: null,
    funding: "RWF 50,000,000 (Disaster Management Authority)",
    technologies: ["Rapid Deployment Drones", "High-Resolution Cameras", "Damage Assessment Software", "Emergency Coordination Platform"],
    objectives: [
      "Respond to disasters within 4 hours",
      "Provide comprehensive damage assessments",
      "Support emergency response coordination",
      "Document damage for recovery planning"
    ],
    challenges: [
      "Weather conditions during disasters",
      "Rapid deployment logistics",
      "Coordinating with multiple agencies",
      "Processing data under time pressure"
    ],
    outcomes: [
      "Deployed in 8+ disaster events",
      "Average response time of 3.5 hours",
      "Improved emergency coordination",
      "Comprehensive damage documentation"
    ],
    methodology: "We maintain 24/7 readiness with trained pilots and equipment. Upon disaster notification, we deploy immediately, conduct systematic assessments, and provide real-time updates to emergency coordinators.",
    results: "System operational and proven effective in multiple disaster scenarios. Strong integration with emergency services."
  },
  {
    title: "Livestock Monitoring and Management System",
    description: "Using drones to monitor livestock health, track movements, and manage grazing patterns for improved animal husbandry and farm productivity.",
    fullDescription: `This agricultural project uses drones to monitor livestock, track animal health, and manage grazing patterns. The system helps farmers optimize herd management, identify health issues early, and improve overall farm productivity.

We conduct regular monitoring flights to count animals, assess body condition, and identify any health concerns. The drones can cover large grazing areas quickly, providing farmers with comprehensive herd information.

Key features include animal counting and tracking, health assessment through visual analysis, grazing pattern monitoring, and support for rotational grazing systems. The system helps farmers make informed decisions about feeding, veterinary care, and pasture management.

The project has been piloted with dairy and beef farmers, showing positive results in herd management and productivity. Farmers report better visibility into their operations and improved ability to identify issues early.

We're expanding to include integration with farm management software, automated health alerts, and support for larger operations. The system is particularly valuable for farms with extensive grazing areas.

Future plans include developing AI systems for automatic animal identification and health assessment, integrating with IoT sensors, and expanding to additional livestock types.`,
    categorySlug: "agriculture",
    status: "in_progress",
    location: "Rural Districts, Rwanda",
    duration: "18 months",
    startDate: "2024-05-15",
    endDate: "2025-11-15",
    funding: "RWF 35,000,000 (Agricultural Development Fund)",
    technologies: ["Livestock Monitoring Drones", "Animal Tracking Software", "Farm Management Integration", "Mobile Reporting App"],
    objectives: [
      "Serve 100+ livestock farmers",
      "Improve herd management practices",
      "Reduce livestock losses",
      "Increase farm productivity"
    ],
    challenges: [
      "Animal behavior affecting monitoring",
      "Weather conditions",
      "Farmer adoption of new technology",
      "Scaling to serve more farmers"
    ],
    outcomes: [
      "30+ farmers actively using system",
      "Improved herd visibility and management",
      "Early detection of health issues",
      "Positive farmer feedback"
    ],
    methodology: "We conduct regular monitoring flights following farmer schedules, analyze imagery for animal health and behavior, and provide reports through mobile applications with actionable recommendations.",
    results: "Pilot phase successful with strong farmer interest. Expansion underway to serve more operations."
  },
  {
    title: "Construction Site Monitoring and Progress Tracking",
    description: "Regular drone flights to monitor construction progress, ensure safety compliance, and create documentation for project management.",
    fullDescription: `This construction management project uses drones to monitor construction sites, track progress, ensure safety compliance, and create comprehensive project documentation. The system provides project managers with regular updates and helps identify issues early.

We conduct weekly or bi-weekly flights depending on project phase, capturing detailed imagery that shows progress, identifies potential issues, and documents work completed. The data supports project management, client reporting, and quality control.

Key capabilities include progress tracking through time-lapse documentation, safety compliance monitoring, material inventory assessment, and 3D modeling of construction sites. The system helps keep projects on schedule and within budget.

The project has been used on multiple construction sites including residential developments, commercial buildings, and infrastructure projects. Clients appreciate the regular updates and detailed documentation.

We're expanding services to include automated progress measurement, integration with project management software, and predictive analytics for project completion timelines.

Future enhancements include developing AI systems for automatic progress detection, safety hazard identification, and integration with BIM (Building Information Modeling) systems.`,
    categorySlug: "infrastructure-inspection",
    status: "in_progress",
    location: "Kigali and Construction Sites, Rwanda",
    duration: "Ongoing",
    startDate: "2023-08-01",
    endDate: null,
    funding: "RWF 45,000,000 (Service Revenue)",
    technologies: ["Construction Monitoring Drones", "Progress Tracking Software", "3D Modeling Tools", "Project Management Integration"],
    objectives: [
      "Serve 20+ construction projects",
      "Improve project management efficiency",
      "Enhance safety compliance",
      "Create comprehensive project documentation"
    ],
    challenges: [
      "Weather conditions affecting flights",
      "Coordinating with construction schedules",
      "Processing large volumes of data",
      "Integrating with existing project management systems"
    ],
    outcomes: [
      "15+ active construction projects",
      "Improved project visibility and management",
      "Enhanced safety monitoring",
      "Comprehensive project documentation"
    ],
    methodology: "We conduct regular scheduled flights, capture comprehensive site imagery, process data to create progress reports and 3D models, and deliver updates through project management platforms.",
    results: "Service successfully operational with strong client satisfaction and growing demand."
  },
  {
    title: "Water Resource Monitoring and Management",
    description: "Monitoring water bodies, assessing water quality, and tracking changes in water resources to support sustainable water management.",
    fullDescription: `This environmental project uses drones to monitor water bodies, assess water quality, and track changes in water resources. The system supports sustainable water management and helps identify issues affecting water availability and quality.

We conduct regular monitoring flights over rivers, lakes, and reservoirs, capturing imagery that reveals water levels, quality indicators, and changes over time. The data supports water resource planning and management decisions.

Key capabilities include water level monitoring, quality assessment through visual indicators, identification of pollution sources, and tracking of seasonal changes. The system helps manage water resources more effectively.

The project has been particularly valuable for monitoring reservoirs and irrigation systems, providing data that supports agricultural water management. We've also identified several pollution sources that were addressed.

We work with the Rwanda Water and Sanitation Corporation, Ministry of Environment, and water management authorities. The data supports policy development and resource allocation decisions.

Future plans include expanding sensor capabilities for direct water quality measurement, developing predictive models for water availability, and integrating with water management systems.`,
    categorySlug: "environmental-monitoring",
    status: "in_progress",
    location: "Nationwide Water Bodies, Rwanda",
    duration: "24 months",
    startDate: "2024-03-01",
    endDate: "2026-03-01",
    funding: "RWF 65,000,000 (Water Management Authority)",
    technologies: ["Water Monitoring Drones", "Multispectral Sensors", "Water Quality Analysis Tools", "Resource Management Platform"],
    objectives: [
      "Monitor 30+ water bodies regularly",
      "Assess water quality and availability",
      "Support water resource management",
      "Identify and address pollution sources"
    ],
    challenges: [
      "Weather conditions affecting operations",
      "Accessing remote water bodies",
      "Sensor calibration and accuracy",
      "Integrating with existing monitoring systems"
    ],
    outcomes: [
      "20+ water bodies under regular monitoring",
      "Water quality data supporting management decisions",
      "Several pollution sources identified and addressed",
      "Improved water resource visibility"
    ],
    methodology: "We conduct regular monitoring flights following established schedules, capture imagery and sensor data, analyze information for water quality and quantity indicators, and provide reports to water management authorities.",
    results: "Project progressing well with comprehensive water resource monitoring established."
  },
  {
    title: "Forest Fire Detection and Prevention System",
    description: "Early detection of forest fires using thermal imaging drones, supporting rapid response and fire prevention efforts.",
    fullDescription: `This fire prevention project uses drones equipped with thermal imaging to detect forest fires early, before they spread and cause significant damage. The system supports rapid response and helps protect forests and nearby communities.

We conduct regular patrol flights during dry seasons when fire risk is highest. Thermal imaging can detect fires even when they're small and not yet visible to the naked eye, enabling rapid response.

The system has detected several fires in early stages, allowing firefighting teams to respond quickly and prevent larger fires. This has protected valuable forest resources and reduced firefighting costs.

Key capabilities include early fire detection through thermal imaging, rapid alert systems, fire spread prediction, and support for firefighting coordination. The system operates during high-risk periods and can be deployed immediately when fires are detected.

We work with the Rwanda Environment Management Authority, firefighting services, and forest management organizations. The system complements ground-based fire detection and response capabilities.

Future enhancements include developing AI systems for automatic fire detection, expanding coverage to additional forest areas, and integrating with weather monitoring for fire risk prediction.`,
    categorySlug: "environmental-monitoring",
    status: "planning",
    location: "Forest Areas, Rwanda",
    duration: "18 months",
    startDate: "2025-06-01",
    endDate: "2026-12-01",
    funding: "RWF 70,000,000 (Environmental Protection Fund)",
    technologies: ["Thermal Imaging Drones", "Fire Detection Software", "Alert Systems", "Fire Risk Assessment Tools"],
    objectives: [
      "Detect fires in early stages",
      "Reduce fire response times",
      "Protect forest resources",
      "Support fire prevention efforts"
    ],
    challenges: [
      "Operating in challenging forest terrain",
      "Weather conditions affecting operations",
      "Coordinating with firefighting services",
      "Maintaining equipment during fire seasons"
    ],
    outcomes: [],
    methodology: "We will conduct regular patrol flights during high-risk periods, use thermal imaging for early detection, immediately alert firefighting services when fires are detected, and support response coordination.",
    results: "Project in planning phase with strong support from environmental and firefighting authorities."
  },
  {
    title: "Mining Site Monitoring and Environmental Compliance",
    description: "Monitoring mining operations for environmental compliance, safety, and operational efficiency.",
    fullDescription: `This mining industry project uses drones to monitor mining operations, ensure environmental compliance, assess safety conditions, and support operational efficiency. The system provides regular oversight of mining activities.

We conduct regular monitoring flights over mining sites, capturing imagery that reveals operational status, environmental impacts, and safety conditions. The data supports regulatory compliance and operational management.

Key capabilities include environmental impact assessment, safety monitoring, operational progress tracking, and compliance documentation. The system helps mining companies meet regulatory requirements while improving operations.

The project has been used to monitor several mining operations, providing data that supports environmental compliance reporting and operational improvements. Regulators appreciate the comprehensive oversight capabilities.

We work with mining companies, environmental regulators, and safety authorities. The monitoring data supports compliance reporting and helps identify areas for improvement.

Future plans include developing automated compliance checking, expanding monitoring capabilities, and integrating with mining management systems.`,
    categorySlug: "infrastructure-inspection",
    status: "in_progress",
    location: "Mining Sites, Rwanda",
    duration: "Ongoing",
    startDate: "2024-01-15",
    endDate: null,
    funding: "RWF 50,000,000 (Mining Industry Contracts)",
    technologies: ["Mining Monitoring Drones", "Environmental Assessment Tools", "Compliance Reporting Software", "Safety Monitoring Systems"],
    objectives: [
      "Monitor 10+ mining operations",
      "Ensure environmental compliance",
      "Improve safety monitoring",
      "Support operational efficiency"
    ],
    challenges: [
      "Accessing restricted mining areas",
      "Weather conditions",
      "Coordinating with mining schedules",
      "Processing and analyzing monitoring data"
    ],
    outcomes: [
      "8+ mining sites under regular monitoring",
      "Improved compliance documentation",
      "Enhanced safety oversight",
      "Operational improvements identified"
    ],
    methodology: "We conduct regular scheduled monitoring flights, capture comprehensive site imagery, analyze data for compliance and safety indicators, and provide detailed reports to mining companies and regulators.",
    results: "Service operational with strong adoption by mining companies and positive feedback from regulators."
  },
  {
    title: "Telecommunications Tower Inspection and Maintenance",
    description: "Regular inspection of telecommunications towers using drones to identify maintenance needs and ensure service reliability.",
    fullDescription: `This telecommunications project uses drones to inspect cell towers and communication infrastructure, identifying maintenance needs and ensuring service reliability. The system provides safer and more efficient inspection compared to traditional methods.

We conduct regular inspections of telecommunications towers, capturing detailed imagery that reveals structural issues, equipment problems, and maintenance needs. The data supports maintenance planning and helps prevent service disruptions.

Key advantages include safer inspections (no need for tower climbing), faster completion times, comprehensive documentation, and ability to inspect hard-to-reach areas. The system helps telecommunications companies maintain reliable service.

The project has inspected over 100 towers, identifying numerous maintenance issues that were addressed before they caused service problems. This has improved network reliability and reduced maintenance costs.

We work with major telecommunications companies operating in Rwanda. The inspection data supports maintenance planning and helps prioritize work based on urgency and impact.

Future enhancements include developing automated defect detection, integrating with maintenance management systems, and expanding to include other telecommunications infrastructure.`,
    categorySlug: "infrastructure-inspection",
    status: "completed",
    location: "Nationwide, Rwanda",
    duration: "12 months",
    startDate: "2023-10-01",
    endDate: "2024-10-01",
    funding: "RWF 80,000,000 (Telecommunications Industry)",
    technologies: ["Tower Inspection Drones", "High-Resolution Cameras", "Inspection Analysis Software", "Maintenance Management Integration"],
    objectives: [
      "Inspect 100+ telecommunications towers",
      "Identify maintenance needs",
      "Improve service reliability",
      "Reduce inspection costs"
    ],
    challenges: [
      "Weather conditions affecting inspections",
      "Accessing restricted tower sites",
      "Processing inspection data",
      "Coordinating with maintenance schedules"
    ],
    outcomes: [
      "120+ towers inspected",
      "Numerous maintenance issues identified and addressed",
      "Improved network reliability",
      "Reduced inspection costs by 40%"
    ],
    methodology: "We conducted systematic inspections following industry standards, captured high-resolution imagery of all tower components, analyzed data for defects and maintenance needs, and provided detailed reports with recommendations.",
    results: "Project completed successfully with all objectives met. Ongoing maintenance inspections continue under service contracts."
  },
  {
    title: "Real Estate Aerial Photography and Virtual Tours",
    description: "Creating stunning aerial photography and virtual tour content for real estate marketing, helping properties stand out in competitive markets.",
    fullDescription: `This real estate project provides aerial photography and virtual tour services for property marketing. The stunning aerial perspectives help properties stand out in competitive markets and attract potential buyers or renters.

We create comprehensive visual content including aerial photographs, video tours, and 3D models of properties. The content is used in marketing materials, online listings, and virtual tour platforms.

The service has been particularly popular for luxury properties, large estates, and commercial real estate. Clients appreciate the professional quality and the unique perspective that aerial imagery provides.

Key capabilities include high-resolution aerial photography, video tours with smooth camera movements, 3D property models, and integration with virtual tour platforms. The content helps properties attract more interest and sell faster.

We work with real estate agencies, property developers, and individual property owners. The service has become standard for high-end property marketing in Rwanda.

Future plans include developing interactive virtual tour experiences, expanding to include interior drone photography, and creating automated content generation for property listings.`,
    categorySlug: "photography-videography",
    status: "in_progress",
    location: "Kigali and Nationwide, Rwanda",
    duration: "Ongoing",
    startDate: "2023-05-01",
    endDate: null,
    funding: "RWF 25,000,000 (Service Revenue)",
    technologies: ["Real Estate Photography Drones", "Virtual Tour Software", "3D Modeling Tools", "Property Marketing Platforms"],
    objectives: [
      "Serve 200+ properties annually",
      "Create professional marketing content",
      "Support real estate sales",
      "Build comprehensive property library"
    ],
    challenges: [
      "Weather conditions affecting shoots",
      "Coordinating with property schedules",
      "Maintaining creative quality at scale",
      "Competing with international providers"
    ],
    outcomes: [
      "150+ properties photographed",
      "High client satisfaction ratings",
      "Properties selling faster with aerial content",
      "Growing demand for services"
    ],
    methodology: "We conduct location scouting, plan shoots for optimal lighting, capture comprehensive aerial imagery and video, create polished content through professional editing, and deliver through various marketing platforms.",
    results: "Service successfully operational with strong client base and growing demand."
  },
  {
    title: "Solar Farm Inspection and Performance Monitoring",
    description: "Regular inspection of solar installations using thermal imaging to identify issues, optimize performance, and ensure efficient energy production.",
    fullDescription: `This renewable energy project uses drones equipped with thermal imaging to inspect solar farms and installations. The system identifies issues such as faulty panels, hot spots, and performance problems that affect energy production.

We conduct regular inspections of solar installations, using thermal imaging to detect problems that aren't visible to the naked eye. The data helps optimize performance and ensures maximum energy production.

Key capabilities include thermal imaging for defect detection, performance analysis, maintenance planning, and comprehensive inspection documentation. The system helps solar farm operators maximize their return on investment.

The project has inspected several solar installations, identifying numerous issues that were addressed to improve performance. This has increased energy production and extended equipment lifespan.

We work with solar farm operators, renewable energy companies, and maintenance providers. The inspection data supports performance optimization and maintenance planning.

Future plans include developing automated defect detection algorithms, integrating with energy monitoring systems, and expanding to include wind farm inspections.`,
    categorySlug: "infrastructure-inspection",
    status: "in_progress",
    location: "Solar Installations, Rwanda",
    duration: "Ongoing",
    startDate: "2024-02-15",
    endDate: null,
    funding: "RWF 40,000,000 (Renewable Energy Industry)",
    technologies: ["Thermal Imaging Drones", "Solar Inspection Software", "Performance Analysis Tools", "Maintenance Management Integration"],
    objectives: [
      "Inspect 20+ solar installations",
      "Identify performance issues",
      "Optimize energy production",
      "Support maintenance planning"
    ],
    challenges: [
      "Weather conditions affecting thermal imaging",
      "Processing large volumes of inspection data",
      "Coordinating with solar farm operations",
      "Developing accurate performance models"
    ],
    outcomes: [
      "12+ solar installations inspected",
      "Multiple performance issues identified and addressed",
      "Improved energy production",
      "Enhanced maintenance planning"
    ],
    methodology: "We conduct regular scheduled inspections using thermal imaging, capture comprehensive data on panel conditions, analyze information for defects and performance issues, and provide detailed reports with recommendations.",
    results: "Service operational with strong adoption by solar farm operators and measurable performance improvements."
  },
  {
    title: "Archaeological Site Documentation and Preservation",
    description: "Using drones to document archaeological sites, create detailed maps, and support preservation efforts for Rwanda's cultural heritage.",
    fullDescription: `This cultural heritage project uses drones to document archaeological sites, create detailed maps, and support preservation efforts. The system helps preserve Rwanda's cultural heritage while supporting research and education.

We conduct detailed documentation of archaeological sites, creating high-resolution maps and 3D models that capture current conditions. This documentation supports preservation planning and provides records for future reference.

Key capabilities include high-resolution site documentation, 3D modeling of structures and features, change detection over time, and support for research and education. The system helps preserve cultural heritage for future generations.

The project has documented several important archaeological sites, creating comprehensive records that support preservation efforts and research. The data has been used in academic research and educational programs.

We work with the Institute of National Museums of Rwanda, archaeological researchers, and cultural heritage organizations. The documentation supports preservation planning and research activities.

Future plans include expanding documentation to additional sites, developing virtual reality experiences for education, and creating comprehensive digital archives of cultural heritage sites.`,
    categorySlug: "research-development",
    status: "in_progress",
    location: "Archaeological Sites, Rwanda",
    duration: "24 months",
    startDate: "2024-07-01",
    endDate: "2026-07-01",
    funding: "RWF 30,000,000 (Cultural Heritage Grants)",
    technologies: ["Archaeological Documentation Drones", "Photogrammetry Software", "3D Modeling Tools", "Cultural Heritage Database"],
    objectives: [
      "Document 15+ archaeological sites",
      "Create comprehensive site records",
      "Support preservation efforts",
      "Enable research and education"
    ],
    challenges: [
      "Accessing remote archaeological sites",
      "Weather conditions",
      "Processing detailed documentation data",
      "Coordinating with research schedules"
    ],
    outcomes: [
      "8+ sites documented",
      "Comprehensive records created",
      "Data supporting preservation and research",
      "Enhanced cultural heritage visibility"
    ],
    methodology: "We conduct detailed documentation flights following archaeological protocols, capture high-resolution imagery for mapping and 3D modeling, process data to create comprehensive site records, and make information available for preservation and research.",
    results: "Project progressing well with comprehensive documentation of important cultural heritage sites."
  },
  {
    title: "Traffic Monitoring and Urban Mobility Analysis",
    description: "Using drones to monitor traffic patterns, analyze urban mobility, and support transportation planning in Kigali.",
    fullDescription: `This urban planning project uses drones to monitor traffic patterns, analyze urban mobility, and support transportation planning. The system provides data that helps optimize traffic flow and plan infrastructure improvements.

We conduct regular monitoring flights during peak traffic times, capturing video and imagery that reveals traffic patterns, congestion points, and mobility challenges. The data supports transportation planning and infrastructure development.

Key capabilities include traffic pattern analysis, congestion identification, mobility flow assessment, and support for infrastructure planning. The system helps city planners make data-driven decisions about transportation.

The project has provided valuable insights into traffic patterns in Kigali, identifying areas where infrastructure improvements could reduce congestion. The data has informed several transportation planning decisions.

We work with the City of Kigali, transportation authorities, and urban planning departments. The monitoring data supports transportation policy and infrastructure investment decisions.

Future plans include developing automated traffic analysis, expanding monitoring coverage, and integrating with traffic management systems for real-time optimization.`,
    categorySlug: "mapping-surveying",
    status: "planning",
    location: "Kigali, Rwanda",
    duration: "18 months",
    startDate: "2025-03-01",
    endDate: "2026-09-01",
    funding: "RWF 60,000,000 (City Planning Budget)",
    technologies: ["Traffic Monitoring Drones", "Video Analysis Software", "Mobility Analysis Tools", "Transportation Planning Platform"],
    objectives: [
      "Monitor traffic patterns regularly",
      "Identify congestion points",
      "Support transportation planning",
      "Optimize urban mobility"
    ],
    challenges: [
      "Weather conditions affecting monitoring",
      "Processing large volumes of video data",
      "Coordinating with traffic management",
      "Ensuring privacy in public spaces"
    ],
    outcomes: [],
    methodology: "We will conduct regular monitoring flights during peak traffic periods, capture video and imagery of traffic patterns, analyze data for congestion and mobility insights, and provide reports to transportation planners.",
    results: "Project in planning phase with strong support from city planning authorities."
  },
  {
    title: "Pest and Disease Early Detection System for Crops",
    description: "Using multispectral imaging and AI to detect crop pests and diseases early, enabling timely intervention and reducing crop losses.",
    fullDescription: `This agricultural innovation project uses advanced drone technology with multispectral imaging and AI to detect crop pests and diseases in early stages. Early detection enables timely intervention, reducing crop losses and minimizing pesticide usage.

We conduct regular monitoring flights over agricultural fields, using multispectral cameras to capture data that reveals plant health indicators. AI algorithms analyze the imagery to identify pest and disease symptoms before they become visible to the naked eye.

Key capabilities include early pest and disease detection, automated identification of specific issues, treatment recommendations, and monitoring of treatment effectiveness. The system helps farmers protect their crops more effectively.

The project has been piloted with several farmers, demonstrating the ability to detect issues 7-10 days earlier than traditional scouting methods. This early detection has enabled more effective treatment and reduced crop losses.

We work with farmers, agricultural extension services, and research institutions. The system supports integrated pest management and sustainable farming practices.

Future plans include expanding AI capabilities to identify more pest and disease types, developing treatment recommendation systems, and integrating with farm management software for comprehensive crop protection.`,
    categorySlug: "agriculture",
    status: "in_progress",
    location: "Agricultural Regions, Rwanda",
    duration: "24 months",
    startDate: "2024-08-01",
    endDate: "2026-08-01",
    funding: "RWF 90,000,000 (Agricultural Innovation Grants)",
    technologies: ["Multispectral Imaging Drones", "AI Detection Algorithms", "Crop Health Analysis Software", "Farm Management Integration"],
    objectives: [
      "Detect pests and diseases 7+ days early",
      "Reduce crop losses by 30%",
      "Serve 150+ farmers",
      "Develop comprehensive detection system"
    ],
    challenges: [
      "Developing accurate AI detection algorithms",
      "Weather conditions affecting monitoring",
      "Farmer adoption of new technology",
      "Integrating with existing farm practices"
    ],
    outcomes: [
      "Pilot phase completed successfully",
      "7-10 day early detection achieved",
      "Reduced crop losses in pilot farms",
      "Strong farmer interest in expansion"
    ],
    methodology: "We conduct regular monitoring flights during growing seasons, capture multispectral imagery, process data using AI algorithms for pest and disease detection, and provide alerts and recommendations to farmers through mobile applications.",
    results: "Project progressing well with successful pilot phase and clear path to expansion."
  },
  {
    title: "Coastal and Lake Monitoring for Environmental Protection",
    description: "Monitoring lake shores and water quality to protect aquatic ecosystems and support sustainable resource management.",
    fullDescription: `This environmental protection project uses drones to monitor lake shores, assess water quality, and track changes in aquatic ecosystems. The system supports sustainable resource management and helps protect Rwanda's water resources.

We conduct regular monitoring flights over lakes and their shorelines, capturing imagery that reveals water quality indicators, shoreline changes, and ecosystem health. The data supports environmental protection and resource management decisions.

Key capabilities include water quality assessment, shoreline monitoring, ecosystem health evaluation, and tracking of environmental changes over time. The system helps protect aquatic ecosystems and supports sustainable resource use.

The project has been particularly valuable for monitoring Lake Kivu and other important water bodies. The data has informed environmental protection measures and resource management decisions.

We work with the Rwanda Environment Management Authority, water management organizations, and research institutions. The monitoring data supports environmental policy and conservation efforts.

Future plans include expanding sensor capabilities for direct water quality measurement, developing ecosystem health indicators, and integrating with environmental monitoring networks.`,
    categorySlug: "environmental-monitoring",
    status: "in_progress",
    location: "Lake Kivu and Water Bodies, Rwanda",
    duration: "24 months",
    startDate: "2024-06-15",
    endDate: "2026-06-15",
    funding: "RWF 55,000,000 (Environmental Protection Fund)",
    technologies: ["Lake Monitoring Drones", "Water Quality Sensors", "Ecosystem Assessment Tools", "Environmental Monitoring Platform"],
    objectives: [
      "Monitor 10+ water bodies regularly",
      "Assess ecosystem health",
      "Support environmental protection",
      "Track environmental changes"
    ],
    challenges: [
      "Weather conditions affecting operations",
      "Sensor calibration and accuracy",
      "Processing environmental data",
      "Coordinating with multiple stakeholders"
    ],
    outcomes: [
      "8+ water bodies under regular monitoring",
      "Environmental data supporting protection measures",
      "Ecosystem health assessments completed",
      "Improved environmental visibility"
    ],
    methodology: "We conduct regular monitoring flights following established schedules, capture imagery and sensor data, analyze information for ecosystem health indicators, and provide reports to environmental authorities.",
    results: "Project progressing well with comprehensive environmental monitoring established."
  },
  {
    title: "Educational Drone Training and Certification Program",
    description: "Comprehensive training program to build drone pilot skills and create employment opportunities in Rwanda's growing drone industry.",
    fullDescription: `This education project provides comprehensive drone training and certification programs, building skills and creating employment opportunities in Rwanda's growing drone industry. The program addresses the critical need for trained drone pilots and technicians.

We offer courses covering basic flight operations, advanced piloting skills, commercial operations, maintenance, and specialized applications. Students receive hands-on training with various drone types and real-world project experience.

The program has trained over 200 students, with 85% finding employment in the drone industry or starting their own businesses. Graduates work as commercial pilots, technicians, and service providers across various sectors.

Key features include comprehensive curriculum covering all aspects of drone operations, hands-on flight training, certification preparation, job placement support, and ongoing mentorship for graduates.

We work with educational institutions, industry partners, and government agencies. The program supports workforce development and helps build Rwanda's drone industry capacity.

Future plans include expanding course offerings, developing specialized training for specific industries, and creating advanced certification programs for experienced pilots.`,
    categorySlug: "research-development",
    status: "completed",
    location: "Kigali and Training Centers, Rwanda",
    duration: "18 months",
    startDate: "2023-04-01",
    endDate: "2024-10-01",
    funding: "RWF 100,000,000 (Education and Workforce Development Grants)",
    technologies: ["Training Drones", "Flight Simulators", "Educational Materials", "Certification Systems"],
    objectives: [
      "Train 200+ drone pilots",
      "Achieve 80% employment rate",
      "Build industry capacity",
      "Support workforce development"
    ],
    challenges: [
      "Access to training equipment",
      "Weather conditions affecting flight training",
      "Developing comprehensive curriculum",
      "Ensuring job placement for graduates"
    ],
    outcomes: [
      "200+ students trained",
      "85% employment rate",
      "Strong industry partnerships",
      "Graduates working across multiple sectors"
    ],
    methodology: "We provide comprehensive classroom instruction, hands-on flight training, real-world project experience, certification preparation, and job placement support through industry partnerships.",
    results: "Program completed successfully with all objectives exceeded. Ongoing training continues with expanded offerings."
  },
  {
    title: "Smart City Infrastructure Monitoring",
    description: "Comprehensive monitoring of smart city infrastructure including sensors, communication networks, and IoT devices using drones.",
    fullDescription: `This smart city project uses drones to monitor and maintain smart city infrastructure including sensors, communication networks, and IoT devices. The system ensures reliable operation of smart city systems that support urban services.

We conduct regular inspections of smart city infrastructure, identifying issues, verifying sensor functionality, and ensuring communication networks are operating properly. The data supports maintenance and optimization of smart city systems.

Key capabilities include infrastructure inspection, sensor verification, network monitoring, and support for smart city operations. The system helps ensure reliable operation of critical urban services.

The project supports Kigali's smart city initiatives, monitoring infrastructure that supports traffic management, environmental monitoring, and other urban services. The data helps optimize system performance.

We work with the City of Kigali, smart city technology providers, and infrastructure management teams. The monitoring supports reliable operation of smart city systems.

Future plans include developing automated monitoring systems, expanding coverage to additional smart city infrastructure, and integrating with smart city management platforms.`,
    categorySlug: "infrastructure-inspection",
    status: "planning",
    location: "Kigali, Rwanda",
    duration: "24 months",
    startDate: "2025-09-01",
    endDate: "2027-09-01",
    funding: "RWF 110,000,000 (Smart City Initiative)",
    technologies: ["Smart City Monitoring Drones", "IoT Integration", "Network Monitoring Tools", "Smart City Management Platform"],
    objectives: [
      "Monitor smart city infrastructure",
      "Ensure reliable system operation",
      "Support smart city optimization",
      "Integrate with management systems"
    ],
    challenges: [
      "Integrating with diverse smart city systems",
      "Processing monitoring data",
      "Coordinating with multiple technology providers",
      "Ensuring system reliability"
    ],
    outcomes: [],
    methodology: "We will conduct regular monitoring flights, inspect smart city infrastructure, verify sensor and network functionality, analyze data for system optimization, and integrate with smart city management platforms.",
    results: "Project in planning phase with strong support from smart city initiatives."
  }
];

// Sample comments for projects
const sampleProjectComments = [
  "This is an excellent project! I'm particularly interested in how you're addressing the challenges. Have you considered partnering with local universities for research support?",
  "Great work on this initiative! The impact on smallholder farmers is impressive. I'd love to learn more about the technology stack you're using.",
  "This project addresses a critical need. The results so far are promising. How are you planning to scale this to reach more beneficiaries?",
  "Fascinating approach! I work in a similar field and would be interested in collaboration opportunities. The methodology seems sound.",
  "The outcomes you've achieved are remarkable. This could serve as a model for similar projects in other regions. Well done!",
  "I'm curious about the funding model. How sustainable is this approach long-term? The impact metrics are impressive.",
  "This project demonstrates real innovation. The combination of technology and community engagement is particularly effective.",
  "Excellent documentation of challenges and solutions. This transparency helps others learn from your experience.",
  "The methodology is well thought out. I appreciate the detailed approach to addressing each challenge systematically.",
  "Impressive results! The project seems to be making a real difference. How can others get involved or support this work?"
];

async function seedProjects() {
  try {
    console.log('🌱 Starting to seed projects...\n');

    // Step 1: Create or get project categories
    console.log('📁 Creating project categories...');
    const categoryMap = {};
    for (const cat of categories) {
      const existing = await prisma.projectCategory.findUnique({
        where: { slug: cat.slug }
      });
      
      if (existing) {
        categoryMap[cat.slug] = existing.id;
        console.log(`   ✓ Category "${cat.name}" already exists`);
      } else {
        const created = await prisma.projectCategory.create({
          data: cat
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

    // Step 3: Create projects
    console.log('\n📝 Creating projects...');
    const createdProjects = [];
    
    for (let i = 0; i < projects.length; i++) {
      const projectData = projects[i];
      const categoryId = categoryMap[projectData.categorySlug];
      const author = users[i % users.length]; // Distribute projects across users
      
      const project = await prisma.project.create({
        data: {
          title: projectData.title,
          description: projectData.description,
          fullDescription: projectData.fullDescription,
          categoryId: categoryId,
          authorId: author.id,
          status: projectData.status,
          location: projectData.location,
          duration: projectData.duration,
          startDate: projectData.startDate,
          endDate: projectData.endDate,
          funding: projectData.funding,
          technologies: projectData.technologies,
          objectives: projectData.objectives,
          challenges: projectData.challenges,
          outcomes: projectData.outcomes,
          methodology: projectData.methodology,
          results: projectData.results,
          isApproved: true, // Auto-approve seeded projects
          approvedAt: new Date(),
          viewsCount: Math.floor(Math.random() * 300) + 50, // Random views
        }
      });

      // Update user's projects count
      await prisma.user.update({
        where: { id: author.id },
        data: { projectsCount: { increment: 1 } }
      });

      createdProjects.push(project);
      console.log(`   ✓ Created project: "${project.title.substring(0, 50)}..."`);
    }

    // Step 4: Create comments on projects
    console.log('\n💬 Creating comments...');
    
    for (let projectIndex = 0; projectIndex < createdProjects.length; projectIndex++) {
      const project = createdProjects[projectIndex];
      const numComments = Math.floor(Math.random() * 4) + 2; // 2-5 comments per project
      
      for (let i = 0; i < numComments; i++) {
        const commentAuthor = users[Math.floor(Math.random() * users.length)];
        const commentContent = sampleProjectComments[Math.floor(Math.random() * sampleProjectComments.length)];
        
        await prisma.comment.create({
          data: {
            content: commentContent,
            projectId: project.id,
            authorId: commentAuthor.id,
            parentId: null, // Top-level comment
          }
        });

        // Update user's comments count
        await prisma.user.update({
          where: { id: commentAuthor.id },
          data: { commentsCount: { increment: 1 } }
        });
      }
      
      console.log(`   ✓ Created ${numComments} comments on "${project.title.substring(0, 40)}..."`);
    }

    // Step 5: Add likes to projects
    console.log('\n❤️  Adding likes to projects...');
    for (const project of createdProjects) {
      const numLikes = Math.floor(Math.random() * 10) + 5; // 5-14 likes per project
      const usersWhoLiked = new Set();
      
      for (let i = 0; i < numLikes; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        if (usersWhoLiked.has(user.id)) continue; // Avoid duplicate likes
        usersWhoLiked.add(user.id);
        
        await prisma.projectLike.create({
          data: {
            userId: user.id,
            projectId: project.id
          }
        });
      }

      // Update project likes count
      await prisma.project.update({
        where: { id: project.id },
        data: { likesCount: usersWhoLiked.size }
      });
      
      console.log(`   ✓ Added ${usersWhoLiked.size} likes to "${project.title.substring(0, 40)}..."`);
    }

    // Step 6: Add likes to comments
    console.log('\n❤️  Adding likes to comments...');
    const allComments = await prisma.comment.findMany({
      where: { projectId: { in: createdProjects.map(p => p.id) } }
    });

    for (const comment of allComments) {
      const numLikes = Math.floor(Math.random() * 4) + 1; // 1-4 likes per comment
      const usersWhoLiked = new Set();
      
      for (let i = 0; i < numLikes; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        if (usersWhoLiked.has(user.id) || user.id === comment.authorId) continue;
        usersWhoLiked.add(user.id);
        
        await prisma.commentLike.create({
          data: {
            userId: user.id,
            commentId: comment.id
          }
        });
      }

      // Update comment likes count
      await prisma.comment.update({
        where: { id: comment.id },
        data: { likesCount: usersWhoLiked.size }
      });
    }
    
    console.log(`   ✓ Added likes to ${allComments.length} comments`);

    // Summary
    console.log('\n✅ Successfully seeded projects!');
    console.log(`\n📊 Summary:`);
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Projects: ${createdProjects.length}`);
    console.log(`   - Comments: ${allComments.length}`);
    console.log(`   - Project likes: ${createdProjects.reduce((sum, p) => sum + p.likesCount, 0)}`);
    console.log(`   - Comment likes: ${allComments.reduce((sum, c) => sum + c.likesCount, 0)}`);

  } catch (error) {
    console.error('❌ Error seeding projects:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedProjects()
    .then(() => {
      console.log('\n🎉 Seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedProjects };
