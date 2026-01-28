// Load environment variables
require('dotenv').config({ path: '.env.production' });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Service categories to create if they don't exist
const categories = [
  {
    name: "Aerial Photography & Videography",
    description: "Professional aerial photography and videography services for events, real estate, and marketing"
  },
  {
    name: "Agricultural Monitoring",
    description: "Crop monitoring, precision agriculture, and farming support services"
  },
  {
    name: "Infrastructure Inspection",
    description: "Building, bridge, and infrastructure inspection services"
  },
  {
    name: "Mapping & Surveying",
    description: "Land surveying, mapping, and geographic information services"
  },
  {
    name: "Delivery Services",
    description: "Package and medical supply delivery services"
  },
  {
    name: "Search & Rescue",
    description: "Emergency response and search and rescue operations"
  },
  {
    name: "Training & Education",
    description: "Drone pilot training and certification programs"
  },
  {
    name: "Maintenance & Repair",
    description: "Drone maintenance, repair, and technical support"
  }
];

// Regions in Rwanda
const regions = [
  'KIGALI_GASABO',
  'KIGALI_KICUKIRO',
  'KIGALI_NYARUGENGE',
  'EAST_RWAMAGANA',
  'EAST_KAYONZA',
  'EAST_BUGESERA',
  'NORTH_MUSANZE',
  'NORTH_GICUMBI',
  'WEST_RUBAVU',
  'WEST_KARONGI',
  'SOUTH_MUHANGA',
  'SOUTH_HUYE'
];

// 30 service providers with comprehensive data
const services = [
  {
    title: "SkyVision Aerial Photography",
    description: "Professional aerial photography and videography services for weddings, events, real estate, and commercial projects. High-quality 4K video and professional photography.",
    categoryName: "Aerial Photography & Videography",
    region: "KIGALI_GASABO",
    contact: "Jean-Baptiste Uwimana",
    phone: "+250 788 123 456",
    email: "info@skyvision.rw",
    website: "www.skyvision.rw",
    servicesList: [
      "Wedding aerial photography",
      "Event videography",
      "Real estate photography",
      "Commercial advertising",
      "Property virtual tours"
    ],
    portfolio: [
      { url: "/uploads/services/skyvision1.jpg", caption: "Wedding aerial shot", title: "Wedding Photography" },
      { url: "/uploads/services/skyvision2.jpg", caption: "Real estate property", title: "Property Showcase" }
    ],
    rating: 4.8,
    reviewCount: 24
  },
  {
    title: "AgriDrone Solutions Rwanda",
    description: "Comprehensive agricultural monitoring services using multispectral imaging. Crop health assessment, yield estimation, and precision agriculture support for farmers.",
    categoryName: "Agricultural Monitoring",
    region: "EAST_RWAMAGANA",
    contact: "Grace Mukamana",
    phone: "+250 788 234 567",
    email: "contact@agridrone.rw",
    website: "www.agridrone.rw",
    servicesList: [
      "Crop health monitoring",
      "Multispectral imaging",
      "Yield estimation",
      "Precision agriculture consulting",
      "Farm mapping and analysis"
    ],
    portfolio: [
      { url: "/uploads/services/agri1.jpg", caption: "Crop health analysis", title: "Agricultural Monitoring" },
      { url: "/uploads/services/agri2.jpg", caption: "Field mapping", title: "Precision Agriculture" }
    ],
    rating: 4.9,
    reviewCount: 18
  },
  {
    title: "InfraInspect Professional Services",
    description: "Specialized infrastructure inspection services for buildings, bridges, towers, and industrial facilities. Thermal imaging and detailed structural analysis.",
    categoryName: "Infrastructure Inspection",
    region: "KIGALI_KICUKIRO",
    contact: "David Nsengimana",
    phone: "+250 788 345 678",
    email: "info@infrainspect.rw",
    website: "www.infrainspect.rw",
    servicesList: [
      "Building inspection",
      "Bridge assessment",
      "Tower inspection",
      "Thermal imaging",
      "Structural analysis reports"
    ],
    portfolio: [
      { url: "/uploads/services/infra1.jpg", caption: "Bridge inspection", title: "Infrastructure Assessment" },
      { url: "/uploads/services/infra2.jpg", caption: "Building analysis", title: "Structural Inspection" }
    ],
    rating: 4.7,
    reviewCount: 32
  },
  {
    title: "GeoSurvey Rwanda",
    description: "Professional land surveying and mapping services. High-precision GPS mapping, topographic surveys, and GIS data collection for construction and development projects.",
    categoryName: "Mapping & Surveying",
    region: "KIGALI_NYARUGENGE",
    contact: "Paul Kagame",
    phone: "+250 788 456 789",
    email: "survey@geosurvey.rw",
    website: "www.geosurvey.rw",
    servicesList: [
      "Land surveying",
      "Topographic mapping",
      "GPS data collection",
      "3D terrain modeling",
      "Construction site mapping"
    ],
    portfolio: [
      { url: "/uploads/services/geo1.jpg", caption: "Survey mapping", title: "Land Surveying" },
      { url: "/uploads/services/geo2.jpg", caption: "3D terrain model", title: "Topographic Mapping" }
    ],
    rating: 4.6,
    reviewCount: 15
  },
  {
    title: "MediFly Delivery Services",
    description: "Reliable medical supply delivery service for hospitals and clinics. Specialized in time-sensitive medical deliveries with temperature-controlled transport.",
    categoryName: "Delivery Services",
    region: "NORTH_MUSANZE",
    contact: "Marie Uwimana",
    phone: "+250 788 567 890",
    email: "delivery@medifly.rw",
    website: "www.medifly.rw",
    servicesList: [
      "Medical supply delivery",
      "Emergency medical transport",
      "Laboratory sample delivery",
      "Vaccine distribution",
      "24/7 emergency service"
    ],
    portfolio: [
      { url: "/uploads/services/med1.jpg", caption: "Medical delivery", title: "Healthcare Logistics" },
      { url: "/uploads/services/med2.jpg", caption: "Emergency transport", title: "Emergency Services" }
    ],
    rating: 4.9,
    reviewCount: 28
  },
  {
    title: "RescueDrone Rwanda",
    description: "Emergency response and search and rescue services. Rapid deployment for missing person searches, disaster assessment, and emergency coordination.",
    categoryName: "Search & Rescue",
    region: "WEST_RUBAVU",
    contact: "James Uwimana",
    phone: "+250 788 678 901",
    email: "rescue@rescuedrone.rw",
    website: "www.rescuedrone.rw",
    servicesList: [
      "Search and rescue operations",
      "Disaster assessment",
      "Emergency response",
      "Missing person searches",
      "24/7 emergency availability"
    ],
    portfolio: [
      { url: "/uploads/services/rescue1.jpg", caption: "Search operation", title: "Search & Rescue" },
      { url: "/uploads/services/rescue2.jpg", caption: "Disaster assessment", title: "Emergency Response" }
    ],
    rating: 5.0,
    reviewCount: 12
  },
  {
    title: "Drone Academy Rwanda",
    description: "Comprehensive drone pilot training and certification programs. From beginner to advanced commercial pilot certification with hands-on flight training.",
    categoryName: "Training & Education",
    region: "KIGALI_GASABO",
    contact: "Sarah Mukamana",
    phone: "+250 788 789 012",
    email: "training@droneacademy.rw",
    website: "www.droneacademy.rw",
    servicesList: [
      "Beginner pilot training",
      "Commercial pilot certification",
      "Advanced flight techniques",
      "Regulatory compliance training",
      "Custom corporate training"
    ],
    portfolio: [
      { url: "/uploads/services/train1.jpg", caption: "Flight training", title: "Pilot Training" },
      { url: "/uploads/services/train2.jpg", caption: "Certification program", title: "Professional Development" }
    ],
    rating: 4.8,
    reviewCount: 45
  },
  {
    title: "TechFix Drone Repair",
    description: "Professional drone repair and maintenance services. Authorized service center for major drone brands with quick turnaround times and warranty support.",
    categoryName: "Maintenance & Repair",
    region: "KIGALI_KICUKIRO",
    contact: "Eric Nkurunziza",
    phone: "+250 788 890 123",
    email: "repair@techfix.rw",
    website: "www.techfix.rw",
    servicesList: [
      "Drone repair services",
      "Routine maintenance",
      "Component replacement",
      "Calibration services",
      "Warranty support"
    ],
    portfolio: [
      { url: "/uploads/services/repair1.jpg", caption: "Repair workshop", title: "Drone Repair" },
      { url: "/uploads/services/repair2.jpg", caption: "Maintenance service", title: "Technical Support" }
    ],
    rating: 4.7,
    reviewCount: 38
  },
  {
    title: "Cinematic Aerial Productions",
    description: "Creative aerial cinematography for films, documentaries, and commercial advertising. Specialized in cinematic shots and creative storytelling.",
    categoryName: "Aerial Photography & Videography",
    region: "KIGALI_NYARUGENGE",
    contact: "Diane Uwimana",
    phone: "+250 788 901 234",
    email: "hello@cinematic.rw",
    website: "www.cinematic.rw",
    servicesList: [
      "Film and documentary cinematography",
      "Commercial advertising",
      "Music video production",
      "Creative aerial shots",
      "Post-production services"
    ],
    portfolio: [
      { url: "/uploads/services/cine1.jpg", caption: "Film production", title: "Cinematography" },
      { url: "/uploads/services/cine2.jpg", caption: "Commercial shoot", title: "Advertising" }
    ],
    rating: 4.9,
    reviewCount: 22
  },
  {
    title: "Precision Agriculture Services",
    description: "Advanced precision agriculture services using drone technology. Crop monitoring, soil analysis, and data-driven farming solutions for improved yields.",
    categoryName: "Agricultural Monitoring",
    region: "EAST_KAYONZA",
    contact: "Fabrice Nsengimana",
    phone: "+250 788 012 345",
    email: "info@precisionagri.rw",
    website: "www.precisionagri.rw",
    servicesList: [
      "Precision crop monitoring",
      "Soil analysis",
      "Irrigation planning",
      "Pest and disease detection",
      "Yield optimization consulting"
    ],
    portfolio: [
      { url: "/uploads/services/prec1.jpg", caption: "Crop analysis", title: "Precision Agriculture" },
      { url: "/uploads/services/prec2.jpg", caption: "Soil mapping", title: "Agricultural Data" }
    ],
    rating: 4.8,
    reviewCount: 20
  },
  {
    title: "Tower Inspection Specialists",
    description: "Specialized inspection services for telecommunications towers, power lines, and tall structures. Comprehensive safety assessments and maintenance planning.",
    categoryName: "Infrastructure Inspection",
    region: "WEST_KARONGI",
    contact: "Ras Uwimana",
    phone: "+250 788 123 456",
    email: "inspect@towerpro.rw",
    website: "www.towerpro.rw",
    servicesList: [
      "Tower inspection",
      "Power line assessment",
      "Safety compliance checks",
      "Maintenance planning",
      "Detailed inspection reports"
    ],
    portfolio: [
      { url: "/uploads/services/tower1.jpg", caption: "Tower inspection", title: "Infrastructure Assessment" },
      { url: "/uploads/services/tower2.jpg", caption: "Safety check", title: "Compliance Inspection" }
    ],
    rating: 4.6,
    reviewCount: 16
  },
  {
    title: "Urban Mapping Solutions",
    description: "Urban planning and development mapping services. 3D city modeling, infrastructure mapping, and spatial analysis for urban development projects.",
    categoryName: "Mapping & Surveying",
    region: "KIGALI_GASABO",
    contact: "Jean Uwimana",
    phone: "+250 788 234 567",
    email: "mapping@urbanmap.rw",
    website: "www.urbanmap.rw",
    servicesList: [
      "Urban 3D modeling",
      "City mapping",
      "Infrastructure mapping",
      "Development planning support",
      "Spatial analysis"
    ],
    portfolio: [
      { url: "/uploads/services/urban1.jpg", caption: "City model", title: "Urban Mapping" },
      { url: "/uploads/services/urban2.jpg", caption: "3D visualization", title: "City Planning" }
    ],
    rating: 4.7,
    reviewCount: 19
  },
  {
    title: "Express Delivery Network",
    description: "Fast and reliable package delivery service across Rwanda. Same-day and next-day delivery options for businesses and individuals.",
    categoryName: "Delivery Services",
    region: "EAST_BUGESERA",
    contact: "Marie Nkurunziza",
    phone: "+250 788 345 678",
    email: "delivery@express.rw",
    website: "www.express.rw",
    servicesList: [
      "Package delivery",
      "Same-day delivery",
      "Express shipping",
      "Business logistics",
      "E-commerce support"
    ],
    portfolio: [
      { url: "/uploads/services/express1.jpg", caption: "Package delivery", title: "Logistics Services" },
      { url: "/uploads/services/express2.jpg", caption: "Express shipping", title: "Delivery Network" }
    ],
    rating: 4.5,
    reviewCount: 31
  },
  {
    title: "Emergency Response Team",
    description: "Professional emergency response services for natural disasters, accidents, and crisis situations. Rapid deployment and coordination capabilities.",
    categoryName: "Search & Rescue",
    region: "SOUTH_MUHANGA",
    contact: "David Kagame",
    phone: "+250 788 456 789",
    email: "emergency@response.rw",
    website: "www.response.rw",
    servicesList: [
      "Emergency response",
      "Disaster assessment",
      "Crisis coordination",
      "Damage evaluation",
      "24/7 emergency service"
    ],
    portfolio: [
      { url: "/uploads/services/emerg1.jpg", caption: "Emergency response", title: "Crisis Management" },
      { url: "/uploads/services/emerg2.jpg", caption: "Disaster assessment", title: "Emergency Services" }
    ],
    rating: 4.9,
    reviewCount: 14
  },
  {
    title: "Professional Pilot Training Center",
    description: "Comprehensive drone pilot training from beginner to commercial certification. Hands-on training with experienced instructors and modern equipment.",
    categoryName: "Training & Education",
    region: "NORTH_GICUMBI",
    contact: "Grace Uwimana",
    phone: "+250 788 567 890",
    email: "training@pilotcenter.rw",
    website: "www.pilotcenter.rw",
    servicesList: [
      "Pilot certification programs",
      "Flight training",
      "Safety training",
      "Commercial pilot prep",
      "Recurrent training"
    ],
    portfolio: [
      { url: "/uploads/services/pilot1.jpg", caption: "Flight training", title: "Pilot Education" },
      { url: "/uploads/services/pilot2.jpg", caption: "Certification", title: "Professional Training" }
    ],
    rating: 4.8,
    reviewCount: 27
  },
  {
    title: "Drone Maintenance Hub",
    description: "Full-service drone maintenance and repair facility. Quick turnaround times, genuine parts, and expert technicians for all drone brands.",
    categoryName: "Maintenance & Repair",
    region: "SOUTH_HUYE",
    contact: "Paul Nsengimana",
    phone: "+250 788 678 901",
    email: "service@maintenancehub.rw",
    website: "www.maintenancehub.rw",
    servicesList: [
      "Complete maintenance services",
      "Repair and diagnostics",
      "Parts replacement",
      "Calibration",
      "Equipment rental"
    ],
    portfolio: [
      { url: "/uploads/services/hub1.jpg", caption: "Service center", title: "Maintenance Services" },
      { url: "/uploads/services/hub2.jpg", caption: "Repair facility", title: "Technical Support" }
    ],
    rating: 4.6,
    reviewCount: 21
  },
  {
    title: "Event Aerial Coverage",
    description: "Specialized aerial coverage for events, festivals, and celebrations. Live streaming and professional event documentation services.",
    categoryName: "Aerial Photography & Videography",
    region: "KIGALI_KICUKIRO",
    contact: "Sarah Uwimana",
    phone: "+250 788 789 012",
    email: "events@aerialcoverage.rw",
    website: "www.aerialcoverage.rw",
    servicesList: [
      "Event photography",
      "Live event streaming",
      "Festival coverage",
      "Celebration documentation",
      "Social media content"
    ],
    portfolio: [
      { url: "/uploads/services/event1.jpg", caption: "Event coverage", title: "Event Services" },
      { url: "/uploads/services/event2.jpg", caption: "Festival documentation", title: "Live Coverage" }
    ],
    rating: 4.7,
    reviewCount: 29
  },
  {
    title: "Farm Intelligence Services",
    description: "AI-powered agricultural intelligence using drone data. Advanced analytics, predictive modeling, and actionable insights for modern farming.",
    categoryName: "Agricultural Monitoring",
    region: "EAST_RWAMAGANA",
    contact: "Eric Mukamana",
    phone: "+250 788 890 123",
    email: "info@farmintel.rw",
    website: "www.farmintel.rw",
    servicesList: [
      "AI-powered crop analysis",
      "Predictive yield modeling",
      "Disease prediction",
      "Optimization recommendations",
      "Data analytics platform"
    ],
    portfolio: [
      { url: "/uploads/services/farm1.jpg", caption: "AI analysis", title: "Farm Intelligence" },
      { url: "/uploads/services/farm2.jpg", caption: "Data insights", title: "Agricultural Analytics" }
    ],
    rating: 4.9,
    reviewCount: 17
  },
  {
    title: "Building Safety Inspections",
    description: "Comprehensive building inspection services for safety compliance, maintenance planning, and property assessment. Thermal imaging and structural analysis.",
    categoryName: "Infrastructure Inspection",
    region: "KIGALI_NYARUGENGE",
    contact: "Diane Nkurunziza",
    phone: "+250 788 901 234",
    email: "inspect@buildingsafe.rw",
    website: "www.buildingsafe.rw",
    servicesList: [
      "Building safety inspections",
      "Thermal imaging",
      "Structural assessment",
      "Compliance verification",
      "Maintenance recommendations"
    ],
    portfolio: [
      { url: "/uploads/services/build1.jpg", caption: "Building inspection", title: "Safety Assessment" },
      { url: "/uploads/services/build2.jpg", caption: "Thermal analysis", title: "Building Analysis" }
    ],
    rating: 4.8,
    reviewCount: 23
  },
  {
    title: "Geographic Data Services",
    description: "Professional geographic information services. GIS data collection, mapping, and spatial analysis for various industries and applications.",
    categoryName: "Mapping & Surveying",
    region: "WEST_RUBAVU",
    contact: "James Mukamana",
    phone: "+250 788 012 345",
    email: "data@geodata.rw",
    website: "www.geodata.rw",
    servicesList: [
      "GIS data collection",
      "Spatial mapping",
      "Geographic analysis",
      "Custom mapping solutions",
      "Data processing services"
    ],
    portfolio: [
      { url: "/uploads/services/geo3.jpg", caption: "GIS mapping", title: "Geographic Services" },
      { url: "/uploads/services/geo4.jpg", caption: "Spatial analysis", title: "Data Services" }
    ],
    rating: 4.6,
    reviewCount: 13
  },
  {
    title: "Medical Logistics Express",
    description: "Specialized medical logistics and supply chain services. Temperature-controlled transport for pharmaceuticals and medical equipment.",
    categoryName: "Delivery Services",
    region: "NORTH_MUSANZE",
    contact: "Marie Kagame",
    phone: "+250 788 123 456",
    email: "logistics@medexpress.rw",
    website: "www.medexpress.rw",
    servicesList: [
      "Medical logistics",
      "Pharmaceutical delivery",
      "Equipment transport",
      "Cold chain management",
      "Hospital supply services"
    ],
    portfolio: [
      { url: "/uploads/services/med3.jpg", caption: "Medical logistics", title: "Healthcare Delivery" },
      { url: "/uploads/services/med4.jpg", caption: "Supply chain", title: "Medical Services" }
    ],
    rating: 4.9,
    reviewCount: 26
  },
  {
    title: "Wildlife Search Operations",
    description: "Specialized search and rescue services for wildlife conservation. Supporting anti-poaching efforts and wildlife monitoring in protected areas.",
    categoryName: "Search & Rescue",
    region: "WEST_KARONGI",
    contact: "Fabrice Uwimana",
    phone: "+250 788 234 567",
    email: "wildlife@searchops.rw",
    website: "www.searchops.rw",
    servicesList: [
      "Wildlife search operations",
      "Anti-poaching support",
      "Conservation monitoring",
      "Protected area patrols",
      "Wildlife tracking"
    ],
    portfolio: [
      { url: "/uploads/services/wild1.jpg", caption: "Wildlife monitoring", title: "Conservation Services" },
      { url: "/uploads/services/wild2.jpg", caption: "Anti-poaching", title: "Wildlife Protection" }
    ],
    rating: 5.0,
    reviewCount: 11
  },
  {
    title: "Aviation Training Institute",
    description: "Professional aviation and drone training institute. Comprehensive programs from basic to advanced commercial pilot certification.",
    categoryName: "Training & Education",
    region: "EAST_KAYONZA",
    contact: "Ras Nsengimana",
    phone: "+250 788 345 678",
    email: "training@aviationinst.rw",
    website: "www.aviationinst.rw",
    servicesList: [
      "Aviation training programs",
      "Commercial pilot certification",
      "Safety and regulations",
      "Advanced flight training",
      "Career placement support"
    ],
    portfolio: [
      { url: "/uploads/services/av1.jpg", caption: "Aviation training", title: "Professional Training" },
      { url: "/uploads/services/av2.jpg", caption: "Certification program", title: "Education Services" }
    ],
    rating: 4.8,
    reviewCount: 33
  },
  {
    title: "QuickFix Drone Services",
    description: "Fast and reliable drone repair services. Same-day repairs for common issues, emergency repairs, and maintenance services for all drone types.",
    categoryName: "Maintenance & Repair",
    region: "KIGALI_GASABO",
    contact: "Jean Nkurunziza",
    phone: "+250 788 456 789",
    email: "repair@quickfix.rw",
    website: "www.quickfix.rw",
    servicesList: [
      "Fast repair services",
      "Emergency repairs",
      "Routine maintenance",
      "Component replacement",
      "On-site service available"
    ],
    portfolio: [
      { url: "/uploads/services/quick1.jpg", caption: "Repair service", title: "Quick Repair" },
      { url: "/uploads/services/quick2.jpg", caption: "Maintenance", title: "Service Center" }
    ],
    rating: 4.7,
    reviewCount: 35
  },
  {
    title: "Real Estate Aerial Media",
    description: "Specialized aerial photography and videography for real estate marketing. Professional property showcases, virtual tours, and marketing materials.",
    categoryName: "Aerial Photography & Videography",
    region: "KIGALI_KICUKIRO",
    contact: "Sarah Kagame",
    phone: "+250 788 567 890",
    email: "media@realaerial.rw",
    website: "www.realaerial.rw",
    servicesList: [
      "Real estate photography",
      "Property virtual tours",
      "Aerial property videos",
      "Marketing materials",
      "Listing photography"
    ],
    portfolio: [
      { url: "/uploads/services/re1.jpg", caption: "Property showcase", title: "Real Estate Media" },
      { url: "/uploads/services/re2.jpg", caption: "Virtual tour", title: "Property Marketing" }
    ],
    rating: 4.8,
    reviewCount: 41
  },
  {
    title: "Smart Farm Solutions",
    description: "Integrated smart farming solutions combining drone technology with IoT sensors. Comprehensive farm management and optimization services.",
    categoryName: "Agricultural Monitoring",
    region: "EAST_BUGESERA",
    contact: "David Uwimana",
    phone: "+250 788 678 901",
    email: "solutions@smartfarm.rw",
    website: "www.smartfarm.rw",
    servicesList: [
      "Smart farming integration",
      "IoT sensor networks",
      "Automated monitoring",
      "Farm management platform",
      "Data-driven optimization"
    ],
    portfolio: [
      { url: "/uploads/services/smart1.jpg", caption: "Smart farm", title: "Integrated Solutions" },
      { url: "/uploads/services/smart2.jpg", caption: "IoT integration", title: "Smart Agriculture" }
    ],
    rating: 4.9,
    reviewCount: 19
  },
  {
    title: "Industrial Inspection Services",
    description: "Specialized inspection services for industrial facilities, factories, and manufacturing plants. Safety compliance and maintenance planning.",
    categoryName: "Infrastructure Inspection",
    region: "SOUTH_MUHANGA",
    contact: "Grace Nsengimana",
    phone: "+250 788 789 012",
    email: "inspect@industrial.rw",
    website: "www.industrial.rw",
    servicesList: [
      "Industrial facility inspection",
      "Safety compliance checks",
      "Equipment assessment",
      "Maintenance planning",
      "Risk assessment"
    ],
    portfolio: [
      { url: "/uploads/services/ind1.jpg", caption: "Industrial inspection", title: "Facility Assessment" },
      { url: "/uploads/services/ind2.jpg", caption: "Safety check", title: "Industrial Services" }
    ],
    rating: 4.7,
    reviewCount: 15
  },
  {
    title: "Topographic Survey Experts",
    description: "Professional topographic surveying services for construction, engineering, and land development projects. High-precision measurements and detailed mapping.",
    categoryName: "Mapping & Surveying",
    region: "SOUTH_HUYE",
    contact: "Paul Uwimana",
    phone: "+250 788 890 123",
    email: "survey@topographic.rw",
    website: "www.topographic.rw",
    servicesList: [
      "Topographic surveys",
      "Construction site mapping",
      "Engineering surveys",
      "Land development support",
      "Precision measurements"
    ],
    portfolio: [
      { url: "/uploads/services/topo1.jpg", caption: "Topographic survey", title: "Survey Services" },
      { url: "/uploads/services/topo2.jpg", caption: "Construction mapping", title: "Engineering Support" }
    ],
    rating: 4.6,
    reviewCount: 18
  },
  {
    title: "Express Medical Delivery",
    description: "Fast and reliable medical delivery service for urgent supplies. 24/7 availability for emergency medical deliveries to hospitals and clinics.",
    categoryName: "Delivery Services",
    region: "NORTH_GICUMBI",
    contact: "Eric Kagame",
    phone: "+250 788 901 234",
    email: "express@meddelivery.rw",
    website: "www.meddelivery.rw",
    servicesList: [
      "Urgent medical delivery",
      "24/7 emergency service",
      "Hospital supply delivery",
      "Emergency medication transport",
      "Rapid response service"
    ],
    portfolio: [
      { url: "/uploads/services/exp1.jpg", caption: "Medical delivery", title: "Emergency Services" },
      { url: "/uploads/services/exp2.jpg", caption: "Urgent transport", title: "Medical Logistics" }
    ],
    rating: 4.8,
    reviewCount: 22
  },
  {
    title: "Mountain Rescue Services",
    description: "Specialized mountain rescue and search operations. Expert team for challenging terrain rescue operations in Rwanda's mountainous regions.",
    categoryName: "Search & Rescue",
    region: "NORTH_MUSANZE",
    contact: "Diane Mukamana",
    phone: "+250 788 012 345",
    email: "rescue@mountain.rw",
    website: "www.mountain.rw",
    servicesList: [
      "Mountain rescue operations",
      "Challenging terrain search",
      "High-altitude operations",
      "Emergency coordination",
      "Specialized rescue equipment"
    ],
    portfolio: [
      { url: "/uploads/services/mount1.jpg", caption: "Mountain rescue", title: "Rescue Operations" },
      { url: "/uploads/services/mount2.jpg", caption: "Terrain search", title: "Mountain Services" }
    ],
    rating: 5.0,
    reviewCount: 9
  },
  {
    title: "Drone Skills Academy",
    description: "Comprehensive drone skills training academy. Programs for hobbyists, professionals, and commercial operators with flexible scheduling options.",
    categoryName: "Training & Education",
    region: "WEST_RUBAVU",
    contact: "James Nkurunziza",
    phone: "+250 788 123 456",
    email: "academy@droneskills.rw",
    website: "www.droneskills.rw",
    servicesList: [
      "Skills training programs",
      "Hobbyist courses",
      "Professional certification",
      "Flexible scheduling",
      "Online and in-person options"
    ],
    portfolio: [
      { url: "/uploads/services/skills1.jpg", caption: "Training academy", title: "Education Services" },
      { url: "/uploads/services/skills2.jpg", caption: "Skills development", title: "Professional Training" }
    ],
    rating: 4.7,
    reviewCount: 30
  },
  {
    title: "Complete Drone Care",
    description: "Full-service drone care and maintenance. Preventive maintenance programs, repair services, and equipment optimization for maximum performance.",
    categoryName: "Maintenance & Repair",
    region: "KIGALI_NYARUGENGE",
    contact: "Marie Uwimana",
    phone: "+250 788 234 567",
    email: "care@completedrone.rw",
    website: "www.completedrone.rw",
    servicesList: [
      "Complete maintenance programs",
      "Preventive care services",
      "Performance optimization",
      "Equipment upgrades",
      "Annual service contracts"
    ],
    portfolio: [
      { url: "/uploads/services/care1.jpg", caption: "Maintenance program", title: "Complete Care" },
      { url: "/uploads/services/care2.jpg", caption: "Service center", title: "Full Service" }
    ],
    rating: 4.8,
    reviewCount: 25
  }
];

async function seedServices() {
  try {
    console.log('🌱 Starting to seed services...\n');

    // Step 1: Create or get service categories
    console.log('📁 Creating service categories...');
    const categoryMap = {};
    for (const cat of categories) {
      const existing = await prisma.serviceCategory.findUnique({
        where: { name: cat.name }
      });
      
      if (existing) {
        categoryMap[cat.name] = existing.id;
        console.log(`   ✓ Category "${cat.name}" already exists`);
      } else {
        const created = await prisma.serviceCategory.create({
          data: {
            name: cat.name,
            description: cat.description
          }
        });
        categoryMap[cat.name] = created.id;
        console.log(`   ✓ Created category: ${cat.name}`);
      }
    }

    // Step 2: Get service provider users
    console.log('\n👥 Fetching service provider users...');
    const serviceProviders = await prisma.user.findMany({
      where: { role: 'service_provider' },
      select: { id: true, username: true, email: true }
    });
    console.log(`   ✓ Found ${serviceProviders.length} service provider users`);

    if (serviceProviders.length === 0) {
      console.log('   ⚠️  No service provider users found. Please seed users first.');
      return;
    }

    // Step 3: Create services
    console.log('\n🛠️  Creating services...');
    const createdServices = [];
    
    for (let i = 0; i < services.length; i++) {
      const serviceData = services[i];
      const categoryId = categoryMap[serviceData.categoryName];
      const provider = serviceProviders[i % serviceProviders.length]; // Distribute across providers
      
      const service = await prisma.service.create({
        data: {
          title: serviceData.title,
          description: serviceData.description,
          categoryId: categoryId,
          region: serviceData.region,
          contact: serviceData.contact,
          phone: serviceData.phone,
          email: serviceData.email,
          website: serviceData.website,
          services: serviceData.servicesList,
          portfolio: serviceData.portfolio,
          rating: serviceData.rating,
          reviewCount: serviceData.reviewCount,
          providerId: provider.id,
          isApproved: true,
          approvedAt: new Date(),
        }
      });

      // Update user's services count
      await prisma.user.update({
        where: { id: provider.id },
        data: { servicesCount: { increment: 1 } }
      });

      createdServices.push(service);
      console.log(`   ✓ Created service: "${service.title.substring(0, 50)}..."`);
    }

    // Summary
    console.log('\n✅ Successfully seeded services!');
    console.log(`\n📊 Summary:`);
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Services: ${createdServices.length}`);
    console.log(`   - Service Providers: ${serviceProviders.length}`);
    console.log(`   - Average Rating: ${(createdServices.reduce((sum, s) => sum + s.rating, 0) / createdServices.length).toFixed(2)}`);
    console.log(`   - Total Reviews: ${createdServices.reduce((sum, s) => sum + s.reviewCount, 0)}`);

  } catch (error) {
    console.error('❌ Error seeding services:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedServices()
    .then(() => {
      console.log('\n🎉 Seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedServices };
