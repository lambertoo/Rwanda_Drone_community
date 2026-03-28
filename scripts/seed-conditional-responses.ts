import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

const responses = [
  // 1. Individual, Commercial, Licensed, Certified, Has drones
  {
    applicant_type: 'Individual',
    full_name: 'Jean-Pierre Habimana',
    national_id: '1199880012345678',
    date_of_birth: '1988-05-15',
    email: 'jphabimana@gmail.com',
    phone: '+250788123456',
    province: 'Kigali City',
    district: 'Gasabo',
    operation_purpose: 'Commercial (paid services)',
    commercial_services: JSON.stringify(['Aerial photography & videography', 'Land surveying & mapping']),
    monthly_revenue: '500,000 - 2,000,000',
    drone_count: '2-5',
    drone_models: 'DJI Mavic 3 Pro, DJI Phantom 4 RTK',
    max_drone_weight: '2kg - 7kg',
    has_rpl: 'Yes, current',
    rpl_number: 'RPL-RW-2023-0145',
    rpl_expiry: '2025-12-31',
    has_insurance: 'Yes, comprehensive',
    bvlos_operations: 'No, but interested',
    experience_years: '3-5 years',
    flight_hours: '320',
    formal_training: 'Yes, certified program',
    training_institution: 'Rwanda Drone Academy',
    skill_confidence: JSON.stringify({ row_0: 'Advanced', row_1: 'Advanced', row_2: 'Intermediate', row_3: 'Intermediate', row_4: 'Advanced', row_5: 'Advanced' }),
    had_incident: 'No',
    confirm_accuracy: JSON.stringify(['Yes, I confirm']),
    agree_regulations: JSON.stringify(['Yes, I agree']),
    consent_data: JSON.stringify(['Yes, I consent']),
  },
  // 2. Organization, Commercial, Licensed, Heavy drones
  {
    applicant_type: 'Organization',
    org_name: 'Kigali Aerial Solutions Ltd',
    org_reg_number: 'RDB-2021-08432',
    org_employees: '6-20',
    contact_person: 'Marie Uwimana',
    email: 'info@kigaliaerialsolutions.rw',
    phone: '+250722987654',
    province: 'Kigali City',
    district: 'Kicukiro',
    operation_purpose: 'Commercial (paid services)',
    commercial_services: JSON.stringify(['Land surveying & mapping', 'Infrastructure inspection', 'Agricultural spraying']),
    monthly_revenue: '2,000,000 - 10,000,000',
    drone_count: '6-10',
    drone_models: 'DJI Matrice 300 RTK, DJI Agras T30, WingtraOne, senseFly eBee X',
    max_drone_weight: 'Over 25kg',
    heavy_drone_auth: 'Yes',
    has_rpl: 'Yes, current',
    rpl_number: 'RPL-RW-2022-0089',
    rpl_expiry: '2026-06-15',
    has_insurance: 'Yes, comprehensive',
    bvlos_operations: 'Yes, currently authorized',
    experience_years: '5-10 years',
    flight_hours: '1500',
    formal_training: 'Yes, certified program',
    training_institution: 'Part 107 equivalent + RCAA Advanced',
    skill_confidence: JSON.stringify({ row_0: 'Expert', row_1: 'Expert', row_2: 'Expert', row_3: 'Advanced', row_4: 'Expert', row_5: 'Expert' }),
    had_incident: 'Yes',
    incident_description: 'Minor prop strike during landing in windy conditions. No injuries or property damage. Drone repaired on-site.',
    incident_reported: 'Yes',
    confirm_accuracy: JSON.stringify(['Yes, I confirm']),
    agree_regulations: JSON.stringify(['Yes, I agree']),
    consent_data: JSON.stringify(['Yes, I consent']),
  },
  // 3. Individual, Recreational, No license, Self-taught
  {
    applicant_type: 'Individual',
    full_name: 'Eric Nshimiyimana',
    national_id: '1199500067891234',
    date_of_birth: '1995-11-22',
    email: 'ericnshimi@yahoo.com',
    phone: '+250783456789',
    province: 'Eastern Province',
    district: 'Kayonza',
    operation_purpose: 'Recreational / Hobby',
    drone_count: '1',
    drone_models: 'DJI Mini 3',
    max_drone_weight: 'Under 250g',
    has_rpl: 'No, never had one',
    license_barrier: JSON.stringify(['Don\'t know the process', 'Not required for my use case']),
    has_insurance: 'No',
    no_insurance_reason: 'Didn\'t know it was needed',
    bvlos_operations: 'No, not needed',
    experience_years: '1-2 years',
    flight_hours: '45',
    formal_training: 'Self-taught',
    self_taught_method: JSON.stringify(['YouTube tutorials', 'Manufacturer documentation']),
    interested_in_cert: 'Maybe, depends on cost',
    skill_confidence: JSON.stringify({ row_0: 'Intermediate', row_1: 'Beginner', row_2: 'Beginner', row_3: 'Beginner', row_4: 'Beginner', row_5: 'Beginner' }),
    had_incident: 'No',
    confirm_accuracy: JSON.stringify(['Yes, I confirm']),
    agree_regulations: JSON.stringify(['Yes, I agree']),
    consent_data: JSON.stringify(['Yes, I consent']),
  },
  // 4. Organization, Research, Applying for license
  {
    applicant_type: 'Organization',
    org_name: 'University of Rwanda - Drone Research Lab',
    org_reg_number: 'UR-RESEARCH-2019',
    org_employees: '6-20',
    contact_person: 'Dr. Patrick Mugabo',
    email: 'pmugabo@ur.ac.rw',
    phone: '+250728111222',
    province: 'Kigali City',
    district: 'Huye',
    operation_purpose: 'Research / Academic',
    research_institution: 'University of Rwanda, College of Science and Technology',
    research_area: JSON.stringify(['Agriculture', 'Environment & Conservation', 'Computer Science / AI']),
    drone_count: '2-5',
    drone_models: 'DJI Mavic 2 Pro, Parrot Anafi, Custom research hexacopter',
    max_drone_weight: '2kg - 7kg',
    has_rpl: 'Currently applying',
    has_insurance: 'Yes, basic liability only',
    bvlos_operations: 'Yes, seeking authorization',
    bvlos_use_case: 'Automated crop health monitoring over tea plantations using multispectral imaging',
    experience_years: '3-5 years',
    flight_hours: '200',
    formal_training: 'Yes, certified program',
    training_institution: 'RCAA Certified Training + DJI Enterprise Training',
    skill_confidence: JSON.stringify({ row_0: 'Advanced', row_1: 'Advanced', row_2: 'Expert', row_3: 'Intermediate', row_4: 'Advanced', row_5: 'Expert' }),
    had_incident: 'No',
    confirm_accuracy: JSON.stringify(['Yes, I confirm']),
    agree_regulations: JSON.stringify(['Yes, I agree']),
    consent_data: JSON.stringify(['Yes, I consent']),
    additional_comments: 'We would like to discuss a research collaboration agreement with RCAA for BVLOS testing in controlled environments.',
  },
  // 5. Individual, Commercial, Expired license
  {
    applicant_type: 'Individual',
    full_name: 'Claudine Mukamana',
    national_id: '1199280098765432',
    date_of_birth: '1992-03-10',
    email: 'claudine.m@outlook.com',
    phone: '+250799334455',
    province: 'Western Province',
    district: 'Rubavu',
    operation_purpose: 'Commercial (paid services)',
    commercial_services: JSON.stringify(['Aerial photography & videography', 'Crop monitoring']),
    monthly_revenue: '100,000 - 500,000',
    drone_count: '1',
    drone_models: 'DJI Air 2S',
    max_drone_weight: '250g - 2kg',
    has_rpl: 'Yes, but expired',
    rpl_expired_date: '2024-08-15',
    plan_to_renew: 'Yes, within 3 months',
    has_insurance: 'No',
    no_insurance_reason: 'Too expensive',
    bvlos_operations: 'No, not needed',
    experience_years: '1-2 years',
    flight_hours: '85',
    formal_training: 'Yes, online course',
    skill_confidence: JSON.stringify({ row_0: 'Intermediate', row_1: 'Intermediate', row_2: 'Intermediate', row_3: 'Beginner', row_4: 'Intermediate', row_5: 'Intermediate' }),
    had_incident: 'Yes',
    incident_description: 'Lost GPS signal during a shoot near Lake Kivu. Drone entered RTH mode and landed safely but in a tree. Retrieved with minor damage.',
    incident_reported: 'Wasn\'t aware I needed to',
    confirm_accuracy: JSON.stringify(['Yes, I confirm']),
    agree_regulations: JSON.stringify(['Yes, I agree']),
    consent_data: JSON.stringify(['Yes, I consent']),
  },
  // 6. Organization, Government
  {
    applicant_type: 'Organization',
    org_name: 'Rwanda National Police - Aerial Unit',
    org_reg_number: 'GOV-RNP-2020',
    org_employees: '21-50',
    contact_person: 'Inspector James Ndayisaba',
    email: 'aerial@police.gov.rw',
    phone: '+250788000111',
    province: 'Kigali City',
    district: 'Nyarugenge',
    operation_purpose: 'Government / Public sector',
    gov_agency: 'Rwanda National Police',
    drone_count: 'More than 10',
    drone_models: 'DJI Matrice 30T, DJI Mavic 3 Enterprise, Autel EVO II Dual',
    max_drone_weight: '7kg - 25kg',
    has_rpl: 'Yes, current',
    rpl_number: 'RPL-RW-GOV-0012',
    rpl_expiry: '2026-12-31',
    has_insurance: 'Yes, comprehensive',
    bvlos_operations: 'Yes, currently authorized',
    experience_years: '5-10 years',
    flight_hours: '3000',
    formal_training: 'Yes, certified program',
    training_institution: 'Military Drone Operations School + DJI Enterprise',
    skill_confidence: JSON.stringify({ row_0: 'Expert', row_1: 'Expert', row_2: 'Expert', row_3: 'Expert', row_4: 'Expert', row_5: 'Advanced' }),
    had_incident: 'No',
    confirm_accuracy: JSON.stringify(['Yes, I confirm']),
    agree_regulations: JSON.stringify(['Yes, I agree']),
    consent_data: JSON.stringify(['Yes, I consent']),
  },
  // 7. Individual, Humanitarian, No drones yet
  {
    applicant_type: 'Individual',
    full_name: 'Samuel Bizimungu',
    national_id: '1200100012340987',
    date_of_birth: '2001-07-04',
    email: 'samuel.biz@redcross.org',
    phone: '+250785667788',
    province: 'Northern Province',
    district: 'Musanze',
    operation_purpose: 'Humanitarian / NGO',
    drone_count: 'None yet (planning to start)',
    has_rpl: 'No, never had one',
    license_barrier: JSON.stringify(['Cost too high', 'No training centers nearby']),
    has_insurance: 'Don\'t know what\'s available',
    bvlos_operations: 'No, but interested',
    experience_years: 'Less than 1 year',
    flight_hours: '10',
    formal_training: 'Currently in training',
    skill_confidence: JSON.stringify({ row_0: 'Beginner', row_1: 'Beginner', row_2: 'Beginner', row_3: 'Beginner', row_4: 'Beginner', row_5: 'Beginner' }),
    had_incident: 'No',
    confirm_accuracy: JSON.stringify(['Yes, I confirm']),
    agree_regulations: JSON.stringify(['Yes, I agree']),
    consent_data: JSON.stringify(['Yes, I consent']),
    additional_comments: 'I work with Red Cross Rwanda and we want to use drones for disaster assessment. Looking for guidance on getting started.',
  },
  // 8. Individual, Commercial, Delivery, Heavy drone no auth
  {
    applicant_type: 'Individual',
    full_name: 'Alice Ingabire',
    national_id: '1199680045671234',
    date_of_birth: '1996-09-18',
    email: 'alice.ingabire@dronelogistics.rw',
    phone: '+250791223344',
    province: 'Kigali City',
    district: 'Gasabo',
    operation_purpose: 'Commercial (paid services)',
    commercial_services: JSON.stringify(['Delivery & logistics', 'Other']),
    commercial_other: 'Medical sample transport between health centers',
    monthly_revenue: 'Under 100,000',
    drone_count: '1',
    drone_models: 'Custom VTOL delivery drone (prototype)',
    max_drone_weight: 'Over 25kg',
    heavy_drone_auth: 'No, applying',
    has_rpl: 'Yes, current',
    rpl_number: 'RPL-RW-2024-0201',
    rpl_expiry: '2026-03-15',
    has_insurance: 'Yes, basic liability only',
    bvlos_operations: 'Yes, seeking authorization',
    bvlos_use_case: 'Autonomous medical delivery between Kigali health facilities within a 15km corridor',
    experience_years: '3-5 years',
    flight_hours: '180',
    formal_training: 'Yes, certified program',
    training_institution: 'RCAA RPL Program + Zipline Operations Training',
    skill_confidence: JSON.stringify({ row_0: 'Advanced', row_1: 'Expert', row_2: 'Advanced', row_3: 'Advanced', row_4: 'Advanced', row_5: 'Intermediate' }),
    had_incident: 'No',
    confirm_accuracy: JSON.stringify(['Yes, I confirm']),
    agree_regulations: JSON.stringify(['Yes, I agree']),
    consent_data: JSON.stringify(['Yes, I consent']),
    additional_comments: 'Seeking partnership with government health agencies for medical drone delivery pilot program.',
  },
  // 9. Organization, Commercial, Ag spraying
  {
    applicant_type: 'Organization',
    org_name: 'AgriDrone Rwanda SARL',
    org_reg_number: 'RDB-2023-15678',
    org_employees: '1-5',
    contact_person: 'Théogène Niyonzima',
    email: 'info@agridrone.rw',
    phone: '+250733998877',
    province: 'Southern Province',
    district: 'Huye',
    operation_purpose: 'Commercial (paid services)',
    commercial_services: JSON.stringify(['Agricultural spraying', 'Crop monitoring']),
    monthly_revenue: '100,000 - 500,000',
    drone_count: '2-5',
    drone_models: 'DJI Agras T20, DJI Agras T30',
    max_drone_weight: '7kg - 25kg',
    has_rpl: 'Yes, current',
    rpl_number: 'RPL-RW-2023-0312',
    rpl_expiry: '2025-09-30',
    has_insurance: 'Yes, basic liability only',
    bvlos_operations: 'No, but interested',
    experience_years: '1-2 years',
    flight_hours: '350',
    formal_training: 'Yes, certified program',
    training_institution: 'DJI Agricultural Drone Training Center (China) + RCAA local certification',
    skill_confidence: JSON.stringify({ row_0: 'Advanced', row_1: 'Advanced', row_2: 'Advanced', row_3: 'Intermediate', row_4: 'Intermediate', row_5: 'Intermediate' }),
    had_incident: 'Yes',
    incident_description: 'Spray nozzle malfunction caused uneven distribution. No crash but had to abort mission and recalibrate.',
    incident_reported: 'No',
    confirm_accuracy: JSON.stringify(['Yes, I confirm']),
    agree_regulations: JSON.stringify(['Yes, I agree']),
    consent_data: JSON.stringify(['Yes, I consent']),
  },
  // 10. Individual, Recreational, Self-taught, Not interested in cert
  {
    applicant_type: 'Individual',
    full_name: 'David Mugisha',
    national_id: '1200000056781234',
    date_of_birth: '2000-01-25',
    email: 'dmugisha.fpv@gmail.com',
    phone: '+250786112233',
    province: 'Kigali City',
    district: 'Kicukiro',
    operation_purpose: 'Recreational / Hobby',
    drone_count: '2-5',
    drone_models: 'BetaFPV Cetus Pro, Geprc CineLog 25, DJI FPV Combo',
    max_drone_weight: '250g - 2kg',
    has_rpl: 'No, never had one',
    license_barrier: JSON.stringify(['Cost too high', 'Not required for my use case']),
    has_insurance: 'No',
    no_insurance_reason: 'Not required for recreational use',
    bvlos_operations: 'No, not needed',
    experience_years: '1-2 years',
    flight_hours: '120',
    formal_training: 'Self-taught',
    self_taught_method: JSON.stringify(['YouTube tutorials', 'Simulator practice', 'Flying with experienced pilots']),
    interested_in_cert: 'No',
    skill_confidence: JSON.stringify({ row_0: 'Advanced', row_1: 'Intermediate', row_2: 'Beginner', row_3: 'Intermediate', row_4: 'Beginner', row_5: 'Beginner' }),
    had_incident: 'Yes',
    incident_description: 'FPV quad hit a wall during freestyle practice. Minor frame damage, no injuries. Was flying in an open area away from people.',
    incident_reported: 'Wasn\'t aware I needed to',
    confirm_accuracy: JSON.stringify(['Yes, I confirm']),
    agree_regulations: JSON.stringify(['Yes, I agree']),
    consent_data: JSON.stringify(['Yes, I consent']),
  },
]

async function main() {
  const form = await prisma.universalForm.findUnique({
    where: { slug: 'drone-operator-registration' },
    include: { sections: { include: { fields: { orderBy: { order: 'asc' } } }, orderBy: { order: 'asc' } } },
  })

  if (!form) throw new Error('Form not found — run seed-conditional-form.ts first')

  // Build name→id map
  const fieldMap: Record<string, string> = {}
  form.sections.forEach(s => s.fields.forEach(f => { fieldMap[f.name] = f.id }))

  // Delete existing entries
  const deleted = await prisma.formEntry.deleteMany({ where: { formId: form.id } })
  if (deleted.count > 0) console.log(`Deleted ${deleted.count} existing entries`)

  console.log(`\nCreating ${responses.length} responses for: ${form.title}\n`)

  for (let i = 0; i < responses.length; i++) {
    const resp = responses[i]
    const values: { fieldId: string; value: string | null }[] = []

    // For each field in the form, check if response has a value
    form.sections.forEach(s => {
      s.fields.forEach(f => {
        const val = (resp as any)[f.name]
        if (val !== undefined && val !== null && val !== '') {
          values.push({ fieldId: f.id, value: typeof val === 'string' ? val : JSON.stringify(val) })
        } else {
          values.push({ fieldId: f.id, value: null })
        }
      })
    })

    const editToken = crypto.randomBytes(24).toString('hex')

    await prisma.formEntry.create({
      data: {
        formId: form.id,
        editToken,
        status: 'submitted',
        meta: {
          ip: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          submittedAt: new Date(Date.now() - Math.floor(Math.random() * 14 * 24 * 60 * 60 * 1000)).toISOString(),
          userAgent: 'Mozilla/5.0 (Seed Script)',
        },
        values: { create: values },
      },
    })

    const name = resp.full_name || resp.org_name || `Response ${i + 1}`
    console.log(`  ✅ ${i + 1}/${responses.length} — ${name}`)
  }

  console.log(`\n🎉 All ${responses.length} responses created!`)
  console.log(`   View: /forms/${form.id}/submissions`)
}

main()
  .catch(e => { console.error('Error:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
