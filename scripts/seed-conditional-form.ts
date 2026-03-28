import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: 'admin' } })
  if (!admin) throw new Error('No admin user found')

  const existing = await prisma.universalForm.findUnique({ where: { slug: 'drone-operator-registration' } })
  if (existing) {
    console.log('Deleting existing form...')
    await prisma.universalForm.delete({ where: { id: existing.id } })
  }

  const form = await prisma.universalForm.create({
    data: {
      userId: admin.id,
      title: 'Drone Operator Registration & Compliance Check',
      slug: 'drone-operator-registration',
      description: 'Register as a drone operator in Rwanda. This form adapts based on your answers — only relevant questions will appear.',
      isActive: true,
      isPublic: true,
      settings: {
        submitButtonText: 'Submit Registration',
        confirmationMessage: 'Thank you for registering. We will review your application and contact you within 5 business days.',
        allowMultipleSubmissions: false,
        showProgressBar: true,
        primaryColor: '#1e40af',
      },
      sections: {
        create: [
          // ===== SECTION 1: Basic Info =====
          {
            title: 'Applicant Information',
            description: 'Tell us about yourself or your organization.',
            order: 1,
            fields: {
              create: [
                {
                  label: 'Are you registering as an individual or an organization?',
                  name: 'applicant_type',
                  type: 'MULTIPLE_CHOICE',
                  order: 1,
                  validation: { required: true },
                  options: ['Individual', 'Organization'],
                },
                // Show if Individual
                {
                  label: 'Full Name',
                  name: 'full_name',
                  type: 'SHORT_TEXT',
                  order: 2,
                  validation: { required: true },
                  conditional: { dependsOn: 'applicant_type', operator: 'equals', value: 'Individual' },
                },
                {
                  label: 'National ID Number',
                  name: 'national_id',
                  type: 'NATIONAL_ID',
                  order: 3,
                  validation: { required: true },
                  conditional: { dependsOn: 'applicant_type', operator: 'equals', value: 'Individual' },
                },
                {
                  label: 'Date of Birth',
                  name: 'date_of_birth',
                  type: 'DATE',
                  order: 4,
                  validation: { required: true },
                  conditional: { dependsOn: 'applicant_type', operator: 'equals', value: 'Individual' },
                },
                // Show if Organization
                {
                  label: 'Organization Name',
                  name: 'org_name',
                  type: 'SHORT_TEXT',
                  order: 5,
                  validation: { required: true },
                  conditional: { dependsOn: 'applicant_type', operator: 'equals', value: 'Organization' },
                },
                {
                  label: 'Business Registration Number',
                  name: 'org_reg_number',
                  type: 'SHORT_TEXT',
                  order: 6,
                  validation: { required: true },
                  conditional: { dependsOn: 'applicant_type', operator: 'equals', value: 'Organization' },
                },
                {
                  label: 'Number of Employees',
                  name: 'org_employees',
                  type: 'DROPDOWN',
                  order: 7,
                  validation: { required: true },
                  options: ['1-5', '6-20', '21-50', '51-100', '100+'],
                  conditional: { dependsOn: 'applicant_type', operator: 'equals', value: 'Organization' },
                },
                {
                  label: 'Contact Person Name',
                  name: 'contact_person',
                  type: 'SHORT_TEXT',
                  order: 8,
                  validation: { required: true },
                  conditional: { dependsOn: 'applicant_type', operator: 'equals', value: 'Organization' },
                },
                // Always shown
                {
                  label: 'Email Address',
                  name: 'email',
                  type: 'EMAIL',
                  order: 9,
                  validation: { required: true },
                },
                {
                  label: 'Phone Number',
                  name: 'phone',
                  type: 'PHONE',
                  order: 10,
                  validation: { required: true },
                },
                {
                  label: 'Province',
                  name: 'province',
                  type: 'DROPDOWN',
                  order: 11,
                  validation: { required: true },
                  options: ['Kigali City', 'Eastern Province', 'Western Province', 'Northern Province', 'Southern Province'],
                },
                {
                  label: 'District',
                  name: 'district',
                  type: 'SHORT_TEXT',
                  order: 12,
                  validation: { required: true },
                },
              ],
            },
          },

          // ===== SECTION 2: Drone Operations =====
          {
            title: 'Drone Operations',
            description: 'Tell us about your drone activities.',
            order: 2,
            fields: {
              create: [
                {
                  label: 'What is the primary purpose of your drone operations?',
                  name: 'operation_purpose',
                  type: 'MULTIPLE_CHOICE',
                  order: 1,
                  validation: { required: true },
                  options: [
                    'Commercial (paid services)',
                    'Recreational / Hobby',
                    'Research / Academic',
                    'Government / Public sector',
                    'Humanitarian / NGO',
                  ],
                },
                // Commercial-specific questions
                {
                  label: 'What commercial services do you provide?',
                  name: 'commercial_services',
                  type: 'CHECKBOXES',
                  order: 2,
                  validation: { required: true },
                  options: [
                    'Aerial photography & videography',
                    'Land surveying & mapping',
                    'Agricultural spraying',
                    'Crop monitoring',
                    'Infrastructure inspection',
                    'Delivery & logistics',
                    'Security & surveillance',
                    'Other',
                  ],
                  conditional: { dependsOn: 'operation_purpose', operator: 'equals', value: 'Commercial (paid services)' },
                },
                {
                  label: 'Please specify other commercial service',
                  name: 'commercial_other',
                  type: 'SHORT_TEXT',
                  order: 3,
                  validation: { required: false },
                  conditional: { dependsOn: 'commercial_services', operator: 'contains', value: 'Other' },
                },
                {
                  label: 'Estimated monthly revenue from drone services (RWF)',
                  name: 'monthly_revenue',
                  type: 'DROPDOWN',
                  order: 4,
                  validation: { required: true },
                  options: ['Under 100,000', '100,000 - 500,000', '500,000 - 2,000,000', '2,000,000 - 10,000,000', 'Over 10,000,000'],
                  conditional: { dependsOn: 'operation_purpose', operator: 'equals', value: 'Commercial (paid services)' },
                },
                // Research-specific
                {
                  label: 'Which institution are you affiliated with?',
                  name: 'research_institution',
                  type: 'SHORT_TEXT',
                  order: 5,
                  validation: { required: true },
                  conditional: { dependsOn: 'operation_purpose', operator: 'equals', value: 'Research / Academic' },
                },
                {
                  label: 'Research focus area',
                  name: 'research_area',
                  type: 'CHECKBOXES',
                  order: 6,
                  validation: { required: true },
                  options: ['Agriculture', 'Environment & Conservation', 'Urban Planning', 'Health', 'Engineering', 'Computer Science / AI', 'Other'],
                  conditional: { dependsOn: 'operation_purpose', operator: 'equals', value: 'Research / Academic' },
                },
                // Government-specific
                {
                  label: 'Which government agency?',
                  name: 'gov_agency',
                  type: 'SHORT_TEXT',
                  order: 7,
                  validation: { required: true },
                  conditional: { dependsOn: 'operation_purpose', operator: 'equals', value: 'Government / Public sector' },
                },
                // Always shown
                {
                  label: 'How many drones do you currently operate?',
                  name: 'drone_count',
                  type: 'MULTIPLE_CHOICE',
                  order: 8,
                  validation: { required: true },
                  options: ['None yet (planning to start)', '1', '2-5', '6-10', 'More than 10'],
                },
                // Show if they have drones
                {
                  label: 'List your drone models',
                  name: 'drone_models',
                  type: 'LONG_TEXT',
                  placeholder: 'e.g. DJI Mavic 3 Pro, DJI Matrice 300 RTK',
                  order: 9,
                  validation: { required: true },
                  conditional: { dependsOn: 'drone_count', operator: 'not_equals', value: 'None yet (planning to start)' },
                },
                {
                  label: 'Total weight of your heaviest drone (kg)',
                  name: 'max_drone_weight',
                  type: 'MULTIPLE_CHOICE',
                  order: 10,
                  validation: { required: true },
                  options: ['Under 250g', '250g - 2kg', '2kg - 7kg', '7kg - 25kg', 'Over 25kg'],
                  conditional: { dependsOn: 'drone_count', operator: 'not_equals', value: 'None yet (planning to start)' },
                },
                // Heavy drone specific
                {
                  label: 'Do you have special authorization for heavy drone operations?',
                  name: 'heavy_drone_auth',
                  type: 'MULTIPLE_CHOICE',
                  order: 11,
                  validation: { required: true },
                  options: ['Yes', 'No, applying', 'No, not yet'],
                  conditional: { dependsOn: 'max_drone_weight', operator: 'equals', value: 'Over 25kg' },
                },
                {
                  label: 'Upload heavy drone authorization document',
                  name: 'heavy_drone_doc',
                  type: 'FILE_UPLOAD',
                  order: 12,
                  validation: { required: true, allowedFileTypes: ['pdf', 'jpg', 'png'], maxFileSize: 10485760, maxFiles: 1 },
                  conditional: { dependsOn: 'heavy_drone_auth', operator: 'equals', value: 'Yes' },
                },
              ],
            },
          },

          // ===== SECTION 3: Licensing & Certification =====
          {
            title: 'Licensing & Certification',
            description: 'Your current licensing status with RCAA.',
            order: 3,
            fields: {
              create: [
                {
                  label: 'Do you have an RCAA Remote Pilot License (RPL)?',
                  name: 'has_rpl',
                  type: 'MULTIPLE_CHOICE',
                  order: 1,
                  validation: { required: true },
                  options: ['Yes, current', 'Yes, but expired', 'No, never had one', 'Currently applying'],
                },
                // If has license
                {
                  label: 'RPL License Number',
                  name: 'rpl_number',
                  type: 'SHORT_TEXT',
                  order: 2,
                  validation: { required: true },
                  conditional: { dependsOn: 'has_rpl', operator: 'equals', value: 'Yes, current' },
                },
                {
                  label: 'License Expiry Date',
                  name: 'rpl_expiry',
                  type: 'DATE',
                  order: 3,
                  validation: { required: true },
                  conditional: { dependsOn: 'has_rpl', operator: 'equals', value: 'Yes, current' },
                },
                {
                  label: 'Upload RPL Certificate',
                  name: 'rpl_certificate',
                  type: 'FILE_UPLOAD',
                  order: 4,
                  validation: { required: false, allowedFileTypes: ['pdf', 'jpg', 'png'], maxFileSize: 10485760, maxFiles: 1 },
                  conditional: { dependsOn: 'has_rpl', operator: 'equals', value: 'Yes, current' },
                },
                // If expired
                {
                  label: 'When did your license expire?',
                  name: 'rpl_expired_date',
                  type: 'DATE',
                  order: 5,
                  validation: { required: true },
                  conditional: { dependsOn: 'has_rpl', operator: 'equals', value: 'Yes, but expired' },
                },
                {
                  label: 'Are you planning to renew?',
                  name: 'plan_to_renew',
                  type: 'MULTIPLE_CHOICE',
                  order: 6,
                  validation: { required: true },
                  options: ['Yes, within 3 months', 'Yes, within 6 months', 'Not sure', 'No'],
                  conditional: { dependsOn: 'has_rpl', operator: 'equals', value: 'Yes, but expired' },
                },
                // If never had one
                {
                  label: 'What is preventing you from getting licensed?',
                  name: 'license_barrier',
                  type: 'CHECKBOXES',
                  order: 7,
                  validation: { required: true },
                  options: ['Cost too high', 'Don\'t know the process', 'No training centers nearby', 'Waiting list too long', 'Not required for my use case', 'Other'],
                  conditional: { dependsOn: 'has_rpl', operator: 'equals', value: 'No, never had one' },
                },
                {
                  label: 'Please specify other barrier',
                  name: 'license_barrier_other',
                  type: 'SHORT_TEXT',
                  order: 8,
                  validation: { required: false },
                  conditional: { dependsOn: 'license_barrier', operator: 'contains', value: 'Other' },
                },
                // Always shown
                {
                  label: 'Do you have drone insurance?',
                  name: 'has_insurance',
                  type: 'MULTIPLE_CHOICE',
                  order: 9,
                  validation: { required: true },
                  options: ['Yes, comprehensive', 'Yes, basic liability only', 'No', 'Don\'t know what\'s available'],
                },
                // If no insurance
                {
                  label: 'Why don\'t you have insurance?',
                  name: 'no_insurance_reason',
                  type: 'MULTIPLE_CHOICE',
                  order: 10,
                  validation: { required: true },
                  options: ['Too expensive', 'Can\'t find a provider', 'Didn\'t know it was needed', 'Not required for recreational use'],
                  conditional: { dependsOn: 'has_insurance', operator: 'equals', value: 'No' },
                },
                // BVLOS
                {
                  label: 'Do you conduct or plan to conduct BVLOS (Beyond Visual Line of Sight) operations?',
                  name: 'bvlos_operations',
                  type: 'MULTIPLE_CHOICE',
                  order: 11,
                  validation: { required: true },
                  options: ['Yes, currently authorized', 'Yes, seeking authorization', 'No, but interested', 'No, not needed'],
                },
                {
                  label: 'Upload BVLOS authorization',
                  name: 'bvlos_doc',
                  type: 'FILE_UPLOAD',
                  order: 12,
                  validation: { required: false, allowedFileTypes: ['pdf'], maxFileSize: 10485760, maxFiles: 1 },
                  conditional: { dependsOn: 'bvlos_operations', operator: 'equals', value: 'Yes, currently authorized' },
                },
                {
                  label: 'What BVLOS use case are you seeking authorization for?',
                  name: 'bvlos_use_case',
                  type: 'SHORT_TEXT',
                  order: 13,
                  validation: { required: true },
                  conditional: { dependsOn: 'bvlos_operations', operator: 'equals', value: 'Yes, seeking authorization' },
                },
              ],
            },
          },

          // ===== SECTION 4: Training & Experience =====
          {
            title: 'Training & Experience',
            description: 'Your drone training background and experience level.',
            order: 4,
            fields: {
              create: [
                {
                  label: 'How many years of drone flying experience do you have?',
                  name: 'experience_years',
                  type: 'MULTIPLE_CHOICE',
                  order: 1,
                  validation: { required: true },
                  options: ['Less than 1 year', '1-2 years', '3-5 years', '5-10 years', 'More than 10 years'],
                },
                {
                  label: 'Estimated total flight hours',
                  name: 'flight_hours',
                  type: 'NUMBER',
                  placeholder: 'e.g. 250',
                  order: 2,
                  validation: { required: true, min: 0 },
                },
                {
                  label: 'Have you completed formal drone training?',
                  name: 'formal_training',
                  type: 'MULTIPLE_CHOICE',
                  order: 3,
                  validation: { required: true },
                  options: ['Yes, certified program', 'Yes, online course', 'Self-taught', 'Currently in training'],
                },
                // If certified
                {
                  label: 'Name of training institution',
                  name: 'training_institution',
                  type: 'SHORT_TEXT',
                  order: 4,
                  validation: { required: true },
                  conditional: { dependsOn: 'formal_training', operator: 'equals', value: 'Yes, certified program' },
                },
                {
                  label: 'Upload training certificate',
                  name: 'training_cert',
                  type: 'FILE_UPLOAD',
                  order: 5,
                  validation: { required: false, allowedFileTypes: ['pdf', 'jpg', 'png'], maxFileSize: 10485760, maxFiles: 1 },
                  conditional: { dependsOn: 'formal_training', operator: 'equals', value: 'Yes, certified program' },
                },
                // If self-taught
                {
                  label: 'How did you learn to fly?',
                  name: 'self_taught_method',
                  type: 'CHECKBOXES',
                  order: 6,
                  validation: { required: true },
                  options: ['YouTube tutorials', 'Manufacturer documentation', 'Flying with experienced pilots', 'Simulator practice', 'Trial and error'],
                  conditional: { dependsOn: 'formal_training', operator: 'equals', value: 'Self-taught' },
                },
                {
                  label: 'Would you be interested in formal certification?',
                  name: 'interested_in_cert',
                  type: 'MULTIPLE_CHOICE',
                  order: 7,
                  validation: { required: true },
                  options: ['Yes, definitely', 'Maybe, depends on cost', 'No'],
                  conditional: { dependsOn: 'formal_training', operator: 'equals', value: 'Self-taught' },
                },
                // Rate your skills
                {
                  label: 'Rate your confidence in these areas',
                  name: 'skill_confidence',
                  type: 'MATRIX',
                  order: 8,
                  validation: { required: true },
                  matrixType: 'single',
                  matrixRows: [
                    'Manual flight control',
                    'Pre-flight checks & safety',
                    'Mission planning',
                    'Emergency procedures',
                    'Airspace regulations',
                    'Data processing (photos, maps)',
                  ],
                  matrixColumns: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
                },
                {
                  label: 'Have you ever had a drone incident or accident?',
                  name: 'had_incident',
                  type: 'MULTIPLE_CHOICE',
                  order: 9,
                  validation: { required: true },
                  options: ['Yes', 'No'],
                },
                {
                  label: 'Please describe the incident briefly',
                  name: 'incident_description',
                  type: 'LONG_TEXT',
                  order: 10,
                  validation: { required: true },
                  conditional: { dependsOn: 'had_incident', operator: 'equals', value: 'Yes' },
                },
                {
                  label: 'Was the incident reported to RCAA?',
                  name: 'incident_reported',
                  type: 'MULTIPLE_CHOICE',
                  order: 11,
                  validation: { required: true },
                  options: ['Yes', 'No', 'Wasn\'t aware I needed to'],
                  conditional: { dependsOn: 'had_incident', operator: 'equals', value: 'Yes' },
                },
              ],
            },
          },

          // ===== SECTION 5: Agreement & Consent =====
          {
            title: 'Agreement & Consent',
            description: 'Please confirm the following before submitting.',
            order: 5,
            fields: {
              create: [
                {
                  label: 'I confirm that all information provided is accurate and complete',
                  name: 'confirm_accuracy',
                  type: 'CHECKBOXES',
                  order: 1,
                  validation: { required: true },
                  options: ['Yes, I confirm'],
                },
                {
                  label: 'I agree to comply with RCAA regulations for drone operations in Rwanda',
                  name: 'agree_regulations',
                  type: 'CHECKBOXES',
                  order: 2,
                  validation: { required: true },
                  options: ['Yes, I agree'],
                },
                {
                  label: 'I consent to my data being used for the Rwanda UAS ecosystem registry',
                  name: 'consent_data',
                  type: 'CHECKBOXES',
                  order: 3,
                  validation: { required: true },
                  options: ['Yes, I consent'],
                },
                {
                  label: 'Any additional comments or questions?',
                  name: 'additional_comments',
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
        include: { fields: { orderBy: { order: 'asc' } } },
        orderBy: { order: 'asc' },
      },
    },
  })

  const totalFields = form.sections.reduce((acc, s) => acc + s.fields.length, 0)
  const conditionalFields = form.sections.reduce(
    (acc, s) => acc + s.fields.filter((f) => f.conditional).length,
    0
  )

  console.log(`\n✅ Form created successfully!`)
  console.log(`   Title: ${form.title}`)
  console.log(`   ID: ${form.id}`)
  console.log(`   Sections: ${form.sections.length}`)
  console.log(`   Total fields: ${totalFields}`)
  console.log(`   Conditional fields: ${conditionalFields}`)
  console.log(`\n   Public URL: /forms/public/${form.id}`)
  console.log(`   Edit URL: /forms/${form.id}/edit`)
}

main()
  .catch((e) => { console.error('Error:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
