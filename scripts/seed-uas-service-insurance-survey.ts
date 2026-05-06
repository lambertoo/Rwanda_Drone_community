import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const MATRIX_COLS = ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree']

const VALUE_CHAIN_OPTIONS = [
  'Upstream: Training and Research / R&D',
  'Upstream: Hardware and Software Supplier / Manufacturer',
  'Upstream: Regulations and Policy',
  'Midstream: UAS Operator (licensed commercial pilot operations)',
  'Midstream: UAS Support Services (maintenance, insurance, logistics)',
  'Midstream: UAS Data Integrator (GIS, AI, data processing)',
  'Midstream: Infrastructure Provider (connectivity, UTM/USSP, UAS ports)',
  'Downstream: End-User / Client (agriculture, health, infrastructure, security, etc.)',
  'Downstream: Advocacy Group / Industry Association',
  'Downstream: Investor / Funder',
  'Other (please specify)',
]

const PRIMARY_ACTIVITY_OPTIONS = [
  'UAS Operator (licensed commercial pilot operations)',
  'UAS Data Integrator (GIS, photogrammetry, AI, remote sensing)',
  'UAS Support Services (maintenance, insurance, logistics)',
  'Infrastructure Provider (UTM/USSP, UAS ports, connectivity)',
  'Hardware / Component Manufacturer',
  'Software / Firmware Developer',
  'Training and Certification Provider',
  'Other (please specify)',
]

const EMPLOYEE_COUNT_OPTIONS = [
  '1 to 5',
  '6 to 10',
  '11 to 50',
  '51 to 100',
  '101 to 500',
  '500+',
]

const GEO_SCOPE_OPTIONS = [
  'Kigali only',
  'Multiple provinces within Rwanda',
  'Rwanda-wide',
  'Regional work (clients or partners in neighbouring countries)',
  'International',
]

const REVENUE_OPTIONS = [
  'Under 5 million',
  '5 to 20 million',
  '20 to 100 million',
  '100 to 500 million',
  'Over 500 million',
  'Prefer not to disclose',
]

const SERVICES_OPTIONS = [
  'UAS operations (aerial surveying, mapping, inspection)',
  'Agricultural services (spraying, crop monitoring, yield estimation)',
  'Delivery and logistics',
  'Data analytics and processing (GIS, AI, photogrammetry)',
  'Maintenance, repair, and overhaul (MRO)',
  'Software development for UAS applications',
  'UTM / Airspace management services',
  'UAS insurance',
  'Consulting / Advisory',
  'Hardware manufacturing or component supply',
  'Pilot training and certification',
  'Other (please specify)',
]

const SECTORS_SERVED_OPTIONS = [
  'Agriculture and food security',
  'Medical and pharmaceutical delivery',
  'Infrastructure inspection (power lines, roads, bridges)',
  'Environmental conservation and forestry',
  'Mining and geological survey',
  'Security and border monitoring',
  'Urban planning and cadastral mapping',
  'Disaster risk management and emergency response',
  'Cargo delivery and last-mile logistics',
  'Government / public sector',
  'Other (please specify)',
]

const FLEET_SIZE_OPTIONS = [
  'None, we subcontract all flight operations',
  '1 to 2',
  '3 to 5',
  '6 to 10',
  '11 to 20',
  '21 to 50',
  '51 to 100',
  '101+',
]

const PLATFORM_TYPES_OPTIONS = [
  'Rotary-wing or Multirotor (quadcopter, hexacopter, etc.)',
  'Fixed-wing UAS',
  'VTOL (Vertical Take-Off and Landing hybrid)',
  'Medium UAVs (10 to 50 kg MTOW)',
  'Heavy UAVs (over 50 kg MTOW)',
  'Other (please specify)',
]

const SENSORS_OPTIONS = [
  'RGB / optical camera',
  'Multispectral sensor',
  'LiDAR',
  'Thermal / infrared camera',
  'Hyperspectral sensor',
  'SAR (Synthetic Aperture Radar)',
  'Cargo / delivery pod',
  'Spraying / agricultural payload',
  'Other (please specify)',
]

const HARDEST_ROLES_OPTIONS = [
  'UAS hardware engineers / Avionics specialists',
  'Software developers (flight control, AI/ML, analytics)',
  'Maintenance and repair technicians',
  'Licensed UAS pilots',
  'GIS / Remote sensing / Data analysts',
  'Regulatory / Compliance specialists',
  'Business development / Sales',
  'Project managers',
]

const FEMALE_PCT_OPTIONS = [
  '0% (no female staff)',
  '1 to 10%',
  '11 to 25%',
  '26 to 50%',
  'Over 50%',
  'Prefer not to disclose',
]

const REVENUE_MODEL_OPTIONS = [
  'Fee-for-service (per project or per flight)',
  'Subscription or retainer contracts',
  'Government grants or aid-funded projects',
  'Product sales (hardware / software)',
  'Data as a service (DaaS)',
  'Other (please specify)',
]

const FINANCING_TYPES_OPTIONS = [
  'Own savings / bootstrapped',
  'Bank loan or credit',
  'Government grant or subsidy',
  'Development finance (e.g. IFC, BRD, USAID)',
  'Venture capital',
  'Angel investment',
  'Crowdfunding',
  'None — we have not accessed external financing',
  'Other (please specify)',
]

const INVESTMENT_NEEDED_OPTIONS = [
  'Under $10,000',
  '$10,000 to $50,000',
  '$50,000 to $200,000',
  '$200,000 to $1 million',
  'Over $1 million',
  'No additional investment needed',
  'Prefer not to disclose',
]

const RELATIONSHIP_TYPES = [
  'Client / Customer',
  'Subcontractor',
  'Partner',
  'Supplier',
  'Regulator',
  'Investor',
  'Other',
]

const BARRIER_OPTIONS = [
  'High equipment costs',
  'Insufficient access to capital or finance',
  'Limited end-user awareness and demand',
  'Regulatory uncertainty',
  'Limited skilled workforce',
  'Weak supply chain',
  'Limited reinsurance support',
  'Lack of industry standards',
  'Other',
]

const UAS_APPLICATION_OPTIONS = [
  'Precision agriculture (crop monitoring, spraying, yield estimation)',
  'Medical and pharmaceutical delivery',
  'Infrastructure inspection and monitoring',
  'Environmental conservation and forestry',
  'Disaster risk management and emergency response',
  'Mining and geological survey',
  'Urban planning and cadastral mapping',
  'Security and border monitoring',
  'Cargo delivery and last-mile logistics',
  'Other (please specify)',
]

const INTERACTION_FREQUENCY_OPTIONS = [
  'Weekly or more',
  'Monthly',
  'Quarterly',
  'Annually (at events or workshops only)',
  'Rarely or never',
]

const ECOSYSTEM_PLATFORM_OPTIONS = [
  'Online directory of UAS service providers',
  'Quarterly ecosystem meetups and networking events',
  'Shared procurement platform (matching buyers and sellers of UAS services)',
  'Joint training and capacity building programmes',
  'Shared testing and calibration facilities',
  'Other (please specify)',
]

// ===== Insurance Part B options =====

const INSURANCE_ORG_TYPE_OPTIONS = [
  'Insurance provider',
  'Reinsurance provider',
  'Risk advisory firm',
  'Aviation insurance specialist',
  'Other (please specify)',
]

const INSURANCE_SERVICES_OPTIONS = [
  'Aviation liability insurance',
  'Drone hull/equipment insurance',
  'Cargo insurance',
  'Third-party liability insurance',
  'Fleet insurance',
  'Reinsurance support',
  'Claims management services',
  'Other (please specify)',
]

const INSURANCE_SECTORS_OPTIONS = [
  'Medical delivery operations',
  'Agricultural drone services',
  'Mapping and surveying',
  'Infrastructure inspection',
  'Mining and geological surveys',
  'Security and surveillance',
  'Environmental monitoring',
  'Logistics and cargo delivery',
  'Government/public sector operations',
  'None currently',
  'Other (please specify)',
]

const INSURANCE_POLICY_COUNT_OPTIONS = [
  'Under 10',
  '10–50',
  '51–100',
  '101–500',
  'Over 500',
]

const INSURANCE_PREMIUM_VOLUME_OPTIONS = [
  'Under RWF 5 million',
  'RWF 5–20 million',
  'RWF 20–100 million',
  'RWF 100–500 million',
  'Over RWF 500 million',
  'Prefer not to disclose',
]

const NO_UAS_INSURANCE_REASON_OPTIONS = [
  'Insufficient actuarial data / claims history to price risk accurately',
  'Lack of internal technical expertise in aviation or drone risk',
  'Regulatory uncertainty around liability and compliance requirements',
  'Limited demand from UAS operators in Rwanda',
  'Inability to obtain reinsurance support for UAS risks',
  'High perceived risk relative to potential premium income',
  'No clear mandatory insurance requirement from regulators',
  'Waiting for the market to mature before entering',
  'Other (please specify)',
]

const ENABLE_UAS_INSURANCE_OPTIONS = [
  'Access to UAS incident data and historical claims records',
  'Availability of reinsurance products covering drone risks',
  'Clearer mandatory insurance regulations from RCAA / RURA',
  'Standardised UAS risk assessment frameworks or underwriting guidelines',
  'Dedicated UAS insurance training for our staff',
  'A larger pool of licensed and certified drone operators in Rwanda',
  'Partnership with an international aviation insurer for co-insurance',
  'Industry association or government body facilitating market entry',
  'Actuarial support or risk-modelling tools specific to UAS',
  'Other (please specify)',
]

const LAUNCH_TIMELINE_OPTIONS = [
  'Less than 6 months',
  '6 to 12 months',
  '1 to 2 years',
  'More than 2 years',
  'We have no plans to enter this market',
]

const FIRST_PRODUCT_OPTIONS = [
  'Third-party liability insurance for commercial drone operators',
  'Hull / equipment insurance (covering drone damage or loss)',
  'Fleet insurance for operators with multiple aircraft',
  'Cargo insurance for delivery drones',
  'Comprehensive policy (liability + hull + cargo bundled)',
  'Unsure at this stage',
  'Other (please specify)',
]

const UAS_RISKS_OPTIONS = [
  'Equipment damage or loss',
  'Operator error',
  'Third-party injury or property damage',
  'Weather-related incidents',
  'Airspace violations',
  'Regulatory non-compliance',
  'Theft or vandalism',
  'Battery or power-system failures',
  'Other (please specify)',
]

const UNDERWRITING_CHALLENGES_OPTIONS = [
  'Limited operational data',
  'Lack of actuarial history',
  'Regulatory uncertainty',
  'Limited certified operators',
  'High equipment replacement costs',
  'Limited incident reporting data',
  'Difficulty assessing operational risk',
  'Lack of industry standards',
  'Reinsurance limitations',
  'Other (please specify)',
]

const INSURANCE_DEMAND_SECTORS_OPTIONS = [
  'Medical delivery',
  'Agriculture',
  'Infrastructure inspection',
  'Mining',
  'Security and surveillance',
  'Environmental conservation',
  'Logistics and cargo delivery',
  'Smart cities and urban planning',
  'Government operations',
  'Other (please specify)',
]

const INSURANCE_BARRIER_OPTIONS = [
  'Low market awareness',
  'Limited operational data',
  'Regulatory uncertainty',
  'Low demand',
  'High perceived risk',
  'Lack of specialised expertise',
  'Limited reinsurance support',
  'Cost sensitivity from operators',
  'Other (please specify)',
]

const INSURANCE_SKILLS_OPTIONS = [
  'Aviation risk analysts',
  'Actuarial specialists',
  'Drone operations assessors',
  'Claims investigators',
  'Compliance specialists',
  'Cyber-risk analysts',
  'Data analysts',
  'Legal/regulatory experts',
  'Other (please specify)',
]

const INSURANCE_STAKEHOLDERS_OPTIONS = [
  'Drone operators',
  'Government agencies',
  'Regulators (RCAA, RURA, etc.)',
  'Technology providers',
  'International reinsurers',
  'Legal firms',
  'Research institutions',
  'Financial institutions',
  'Other (please specify)',
]

const FORM_SLUG = 'uas-service-provider-insurance-survey'

const HIDE_FOR_INSURANCE_ONLY = [
  {
    action: 'HIDE',
    when: {
      type: 'all',
      clauses: [
        { field: 'respondent_type', operator: 'equals', value: 'Insurance Company' },
      ],
    },
  },
]

const HIDE_FOR_SERVICE_PROVIDER_ONLY = [
  {
    action: 'HIDE',
    when: {
      type: 'all',
      clauses: [
        { field: 'respondent_type', operator: 'equals', value: 'UAS Service Provider / Manufacturer' },
      ],
    },
  },
]

async function main() {
  const adminUser = await prisma.user.findUnique({
    where: { email: 'admin@uav.rw' },
  })
  if (!adminUser) {
    throw new Error('Admin user admin@uav.rw not found. Run setup-admin-user first.')
  }

  const existing = await prisma.universalForm.findUnique({
    where: { slug: FORM_SLUG },
  })
  if (existing) {
    await prisma.universalForm.delete({ where: { id: existing.id } })
    console.log('Deleted existing form.')
  }

  const form = await prisma.universalForm.create({
    data: {
      userId: adminUser.id,
      title: 'Rwanda UAS Service Provider & Insurance Survey',
      slug: FORM_SLUG,
      description:
        'Survey conducted by RISA in partnership with GIZ to map the Rwanda UAS ecosystem. Part A covers UAS Service Providers and Manufacturers. Part B covers Insurance Companies. Your answers will go directly into the Rwanda UAV Ecosystem Mapping Report, and from there into policy and investment recommendations. Everything you tell us is confidential and will only be used for ecosystem analysis.',
      isActive: true,
      isPublic: true,
      settings: {
        submitButtonText: 'Submit response',
        confirmationMessage:
          'Thank you for completing this survey. Your input is invaluable for shaping Rwanda\'s UAV ecosystem.',
        allowMultipleSubmissions: false,
        showProgressBar: true,
        primaryColor: '#1e3a5f',
        notifyEmails: 'uassurvey@risa.gov.rw',
      },
      sections: {
        create: [
          // ============================================================
          // ROUTING: Respondent Type Selector
          // ============================================================
          {
            title: 'Welcome — Tell Us Who You Are',
            description:
              'This survey has two parts. Part A is for UAS Service Providers and Manufacturers. Part B is for Insurance Companies. Please select which applies to you so we show you the right questions.',
            order: 1,
            fields: {
              create: [
                {
                  label: 'Which best describes your organisation?',
                  name: 'respondent_type',
                  type: 'MULTIPLE_CHOICE',
                  order: 1,
                  options: [
                    'UAS Service Provider / Manufacturer',
                    'Insurance Company',
                    'Both (Service Provider and Insurance)',
                  ],
                  validation: { required: true },
                },
              ],
            },
          },

          // ============================================================
          // PART A — SECTION 1: About Your Organisation
          // ============================================================
          {
            title: 'Part A — Section 1: About Your Organisation',
            description:
              'Before we get into the detail, we would like to learn a little about your organisation and who we are speaking to. Your answer to question 7 determines your question pathway, so please choose the option that best fits your primary role.',
            order: 2,
            actions: [
              {
                action: 'HIDE',
                when: {
                  type: 'all',
                  clauses: [
                    {
                      field: 'respondent_type',
                      operator: 'equals',
                      value: 'Insurance Company',
                    },
                  ],
                },
              },
            ],
            fields: {
              create: [
                {
                  label: 'Organisation name',
                  name: 'a1_organisation_name',
                  type: 'SHORT_TEXT',
                  order: 1,
                  validation: { required: true },
                },
                {
                  label: 'Full name of the main contact person',
                  name: 'a1_contact_name',
                  type: 'SHORT_TEXT',
                  order: 2,
                  validation: { required: true },
                },
                {
                  label: 'Their job title or role',
                  name: 'a1_job_title',
                  type: 'SHORT_TEXT',
                  order: 3,
                  validation: { required: true },
                },
                {
                  label: 'Their email address',
                  name: 'a1_email',
                  type: 'EMAIL',
                  order: 4,
                  validation: { required: true },
                },
                {
                  label: 'Their phone number',
                  name: 'a1_phone',
                  type: 'PHONE',
                  order: 5,
                  validation: { required: true },
                },
                {
                  label: 'Year your organisation was established',
                  name: 'a1_year_established',
                  type: 'NUMBER',
                  order: 6,
                  placeholder: 'e.g. 2018',
                  validation: { required: true, min: 1800, max: 2026, integer: true },
                },
                {
                  label:
                    'Which segment of the UAS value chain does your organisation primarily operate in?',
                  name: 'a1_value_chain',
                  type: 'MULTIPLE_CHOICE',
                  order: 7,
                  options: VALUE_CHAIN_OPTIONS,
                  validation: { required: true },
                },
                {
                  label: 'If you selected "Other", please tell us more',
                  name: 'a1_value_chain_other',
                  type: 'SHORT_TEXT',
                  order: 8,
                  validation: { required: false },
                  actions: [
                    {
                      action: 'HIDE',
                      when: {
                        type: 'all',
                        clauses: [
                          {
                            field: 'a1_value_chain',
                            operator: 'not_equals',
                            value: 'Other (please specify)',
                          },
                        ],
                      },
                    },
                  ],
                },
              ],
            },
          },

          // ============================================================
          // PART A — SECTION 2: Supply Chain and Infrastructure
          // ============================================================
          {
            title: 'Part A — Section 2: Supply Chain and Infrastructure',
            description:
              'You told us earlier that you are a hardware or software supplier, so we would like to ask extra questions about the supply chain and physical infrastructure you rely on.',
            order: 3,
            actions: [
              ...HIDE_FOR_INSURANCE_ONLY,
              {
                action: 'HIDE',
                when: {
                  type: 'all',
                  clauses: [
                    {
                      field: 'a1_value_chain',
                      operator: 'not_equals',
                      value: 'Upstream: Hardware and Software Supplier / Manufacturer',
                    },
                  ],
                },
              },
            ],
            fields: {
              create: [
                {
                  label: 'Please tell us how strongly you agree with each statement',
                  name: 'a2_supply_chain_matrix',
                  type: 'MATRIX',
                  order: 1,
                  validation: { required: true },
                  matrixRows: [
                    'The supply chain for UAS components (airframes, sensors, batteries) is well established and reliable in Rwanda.',
                    'Locally sourced materials and components are available to reduce import dependency.',
                    'Essential spare parts and maintenance tools are obtainable within Rwanda without significant delays.',
                    'Physical infrastructure (landing zones, charging stations, storage facilities) is adequate for UAS operations.',
                    'Telecommunications infrastructure reliably supports UAS command-and-control requirements nationwide.',
                    'UTM/USSP systems are functional and accessible for coordinating UAS flights.',
                    'Power supply infrastructure supports reliable UAS charging and ground operations across our operating areas.',
                  ],
                  matrixColumns: MATRIX_COLS,
                  matrixType: 'single',
                },
                {
                  label: 'What percentage of the UAS hardware components you supply are imported?',
                  name: 'a2_imported_pct',
                  type: 'NUMBER',
                  order: 2,
                  placeholder: 'e.g. 90',
                  validation: { required: false, min: 0, max: 100 },
                },
                {
                  label: 'What percentage are locally sourced?',
                  name: 'a2_local_pct',
                  type: 'NUMBER',
                  order: 3,
                  placeholder: 'e.g. 10',
                  validation: { required: false, min: 0, max: 100 },
                },
                {
                  label:
                    'In your view, what is the single biggest supply chain or infrastructure bottleneck facing the Rwanda UAS ecosystem?',
                  name: 'a2_biggest_bottleneck',
                  type: 'LONG_TEXT',
                  order: 4,
                  validation: { required: false },
                },
              ],
            },
          },

          // ============================================================
          // PART A — SECTION 3: About Your Operations
          // ============================================================
          {
            title: 'Part A — Section 3: About Your Operations',
            description:
              'We would like to understand how you actually operate in the sector — what you do, who you serve, and at what scale. Please answer based on what your organisation does today.',
            order: 4,
            actions: HIDE_FOR_INSURANCE_ONLY,
            fields: {
              create: [
                {
                  label: 'Which best describes your primary activity?',
                  name: 'a3_primary_activity',
                  type: 'MULTIPLE_CHOICE',
                  order: 1,
                  options: PRIMARY_ACTIVITY_OPTIONS,
                  validation: { required: true },
                },
                {
                  label: 'Do you also operate in a secondary segment? If yes, which one?',
                  name: 'a3_secondary_segment',
                  type: 'SHORT_TEXT',
                  order: 2,
                  validation: { required: false },
                },
                {
                  label: 'Number of full-time employees',
                  name: 'a3_employee_count',
                  type: 'MULTIPLE_CHOICE',
                  order: 3,
                  options: EMPLOYEE_COUNT_OPTIONS,
                  validation: { required: true },
                },
                {
                  label: 'Geographic scope of operations',
                  name: 'a3_geo_scope',
                  type: 'MULTIPLE_CHOICE',
                  order: 4,
                  options: GEO_SCOPE_OPTIONS,
                  validation: { required: true },
                },
                {
                  label: 'Annual revenue from UAS-related activities (RWF, approximate)',
                  name: 'a3_annual_revenue',
                  type: 'MULTIPLE_CHOICE',
                  order: 5,
                  options: REVENUE_OPTIONS,
                  validation: { required: true },
                },
                {
                  label: 'Which services / products do you provide? Select all that apply.',
                  name: 'a3_services',
                  type: 'CHECKBOXES',
                  order: 6,
                  options: SERVICES_OPTIONS,
                  validation: { required: true },
                },
                {
                  label: 'Which sectors do you serve? Select all that apply.',
                  name: 'a3_sectors',
                  type: 'CHECKBOXES',
                  order: 7,
                  options: SECTORS_SERVED_OPTIONS,
                  validation: { required: true },
                },
                {
                  label:
                    'What is the most significant technology or service innovation you have introduced in the last 24 months?',
                  name: 'a3_recent_innovation',
                  type: 'LONG_TEXT',
                  order: 8,
                  validation: { required: false },
                },
              ],
            },
          },

          // ============================================================
          // PART A — SECTION 4: Fleet and Technology
          // ============================================================
          {
            title: 'Part A — Section 4: Fleet and Technology',
            description:
              'Next, we would like to know about the aircraft, sensors, and software you use day-to-day. If you do not own or operate any aircraft yourself, select "None, we subcontract all flight operations" and we will skip the rest for you.',
            order: 5,
            actions: HIDE_FOR_INSURANCE_ONLY,
            fields: {
              create: [
                {
                  label:
                    'How many UAS aircraft does your organisation currently own or operate?',
                  name: 'a4_fleet_size',
                  type: 'MULTIPLE_CHOICE',
                  order: 1,
                  options: FLEET_SIZE_OPTIONS,
                  validation: { required: true },
                },
                {
                  label:
                    'Which types of UAS platforms are in your fleet? Select all that apply.',
                  name: 'a4_platform_types',
                  type: 'CHECKBOXES',
                  order: 2,
                  options: PLATFORM_TYPES_OPTIONS,
                  validation: { required: false },
                  actions: [
                    {
                      action: 'HIDE',
                      when: {
                        type: 'all',
                        clauses: [
                          {
                            field: 'a4_fleet_size',
                            operator: 'equals',
                            value: 'None, we subcontract all flight operations',
                          },
                        ],
                      },
                    },
                  ],
                },
                ...Array.from({ length: 5 }, (_, i) => ({
                  label: `Primary UAS brand or model #${i + 1}`,
                  name: `a4_brand_model_${i + 1}`,
                  type: 'SHORT_TEXT' as const,
                  order: 3 + i,
                  placeholder:
                    i === 0 ? 'e.g. DJI Matrice 300 RTK, senseFly eBee X' : '',
                  validation: { required: false },
                  actions: [
                    {
                      action: 'HIDE',
                      when: {
                        type: 'all',
                        clauses: [
                          {
                            field: 'a4_fleet_size',
                            operator: 'equals',
                            value: 'None, we subcontract all flight operations',
                          },
                        ],
                      },
                    },
                  ],
                })),
                {
                  label:
                    'Which sensors and payloads do you use? Select all that apply.',
                  name: 'a4_sensors',
                  type: 'CHECKBOXES',
                  order: 8,
                  options: SENSORS_OPTIONS,
                  validation: { required: false },
                  actions: [
                    {
                      action: 'HIDE',
                      when: {
                        type: 'all',
                        clauses: [
                          {
                            field: 'a4_fleet_size',
                            operator: 'equals',
                            value: 'None, we subcontract all flight operations',
                          },
                        ],
                      },
                    },
                  ],
                },
                ...Array.from({ length: 5 }, (_, i) => ({
                  label: `Primary software tool #${i + 1}`,
                  name: `a4_software_${i + 1}`,
                  type: 'SHORT_TEXT' as const,
                  order: 9 + i,
                  placeholder:
                    i === 0 ? 'e.g. Pix4D, DJI Terra, Mission Planner, ArcGIS, QGIS' : '',
                  validation: { required: false },
                  actions: [
                    {
                      action: 'HIDE',
                      when: {
                        type: 'all',
                        clauses: [
                          {
                            field: 'a4_fleet_size',
                            operator: 'equals',
                            value: 'None, we subcontract all flight operations',
                          },
                        ],
                      },
                    },
                  ],
                })),
                {
                  label:
                    'On average, how many UAS missions do you complete per month?',
                  name: 'a4_monthly_missions',
                  type: 'NUMBER',
                  order: 14,
                  placeholder: 'e.g. 20',
                  validation: { required: false },
                  actions: [
                    {
                      action: 'HIDE',
                      when: {
                        type: 'all',
                        clauses: [
                          {
                            field: 'a4_fleet_size',
                            operator: 'equals',
                            value: 'None, we subcontract all flight operations',
                          },
                        ],
                      },
                    },
                  ],
                },
                {
                  label: 'Estimated annual fleet utilisation rate',
                  name: 'a4_utilisation_rate',
                  type: 'SHORT_TEXT',
                  order: 15,
                  placeholder: 'e.g. 65%',
                  validation: { required: false },
                  actions: [
                    {
                      action: 'HIDE',
                      when: {
                        type: 'all',
                        clauses: [
                          {
                            field: 'a4_fleet_size',
                            operator: 'equals',
                            value: 'None, we subcontract all flight operations',
                          },
                        ],
                      },
                    },
                  ],
                },
              ],
            },
          },

          // ============================================================
          // PART A — SECTION 5: Regulatory Compliance
          // ============================================================
          {
            title: 'Part A — Section 5: Regulatory Compliance',
            description:
              'Now we would like to hear about your real experience of getting licensed, approved, and staying compliant.',
            order: 6,
            actions: HIDE_FOR_INSURANCE_ONLY,
            fields: {
              create: [
                {
                  label: 'Please tell us how strongly you agree with each statement',
                  name: 'a5_regulatory_matrix',
                  type: 'MATRIX',
                  order: 1,
                  validation: { required: true },
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
                  matrixType: 'single',
                },
                {
                  label:
                    'How long (in weeks) did it take to obtain your most recent RCAA licence or approval?',
                  name: 'a5_approval_weeks',
                  type: 'NUMBER',
                  order: 2,
                  placeholder: 'e.g. 8',
                  validation: { required: false },
                },
                {
                  label:
                    'What is your total annual cost of regulatory compliance in RWF?',
                  name: 'a5_compliance_cost',
                  type: 'NUMBER',
                  order: 3,
                  validation: { required: false },
                },
                {
                  label:
                    'What is the single most important regulatory improvement that would benefit your operations?',
                  name: 'a5_regulatory_improvement',
                  type: 'LONG_TEXT',
                  order: 4,
                  validation: { required: false },
                },
              ],
            },
          },

          // ============================================================
          // PART A — SECTION 6: Talent and Workforce
          // ============================================================
          {
            title: 'Part A — Section 6: Talent and Workforce',
            description:
              'We would like to hear your view of the people side of the sector — the pilots, analysts, engineers, and support roles you rely on.',
            order: 7,
            actions: HIDE_FOR_INSURANCE_ONLY,
            fields: {
              create: [
                {
                  label: 'Please tell us how strongly you agree with each statement',
                  name: 'a6_talent_matrix',
                  type: 'MATRIX',
                  order: 1,
                  validation: { required: true },
                  matrixRows: [
                    'There is a sufficient pool of qualified UAS pilots available for hire in Rwanda.',
                    'There is a sufficient pool of UAS data analysts (GIS, photogrammetry, remote sensing) available in Rwanda.',
                    'There is a sufficient pool of UAS hardware engineers and maintenance technicians in Rwanda.',
                    'Training and certification programmes produce graduates whose skills match what we need.',
                    'On-the-job training and mentorship opportunities are accessible within the ecosystem.',
                  ],
                  matrixColumns: MATRIX_COLS,
                  matrixType: 'single',
                },
                {
                  label: 'Which role is hardest for you to recruit for? (1st hardest)',
                  name: 'a6_hardest_role_1',
                  type: 'DROPDOWN',
                  order: 2,
                  options: HARDEST_ROLES_OPTIONS,
                  validation: { required: true },
                },
                {
                  label: 'Second hardest role to recruit for',
                  name: 'a6_hardest_role_2',
                  type: 'DROPDOWN',
                  order: 3,
                  options: HARDEST_ROLES_OPTIONS,
                  validation: { required: true },
                },
                {
                  label: 'Third hardest role to recruit for',
                  name: 'a6_hardest_role_3',
                  type: 'DROPDOWN',
                  order: 4,
                  options: HARDEST_ROLES_OPTIONS,
                  validation: { required: true },
                },
                {
                  label: 'What percentage of your UAS workforce is female?',
                  name: 'a6_female_pct',
                  type: 'MULTIPLE_CHOICE',
                  order: 5,
                  options: FEMALE_PCT_OPTIONS,
                  validation: { required: false },
                },
              ],
            },
          },

          // ============================================================
          // PART A — SECTION 7: Business Viability and Access to Finance
          // ============================================================
          {
            title: 'Part A — Section 7: Business Viability and Access to Finance',
            description:
              'This section helps us understand how financially sustainable UAS service providers are in Rwanda, and what kind of support would help them grow.',
            order: 8,
            actions: HIDE_FOR_INSURANCE_ONLY,
            fields: {
              create: [
                {
                  label: 'Please tell us how strongly you agree with each statement',
                  name: 'a7_finance_matrix',
                  type: 'MATRIX',
                  order: 1,
                  validation: { required: true },
                  matrixRows: [
                    'Our UAS business generates sufficient revenue to cover operational costs.',
                    'Access to working capital / short-term financing for equipment is available and affordable.',
                    'Long-term investment capital for expanding our UAS operations is accessible in Rwanda.',
                    'The cost of UAS equipment and maintenance is a significant barrier to growth.',
                    'Insurance products suited to our UAS operations are available and affordable.',
                    'Government procurement processes for UAS services are transparent and accessible to local companies.',
                  ],
                  matrixColumns: MATRIX_COLS,
                  matrixType: 'single',
                },
                {
                  label: 'What is your primary revenue model?',
                  name: 'a7_revenue_model',
                  type: 'MULTIPLE_CHOICE',
                  order: 2,
                  options: REVENUE_MODEL_OPTIONS,
                  validation: { required: true },
                },
                {
                  label:
                    'Which types of financing have you accessed for your UAS activities? Select all that apply.',
                  name: 'a7_financing_types',
                  type: 'CHECKBOXES',
                  order: 3,
                  options: FINANCING_TYPES_OPTIONS,
                  validation: { required: false },
                },
                {
                  label:
                    'How much additional investment (USD) would you need over the next 2 years to reach your growth targets?',
                  name: 'a7_investment_needed',
                  type: 'MULTIPLE_CHOICE',
                  order: 4,
                  options: INVESTMENT_NEEDED_OPTIONS,
                  validation: { required: true },
                },
                {
                  label:
                    'What is the single biggest financial barrier to your growth?',
                  name: 'a7_biggest_financial_barrier',
                  type: 'LONG_TEXT',
                  order: 5,
                  validation: { required: false },
                },
              ],
            },
          },

          // ============================================================
          // PART A — SECTION 8: Your Connections in the Ecosystem
          // ============================================================
          {
            title: 'Part A — Section 8: Your Connections in the Ecosystem',
            description:
              'We would like to learn about who you work with, and who you wish you could work with. This section helps us draw the real map of relationships inside the Rwanda UAS sector.',
            order: 9,
            actions: HIDE_FOR_INSURANCE_ONLY,
            fields: {
              create: [
                ...Array.from({ length: 5 }, (_, i) => [
                  {
                    label: `Strongest working relationship #${i + 1} — Organisation name`,
                    name: `a8_partner_name_${i + 1}`,
                    type: 'SHORT_TEXT' as const,
                    order: 1 + i * 2,
                    validation: { required: false },
                  },
                  {
                    label: `Strongest working relationship #${i + 1} — Type of relationship`,
                    name: `a8_partner_type_${i + 1}`,
                    type: 'DROPDOWN' as const,
                    order: 2 + i * 2,
                    options: RELATIONSHIP_TYPES,
                    validation: { required: false },
                  },
                ]).flat(),
                ...Array.from({ length: 3 }, (_, i) => [
                  {
                    label: `Organisation you would like to collaborate with #${i + 1} — Name`,
                    name: `a8_desired_collab_name_${i + 1}`,
                    type: 'SHORT_TEXT' as const,
                    order: 11 + i * 2,
                    validation: { required: false },
                  },
                  {
                    label: `Organisation you would like to collaborate with #${i + 1} — Why not yet?`,
                    name: `a8_desired_collab_why_${i + 1}`,
                    type: 'SHORT_TEXT' as const,
                    order: 12 + i * 2,
                    validation: { required: false },
                  },
                ]).flat(),
                {
                  label:
                    'How often do you interact with other UAS ecosystem players outside of direct client or supplier relationships?',
                  name: 'a8_interaction_frequency',
                  type: 'MULTIPLE_CHOICE',
                  order: 17,
                  options: INTERACTION_FREQUENCY_OPTIONS,
                  validation: { required: true },
                },
                {
                  label:
                    'Are you a member of any UAS or aviation industry association or network?',
                  name: 'a8_association_member',
                  type: 'MULTIPLE_CHOICE',
                  order: 18,
                  options: [
                    'Yes',
                    'No, but I am interested in joining one',
                    'No, and I am not interested',
                  ],
                  validation: { required: true },
                },
                {
                  label: 'If yes, which association or network?',
                  name: 'a8_association_name',
                  type: 'SHORT_TEXT',
                  order: 19,
                  validation: { required: false },
                  actions: [
                    {
                      action: 'HIDE',
                      when: {
                        type: 'all',
                        clauses: [
                          {
                            field: 'a8_association_member',
                            operator: 'not_equals',
                            value: 'Yes',
                          },
                        ],
                      },
                    },
                  ],
                },
                {
                  label:
                    'What type of ecosystem platform would be most valuable to you?',
                  name: 'a8_ecosystem_platform',
                  type: 'MULTIPLE_CHOICE',
                  order: 20,
                  options: ECOSYSTEM_PLATFORM_OPTIONS,
                  validation: { required: true },
                },
              ],
            },
          },

          // ============================================================
          // PART A — SECTION 9: Strategic Priorities and Outlook
          // ============================================================
          {
            title: 'Part A — Section 9: Strategic Priorities and Outlook',
            description:
              'Finally, we would like to hear your view of the bigger picture: the barriers holding the sector back, the applications with the most untapped potential, and where you honestly think Rwanda\'s UAS ecosystem will be in five years.',
            order: 10,
            actions: HIDE_FOR_INSURANCE_ONLY,
            fields: {
              create: [
                {
                  label: 'What is the biggest barrier to UAS ecosystem growth in Rwanda?',
                  name: 'a9_barrier_1',
                  type: 'DROPDOWN',
                  order: 1,
                  options: BARRIER_OPTIONS,
                  validation: { required: true },
                },
                {
                  label: 'Second biggest barrier',
                  name: 'a9_barrier_2',
                  type: 'DROPDOWN',
                  order: 2,
                  options: BARRIER_OPTIONS,
                  validation: { required: true },
                },
                {
                  label: 'Third biggest barrier',
                  name: 'a9_barrier_3',
                  type: 'DROPDOWN',
                  order: 3,
                  options: BARRIER_OPTIONS,
                  validation: { required: true },
                },
                {
                  label:
                    'Which UAS application area has the highest untapped potential in Rwanda?',
                  name: 'a9_highest_potential',
                  type: 'MULTIPLE_CHOICE',
                  order: 4,
                  options: UAS_APPLICATION_OPTIONS,
                  validation: { required: true },
                },
                {
                  label:
                    'What single action by the Government of Rwanda would most accelerate the UAS sector?',
                  name: 'a9_government_action',
                  type: 'LONG_TEXT',
                  order: 5,
                  validation: { required: true },
                },
                {
                  label:
                    'Where do you see the Rwanda UAS ecosystem in 5 years? Please share your honest view.',
                  name: 'a9_five_year_outlook',
                  type: 'LONG_TEXT',
                  order: 6,
                  validation: { required: true },
                },
              ],
            },
          },

          // ============================================================
          // PART B — SECTION 1: About Your Organisation (Insurance)
          // ============================================================
          {
            title: 'Part B — Insurance: Section 1: About Your Organisation',
            description:
              'Part B is for insurance providers, reinsurance firms, risk advisors, and aviation insurance specialists. Please tell us about your organisation.',
            order: 11,
            actions: HIDE_FOR_SERVICE_PROVIDER_ONLY,
            fields: {
              create: [
                {
                  label: 'Organisation name',
                  name: 'b1_organisation_name',
                  type: 'SHORT_TEXT',
                  order: 1,
                  validation: { required: true },
                },
                {
                  label: 'Full name of primary contact person',
                  name: 'b1_contact_name',
                  type: 'SHORT_TEXT',
                  order: 2,
                  validation: { required: true },
                },
                {
                  label: 'Job title / role',
                  name: 'b1_job_title',
                  type: 'SHORT_TEXT',
                  order: 3,
                  validation: { required: true },
                },
                {
                  label: 'Email address',
                  name: 'b1_email',
                  type: 'EMAIL',
                  order: 4,
                  validation: { required: true },
                },
                {
                  label: 'Phone number',
                  name: 'b1_phone',
                  type: 'PHONE',
                  order: 5,
                  validation: { required: false },
                },
                {
                  label: 'Year organisation was established',
                  name: 'b1_year_established',
                  type: 'NUMBER',
                  order: 6,
                  placeholder: 'e.g. 2010',
                  validation: { required: false, min: 1800, max: 2026, integer: true },
                },
                {
                  label: 'Which best describes your organisation?',
                  name: 'b1_org_type',
                  type: 'MULTIPLE_CHOICE',
                  order: 7,
                  options: INSURANCE_ORG_TYPE_OPTIONS,
                  validation: { required: true },
                },
              ],
            },
          },

          // ============================================================
          // PART B — SECTION 2: UAS Insurance Operations
          // ============================================================
          {
            title: 'Part B — Insurance: Section 2: UAS Insurance Operations',
            description:
              'Tell us about the UAS insurance services your organisation provides.',
            order: 12,
            actions: HIDE_FOR_SERVICE_PROVIDER_ONLY,
            fields: {
              create: [
                {
                  label:
                    'Which UAS-related insurance services does your organisation provide? Select all that apply.',
                  name: 'b2_insurance_services',
                  type: 'CHECKBOXES',
                  order: 1,
                  options: INSURANCE_SERVICES_OPTIONS,
                  validation: { required: false },
                },
                {
                  label:
                    'Which UAS sectors do you currently insure? Select all that apply.',
                  name: 'b2_insured_sectors',
                  type: 'CHECKBOXES',
                  order: 2,
                  options: INSURANCE_SECTORS_OPTIONS,
                  validation: { required: false },
                },
                {
                  label:
                    'Approximately how many UAS-related insurance policies does your organisation manage annually?',
                  name: 'b2_policy_count',
                  type: 'MULTIPLE_CHOICE',
                  order: 3,
                  options: INSURANCE_POLICY_COUNT_OPTIONS,
                  validation: { required: true },
                },
                {
                  label:
                    'What is the approximate annual premium volume related to UAS insurance?',
                  name: 'b2_premium_volume',
                  type: 'MULTIPLE_CHOICE',
                  order: 4,
                  options: INSURANCE_PREMIUM_VOLUME_OPTIONS,
                  validation: { required: true },
                },
                {
                  label:
                    'Does your organisation currently provide insurance products specifically designed for drone/UAS operations?',
                  name: 'b2_has_uas_products',
                  type: 'MULTIPLE_CHOICE',
                  order: 5,
                  options: ['Yes', 'No', 'In development'],
                  validation: { required: true },
                },
              ],
            },
          },

          // ============================================================
          // PART B — SECTION 2b: What Would It Take to Start Offering UAS Insurance?
          // ============================================================
          {
            title:
              'Part B — Insurance: Section 2b: What Would It Take to Start Offering UAS Insurance?',
            description:
              'If you answered "No" or "In development" to the previous question about offering UAS insurance products, please complete this section. If you already offer UAS insurance, you may skip to the next section.',
            order: 13,
            actions: [
              ...HIDE_FOR_SERVICE_PROVIDER_ONLY,
              {
                action: 'HIDE',
                when: {
                  type: 'all',
                  clauses: [
                    {
                      field: 'b2_has_uas_products',
                      operator: 'equals',
                      value: 'Yes',
                    },
                  ],
                },
              },
            ],
            fields: {
              create: [
                {
                  label:
                    'What is the primary reason your organisation does not currently offer UAS-specific insurance products?',
                  name: 'b2b_primary_reason',
                  type: 'MULTIPLE_CHOICE',
                  order: 1,
                  options: NO_UAS_INSURANCE_REASON_OPTIONS,
                  validation: { required: true },
                },
                {
                  label:
                    'What conditions or changes would most enable your organisation to start offering UAS insurance? Select all that apply.',
                  name: 'b2b_enabling_conditions',
                  type: 'CHECKBOXES',
                  order: 2,
                  options: ENABLE_UAS_INSURANCE_OPTIONS,
                  validation: { required: false },
                },
                {
                  label:
                    'How long (approximately) would it take your organisation to launch a UAS insurance product if the right conditions were met?',
                  name: 'b2b_launch_timeline',
                  type: 'MULTIPLE_CHOICE',
                  order: 3,
                  options: LAUNCH_TIMELINE_OPTIONS,
                  validation: { required: true },
                },
                {
                  label:
                    'Which type of UAS insurance product would your organisation be most likely to offer first?',
                  name: 'b2b_first_product',
                  type: 'MULTIPLE_CHOICE',
                  order: 4,
                  options: FIRST_PRODUCT_OPTIONS,
                  validation: { required: false },
                },
                {
                  label:
                    'What level of external support or partnership would your organisation need to enter the UAS insurance market?',
                  name: 'b2b_support_matrix',
                  type: 'MATRIX',
                  order: 5,
                  validation: { required: true },
                  matrixRows: [
                    'We would need technical support from an international aviation insurer or reinsurer.',
                    'We would need government or regulatory guidance on minimum coverage requirements.',
                    'We would benefit from shared industry data on UAS incidents and claims in Rwanda.',
                    'We would need training and capacity building for our underwriting and claims teams.',
                    'A co-insurance arrangement with another local insurer would help us manage entry risk.',
                  ],
                  matrixColumns: MATRIX_COLS,
                  matrixType: 'single',
                },
                {
                  label:
                    'What is the single most important action that would accelerate your organisation\'s entry into the UAS insurance market?',
                  name: 'b2b_accelerating_action',
                  type: 'LONG_TEXT',
                  order: 6,
                  validation: { required: false },
                },
              ],
            },
          },

          // ============================================================
          // PART B — SECTION 3: Risk Assessment and Claims
          // ============================================================
          {
            title: 'Part B — Insurance: Section 3: Risk Assessment and Claims',
            description:
              'Tell us about the risks you see in UAS operations and your claims experience.',
            order: 14,
            actions: HIDE_FOR_SERVICE_PROVIDER_ONLY,
            fields: {
              create: [
                {
                  label:
                    'What are the most common risks associated with UAS operations in Rwanda? Select all that apply.',
                  name: 'b3_common_risks',
                  type: 'CHECKBOXES',
                  order: 1,
                  options: UAS_RISKS_OPTIONS,
                  validation: { required: false },
                },
                {
                  label:
                    'Has your organisation processed UAS-related insurance claims?',
                  name: 'b3_has_processed_claims',
                  type: 'MULTIPLE_CHOICE',
                  order: 2,
                  options: ['Yes', 'No'],
                  validation: { required: true },
                },
                {
                  label:
                    'If yes, what types of incidents are most commonly reported?',
                  name: 'b3_common_incidents',
                  type: 'LONG_TEXT',
                  order: 3,
                  validation: { required: false },
                  actions: [
                    {
                      action: 'HIDE',
                      when: {
                        type: 'all',
                        clauses: [
                          {
                            field: 'b3_has_processed_claims',
                            operator: 'not_equals',
                            value: 'Yes',
                          },
                        ],
                      },
                    },
                  ],
                },
                {
                  label:
                    'How would you rate the overall risk level of commercial UAS operations in Rwanda?',
                  name: 'b3_risk_level',
                  type: 'MULTIPLE_CHOICE',
                  order: 4,
                  options: ['Very low', 'Low', 'Moderate', 'High', 'Very high'],
                  validation: { required: true },
                },
                {
                  label:
                    'What are the biggest challenges in underwriting UAS operations? Select all that apply.',
                  name: 'b3_underwriting_challenges',
                  type: 'CHECKBOXES',
                  order: 5,
                  options: UNDERWRITING_CHALLENGES_OPTIONS,
                  validation: { required: false },
                },
              ],
            },
          },

          // ============================================================
          // PART B — SECTION 4: Regulatory Environment
          // ============================================================
          {
            title: 'Part B — Insurance: Section 4: Regulatory Environment',
            description:
              'How do current regulations affect your ability to provide UAS insurance?',
            order: 15,
            actions: HIDE_FOR_SERVICE_PROVIDER_ONLY,
            fields: {
              create: [
                {
                  label:
                    'Please indicate your level of agreement with the following statements',
                  name: 'b4_regulatory_matrix',
                  type: 'MATRIX',
                  order: 1,
                  validation: { required: true },
                  matrixRows: [
                    'Rwanda\'s UAS regulations provide sufficient clarity for insurers.',
                    'Liability requirements for drone operations are clearly defined.',
                    'Current regulations support the development of UAS insurance products.',
                    'Communication between regulators and insurers is effective.',
                    'Existing safety standards help reduce insurance risk exposure.',
                  ],
                  matrixColumns: MATRIX_COLS,
                  matrixType: 'single',
                },
                {
                  label:
                    'Are mandatory insurance requirements for commercial drone operators clearly defined?',
                  name: 'b4_mandatory_defined',
                  type: 'MULTIPLE_CHOICE',
                  order: 2,
                  options: ['Yes', 'No', 'Partially', 'Unsure'],
                  validation: { required: true },
                },
                {
                  label:
                    'What regulatory improvements would most support the growth of the UAS insurance market in Rwanda?',
                  name: 'b4_regulatory_improvements',
                  type: 'LONG_TEXT',
                  order: 3,
                  validation: { required: false },
                },
              ],
            },
          },

          // ============================================================
          // PART B — SECTION 5: Market Development and Business Outlook
          // ============================================================
          {
            title:
              'Part B — Insurance: Section 5: Market Development and Business Outlook',
            description:
              'Help us understand the current and future UAS insurance market in Rwanda.',
            order: 16,
            actions: HIDE_FOR_SERVICE_PROVIDER_ONLY,
            fields: {
              create: [
                {
                  label:
                    'How would you describe current demand for UAS insurance products in Rwanda?',
                  name: 'b5_current_demand',
                  type: 'MULTIPLE_CHOICE',
                  order: 1,
                  options: ['Very low', 'Low', 'Moderate', 'High', 'Very high'],
                  validation: { required: true },
                },
                {
                  label:
                    'Which UAS sectors are likely to generate the highest insurance demand over the next 5 years? Select all that apply.',
                  name: 'b5_demand_sectors',
                  type: 'CHECKBOXES',
                  order: 2,
                  options: INSURANCE_DEMAND_SECTORS_OPTIONS,
                  validation: { required: false },
                },
                {
                  label:
                    'What is the biggest barrier to growth of the UAS insurance market in Rwanda?',
                  name: 'b5_biggest_barrier',
                  type: 'MULTIPLE_CHOICE',
                  order: 3,
                  options: INSURANCE_BARRIER_OPTIONS,
                  validation: { required: true },
                },
                {
                  label:
                    'In your view, how mature is Rwanda\'s UAS insurance ecosystem today?',
                  name: 'b5_maturity',
                  type: 'MULTIPLE_CHOICE',
                  order: 4,
                  options: [
                    'Very immature',
                    'Early-stage',
                    'Developing',
                    'Mature',
                    'Highly advanced',
                  ],
                  validation: { required: true },
                },
              ],
            },
          },

          // ============================================================
          // PART B — SECTION 6: Workforce and Technical Capacity
          // ============================================================
          {
            title:
              'Part B — Insurance: Section 6: Workforce and Technical Capacity',
            description:
              'Tell us about the skills and capacity within your organisation for UAS insurance.',
            order: 17,
            actions: HIDE_FOR_SERVICE_PROVIDER_ONLY,
            fields: {
              create: [
                {
                  label:
                    'Which UAS insurance-related skills are hardest to recruit for? Select up to 3.',
                  name: 'b6_hardest_skills',
                  type: 'CHECKBOXES',
                  order: 1,
                  options: INSURANCE_SKILLS_OPTIONS,
                  validation: { required: false },
                },
                {
                  label:
                    'Does your organisation currently have staff specifically trained in aviation or drone insurance?',
                  name: 'b6_has_trained_staff',
                  type: 'MULTIPLE_CHOICE',
                  order: 2,
                  options: ['Yes', 'No', 'Limited capacity'],
                  validation: { required: true },
                },
                {
                  label:
                    'How important is additional UAS-specific insurance training for your organisation?',
                  name: 'b6_training_importance',
                  type: 'MULTIPLE_CHOICE',
                  order: 3,
                  options: [
                    'Not important',
                    'Slightly important',
                    'Moderately important',
                    'Very important',
                    'Critical',
                  ],
                  validation: { required: true },
                },
              ],
            },
          },

          // ============================================================
          // PART B — SECTION 7: Ecosystem Collaboration
          // ============================================================
          {
            title: 'Part B — Insurance: Section 7: Ecosystem Collaboration',
            description:
              'Tell us about your partnerships and collaborations in the UAS ecosystem.',
            order: 18,
            actions: HIDE_FOR_SERVICE_PROVIDER_ONLY,
            fields: {
              create: [
                {
                  label:
                    'Which stakeholders does your organisation collaborate with most frequently? Select all that apply.',
                  name: 'b7_stakeholders',
                  type: 'CHECKBOXES',
                  order: 1,
                  options: INSURANCE_STAKEHOLDERS_OPTIONS,
                  validation: { required: false },
                },
                {
                  label:
                    'Which organisations would you most like to collaborate with in Rwanda\'s UAS ecosystem?',
                  name: 'b7_desired_collaborators',
                  type: 'LONG_TEXT',
                  order: 2,
                  validation: { required: false },
                },
                {
                  label:
                    'How often does your organisation engage with other UAS ecosystem stakeholders?',
                  name: 'b7_engagement_frequency',
                  type: 'MULTIPLE_CHOICE',
                  order: 3,
                  options: ['Weekly', 'Monthly', 'Quarterly', 'Annually', 'Rarely'],
                  validation: { required: true },
                },
              ],
            },
          },

          // ============================================================
          // PART B — SECTION 8: Strategic Outlook
          // ============================================================
          {
            title: 'Part B — Insurance: Section 8: Strategic Outlook',
            description:
              'Share your view on the future of UAS insurance in Rwanda.',
            order: 19,
            actions: HIDE_FOR_SERVICE_PROVIDER_ONLY,
            fields: {
              create: [
                {
                  label:
                    'Where do you see Rwanda\'s UAS insurance market in the next 5 years?',
                  name: 'b8_five_year_outlook',
                  type: 'LONG_TEXT',
                  order: 1,
                  validation: { required: false },
                },
                {
                  label:
                    'What single action by the Government of Rwanda would most accelerate growth of the UAS insurance market?',
                  name: 'b8_government_action',
                  type: 'LONG_TEXT',
                  order: 2,
                  validation: { required: false },
                },
                {
                  label:
                    'Do you believe commercial UAS operations should require mandatory insurance coverage?',
                  name: 'b8_mandatory_insurance',
                  type: 'MULTIPLE_CHOICE',
                  order: 3,
                  options: [
                    'Yes',
                    'No',
                    'Only for certain operations',
                    'Unsure',
                  ],
                  validation: { required: true },
                },
                {
                  label: 'Additional comments or recommendations',
                  name: 'b8_additional_comments',
                  type: 'LONG_TEXT',
                  order: 4,
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
