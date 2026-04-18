import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ===== Shared option lists =====
const CS4_OPTIONS = [
  'Upstream: Training and Research / R&D',
  'Upstream: Hardware and Software Supplier',
  'Upstream: Regulations and Policy',
  'Midstream: UAS Operator (licensed pilot operations)',
  'Midstream: UAS Support Services (maintenance, insurance, logistics)',
  'Midstream: UAS Data Integrator (GIS, AI, data processing)',
  'Midstream: Infrastructure Provider (connectivity, UTM/USSP, UAS ports)',
  'Downstream: End-User / Client (agriculture, health, infrastructure, security, etc.)',
  'Downstream: Advocacy Group / Industry Association',
  'Downstream: Investor / Funder',
  'Other (please specify)',
]

const DOWNSTREAM_END_USER_OR_ADVOCACY = [
  'Downstream: End-User / Client (agriculture, health, infrastructure, security, etc.)',
  'Downstream: Advocacy Group / Industry Association',
]

const DOWNSTREAM_INVESTOR = 'Downstream: Investor / Funder'

const MATRIX_COLS = ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree']

const GEO_SCOPE = [
  'Kigali only',
  'Multiple provinces within Rwanda',
  'Rwanda-wide',
  'Regional work (clients or partners in neighbouring countries)',
  'International',
]

const REVENUE_RANGES = [
  'Under 5 million',
  '5 to 20 million',
  '20 to 100 million',
  '100 to 500 million',
  'Over 500 million',
  'Prefer not to disclose',
]

const FEMALE_PCT = ['0%', '1 to 10%', '11 to 25%', '26 to 50%', 'Over 50%']

const HARDEST_ROLES = [
  'Licensed UAS pilots',
  'GIS / Remote sensing / Data analysts',
  'UAS hardware engineers / Avionics specialists',
  'Software developers (flight control, AI/ML, analytics)',
  'Maintenance and repair technicians',
  'Regulatory compliance specialists',
  'Business development / Sales for UAS services',
  'Other',
]

const BARRIERS = [
  'Regulatory complexity or delays',
  'Lack of skilled workforce',
  'Insufficient access to capital or finance',
  'Limited end-user awareness and demand',
  'Infrastructure gaps (connectivity, airspace, facilities)',
  'Import restrictions or supply chain challenges',
  'Weak collaboration between ecosystem players',
  'Lack of local manufacturing capability',
  'Data privacy and security concerns',
  'Other',
]

const RELATIONSHIP_TYPES = ['Partnership', 'Subcontracting', 'Referrals', 'Data sharing', 'Joint R&D', 'Other']

async function main() {
  const adminUser = await prisma.user.findUnique({ where: { email: 'admin@uav.rw' } })
  if (!adminUser) throw new Error('Admin user admin@uav.rw not found')

  const existing = await prisma.universalForm.findUnique({
    where: { slug: 'rwanda-uas-ecosystem-mapping' },
  })
  if (existing) {
    console.log('Form already exists, deleting and recreating...')
    await prisma.universalForm.delete({ where: { id: existing.id } })
  }

  const form = await prisma.universalForm.create({
    data: {
      userId: adminUser.id,
      title: 'Rwanda UAS Ecosystem Mapping Survey',
      slug: 'rwanda-uas-ecosystem-mapping',
      description:
        'Thank you for taking the time to share your experience with us. We are the Rwanda Information Society Authority (RISA), and together with GIZ we are mapping the Rwanda UAS ecosystem, the people, organisations, technology, and capital that shape the sector. The answers you give us here will go directly into the Rwanda UAS Ecosystem Mapping Report, and from there into policy and investment recommendations. Everything you tell us is confidential and will only be used for ecosystem analysis. We will only ask you the questions that are relevant to your role, so most people get through this in 10 to 20 minutes.',
      isActive: true,
      isPublic: true,
      settings: {
        submitButtonText: 'Submit response',
        confirmationMessage:
          'Thank you. We have received your response, and it will go directly into the Rwanda UAS Ecosystem Mapping Report. If you have colleagues or partners in the sector, we would be grateful if you shared the survey with them too. The more voices we hear, the stronger the recommendations we can put forward for the sector.',
        allowMultipleSubmissions: false,
        showProgressBar: true,
        primaryColor: '#1e3a5f',
        notifyEmails: 'info@risa.gov.rw',
      },
      sections: {
        create: [
          // ============================================================
          // SECTION 1, COMMON (everyone)
          // ============================================================
          {
            title: 'About your organisation',
            description:
              'Before we get into the detail, we would like to learn a little about your organisation and who we are speaking to. Your answer to the last question below tells us which set of questions to ask you next, so please choose the option that best fits your primary role, not a secondary one.',
            order: 1,
            fields: {
              create: [
                {
                  label: 'Organisation name',
                  name: 'cs1_organisation_name',
                  type: 'SHORT_TEXT',
                  order: 1,
                  validation: { required: true },
                },
                {
                  label: 'Full name of the main contact person',
                  name: 'cs2_contact_name',
                  type: 'SHORT_TEXT',
                  order: 2,
                  validation: { required: true },
                },
                {
                  label: 'Their job title or role',
                  name: 'cs2_contact_title',
                  type: 'SHORT_TEXT',
                  order: 3,
                  validation: { required: true },
                },
                {
                  label: 'Their email address',
                  name: 'cs2_contact_email',
                  type: 'EMAIL',
                  order: 4,
                  validation: { required: true },
                },
                {
                  label: 'Their phone number',
                  name: 'cs2_contact_phone',
                  type: 'PHONE',
                  order: 5,
                  validation: { required: true },
                },
                {
                  label: 'Year your organisation was established',
                  name: 'cs3_year_established',
                  type: 'NUMBER',
                  placeholder: 'e.g. 2018',
                  order: 6,
                  validation: { required: true },
                },
                {
                  label: 'Which segment of the UAS value chain does your organisation primarily operate in?',
                  name: 'cs4_value_chain',
                  type: 'MULTIPLE_CHOICE',
                  order: 7,
                  validation: { required: true },
                  options: CS4_OPTIONS,
                },
                {
                  label: 'If you selected "Other", please tell us more',
                  name: 'cs4_other',
                  type: 'SHORT_TEXT',
                  order: 8,
                  validation: { required: false },
                  conditional: { dependsOn: 'cs4_value_chain', operator: 'equals', value: 'Other (please specify)' },
                },
              ],
            },
          },

          // ============================================================
          // UPSTREAM PATH
          // ============================================================
          {
            title: 'Your role in the UAS ecosystem',
            description:
              'We would like to understand exactly where your organisation sits in the upstream of the sector, whether you are training people, running research, supplying hardware or software, or shaping policy. Your answers here help us build a clearer picture of who is doing what.',
            order: 2,
            conditional: { dependsOn: 'cs4_value_chain', operator: 'contains', value: 'Upstream' },
            fields: {
              create: [
                {
                  label: 'What best describes your primary role?',
                  name: 'up11_primary_role',
                  type: 'MULTIPLE_CHOICE',
                  order: 1,
                  validation: { required: true },
                  options: [
                    'Training institution (pilot certification or technical courses)',
                    'Academic or research institution (R&D and applied research)',
                    'Hardware supplier (components, airframes, batteries, sensors)',
                    'Software supplier (flight planning, analytics, AI platforms)',
                    'Regulatory authority (RCAA, RISA, or another government body)',
                    'Policy or planning body (ministry or another government agency)',
                    'Other',
                  ],
                },
                {
                  label: 'If you selected "Other", please tell us your role',
                  name: 'up11_other',
                  type: 'SHORT_TEXT',
                  order: 2,
                  validation: { required: false },
                  conditional: { dependsOn: 'up11_primary_role', operator: 'equals', value: 'Other' },
                },
                {
                  label: 'Do you also operate in a secondary segment? If yes, which one?',
                  name: 'up12_secondary_segment',
                  type: 'SHORT_TEXT',
                  order: 3,
                  validation: { required: false },
                },
                {
                  label: 'Geographic scope of your UAS-related work',
                  name: 'up13_geographic_scope',
                  type: 'MULTIPLE_CHOICE',
                  order: 4,
                  validation: { required: true },
                  options: GEO_SCOPE,
                },
                {
                  label:
                    'Roughly how many individuals or organisations do you directly serve or support per year through UAS-related activities?',
                  name: 'up14_reach',
                  type: 'MULTIPLE_CHOICE',
                  order: 5,
                  validation: { required: true },
                  options: ['Fewer than 10', '10 to 50', '51 to 200', '201 to 500', 'More than 500'],
                },
                {
                  label: 'Your annual budget or revenue from UAS-related activities (RWF, approximate)',
                  name: 'up15_revenue',
                  type: 'MULTIPLE_CHOICE',
                  order: 6,
                  validation: { required: true },
                  options: REVENUE_RANGES,
                },
                {
                  label: 'Which products or services do you offer? Select all that apply.',
                  name: 'up16_products_services',
                  type: 'CHECKBOXES',
                  order: 7,
                  validation: { required: true },
                  options: [
                    'Drone manufacturing / Assembly',
                    'Component supply (parts, batteries, sensors, airframes)',
                    'Software development for UAS (flight control, analytics, AI)',
                    'Pilot training and certification',
                    'Technical / engineering education and degree programmes',
                    'Applied research and R&D',
                    'Regulatory services / Licensing support',
                    'Policy research and advisory',
                    'Airspace management / UTM services',
                    'Other',
                  ],
                },
                {
                  label: 'If you selected "Other", please describe the product or service',
                  name: 'up16_other',
                  type: 'SHORT_TEXT',
                  order: 8,
                  validation: { required: false },
                },
                {
                  label:
                    'What is the most significant product, research output, or programme you have delivered in the last 24 months?',
                  name: 'up17_significant_output',
                  type: 'LONG_TEXT',
                  order: 9,
                  validation: { required: false },
                },
              ],
            },
          },
          {
            title: 'Training, research, and knowledge transfer',
            description:
              'We want to hear your honest read on how well Rwanda\'s training institutions, research bodies, and knowledge-sharing platforms are serving the sector. There are no right or wrong answers, just tell us what you see from where you sit.',
            order: 3,
            conditional: { dependsOn: 'cs4_value_chain', operator: 'contains', value: 'Upstream' },
            fields: {
              create: [
                {
                  label: 'Please tell us how strongly you agree with each statement',
                  name: 'up2_matrix',
                  type: 'MATRIX',
                  order: 1,
                  validation: { required: true },
                  matrixType: 'single',
                  matrixRows: [
                    'Academic and training institutions in Rwanda produce graduates whose skills match UAS industry needs.',
                    'On-the-job training and mentorship opportunities are accessible within the ecosystem.',
                    'Collaboration between UAS companies and research institutions is active and productive.',
                    'International technology partnerships effectively support local UAS capability development.',
                    'There are adequate platforms (conferences, workshops, hubs) for knowledge exchange within the ecosystem.',
                    'Local R&D activities are generating commercially viable UAS innovations.',
                    'Intellectual property protections are adequate to incentivise local UAS innovation.',
                  ],
                  matrixColumns: MATRIX_COLS,
                },
                {
                  label: 'Which training topics are most in demand from your learners or clients? Select up to three.',
                  name: 'up28_training_demand',
                  type: 'CHECKBOXES',
                  order: 2,
                  validation: { required: true },
                  options: [
                    'Advanced drone piloting (BVLOS or night operations)',
                    'Drone data processing and analytics (photogrammetry, NDVI, LiDAR)',
                    'UAS software development (flight planning, autonomy, AI)',
                    'UAS maintenance, repair, and overhaul',
                    'Regulatory compliance and safety management',
                    'Drone manufacturing and assembly',
                    'Business model development for UAS services',
                    'Other',
                  ],
                },
                {
                  label: 'If you selected "Other", which topic?',
                  name: 'up28_training_other',
                  type: 'SHORT_TEXT',
                  order: 3,
                  validation: { required: false },
                },
                {
                  label: 'Which single skill gap, if closed, would most strengthen the Rwanda UAS ecosystem?',
                  name: 'up29_skill_gap',
                  type: 'LONG_TEXT',
                  order: 4,
                  validation: { required: false },
                },
                {
                  label: 'R&D or knowledge-sharing collaborator #1',
                  name: 'up210_collab_1',
                  type: 'SHORT_TEXT',
                  placeholder: 'Organisation name',
                  order: 5,
                  validation: { required: false },
                },
                {
                  label: 'R&D or knowledge-sharing collaborator #2',
                  name: 'up210_collab_2',
                  type: 'SHORT_TEXT',
                  order: 6,
                  validation: { required: false },
                },
                {
                  label: 'R&D or knowledge-sharing collaborator #3',
                  name: 'up210_collab_3',
                  type: 'SHORT_TEXT',
                  order: 7,
                  validation: { required: false },
                },
                {
                  label: 'R&D or knowledge-sharing collaborator #4',
                  name: 'up210_collab_4',
                  type: 'SHORT_TEXT',
                  order: 8,
                  validation: { required: false },
                },
                {
                  label: 'R&D or knowledge-sharing collaborator #5',
                  name: 'up210_collab_5',
                  type: 'SHORT_TEXT',
                  order: 9,
                  validation: { required: false },
                },
                {
                  label: 'What percentage of your UAS-related workforce or student body is female?',
                  name: 'up211_female_pct',
                  type: 'MULTIPLE_CHOICE',
                  order: 10,
                  validation: { required: true },
                  options: FEMALE_PCT,
                },
              ],
            },
          },
          {
            title: 'Supply chain and infrastructure',
            description:
              'You told us earlier that you are a hardware or software supplier, so we would like to ask you a few extra questions about the supply chain and physical infrastructure you rely on. Please answer based on your day-to-day experience working in Rwanda.',
            order: 4,
            conditional: {
              dependsOn: 'up11_primary_role',
              operator: 'in',
              value: [
                'Hardware supplier (components, airframes, batteries, sensors)',
                'Software supplier (flight planning, analytics, AI platforms)',
              ],
            },
            fields: {
              create: [
                {
                  label: 'Please tell us how strongly you agree with each statement',
                  name: 'up3_matrix',
                  type: 'MATRIX',
                  order: 1,
                  validation: { required: true },
                  matrixType: 'single',
                  matrixRows: [
                    'The supply chain for UAS components (airframes, sensors, batteries) is well established and reliable in Rwanda.',
                    'Locally sourced materials and components are available to reduce import dependency.',
                    'Essential spare parts and maintenance tools are obtainable within Rwanda without significant delays.',
                    'Physical infrastructure (landing zones, charging stations, storage facilities) is adequate for UAS operations.',
                    'Telecommunications infrastructure reliably supports UAS command-and-control requirements nationwide.',
                    'UTM/USSP systems are functional and accessible for coordinating UAS flights.',
                  ],
                  matrixColumns: MATRIX_COLS,
                },
                {
                  label: 'What percentage of the UAS hardware components you supply are imported?',
                  name: 'up37_imported_pct',
                  type: 'NUMBER',
                  placeholder: 'e.g. 90',
                  order: 2,
                  validation: { required: false, min: 0, max: 100 },
                },
                {
                  label: 'What percentage are locally sourced?',
                  name: 'up37_local_pct',
                  type: 'NUMBER',
                  placeholder: 'e.g. 10',
                  order: 3,
                  validation: { required: false, min: 0, max: 100 },
                },
                {
                  label:
                    'In your view, what is the single biggest supply chain or infrastructure bottleneck facing the Rwanda UAS ecosystem?',
                  name: 'up38_bottleneck',
                  type: 'LONG_TEXT',
                  order: 4,
                  validation: { required: false },
                },
              ],
            },
          },
          {
            title: 'Regulatory environment',
            description:
              'Now we would like to hear your view of the regulatory system. If you work inside a regulator or policy body, please answer from that perspective. If you engage with the system from the outside, as a supplier, trainer, or researcher, please tell us what the system feels like from your side.',
            order: 5,
            conditional: { dependsOn: 'cs4_value_chain', operator: 'contains', value: 'Upstream' },
            fields: {
              create: [
                {
                  label: 'Please tell us how strongly you agree with each statement',
                  name: 'up4_matrix',
                  type: 'MATRIX',
                  order: 1,
                  validation: { required: true },
                  matrixType: 'single',
                  matrixRows: [
                    'The regulatory framework is sufficiently flexible to accommodate new UAS applications and technologies.',
                    'There is clear and accessible guidance on BVLOS (Beyond Visual Line of Sight) operations.',
                    'The regulatory framework supports cross-border UAS operations within East Africa.',
                    'Communication and feedback channels between operators and RCAA are effective.',
                    'The current regulatory timeline for new approvals meets the needs of the industry.',
                    'The cost of regulatory compliance is proportionate and affordable for the sector.',
                  ],
                  matrixColumns: MATRIX_COLS,
                },
                {
                  label: 'What is the single most important regulatory improvement that would benefit the UAS sector?',
                  name: 'up47_reg_improvement',
                  type: 'LONG_TEXT',
                  order: 2,
                  validation: { required: false },
                },
              ],
            },
          },

          // ============================================================
          // MIDSTREAM PATH
          // ============================================================
          {
            title: 'About your operations',
            description:
              'We would like to understand how you actually operate in the sector, what you do, who you serve, and at what scale. Please answer based on what your organisation does today, even if your plans for the year ahead look different.',
            order: 6,
            conditional: { dependsOn: 'cs4_value_chain', operator: 'contains', value: 'Midstream' },
            fields: {
              create: [
                {
                  label: 'Which best describes your primary activity?',
                  name: 'mid11_primary_activity',
                  type: 'MULTIPLE_CHOICE',
                  order: 1,
                  validation: { required: true },
                  options: [
                    'UAS Operator (licensed commercial pilot operations)',
                    'UAS Data Integrator (GIS, photogrammetry, AI, remote sensing)',
                    'UAS Support Services (maintenance, insurance, logistics)',
                    'Infrastructure Provider (UTM/USSP, UAS ports, connectivity)',
                    'Other',
                  ],
                },
                {
                  label: 'If you selected "Other", please describe what you do',
                  name: 'mid11_other',
                  type: 'SHORT_TEXT',
                  order: 2,
                  validation: { required: false },
                  conditional: { dependsOn: 'mid11_primary_activity', operator: 'equals', value: 'Other' },
                },
                {
                  label: 'Do you also operate in a secondary segment? If yes, which one?',
                  name: 'mid12_secondary',
                  type: 'SHORT_TEXT',
                  order: 3,
                  validation: { required: false },
                },
                {
                  label: 'Number of full-time employees',
                  name: 'mid13_employees',
                  type: 'MULTIPLE_CHOICE',
                  order: 4,
                  validation: { required: true },
                  options: ['1 to 5', '6 to 10', '11 to 50', '51 to 100', '101 to 500', '500+'],
                },
                {
                  label: 'Geographic scope of operations',
                  name: 'mid14_geographic_scope',
                  type: 'MULTIPLE_CHOICE',
                  order: 5,
                  validation: { required: true },
                  options: GEO_SCOPE,
                },
                {
                  label: 'Annual revenue from UAS-related activities (RWF, approximate)',
                  name: 'mid15_revenue',
                  type: 'MULTIPLE_CHOICE',
                  order: 6,
                  validation: { required: true },
                  options: REVENUE_RANGES,
                },
                {
                  label: 'Which services do you provide? Select all that apply.',
                  name: 'mid16_services',
                  type: 'CHECKBOXES',
                  order: 7,
                  validation: { required: true },
                  options: [
                    'UAS operations (aerial surveying, mapping, inspection)',
                    'Agricultural services (spraying, crop monitoring, yield estimation)',
                    'Delivery and logistics',
                    'Data analytics and processing (GIS, AI, photogrammetry)',
                    'Maintenance, repair, and overhaul (MRO)',
                    'Software development for UAS applications',
                    'UTM / Airspace management services',
                    'UAS insurance',
                    'Consulting / Advisory',
                    'Other',
                  ],
                },
                {
                  label: 'If you selected "Other", please describe the service',
                  name: 'mid16_other',
                  type: 'SHORT_TEXT',
                  order: 8,
                  validation: { required: false },
                },
                {
                  label: 'Which sectors do you serve? Select all that apply.',
                  name: 'mid17_sectors',
                  type: 'CHECKBOXES',
                  order: 9,
                  validation: { required: true },
                  options: [
                    'Agriculture and precision farming',
                    'Healthcare / Medical delivery',
                    'Infrastructure inspection (roads, bridges, energy)',
                    'Environmental monitoring and conservation',
                    'Mining and quarry monitoring',
                    'Security and surveillance',
                    'Delivery and logistics',
                    'Media, film, and photography',
                    'Emergency response and disaster management',
                    'Surveying, mapping, and GIS',
                    'Urban planning and smart cities',
                    'Scientific research',
                    'Other',
                  ],
                },
                {
                  label: 'If you selected "Other", which sector?',
                  name: 'mid17_other',
                  type: 'SHORT_TEXT',
                  order: 10,
                  validation: { required: false },
                },
                {
                  label:
                    'What is the most significant technology or service innovation you have introduced in the last 24 months?',
                  name: 'mid18_innovation',
                  type: 'LONG_TEXT',
                  order: 11,
                  validation: { required: false },
                },
              ],
            },
          },
          {
            title: 'Fleet and technology',
            description:
              'Next, we would like to know about the aircraft, sensors, and software you use day-to-day. If you do not own or operate any aircraft yourself (for example, if you outsource all flights to a contractor) select "None, we subcontract all flight operations" in the first question and we will skip the rest for you.',
            order: 7,
            conditional: { dependsOn: 'cs4_value_chain', operator: 'contains', value: 'Midstream' },
            fields: {
              create: [
                {
                  label: 'How many UAS aircraft does your organisation currently own or operate?',
                  name: 'mid21_fleet_size',
                  type: 'MULTIPLE_CHOICE',
                  order: 1,
                  validation: { required: true },
                  options: [
                    'None, we subcontract all flight operations',
                    '1 to 2',
                    '3 to 5',
                    '6 to 10',
                    '11 to 20',
                    '21 to 50',
                    '51 to 100',
                    '101+',
                  ],
                },
                {
                  label: 'Which types of UAS platforms are in your fleet? Select all that apply.',
                  name: 'mid22_platforms',
                  type: 'CHECKBOXES',
                  order: 2,
                  validation: { required: false },
                  options: [
                    'Rotary-wing or Multirotor (quadcopter, hexacopter, etc.)',
                    'Fixed-wing UAS',
                    'VTOL (Vertical Take-Off and Landing hybrid)',
                    'Medium UAVs (10 to 50 kg MTOW)',
                    'Heavy UAVs (over 50 kg MTOW)',
                    'Other',
                  ],
                  conditional: {
                    dependsOn: 'mid21_fleet_size',
                    operator: 'not_equals',
                    value: 'None, we subcontract all flight operations',
                  },
                },
                {
                  label: 'If you selected "Other", which platform?',
                  name: 'mid22_other',
                  type: 'SHORT_TEXT',
                  order: 3,
                  validation: { required: false },
                  conditional: {
                    dependsOn: 'mid21_fleet_size',
                    operator: 'not_equals',
                    value: 'None, we subcontract all flight operations',
                  },
                },
                ...[1, 2, 3, 4, 5].map((i) => ({
                  label: `Primary UAS brand or model in your fleet #${i}`,
                  name: `mid23_brand_${i}`,
                  type: 'SHORT_TEXT' as const,
                  placeholder: i === 1 ? 'e.g. DJI Matrice 300 RTK' : i === 2 ? 'e.g. senseFly eBee X' : undefined,
                  order: 3 + i,
                  validation: { required: false },
                  conditional: {
                    dependsOn: 'mid21_fleet_size',
                    operator: 'not_equals',
                    value: 'None, we subcontract all flight operations',
                  },
                })),
                {
                  label: 'Which sensors and payloads do you use? Select all that apply.',
                  name: 'mid24_sensors',
                  type: 'CHECKBOXES',
                  order: 9,
                  validation: { required: false },
                  options: [
                    'RGB camera (standard visual)',
                    'Multispectral sensor',
                    'Thermal / Infrared sensor',
                    'LiDAR',
                    'Hyperspectral sensor',
                    'Delivery payload mechanism',
                    'Spraying system (agricultural)',
                    'Other',
                  ],
                  conditional: {
                    dependsOn: 'mid21_fleet_size',
                    operator: 'not_equals',
                    value: 'None, we subcontract all flight operations',
                  },
                },
                {
                  label: 'If you selected "Other", which sensor or payload?',
                  name: 'mid24_other',
                  type: 'SHORT_TEXT',
                  order: 10,
                  validation: { required: false },
                  conditional: {
                    dependsOn: 'mid21_fleet_size',
                    operator: 'not_equals',
                    value: 'None, we subcontract all flight operations',
                  },
                },
                ...[1, 2, 3, 4, 5].map((i) => ({
                  label: `Primary software tool #${i}`,
                  name: `mid25_software_${i}`,
                  type: 'SHORT_TEXT' as const,
                  placeholder: i === 1 ? 'e.g. Pix4D' : i === 2 ? 'e.g. DroneDeploy' : i === 3 ? 'e.g. QGIS' : undefined,
                  order: 10 + i,
                  validation: { required: false },
                  conditional: {
                    dependsOn: 'mid21_fleet_size',
                    operator: 'not_equals',
                    value: 'None, we subcontract all flight operations',
                  },
                })),
                {
                  label: 'On average, how many UAS missions do you complete per month?',
                  name: 'mid26_missions_per_month',
                  type: 'MULTIPLE_CHOICE',
                  order: 16,
                  validation: { required: false },
                  options: ['Fewer than 5', '5 to 15', '16 to 30', '31 to 60', 'More than 60'],
                  conditional: {
                    dependsOn: 'mid21_fleet_size',
                    operator: 'not_equals',
                    value: 'None, we subcontract all flight operations',
                  },
                },
                {
                  label:
                    'Estimated annual fleet utilisation rate (percentage of operational days vs. total available days)',
                  name: 'mid27_utilisation',
                  type: 'MULTIPLE_CHOICE',
                  order: 17,
                  validation: { required: false },
                  options: ['Under 20%', '20 to 40%', '41 to 60%', '61 to 80%', 'Over 80%', 'Not tracked'],
                  conditional: {
                    dependsOn: 'mid21_fleet_size',
                    operator: 'not_equals',
                    value: 'None, we subcontract all flight operations',
                  },
                },
              ],
            },
          },
          {
            title: 'Supply chain and infrastructure',
            description:
              'We would like to know how well the local supply chain, connectivity, and physical infrastructure actually support the work you do. Please answer based on your real experience, where things work, and where they hold you back.',
            order: 8,
            conditional: { dependsOn: 'cs4_value_chain', operator: 'contains', value: 'Midstream' },
            fields: {
              create: [
                {
                  label: 'Please tell us how strongly you agree with each statement',
                  name: 'mid3_matrix',
                  type: 'MATRIX',
                  order: 1,
                  validation: { required: true },
                  matrixType: 'single',
                  matrixRows: [
                    'The supply chain for UAS components (airframes, sensors, batteries) is well established and reliable in Rwanda.',
                    'Locally sourced components are available to reduce import dependency.',
                    'Essential spare parts and maintenance tools are obtainable within Rwanda without significant delays.',
                    'Physical infrastructure (designated landing zones, charging stations, storage facilities) is adequate for our operations.',
                    'Telecommunications infrastructure reliably supports UAS command-and-control requirements nationwide.',
                    'UTM/USSP systems are functional and accessible for coordinating UAS flights.',
                    'Power supply infrastructure supports reliable UAS charging and ground operations across our operating areas.',
                  ],
                  matrixColumns: MATRIX_COLS,
                },
                {
                  label: 'What percentage of your UAS hardware components are imported?',
                  name: 'mid38_imported_pct',
                  type: 'NUMBER',
                  placeholder: 'e.g. 90',
                  order: 2,
                  validation: { required: false, min: 0, max: 100 },
                },
                {
                  label: 'What percentage are locally sourced?',
                  name: 'mid38_local_pct',
                  type: 'NUMBER',
                  placeholder: 'e.g. 10',
                  order: 3,
                  validation: { required: false, min: 0, max: 100 },
                },
                {
                  label: 'On average, how many weeks does it take to receive imported UAS components?',
                  name: 'mid39_lead_time',
                  type: 'NUMBER',
                  placeholder: 'e.g. 6',
                  order: 4,
                  validation: { required: false, min: 0 },
                },
                {
                  label: 'Where do you send UAS equipment for major repairs or overhaul?',
                  name: 'mid310_repair_location',
                  type: 'MULTIPLE_CHOICE',
                  order: 5,
                  validation: { required: false },
                  options: [
                    'Local service provider in Rwanda',
                    'Manufacturer abroad',
                    'Regional service centre in East Africa',
                    'We handle all maintenance in-house',
                    'Other',
                  ],
                },
                {
                  label: 'If you selected "Other", where?',
                  name: 'mid310_repair_other',
                  type: 'SHORT_TEXT',
                  order: 6,
                  validation: { required: false },
                  conditional: { dependsOn: 'mid310_repair_location', operator: 'equals', value: 'Other' },
                },
                {
                  label: 'What is the single biggest supply chain or infrastructure bottleneck you face?',
                  name: 'mid311_bottleneck',
                  type: 'LONG_TEXT',
                  order: 7,
                  validation: { required: false },
                },
              ],
            },
          },
          {
            title: 'Regulatory compliance',
            description:
              'Now we would like to hear about your real experience of getting licensed, approved, and staying compliant. We also ask for some costs and timings. Share whatever you are comfortable disclosing, and leave blank anything you are not.',
            order: 9,
            conditional: { dependsOn: 'cs4_value_chain', operator: 'contains', value: 'Midstream' },
            fields: {
              create: [
                {
                  label: 'Please tell us how strongly you agree with each statement',
                  name: 'mid4_matrix',
                  type: 'MATRIX',
                  order: 1,
                  validation: { required: true },
                  matrixType: 'single',
                  matrixRows: [
                    'The process to register a UAS and obtain operator licences from RCAA is clear and well-documented.',
                    'The time required to obtain regulatory approvals is reasonable for our operational needs.',
                    'The cost of licensing, registration, and compliance is proportionate and affordable.',
                    'Regulations are sufficiently flexible to accommodate new UAS applications and emerging technologies.',
                    'There is clear guidance on BVLOS (Beyond Visual Line of Sight) operations.',
                    'The regulatory framework supports cross-border UAS operations within East Africa.',
                    'Communication and feedback channels between operators and RCAA are effective.',
                  ],
                  matrixColumns: MATRIX_COLS,
                },
                {
                  label: 'How long (in weeks) did it take to obtain your most recent RCAA licence or approval?',
                  name: 'mid48_license_time',
                  type: 'NUMBER',
                  placeholder: 'e.g. 8',
                  order: 2,
                  validation: { required: false, min: 0 },
                },
                {
                  label:
                    'What is your total annual cost of regulatory compliance in RWF? Include registration, licensing, insurance, and training certification.',
                  name: 'mid49_compliance_cost',
                  type: 'NUMBER',
                  placeholder: 'e.g. 2000000',
                  order: 3,
                  validation: { required: false, min: 0 },
                },
                {
                  label: 'What is the single most important regulatory improvement that would benefit your operations?',
                  name: 'mid410_reg_improvement',
                  type: 'LONG_TEXT',
                  order: 4,
                  validation: { required: false },
                },
              ],
            },
          },
          {
            title: 'Talent and workforce',
            description:
              'We would like to hear your view of the people side of the sector, the pilots, analysts, engineers, and support roles you rely on. In particular, we want to know where you struggle to find the right people, because that tells us where the training system needs to do more.',
            order: 10,
            conditional: { dependsOn: 'cs4_value_chain', operator: 'contains', value: 'Midstream' },
            fields: {
              create: [
                {
                  label: 'Please tell us how strongly you agree with each statement',
                  name: 'mid5_matrix',
                  type: 'MATRIX',
                  order: 1,
                  validation: { required: true },
                  matrixType: 'single',
                  matrixRows: [
                    'There is a sufficient pool of qualified UAS pilots available for hire in Rwanda.',
                    'There is a sufficient pool of UAS data analysts (GIS, photogrammetry, remote sensing) available in Rwanda.',
                    'There is a sufficient pool of UAS hardware engineers and maintenance technicians in Rwanda.',
                    'Training and certification programmes produce graduates whose skills match what we need.',
                    'On-the-job training and mentorship opportunities are accessible within the ecosystem.',
                  ],
                  matrixColumns: MATRIX_COLS,
                },
                {
                  label: 'Which role is hardest for you to recruit for? (1st hardest)',
                  name: 'mid56_rank1',
                  type: 'DROPDOWN',
                  order: 2,
                  validation: { required: true },
                  options: HARDEST_ROLES,
                },
                {
                  label: 'Second hardest role to recruit for',
                  name: 'mid56_rank2',
                  type: 'DROPDOWN',
                  order: 3,
                  validation: { required: true },
                  options: HARDEST_ROLES,
                },
                {
                  label: 'Third hardest role to recruit for',
                  name: 'mid56_rank3',
                  type: 'DROPDOWN',
                  order: 4,
                  validation: { required: true },
                  options: HARDEST_ROLES,
                },
                {
                  label: 'What percentage of your UAS workforce is female?',
                  name: 'mid57_female_pct',
                  type: 'MULTIPLE_CHOICE',
                  order: 5,
                  validation: { required: true },
                  options: FEMALE_PCT,
                },
              ],
            },
          },
          {
            title: 'Business viability and access to finance',
            description:
              'This is often the toughest conversation in the sector, so we would really value your honesty here. Tell us how your business is really doing, and how well the banks, investors, grant funders, and insurers around you are actually serving UAS companies like yours.',
            order: 11,
            conditional: { dependsOn: 'cs4_value_chain', operator: 'contains', value: 'Midstream' },
            fields: {
              create: [
                {
                  label: 'Please tell us how strongly you agree with each statement',
                  name: 'mid6_matrix',
                  type: 'MATRIX',
                  order: 1,
                  validation: { required: true },
                  matrixType: 'single',
                  matrixRows: [
                    'Our UAS-related business is financially sustainable, with revenues consistently covering costs.',
                    'Demand for UAS services is sufficient to maintain consistent operations throughout the year.',
                    'Access to startup or growth capital for UAS ventures is adequate in Rwanda.',
                    'Financial institutions (banks, MFIs) understand the UAS sector and offer suitable products.',
                    'Grant funding and donor support for UAS projects is accessible to organisations like ours.',
                    'UAS insurance products are available and reasonably priced.',
                  ],
                  matrixColumns: MATRIX_COLS,
                },
                {
                  label: 'What is your primary revenue model?',
                  name: 'mid67_revenue_model',
                  type: 'MULTIPLE_CHOICE',
                  order: 2,
                  validation: { required: true },
                  options: [
                    'Per-mission / Per-flight fees',
                    'Subscription or retainer contracts',
                    'Product sales (hardware or software)',
                    'Training and certification fees',
                    'Data / Analytics as a service',
                    'Government contracts or tenders',
                    'Grant-funded projects',
                    'Other',
                  ],
                },
                {
                  label: 'If you selected "Other", please describe your revenue model',
                  name: 'mid67_other',
                  type: 'SHORT_TEXT',
                  order: 3,
                  validation: { required: false },
                  conditional: { dependsOn: 'mid67_revenue_model', operator: 'equals', value: 'Other' },
                },
                {
                  label: 'Which types of financing have you accessed for your UAS activities? Select all that apply.',
                  name: 'mid68_financing',
                  type: 'CHECKBOXES',
                  order: 4,
                  validation: { required: true },
                  options: [
                    'Personal savings / Bootstrapping',
                    'Bank loan',
                    'Microfinance',
                    'Angel investment',
                    'Venture capital',
                    'Government grant (NCST, RDB, Innovation Fund, etc.)',
                    'International donor / Development partner grant',
                    'Competition or challenge prize',
                    'None, we have been unable to access financing',
                  ],
                },
                {
                  label:
                    'How much additional investment (in USD) would you need over the next 2 years to reach your growth targets?',
                  name: 'mid69_investment_needed',
                  type: 'MULTIPLE_CHOICE',
                  order: 5,
                  validation: { required: true },
                  options: ['Under $10,000', '$10,000 to $50,000', '$50,000 to $200,000', '$200,000 to $1,000,000', 'Over $1,000,000'],
                },
                {
                  label: 'What is the single biggest financial barrier to your growth?',
                  name: 'mid610_financial_barrier',
                  type: 'LONG_TEXT',
                  order: 6,
                  validation: { required: false },
                },
              ],
            },
          },

          // ============================================================
          // DOWNSTREAM, End-User / Advocacy
          // ============================================================
          {
            title: 'About your organisation',
            description:
              'We would like to learn a little about your organisation and, if you have used UAS services before, what that experience has been like. Please answer from your own point of view as a user of the technology, not from the view of the sector as a whole.',
            order: 12,
            conditional: {
              dependsOn: 'cs4_value_chain',
              operator: 'in',
              value: DOWNSTREAM_END_USER_OR_ADVOCACY,
            },
            fields: {
              create: [
                {
                  label: 'What is your organisation\'s primary sector?',
                  name: 'dsa1_sector',
                  type: 'MULTIPLE_CHOICE',
                  order: 1,
                  validation: { required: true },
                  options: [
                    'Agriculture and precision farming',
                    'Healthcare / Medical delivery',
                    'Infrastructure (roads, bridges, energy inspection)',
                    'Environmental monitoring and conservation',
                    'Mining and quarry monitoring',
                    'Security and surveillance',
                    'Delivery and logistics',
                    'Media, film, and photography',
                    'Emergency response and disaster management',
                    'Surveying, mapping, and GIS',
                    'Urban planning and smart cities',
                    'Scientific research',
                    'Advocacy / Industry Association',
                    'Other',
                  ],
                },
                {
                  label: 'If you selected "Other", which sector?',
                  name: 'dsa1_other',
                  type: 'SHORT_TEXT',
                  order: 2,
                  validation: { required: false },
                  conditional: { dependsOn: 'dsa1_sector', operator: 'equals', value: 'Other' },
                },
                {
                  label: 'Number of full-time employees',
                  name: 'dsa2_employees',
                  type: 'MULTIPLE_CHOICE',
                  order: 3,
                  validation: { required: true },
                  options: ['1 to 10', '11 to 50', '51 to 200', '201 to 1,000', 'Over 1,000'],
                },
                {
                  label: 'Have you used UAS services in the past 24 months?',
                  name: 'dsa3_used_uas',
                  type: 'MULTIPLE_CHOICE',
                  order: 4,
                  validation: { required: true },
                  options: [
                    'Yes, regularly, with more than 3 engagements',
                    'Yes, occasionally, with 1 to 3 engagements',
                    'No, but we have evaluated UAS services',
                    'No, we have not yet explored UAS services',
                  ],
                },
                {
                  label: 'Which types of UAS services have you used? Select all that apply.',
                  name: 'dsa4_services_used',
                  type: 'CHECKBOXES',
                  order: 5,
                  validation: { required: false },
                  options: [
                    'Aerial mapping and surveying',
                    'Crop monitoring and precision agriculture',
                    'Delivery and logistics',
                    'Infrastructure inspection',
                    'Environmental monitoring',
                    'Security and surveillance',
                    'Emergency response',
                    'Data analytics from UAS imagery',
                    'Other',
                  ],
                  conditional: {
                    dependsOn: 'dsa3_used_uas',
                    operator: 'not_equals',
                    value: 'No, we have not yet explored UAS services',
                  },
                },
                {
                  label: 'If you selected "Other", which service?',
                  name: 'dsa4_other',
                  type: 'SHORT_TEXT',
                  order: 6,
                  validation: { required: false },
                  conditional: {
                    dependsOn: 'dsa3_used_uas',
                    operator: 'not_equals',
                    value: 'No, we have not yet explored UAS services',
                  },
                },
                {
                  label: 'Who provides the UAS services you use?',
                  name: 'dsa5_provider',
                  type: 'MULTIPLE_CHOICE',
                  order: 7,
                  validation: { required: false },
                  options: [
                    'In-house (we own and operate our own drones)',
                    'Contracted local UAS service provider',
                    'International UAS company operating in Rwanda',
                    'Government agency providing UAS services',
                    'A mix of in-house and contracted',
                  ],
                  conditional: {
                    dependsOn: 'dsa3_used_uas',
                    operator: 'not_equals',
                    value: 'No, we have not yet explored UAS services',
                  },
                },
                {
                  label: 'Approximately how much do you pay per UAS mission or service engagement (RWF)?',
                  name: 'dsa6_avg_price',
                  type: 'NUMBER',
                  placeholder: 'e.g. 500000',
                  order: 8,
                  validation: { required: false, min: 0 },
                  conditional: {
                    dependsOn: 'dsa3_used_uas',
                    operator: 'not_equals',
                    value: 'No, we have not yet explored UAS services',
                  },
                },
                {
                  label: 'Overall, how satisfied are you with the UAS services you have received?',
                  name: 'dsa7_satisfaction',
                  type: 'MULTIPLE_CHOICE',
                  order: 9,
                  validation: { required: false },
                  options: ['Very satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very dissatisfied'],
                  conditional: {
                    dependsOn: 'dsa3_used_uas',
                    operator: 'not_equals',
                    value: 'No, we have not yet explored UAS services',
                  },
                },
              ],
            },
          },
          {
            title: 'How you see UAS adoption',
            description:
              'We want to know what you honestly think about UAS services right now: whether they fit your work, whether you trust the data they produce, and what it would take for you to use them more in the future.',
            order: 13,
            conditional: {
              dependsOn: 'cs4_value_chain',
              operator: 'in',
              value: DOWNSTREAM_END_USER_OR_ADVOCACY,
            },
            fields: {
              create: [
                {
                  label: 'Please tell us how strongly you agree with each statement',
                  name: 'dsb_matrix',
                  type: 'MATRIX',
                  order: 1,
                  validation: { required: true },
                  matrixType: 'single',
                  matrixRows: [
                    'Our organisation is aware of the range of UAS applications that could be useful in our sector.',
                    'We trust the quality and accuracy of data produced by UAS operations.',
                    'UAS services are competitively priced compared to traditional alternatives such as manned surveys or ground methods.',
                    'The regulatory environment makes it straightforward for us to engage UAS service providers.',
                    'UAS data can be integrated into our existing workflows and systems without major difficulty.',
                    'Our organisation would increase its use of UAS services if the cost were lower.',
                    'Government agencies we work with actively support or procure UAS services.',
                  ],
                  matrixColumns: MATRIX_COLS,
                },
                {
                  label: 'What is the main reason your organisation does not use (or uses less) UAS services?',
                  name: 'dsb8_non_adoption_reason',
                  type: 'MULTIPLE_CHOICE',
                  order: 2,
                  validation: { required: true },
                  options: [
                    'Cost is perceived as too high',
                    'Lack of awareness of UAS capabilities',
                    'Regulatory uncertainty or restrictions',
                    'Lack of trust in data quality',
                    'Preference for traditional methods',
                    'Difficulty integrating UAS data into existing workflows',
                    'No suitable local provider available',
                    'Not applicable, we use UAS services regularly',
                    'Other',
                  ],
                },
                {
                  label: 'If you selected "Other", please tell us more',
                  name: 'dsb8_other',
                  type: 'SHORT_TEXT',
                  order: 3,
                  validation: { required: false },
                  conditional: { dependsOn: 'dsb8_non_adoption_reason', operator: 'equals', value: 'Other' },
                },
                {
                  label: 'What UAS capability or service, if it were available or affordable, would most benefit your organisation?',
                  name: 'dsb9_desired_capability',
                  type: 'LONG_TEXT',
                  order: 4,
                  validation: { required: false },
                },
                {
                  label: 'What one improvement would make you most likely to increase your use of UAS services?',
                  name: 'dsb10_improvement',
                  type: 'LONG_TEXT',
                  order: 5,
                  validation: { required: false },
                },
              ],
            },
          },

          // ============================================================
          // DOWNSTREAM, Investor / Funder
          // ============================================================
          {
            title: 'About your investment activity',
            description:
              'We would like to understand how your organisation actually engages with the UAS sector as a funder. That might be equity, debt, grants, challenge prizes, or a government fund. Please answer based on the activity you have had in Rwanda specifically over the last three years.',
            order: 14,
            conditional: {
              dependsOn: 'cs4_value_chain',
              operator: 'equals',
              value: DOWNSTREAM_INVESTOR,
            },
            fields: {
              create: [
                {
                  label: 'How do you primarily engage with the UAS sector?',
                  name: 'dsc1_engagement',
                  type: 'MULTIPLE_CHOICE',
                  order: 1,
                  validation: { required: true },
                  options: [
                    'Equity investor (angel, venture capital, private equity)',
                    'Debt or loan provider (bank, development finance institution, MFI)',
                    'Grant funder (foundation, donor, development partner)',
                    'Challenge / Prize funder',
                    'Government fund or innovation programme',
                    'Other',
                  ],
                },
                {
                  label: 'If you selected "Other", please tell us more',
                  name: 'dsc1_other',
                  type: 'SHORT_TEXT',
                  order: 2,
                  validation: { required: false },
                  conditional: { dependsOn: 'dsc1_engagement', operator: 'equals', value: 'Other' },
                },
                {
                  label:
                    'Have you made any investment or grant to a UAS-related entity in Rwanda in the past 3 years?',
                  name: 'dsc2_past_investment',
                  type: 'MULTIPLE_CHOICE',
                  order: 3,
                  validation: { required: true },
                  options: [
                    'Yes, we currently have an active portfolio or grant recipient',
                    'Yes, but the relationship has since ended',
                    'No, but we are evaluating opportunities now',
                    'No, UAS is not currently a focus area for us',
                  ],
                },
                {
                  label: 'Total capital deployed into Rwanda UAS-related entities in the past 3 years (USD)',
                  name: 'dsc3_capital_deployed',
                  type: 'MULTIPLE_CHOICE',
                  order: 4,
                  validation: { required: false },
                  options: [
                    'Under $50,000',
                    '$50,000 to $200,000',
                    '$200,000 to $1,000,000',
                    '$1M to $5M',
                    'Over $5M',
                    'Prefer not to disclose',
                  ],
                  conditional: {
                    dependsOn: 'dsc2_past_investment',
                    operator: 'not_equals',
                    value: 'No, UAS is not currently a focus area for us',
                  },
                },
                {
                  label: 'Which UAS sub-sectors do your investments or grants target? Select all that apply.',
                  name: 'dsc4_subsectors',
                  type: 'CHECKBOXES',
                  order: 5,
                  validation: { required: false },
                  options: [
                    'UAS operations and services',
                    'Hardware manufacturing / component supply',
                    'Software and analytics platforms',
                    'Training and education',
                    'Infrastructure (UTM, UAS ports, connectivity)',
                    'Agricultural UAS applications',
                    'Health / Humanitarian delivery',
                    'Data and AI',
                    'Other',
                  ],
                  conditional: {
                    dependsOn: 'dsc2_past_investment',
                    operator: 'not_equals',
                    value: 'No, UAS is not currently a focus area for us',
                  },
                },
                {
                  label: 'If you selected "Other", which sub-sector?',
                  name: 'dsc4_other',
                  type: 'SHORT_TEXT',
                  order: 6,
                  validation: { required: false },
                  conditional: {
                    dependsOn: 'dsc2_past_investment',
                    operator: 'not_equals',
                    value: 'No, UAS is not currently a focus area for us',
                  },
                },
                {
                  label: 'What is the primary challenge you face when investing in or funding UAS entities in Rwanda?',
                  name: 'dsc5_challenge',
                  type: 'LONG_TEXT',
                  order: 7,
                  validation: { required: false },
                  conditional: {
                    dependsOn: 'dsc2_past_investment',
                    operator: 'not_equals',
                    value: 'No, UAS is not currently a focus area for us',
                  },
                },
              ],
            },
          },
          {
            title: 'How you see the UAS finance landscape',
            description:
              'We would like to hear your assessment of how ready Rwanda really is for UAS investment: deal pipeline, policy stability, the behaviour of financial institutions, donor coordination, and government procurement. Please be candid with us.',
            order: 15,
            conditional: {
              dependsOn: 'cs4_value_chain',
              operator: 'equals',
              value: DOWNSTREAM_INVESTOR,
            },
            fields: {
              create: [
                {
                  label: 'Please tell us how strongly you agree with each statement',
                  name: 'dsd_matrix',
                  type: 'MATRIX',
                  order: 1,
                  validation: { required: true },
                  matrixType: 'single',
                  matrixRows: [
                    'There are sufficient investment-ready UAS ventures in Rwanda to deploy capital into.',
                    'The regulatory environment creates a stable and predictable context for UAS investment.',
                    'Financial institutions understand the UAS sector and offer appropriate financing products.',
                    'Grant funding and donor support for UAS projects is well-coordinated and impactful.',
                    'The Rwanda government provides a supportive environment for UAS investment through policies, incentives, and procurement.',
                  ],
                  matrixColumns: MATRIX_COLS,
                },
                {
                  label: 'What type of UAS initiative would you be most likely to fund or invest in over the next 2 years?',
                  name: 'dsd6_initiative',
                  type: 'LONG_TEXT',
                  order: 2,
                  validation: { required: false },
                },
                {
                  label:
                    'What one change in the Rwanda UAS ecosystem would most improve its attractiveness for investment?',
                  name: 'dsd7_change',
                  type: 'LONG_TEXT',
                  order: 3,
                  validation: { required: false },
                },
              ],
            },
          },

          // ============================================================
          // COMMON CLOSE, everyone
          // ============================================================
          {
            title: 'Your connections in the ecosystem',
            description:
              'We would like to learn about who you work with, and who you wish you could work with. This section helps us draw the real map of relationships inside the Rwanda UAS sector, and it shows us where new bridges need to be built.',
            order: 16,
            fields: {
              create: [
                ...[1, 2, 3, 4, 5].flatMap((i) => [
                  {
                    label: `Strongest working relationship #${i} (organisation name)`,
                    name: `cc1_org_${i}`,
                    type: 'SHORT_TEXT' as const,
                    placeholder: i === 1 ? 'Name of a partner, subcontractor, or client' : undefined,
                    order: (i - 1) * 2 + 1,
                    validation: { required: false },
                  },
                  {
                    label: `Strongest working relationship #${i} (type of relationship)`,
                    name: `cc1_rel_${i}`,
                    type: 'DROPDOWN' as const,
                    order: (i - 1) * 2 + 2,
                    validation: { required: false },
                    options: RELATIONSHIP_TYPES,
                  },
                ]),
                ...[1, 2, 3].flatMap((i) => [
                  {
                    label: `Organisation you would like to collaborate with but don't yet #${i} (name)`,
                    name: `cc2_org_${i}`,
                    type: 'SHORT_TEXT' as const,
                    order: 10 + (i - 1) * 2 + 1,
                    validation: { required: false },
                  },
                  {
                    label: `Why not yet? #${i}`,
                    name: `cc2_reason_${i}`,
                    type: 'SHORT_TEXT' as const,
                    order: 10 + (i - 1) * 2 + 2,
                    validation: { required: false },
                  },
                ]),
                {
                  label:
                    'How often do you interact with other UAS ecosystem players outside of direct client or supplier relationships?',
                  name: 'cc3_interaction_frequency',
                  type: 'MULTIPLE_CHOICE',
                  order: 17,
                  validation: { required: true },
                  options: [
                    'Weekly or more',
                    'Monthly',
                    'Quarterly',
                    'Annually (at events or workshops only)',
                    'Rarely or never',
                  ],
                },
                {
                  label: 'Are you a member of any UAS or aviation industry association or network?',
                  name: 'cc4_association_member',
                  type: 'MULTIPLE_CHOICE',
                  order: 18,
                  validation: { required: true },
                  options: ['Yes', 'No, but I am interested in joining one', 'No, and I am not interested'],
                },
                {
                  label: 'If yes, which association or network?',
                  name: 'cc4_association_name',
                  type: 'SHORT_TEXT',
                  order: 19,
                  validation: { required: false },
                  conditional: { dependsOn: 'cc4_association_member', operator: 'equals', value: 'Yes' },
                },
                {
                  label: 'What type of ecosystem platform would be most valuable to you?',
                  name: 'cc5_platform_preference',
                  type: 'MULTIPLE_CHOICE',
                  order: 20,
                  validation: { required: true },
                  options: [
                    'Online directory of UAS service providers',
                    'Quarterly ecosystem meetups and networking events',
                    'Shared procurement platform (matching buyers and sellers of UAS services)',
                    'Joint training and capacity building programmes',
                    'Shared testing and calibration facilities',
                    'Other',
                  ],
                },
                {
                  label: 'If you selected "Other", which platform?',
                  name: 'cc5_platform_other',
                  type: 'SHORT_TEXT',
                  order: 21,
                  validation: { required: false },
                  conditional: { dependsOn: 'cc5_platform_preference', operator: 'equals', value: 'Other' },
                },
              ],
            },
          },
          {
            title: 'Strategic priorities and outlook',
            description:
              'Finally, we would like to hear your view of the bigger picture: the barriers holding the sector back, the applications with the most untapped potential, and where you honestly think Rwanda\'s UAS ecosystem will be in five years. These are the answers that shape the recommendations we will take forward.',
            order: 17,
            fields: {
              create: [
                {
                  label: 'What is the biggest barrier to UAS ecosystem growth in Rwanda?',
                  name: 'cc6_barrier_rank1',
                  type: 'DROPDOWN',
                  order: 1,
                  validation: { required: true },
                  options: BARRIERS,
                },
                {
                  label: 'Second biggest barrier',
                  name: 'cc6_barrier_rank2',
                  type: 'DROPDOWN',
                  order: 2,
                  validation: { required: true },
                  options: BARRIERS,
                },
                {
                  label: 'Third biggest barrier',
                  name: 'cc6_barrier_rank3',
                  type: 'DROPDOWN',
                  order: 3,
                  validation: { required: true },
                  options: BARRIERS,
                },
                {
                  label: 'Which UAS application area has the highest untapped potential in Rwanda?',
                  name: 'cc7_untapped_potential',
                  type: 'MULTIPLE_CHOICE',
                  order: 4,
                  validation: { required: true },
                  options: [
                    'Precision agriculture (crop monitoring, spraying, yield estimation)',
                    'Medical and pharmaceutical delivery',
                    'Infrastructure inspection and monitoring',
                    'Environmental conservation and forestry',
                    'Disaster risk management and emergency response',
                    'Mining and geological survey',
                    'Urban planning and cadastral mapping',
                    'Security and border monitoring',
                    'Cargo delivery and last-mile logistics',
                    'Other',
                  ],
                },
                {
                  label: 'If you selected "Other", which application area?',
                  name: 'cc7_untapped_other',
                  type: 'SHORT_TEXT',
                  order: 5,
                  validation: { required: false },
                  conditional: { dependsOn: 'cc7_untapped_potential', operator: 'equals', value: 'Other' },
                },
                {
                  label: 'What single action by the Government of Rwanda would most accelerate the UAS sector?',
                  name: 'cc8_government_action',
                  type: 'LONG_TEXT',
                  order: 6,
                  validation: { required: true },
                },
                {
                  label: 'Where do you see the Rwanda UAS ecosystem in 5 years? Please share your honest view.',
                  name: 'cc9_five_year_outlook',
                  type: 'LONG_TEXT',
                  order: 7,
                  validation: { required: false },
                },
              ],
            },
          },
        ],
      },
    },
    include: {
      sections: {
        include: {
          fields: { orderBy: { order: 'asc' } },
        },
        orderBy: { order: 'asc' },
      },
    },
  })

  const totalFields = form.sections.reduce((acc, s) => acc + s.fields.length, 0)
  console.log(`\n✅ Form created successfully!`)
  console.log(`   Title: ${form.title}`)
  console.log(`   Slug: ${form.slug}`)
  console.log(`   ID: ${form.id}`)
  console.log(`   Sections: ${form.sections.length}`)
  console.log(`   Total fields: ${totalFields}`)
  console.log(`\n   Public URL: /forms/public/${form.id}`)
  console.log(`   Edit URL: /forms/${form.id}/edit`)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
