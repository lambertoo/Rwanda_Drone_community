import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

// Realistic Rwanda UAS ecosystem organizations
const orgs = [
  { name: 'Charis UAS Ltd', segment: 'Midstream: UAS Operator (licensed pilot operations)', year: 2019, employees: '6-10', scope: 'Rwanda-wide', revenue: '20-100 million', fleet: '3-5', platforms: ['Rotary-wing / Multirotor (quadcopter, hexacopter, etc.)', 'Fixed-wing UAS'], brands: ['DJI Matrice 300 RTK', 'DJI Phantom 4 RTK', 'senseFly eBee X'], sensors: ['RGB camera (standard visual)', 'Multispectral sensor', 'Thermal / Infrared sensor'], software: ['Pix4D', 'DroneDeploy', 'QGIS'], missions: '16-30', utilization: '41-60%', services: ['UAS operations (surveying, mapping, inspection)', 'Data analytics and processing (GIS, AI, photogrammetry)'], sectors: ['Agriculture and precision farming', 'Infrastructure inspection (roads, bridges, energy)', 'Surveying, mapping, and GIS'], revenueModel: 'Per-mission / Per-flight fees', financing: ['Personal savings / Bootstrapping', 'Government grant (NCST, RDB, Innovation Fund, etc.)'], investment: '$50,000-$200,000', importPct: 95, localPct: 5, leadTime: 6, repairLocation: 'We do all maintenance in-house', femalePct: '1-10%' },
  { name: 'Zipline Rwanda', segment: 'Midstream: UAS Operator (licensed pilot operations)', year: 2016, employees: '101-500', scope: 'International', revenue: 'Over 500 million', fleet: '101+', platforms: ['Fixed-wing UAS'], brands: ['Zipline Custom Platform'], sensors: ['Delivery payload mechanism'], software: ['Zipline Proprietary'], missions: '60+', utilization: 'Over 80%', services: ['Delivery and logistics'], sectors: ['Healthcare / Medical delivery', 'Delivery and logistics'], revenueModel: 'Government contracts / Tenders', financing: ['Venture capital', 'International donor / Development partner grant'], investment: 'Over $1,000,000', importPct: 100, localPct: 0, leadTime: 4, repairLocation: 'We do all maintenance in-house', femalePct: '26-50%' },
  { name: 'Rwanda Drone Academy', segment: 'Upstream: Training and Research / R&D', year: 2020, employees: '6-10', scope: 'Regional (serving clients in neighboring countries)', revenue: '5-20 million', fleet: '3-5', platforms: ['Rotary-wing / Multirotor (quadcopter, hexacopter, etc.)'], brands: ['DJI Mini 3 Pro', 'DJI Mavic 3'], sensors: ['RGB camera (standard visual)'], software: ['Litchi', 'DJI Fly'], missions: '6-15', utilization: '20-40%', services: ['Training and education (pilot certification, technical courses)', 'Consulting / Advisory'], sectors: ['Agriculture and precision farming', 'Media, film, and photography', 'Scientific research'], revenueModel: 'Training and certification fees', financing: ['Personal savings / Bootstrapping', 'Competition / Challenge prize'], investment: '$10,000-$50,000', importPct: 100, localPct: 0, leadTime: 8, repairLocation: 'Manufacturer (abroad)', femalePct: '11-25%' },
  { name: 'AgroTech Drones Rwanda', segment: 'Midstream: UAS Operator (licensed pilot operations)', year: 2021, employees: '1-5', scope: 'Multiple provinces within Rwanda', revenue: 'Under 5 million', fleet: '1-2', platforms: ['Rotary-wing / Multirotor (quadcopter, hexacopter, etc.)'], brands: ['DJI Agras T30'], sensors: ['Multispectral sensor', 'Spraying system (agricultural)'], software: ['DJI Terra', 'QGIS'], missions: '6-15', utilization: '20-40%', services: ['Agricultural services (spraying, crop monitoring)', 'UAS operations (surveying, mapping, inspection)'], sectors: ['Agriculture and precision farming'], revenueModel: 'Per-mission / Per-flight fees', financing: ['Personal savings / Bootstrapping', 'None — unable to access financing'], investment: '$10,000-$50,000', importPct: 100, localPct: 0, leadTime: 10, repairLocation: 'We do all maintenance in-house', femalePct: '0%' },
  { name: 'Kigali Geomatics', segment: 'Midstream: UAS Data Integrator (GIS, AI, data processing)', year: 2017, employees: '11-50', scope: 'Regional (serving clients in neighboring countries)', revenue: '20-100 million', fleet: '6-10', platforms: ['Rotary-wing / Multirotor (quadcopter, hexacopter, etc.)', 'Fixed-wing UAS', 'VTOL (Vertical Take-Off and Landing hybrid)'], brands: ['DJI Matrice 300 RTK', 'WingtraOne', 'DJI Phantom 4 RTK', 'senseFly eBee X'], sensors: ['RGB camera (standard visual)', 'Multispectral sensor', 'LiDAR', 'Thermal / Infrared sensor'], software: ['Pix4D', 'ArcGIS Pro', 'Global Mapper', 'Agisoft Metashape', 'QGIS'], missions: '31-60', utilization: '61-80%', services: ['UAS operations (surveying, mapping, inspection)', 'Data analytics and processing (GIS, AI, photogrammetry)', 'Consulting / Advisory'], sectors: ['Surveying, mapping, and GIS', 'Infrastructure inspection (roads, bridges, energy)', 'Mining and quarry monitoring', 'Urban planning and smart cities'], revenueModel: 'Per-mission / Per-flight fees', financing: ['Bank loan', 'Government grant (NCST, RDB, Innovation Fund, etc.)'], investment: '$200,000-$1,000,000', importPct: 90, localPct: 10, leadTime: 5, repairLocation: 'Local service provider in Rwanda', femalePct: '11-25%' },
  { name: 'RCAA Drone Division', segment: 'Upstream: Regulations and Policy', year: 2015, employees: '11-50', scope: 'Rwanda-wide', revenue: 'Not applicable / Prefer not to disclose', fleet: '0 (we use subcontracted operators)', platforms: [], brands: [], sensors: [], software: [], missions: 'Not applicable', utilization: "Don't know / Not tracked", services: ['Consulting / Advisory'], sectors: ['Security and surveillance'], revenueModel: 'Government contracts / Tenders', financing: ['Not applicable'], investment: 'Under $10,000', importPct: 0, localPct: 0, leadTime: 0, repairLocation: 'Local service provider in Rwanda', femalePct: '26-50%' },
  { name: 'SkyView Media RW', segment: 'Midstream: UAS Operator (licensed pilot operations)', year: 2020, employees: '1-5', scope: 'Kigali only', revenue: 'Under 5 million', fleet: '1-2', platforms: ['Rotary-wing / Multirotor (quadcopter, hexacopter, etc.)'], brands: ['DJI Mavic 3 Pro', 'DJI Mini 4 Pro'], sensors: ['RGB camera (standard visual)'], software: ['Adobe Premiere', 'DaVinci Resolve'], missions: '6-15', utilization: '20-40%', services: ['UAS operations (surveying, mapping, inspection)'], sectors: ['Media, film, and photography'], revenueModel: 'Per-mission / Per-flight fees', financing: ['Personal savings / Bootstrapping'], investment: 'Under $10,000', importPct: 100, localPct: 0, leadTime: 12, repairLocation: 'Manufacturer (abroad)', femalePct: '0%' },
  { name: 'Rwanda Energy Group', segment: 'Downstream: End-User / Client (agriculture, health, infrastructure, security, etc.)', year: 2010, employees: '500+', scope: 'Rwanda-wide', revenue: 'Not applicable / Prefer not to disclose', fleet: '0 (we use subcontracted operators)', platforms: [], brands: [], sensors: [], software: [], missions: 'Not applicable', utilization: "Don't know / Not tracked", services: [], sectors: ['Infrastructure inspection (roads, bridges, energy)'], revenueModel: 'Government contracts / Tenders', financing: ['Not applicable'], investment: '$50,000-$200,000', importPct: 0, localPct: 0, leadTime: 0, repairLocation: 'Local service provider in Rwanda', femalePct: '26-50%' },
  { name: 'DroneWorks Africa', segment: 'Upstream: Hardware and Software Supplier', year: 2022, employees: '1-5', scope: 'Regional (serving clients in neighboring countries)', revenue: '5-20 million', fleet: '3-5', platforms: ['Rotary-wing / Multirotor (quadcopter, hexacopter, etc.)'], brands: ['Custom Built Hexacopter', 'DJI Matrice 30T'], sensors: ['RGB camera (standard visual)', 'Thermal / Infrared sensor'], software: ['ArduPilot', 'Mission Planner', 'QGroundControl'], missions: '0-5', utilization: 'Under 20%', services: ['Drone manufacturing / Assembly', 'Component supply (parts, batteries, sensors)', 'Maintenance, repair, and overhaul (MRO)'], sectors: ['Agriculture and precision farming', 'Security and surveillance'], revenueModel: 'Product sales (hardware, software)', financing: ['Angel investment', 'Competition / Challenge prize'], investment: '$50,000-$200,000', importPct: 80, localPct: 20, leadTime: 8, repairLocation: 'We do all maintenance in-house', femalePct: '0%' },
  { name: 'INES-Ruhengeri Drone Lab', segment: 'Upstream: Training and Research / R&D', year: 2018, employees: '6-10', scope: 'Rwanda-wide', revenue: 'Not applicable / Prefer not to disclose', fleet: '3-5', platforms: ['Rotary-wing / Multirotor (quadcopter, hexacopter, etc.)', 'Fixed-wing UAS'], brands: ['DJI Mavic 2 Pro', 'Parrot Disco', 'Custom Research UAV'], sensors: ['RGB camera (standard visual)', 'Multispectral sensor'], software: ['QGIS', 'Python/OpenCV', 'ROS'], missions: '6-15', utilization: '20-40%', services: ['Training and education (pilot certification, technical courses)', 'Software development for UAS'], sectors: ['Scientific research', 'Agriculture and precision farming', 'Environmental monitoring and conservation'], revenueModel: 'Grant-funded projects', financing: ['Government grant (NCST, RDB, Innovation Fund, etc.)', 'International donor / Development partner grant'], investment: '$50,000-$200,000', importPct: 95, localPct: 5, leadTime: 6, repairLocation: 'We do all maintenance in-house', femalePct: '11-25%' },
  { name: 'RwandAir UTM Services', segment: 'Midstream: Infrastructure Provider (connectivity, UTM/USSP, UASports)', year: 2021, employees: '6-10', scope: 'Rwanda-wide', revenue: '20-100 million', fleet: '0 (we use subcontracted operators)', platforms: [], brands: [], sensors: [], software: ['AirMap', 'Custom UTM Platform'], missions: 'Not applicable', utilization: "Don't know / Not tracked", services: ['UTM / Airspace management services', 'Software development for UAS'], sectors: ['Surveying, mapping, and GIS', 'Delivery and logistics'], revenueModel: 'Subscription / Retainer contracts', financing: ['Venture capital'], investment: '$200,000-$1,000,000', importPct: 0, localPct: 0, leadTime: 0, repairLocation: 'Local service provider in Rwanda', femalePct: '1-10%' },
  { name: 'NAEB Drone Unit', segment: 'Downstream: End-User / Client (agriculture, health, infrastructure, security, etc.)', year: 2022, employees: '11-50', scope: 'Rwanda-wide', revenue: 'Not applicable / Prefer not to disclose', fleet: '1-2', platforms: ['Rotary-wing / Multirotor (quadcopter, hexacopter, etc.)'], brands: ['DJI Agras T20'], sensors: ['Multispectral sensor', 'Spraying system (agricultural)'], software: ['DJI Terra'], missions: '6-15', utilization: '20-40%', services: ['Agricultural services (spraying, crop monitoring)'], sectors: ['Agriculture and precision farming'], revenueModel: 'Government contracts / Tenders', financing: ['Government grant (NCST, RDB, Innovation Fund, etc.)'], investment: '$50,000-$200,000', importPct: 100, localPct: 0, leadTime: 8, repairLocation: 'Manufacturer (abroad)', femalePct: '26-50%' },
  { name: 'TerraMap Solutions', segment: 'Midstream: UAS Data Integrator (GIS, AI, data processing)', year: 2019, employees: '6-10', scope: 'Multiple provinces within Rwanda', revenue: '5-20 million', fleet: '1-2', platforms: ['Rotary-wing / Multirotor (quadcopter, hexacopter, etc.)'], brands: ['DJI Phantom 4 RTK'], sensors: ['RGB camera (standard visual)', 'Multispectral sensor'], software: ['Pix4D', 'QGIS', 'Google Earth Engine'], missions: '6-15', utilization: '41-60%', services: ['Data analytics and processing (GIS, AI, photogrammetry)', 'UAS operations (surveying, mapping, inspection)'], sectors: ['Surveying, mapping, and GIS', 'Environmental monitoring and conservation', 'Urban planning and smart cities'], revenueModel: 'Data / Analytics as a service', financing: ['Personal savings / Bootstrapping', 'Competition / Challenge prize'], investment: '$10,000-$50,000', importPct: 100, localPct: 0, leadTime: 6, repairLocation: 'We do all maintenance in-house', femalePct: '1-10%' },
  { name: 'Rwanda Mining Board', segment: 'Downstream: End-User / Client (agriculture, health, infrastructure, security, etc.)', year: 2013, employees: '51-100', scope: 'Rwanda-wide', revenue: 'Not applicable / Prefer not to disclose', fleet: '0 (we use subcontracted operators)', platforms: [], brands: [], sensors: [], software: [], missions: 'Not applicable', utilization: "Don't know / Not tracked", services: [], sectors: ['Mining and quarry monitoring'], revenueModel: 'Government contracts / Tenders', financing: ['Not applicable'], investment: '$200,000-$1,000,000', importPct: 0, localPct: 0, leadTime: 0, repairLocation: 'Local service provider in Rwanda', femalePct: '11-25%' },
  { name: 'UAV Insurance Rwanda', segment: 'Midstream: UAS Support Services (maintenance, insurance, logistics)', year: 2021, employees: '1-5', scope: 'Rwanda-wide', revenue: '5-20 million', fleet: '0 (we use subcontracted operators)', platforms: [], brands: [], sensors: [], software: [], missions: 'Not applicable', utilization: "Don't know / Not tracked", services: ['Insurance for UAS operations', 'Consulting / Advisory'], sectors: ['Agriculture and precision farming', 'Delivery and logistics', 'Infrastructure inspection (roads, bridges, energy)'], revenueModel: 'Subscription / Retainer contracts', financing: ['Bank loan', 'Personal savings / Bootstrapping'], investment: '$10,000-$50,000', importPct: 0, localPct: 0, leadTime: 0, repairLocation: 'Local service provider in Rwanda', femalePct: '26-50%' },
  { name: 'EcoFlight Rwanda', segment: 'Midstream: UAS Operator (licensed pilot operations)', year: 2023, employees: '1-5', scope: 'Multiple provinces within Rwanda', revenue: 'Under 5 million', fleet: '1-2', platforms: ['Rotary-wing / Multirotor (quadcopter, hexacopter, etc.)'], brands: ['DJI Mavic 3 Enterprise'], sensors: ['RGB camera (standard visual)', 'Thermal / Infrared sensor'], software: ['DroneDeploy', 'QGIS'], missions: '0-5', utilization: 'Under 20%', services: ['UAS operations (surveying, mapping, inspection)'], sectors: ['Environmental monitoring and conservation', 'Emergency response and disaster management'], revenueModel: 'Grant-funded projects', financing: ['International donor / Development partner grant'], investment: '$10,000-$50,000', importPct: 100, localPct: 0, leadTime: 10, repairLocation: 'Manufacturer (abroad)', femalePct: '1-10%' },
  { name: 'Smart Farms Coop', segment: 'Downstream: End-User / Client (agriculture, health, infrastructure, security, etc.)', year: 2018, employees: '51-100', scope: 'Multiple provinces within Rwanda', revenue: 'Not applicable / Prefer not to disclose', fleet: '0 (we use subcontracted operators)', platforms: [], brands: [], sensors: [], software: [], missions: 'Not applicable', utilization: "Don't know / Not tracked", services: [], sectors: ['Agriculture and precision farming'], revenueModel: 'Other', financing: ['Microfinance'], investment: 'Under $10,000', importPct: 0, localPct: 0, leadTime: 0, repairLocation: 'Local service provider in Rwanda', femalePct: 'Over 50%' },
  { name: 'Drone Association of Rwanda', segment: 'Downstream: Advocacy Group / Industry Association', year: 2020, employees: '1-5', scope: 'Rwanda-wide', revenue: 'Not applicable / Prefer not to disclose', fleet: '0 (we use subcontracted operators)', platforms: [], brands: [], sensors: [], software: [], missions: 'Not applicable', utilization: "Don't know / Not tracked", services: ['Consulting / Advisory', 'Training and education (pilot certification, technical courses)'], sectors: ['Scientific research'], revenueModel: 'Grant-funded projects', financing: ['International donor / Development partner grant', 'Competition / Challenge prize'], investment: '$10,000-$50,000', importPct: 0, localPct: 0, leadTime: 0, repairLocation: 'Local service provider in Rwanda', femalePct: '26-50%' },
  { name: 'Ubuzima Health Logistics', segment: 'Midstream: UAS Operator (licensed pilot operations)', year: 2022, employees: '6-10', scope: 'Rwanda-wide', revenue: '5-20 million', fleet: '3-5', platforms: ['VTOL (Vertical Take-Off and Landing hybrid)'], brands: ['Wingcopter 198', 'Custom VTOL'], sensors: ['Delivery payload mechanism'], software: ['Custom Logistics Platform'], missions: '16-30', utilization: '41-60%', services: ['Delivery and logistics'], sectors: ['Healthcare / Medical delivery', 'Delivery and logistics'], revenueModel: 'Government contracts / Tenders', financing: ['Venture capital', 'Government grant (NCST, RDB, Innovation Fund, etc.)'], investment: '$200,000-$1,000,000', importPct: 85, localPct: 15, leadTime: 6, repairLocation: 'We do all maintenance in-house', femalePct: '11-25%' },
  { name: 'GIZ Digital Innovation Hub', segment: 'Cross-cutting: Investor / Funder', year: 2018, employees: '11-50', scope: 'International', revenue: 'Not applicable / Prefer not to disclose', fleet: '0 (we use subcontracted operators)', platforms: [], brands: [], sensors: [], software: [], missions: 'Not applicable', utilization: "Don't know / Not tracked", services: ['Consulting / Advisory'], sectors: ['Agriculture and precision farming', 'Healthcare / Medical delivery', 'Scientific research'], revenueModel: 'Grant-funded projects', financing: ['International donor / Development partner grant'], investment: 'Over $1,000,000', importPct: 0, localPct: 0, leadTime: 0, repairLocation: 'Local service provider in Rwanda', femalePct: 'Over 50%' },
]

const skillRankOptions = [
  'Licensed UAS pilots',
  'GIS / Remote sensing / Data analysts',
  'UAS hardware engineers / Avionics',
  'Software developers (flight control, AI/ML, analytics)',
  'Maintenance and repair technicians',
  'Regulatory compliance specialists',
  'Business development / Sales for UAS services',
]

const trainingOptions = [
  'Advanced drone piloting (BVLOS, night operations)',
  'Drone data processing and analytics (photogrammetry, NDVI, LiDAR)',
  'UAS software development (flight planning, autonomy, AI)',
  'UAS maintenance, repair, and overhaul',
  'Regulatory compliance and safety management',
  'Drone manufacturing and assembly',
  'Business model development for UAS services',
  'Project management for UAS operations',
]

const barrierOptions = [
  'Regulatory complexity or delays',
  'Lack of skilled workforce',
  'Insufficient access to capital / finance',
  'Limited end-user awareness and demand',
  'Infrastructure gaps (connectivity, airspace, facilities)',
  'Import restrictions or supply chain challenges',
  'Weak collaboration between ecosystem players',
  'Lack of local manufacturing capability',
  'Data privacy and security concerns',
]

const untappedOptions = [
  'Precision agriculture (crop monitoring, spraying, yield estimation)',
  'Medical and pharmaceutical delivery',
  'Infrastructure inspection and monitoring',
  'Environmental conservation and forestry',
  'Disaster risk management and emergency response',
  'Mining and geological survey',
  'Urban planning and cadastral mapping',
  'Security and border monitoring',
  'Cargo delivery and logistics',
]

const nonAdoptionReasons = [
  'Cost perceived as too high',
  'Lack of awareness of UAS capabilities',
  'Regulatory uncertainty or restrictions',
  'Lack of trust in data quality',
  'Preference for traditional methods',
  'Difficulty integrating UAS data into existing workflows',
]

const clientOptions = [
  'Government ministries and agencies',
  'District local governments',
  'International NGOs and development organizations',
  'Agricultural cooperatives and farmer organizations',
  'Mining companies',
  'Construction and real estate companies',
  'Research institutions and universities',
  'Private sector (other)',
]

const relationshipTypes = ['Partnership', 'Subcontracting', 'Referrals', 'Data sharing', 'Joint R&D']
const interactionFreqs = ['Weekly or more', 'Monthly', 'Quarterly', 'Annually (at events or workshops only)', 'Rarely or never']
const platformPrefs = ['Online directory of UAS service providers', 'Quarterly ecosystem meetups / Networking events', 'Shared procurement platform (matching supply and demand)', 'Joint training and capacity building programs', 'Shared testing and calibration facilities']

function pick<T>(arr: T[], n: number = 1): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(n, arr.length))
}

function pickOne<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function likert(): string {
  const vals = ['1 Strongly Disagree', '2 Disagree', '3 Neutral', '4 Agree', '5 Strongly Agree']
  // Weight toward middle/agree
  const weights = [0.1, 0.15, 0.25, 0.3, 0.2]
  const r = Math.random()
  let cumulative = 0
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i]
    if (r <= cumulative) return vals[i]
  }
  return vals[2]
}

function matrixResponse(rows: number): string {
  const result: Record<string, string> = {}
  for (let i = 0; i < rows; i++) {
    result[`row_${i}`] = likert()
  }
  return JSON.stringify(result)
}

async function main() {
  const form = await prisma.universalForm.findUnique({
    where: { slug: 'rwanda-uas-ecosystem-mapping' },
    include: { sections: { include: { fields: { orderBy: { order: 'asc' } } }, orderBy: { order: 'asc' } } },
  })

  if (!form) throw new Error('Form not found — run seed-uas-survey.ts first')

  // Build a name→field map
  const fieldMap: Record<string, string> = {}
  form.sections.forEach(s => s.fields.forEach(f => { fieldMap[f.name] = f.id }))

  console.log(`Creating 20 test responses for form: ${form.title}\n`)

  for (let i = 0; i < 20; i++) {
    const org = orgs[i]
    const values: { fieldId: string; value: string | null }[] = []

    function set(name: string, value: string | null) {
      if (fieldMap[name]) {
        values.push({ fieldId: fieldMap[name], value })
      }
    }

    // Section A: Organization Profile
    set('a1_organization_name', org.name)
    set('a2_contact_name', `Contact Person ${i + 1}`)
    set('a2_contact_title', pickOne(['CEO', 'CTO', 'Director', 'Operations Manager', 'Head of UAS', 'Program Manager']))
    set('a2_contact_email', `contact${i + 1}@${org.name.toLowerCase().replace(/[^a-z]/g, '')}.rw`)
    set('a2_contact_phone', `+2507${(80000000 + Math.floor(Math.random() * 9999999)).toString()}`)
    set('a3_year_established', org.year.toString())
    set('a4_value_chain_segment', org.segment)
    set('a4_value_chain_other', null)
    set('a5_secondary_segment', i % 3 === 0 ? 'Training and Research / R&D' : null)
    set('a6_employees', org.employees)
    set('a7_geographic_scope', org.scope)
    set('a8_countries_served', org.scope.includes('Regional') ? pickOne(['DRC, Burundi', 'Uganda, Kenya, Tanzania', 'DRC, Uganda, Burundi', 'Kenya, Tanzania']) : null)
    set('a9_annual_revenue', org.revenue)

    // Fleet and Technology Profile
    set('a10_fleet_size', org.fleet)
    set('a11_platform_types', org.platforms.length > 0 ? JSON.stringify(org.platforms) : null)
    set('a11_platform_other', null)
    for (let b = 0; b < 5; b++) {
      set(`a12_brand_${b + 1}`, org.brands[b] || null)
    }
    set('a13_sensors_payloads', org.sensors.length > 0 ? JSON.stringify(org.sensors) : null)
    set('a13_sensors_other', null)
    for (let s = 0; s < 5; s++) {
      set(`a14_software_${s + 1}`, org.software[s] || null)
    }
    set('a15_missions_per_month', org.missions)
    set('a16_utilization_rate', org.utilization)

    // Services
    set('a17_services', org.services.length > 0 ? JSON.stringify(org.services) : null)
    set('a17_services_other', null)
    set('a18_sectors', JSON.stringify(org.sectors))
    set('a18_sectors_other', null)
    set('a19_innovation', i % 2 === 0 ? pickOne([
      'Developed AI-based crop health monitoring pipeline using multispectral drone data',
      'Launched BVLOS medical delivery corridor covering 3 districts',
      'Created automated stockpile volumetric analysis using drone LiDAR',
      'Built custom flight planning tool for agricultural spraying operations',
      'Introduced thermal drone inspections for solar panel maintenance',
      'Piloted autonomous drone delivery of lab samples between health centers',
      'Developed cloud-based GIS platform for real-time drone data analytics',
      'Launched first commercial drone pilot certification program in Rwanda',
      'Created open-source drone kit for STEM education in secondary schools',
      'Integrated drone survey data with national cadastral mapping system',
    ]) : null)

    // Section B: Supply Chain (matrix + follow-ups)
    set('b1_b7_matrix', matrixResponse(7))
    set('b8_imported_pct', org.importPct.toString())
    set('b8_local_pct', org.localPct.toString())
    set('b9_lead_time', org.leadTime > 0 ? org.leadTime.toString() : null)
    set('b10_repair_location', org.repairLocation)
    set('b10_repair_other', null)
    set('b11_bottleneck', pickOne([
      'High import duties on drone components and spare parts',
      'Long lead times for specialized sensors from overseas manufacturers',
      'No local LiDAR sensor calibration facility',
      'Unreliable power supply in rural operating areas',
      'Limited 4G/5G coverage for BVLOS command and control',
      'Lack of certified repair centers for major drone brands',
      'Customs clearance delays for lithium batteries',
      'No local supplier for flight controller boards',
    ]))

    // Section C: Talent
    set('c1_c5_matrix', matrixResponse(5))
    const ranks = pick(skillRankOptions, 3)
    set('c6_rank1', ranks[0])
    set('c6_rank2', ranks[1])
    set('c6_rank3', ranks[2])
    set('c7_training_topics', JSON.stringify(pick(trainingOptions, 3)))
    set('c7_training_other', null)
    set('c8_female_pct', org.femalePct)

    // Section D: Regulatory
    set('d1_d7_matrix', matrixResponse(7))
    set('d8_license_time', (Math.floor(Math.random() * 16) + 2).toString())
    set('d9_compliance_cost', (Math.floor(Math.random() * 5000000) + 500000).toString())
    set('d10_regulatory_improvement', pickOne([
      'Streamline the BVLOS approval process with clear timelines',
      'Reduce registration fees for small operators and startups',
      'Create a single online portal for all UAS permits and renewals',
      'Establish mutual recognition of pilot licenses within EAC',
      'Publish clear guidelines for agricultural drone spraying operations',
      'Allow temporary flight permits for research and testing',
      'Simplify insurance requirements for sub-2kg recreational drones',
    ]))

    // Section E: Technology & Knowledge Transfer
    set('e1_e5_matrix', matrixResponse(5))
    const collabs = pick(orgs.filter((_, idx) => idx !== i).map(o => o.name), Math.floor(Math.random() * 4) + 1)
    for (let c = 0; c < 5; c++) {
      set(`e6_collaborator_${c + 1}`, collabs[c] || null)
    }
    set('e7_capability_gap', pickOne([
      'Local LiDAR data processing capability',
      'AI/ML for automated drone data analysis',
      'BVLOS flight capability and infrastructure',
      'Local drone manufacturing and assembly',
      'Advanced photogrammetry and 3D modeling',
      'Real-time data transmission and analytics',
      'Autonomous flight systems development',
    ]))

    // Section F: Business Viability
    set('f1_f6_matrix', matrixResponse(6))
    set('f7_revenue_model', org.revenueModel)
    set('f7_revenue_other', org.revenueModel === 'Other' ? 'Cooperative membership fees' : null)
    set('f8_financing', JSON.stringify(org.financing))
    set('f9_investment_needed', org.investment)
    set('f10_financial_barrier', pickOne([
      'Banks do not understand UAS as an asset class for collateral',
      'High upfront cost of professional drone equipment',
      'Seasonal and unpredictable demand for drone services',
      'Limited investor awareness of UAS market potential in Rwanda',
      'Grant funding cycles too slow for fast-moving technology sector',
      'No insurance products designed for drone operations',
    ]))

    // Section G: End-User Adoption
    set('g1_g5_matrix', matrixResponse(5))
    set('g6_primary_clients', JSON.stringify(pick(clientOptions, 3)))
    set('g7_avg_price', (Math.floor(Math.random() * 2000000) + 100000).toString())
    set('g8_non_adoption_reason', pickOne(nonAdoptionReasons))
    set('g8_non_adoption_other', null)

    // Section H: Ecosystem Connectivity
    const partners = pick(orgs.filter((_, idx) => idx !== i).map(o => o.name), Math.min(5, Math.floor(Math.random() * 4) + 2))
    for (let p = 0; p < 5; p++) {
      set(`h1_partner_${p + 1}_name`, partners[p] || null)
      set(`h1_partner_${p + 1}_type`, partners[p] ? pickOne(relationshipTypes) : null)
    }
    const desired = pick(orgs.filter((_, idx) => idx !== i && !partners.includes(orgs[idx].name)).map(o => o.name), Math.min(3, 2))
    for (let d = 0; d < 3; d++) {
      set(`h2_desired_${d + 1}_name`, desired[d] || null)
      set(`h2_desired_${d + 1}_reason`, desired[d] ? pickOne(['No contact point', 'Different focus areas', 'Not aware of their work', 'Geographic distance', 'Lack of formal introduction']) : null)
    }
    set('h3_interaction_frequency', pickOne(interactionFreqs))
    set('h4_association_member', pickOne(['Yes', 'No, but interested', 'No, not interested']))
    set('h4_association_name', i % 3 === 0 ? 'Drone Association of Rwanda' : null)
    set('h5_platform_preference', pickOne(platformPrefs))
    set('h5_platform_other', null)

    // Section I: Strategic Priorities
    const barriers = pick(barrierOptions, 3)
    set('i1_barrier_rank1', barriers[0])
    set('i1_barrier_rank2', barriers[1])
    set('i1_barrier_rank3', barriers[2])
    set('i2_untapped_potential', pickOne(untappedOptions))
    set('i2_untapped_other', null)
    set('i3_government_action', pickOne([
      'Create a national UAS strategy with clear 5-year targets and funding commitments',
      'Establish tax incentives for drone technology imports and local manufacturing',
      'Fund a national drone testing and certification facility',
      'Mandate UAS integration in key government procurement processes',
      'Create a dedicated UAS innovation fund for startups',
      'Establish a drone corridor network connecting major cities',
      'Develop public drone awareness campaigns to build end-user confidence',
    ]))
    set('i4_five_year_outlook', pickOne([
      'Rwanda will be a regional leader in drone delivery and agricultural UAS applications',
      'A mature ecosystem with local manufacturing, strong regulation, and widespread adoption',
      'Multiple commercial BVLOS corridors, local drone assembly, and East African market leadership',
      'Fully integrated UTM system, 50+ licensed operators, and UAS data driving policy decisions',
      'Rwanda as the go-to destination for drone innovation in Africa with a thriving startup ecosystem',
    ]))

    const editToken = crypto.randomBytes(24).toString('hex')

    await prisma.formEntry.create({
      data: {
        formId: form.id,
        editToken,
        status: 'submitted',
        meta: {
          ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          submittedAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
          userAgent: 'Mozilla/5.0 (Test Seed Script)',
        },
        values: { create: values },
      },
    })

    console.log(`  ✅ ${i + 1}/20 — ${org.name}`)
  }

  console.log('\n🎉 All 20 test responses created successfully!')
  console.log(`   View submissions at: /forms/${form.id}/submissions`)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
