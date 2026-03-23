/**
 * Pre-built form templates for common use cases.
 */

export interface FormTemplate {
  id: string
  name: string
  description: string
  icon: string
  category: string
  data: {
    title: string
    description: string
    sections: {
      title: string
      description?: string
      fields: {
        type: string
        label: string
        name: string
        placeholder?: string
        required: boolean
        options?: string[]
        order: number
      }[]
    }[]
    settings: Record<string, any>
  }
}

export const FORM_TEMPLATES: FormTemplate[] = [
  {
    id: "event-registration",
    name: "Event Registration",
    description: "Collect attendee info for events and workshops",
    icon: "calendar",
    category: "Events",
    data: {
      title: "Event Registration",
      description: "Register for the upcoming event",
      sections: [
        {
          title: "Personal Information",
          fields: [
            { type: "SHORT_TEXT", label: "Full Name", name: "full_name", placeholder: "Enter your full name", required: true, order: 1 },
            { type: "EMAIL", label: "Email Address", name: "email", placeholder: "your@email.com", required: true, order: 2 },
            { type: "PHONE", label: "Phone Number", name: "phone", placeholder: "+250...", required: true, order: 3 },
            { type: "SHORT_TEXT", label: "Organization", name: "organization", placeholder: "Company or institution", required: false, order: 4 },
          ],
        },
        {
          title: "Event Details",
          fields: [
            { type: "MULTIPLE_CHOICE", label: "How did you hear about this event?", name: "source", required: false, options: ["Social Media", "Email", "Friend/Colleague", "Website", "Other"], order: 1 },
            { type: "CHECKBOXES", label: "Which sessions interest you?", name: "sessions", required: false, options: ["Keynote", "Workshop A", "Workshop B", "Networking", "Panel Discussion"], order: 2 },
            { type: "DROPDOWN", label: "Dietary Requirements", name: "dietary", required: false, options: ["None", "Vegetarian", "Vegan", "Halal", "Gluten-free", "Other"], order: 3 },
            { type: "LONG_TEXT", label: "Any questions or special requirements?", name: "questions", placeholder: "Let us know...", required: false, order: 4 },
          ],
        },
      ],
      settings: { submitButtonText: "Register", confirmationMessage: "You're registered! We'll send you a confirmation email shortly." },
    },
  },
  {
    id: "job-application",
    name: "Job Application",
    description: "Collect resumes and candidate information",
    icon: "briefcase",
    category: "HR",
    data: {
      title: "Job Application",
      description: "Apply for a position",
      sections: [
        {
          title: "Personal Details",
          fields: [
            { type: "SHORT_TEXT", label: "Full Name", name: "full_name", required: true, order: 1 },
            { type: "EMAIL", label: "Email", name: "email", required: true, order: 2 },
            { type: "PHONE", label: "Phone Number", name: "phone", required: true, order: 3 },
            { type: "URL", label: "LinkedIn Profile", name: "linkedin", placeholder: "https://linkedin.com/in/...", required: false, order: 4 },
            { type: "URL", label: "Portfolio / Website", name: "portfolio", required: false, order: 5 },
          ],
        },
        {
          title: "Experience",
          fields: [
            { type: "DROPDOWN", label: "Years of Experience", name: "experience", required: true, options: ["0-1 years", "1-3 years", "3-5 years", "5-10 years", "10+ years"], order: 1 },
            { type: "LONG_TEXT", label: "Relevant Experience", name: "experience_detail", placeholder: "Describe your relevant work experience...", required: true, order: 2 },
            { type: "CHECKBOXES", label: "Skills", name: "skills", required: false, options: ["Python", "JavaScript", "Data Analysis", "Project Management", "Communication", "Leadership"], order: 3 },
            { type: "FILE_UPLOAD", label: "Upload CV/Resume", name: "resume", required: true, order: 4 },
            { type: "LONG_TEXT", label: "Why do you want this role?", name: "motivation", required: true, order: 5 },
          ],
        },
      ],
      settings: { submitButtonText: "Submit Application", confirmationMessage: "Thank you for applying! We'll review your application and get back to you." },
    },
  },
  {
    id: "feedback-survey",
    name: "Feedback Survey",
    description: "Gather feedback with ratings and comments",
    icon: "star",
    category: "Surveys",
    data: {
      title: "Feedback Survey",
      description: "Help us improve by sharing your experience",
      sections: [
        {
          title: "Your Feedback",
          fields: [
            { type: "RATING", label: "Overall Experience", name: "overall_rating", required: true, order: 1 },
            { type: "LINEAR_SCALE", label: "How likely are you to recommend us?", name: "nps", required: true, order: 2 },
            { type: "MULTIPLE_CHOICE", label: "What best describes your role?", name: "role", required: false, options: ["Student", "Professional", "Hobbyist", "Researcher", "Other"], order: 3 },
            { type: "CHECKBOXES", label: "What did you enjoy most?", name: "enjoyed", required: false, options: ["Content Quality", "Networking", "Speakers", "Organization", "Location", "Food"], order: 4 },
            { type: "LONG_TEXT", label: "What could we improve?", name: "improvement", placeholder: "Your suggestions...", required: false, order: 5 },
            { type: "LONG_TEXT", label: "Additional comments", name: "comments", required: false, order: 6 },
          ],
        },
      ],
      settings: { submitButtonText: "Submit Feedback", confirmationMessage: "Thank you for your feedback! It helps us improve." },
    },
  },
  {
    id: "drone-flight-request",
    name: "Drone Flight Request",
    description: "Request approval for drone flight operations",
    icon: "plane",
    category: "Drone Operations",
    data: {
      title: "Drone Flight Request",
      description: "Submit your flight plan for approval",
      sections: [
        {
          title: "Pilot Information",
          fields: [
            { type: "SHORT_TEXT", label: "Pilot Name", name: "pilot_name", required: true, order: 1 },
            { type: "SHORT_TEXT", label: "Pilot License Number", name: "license_number", required: true, order: 2 },
            { type: "EMAIL", label: "Contact Email", name: "email", required: true, order: 3 },
            { type: "PHONE", label: "Contact Phone", name: "phone", required: true, order: 4 },
          ],
        },
        {
          title: "Flight Details",
          fields: [
            { type: "DATE", label: "Flight Date", name: "flight_date", required: true, order: 1 },
            { type: "TIME", label: "Start Time", name: "start_time", required: true, order: 2 },
            { type: "TIME", label: "End Time", name: "end_time", required: true, order: 3 },
            { type: "GPS_COORDINATES", label: "Flight Location (GPS)", name: "location_gps", required: true, order: 4 },
            { type: "SHORT_TEXT", label: "Location Description", name: "location_desc", placeholder: "e.g. Near Kigali Convention Center", required: true, order: 5 },
            { type: "NUMBER", label: "Maximum Altitude (meters)", name: "max_altitude", required: true, order: 6 },
            { type: "DROPDOWN", label: "Purpose of Flight", name: "purpose", required: true, options: ["Photography", "Survey/Mapping", "Delivery", "Inspection", "Training", "Research", "Commercial", "Other"], order: 7 },
            { type: "SHORT_TEXT", label: "Drone Model", name: "drone_model", required: true, order: 8 },
            { type: "LONG_TEXT", label: "Additional Notes", name: "notes", required: false, order: 9 },
          ],
        },
      ],
      settings: { submitButtonText: "Submit Flight Request", confirmationMessage: "Your flight request has been submitted for review. You'll receive a response within 48 hours." },
    },
  },
  {
    id: "pilot-registration",
    name: "Pilot Registration",
    description: "Register new drone pilots on the platform",
    icon: "user-plus",
    category: "Drone Operations",
    data: {
      title: "Pilot Registration",
      description: "Register as a drone pilot",
      sections: [
        {
          title: "Personal Information",
          fields: [
            { type: "SHORT_TEXT", label: "Full Name", name: "full_name", required: true, order: 1 },
            { type: "EMAIL", label: "Email", name: "email", required: true, order: 2 },
            { type: "PHONE", label: "Phone Number", name: "phone", required: true, order: 3 },
            { type: "NATIONAL_ID", label: "National ID Number", name: "national_id", required: true, order: 4 },
            { type: "DATE", label: "Date of Birth", name: "dob", required: true, order: 5 },
          ],
        },
        {
          title: "Pilot Qualifications",
          fields: [
            { type: "SHORT_TEXT", label: "Pilot License Number", name: "license", required: false, order: 1 },
            { type: "DROPDOWN", label: "Experience Level", name: "experience", required: true, options: ["Beginner (0-1 yr)", "Intermediate (1-3 yrs)", "Advanced (3-5 yrs)", "Expert (5+ yrs)"], order: 2 },
            { type: "CHECKBOXES", label: "Specializations", name: "specializations", required: false, options: ["Photography/Videography", "Mapping/Survey", "Agriculture", "Inspection", "Delivery", "Racing", "Training"], order: 3 },
            { type: "CHECKBOXES", label: "Certifications", name: "certifications", required: false, options: ["RCAA License", "Part 107 (FAA)", "EASA A1/A3", "Other International"], order: 4 },
            { type: "FILE_UPLOAD", label: "Upload License Document", name: "license_doc", required: false, order: 5 },
          ],
        },
      ],
      settings: { submitButtonText: "Register", confirmationMessage: "Welcome! Your pilot registration is being reviewed." },
    },
  },
  {
    id: "equipment-inspection",
    name: "Equipment Inspection",
    description: "Pre-flight drone inspection checklist",
    icon: "clipboard-check",
    category: "Drone Operations",
    data: {
      title: "Pre-Flight Inspection",
      description: "Complete this checklist before each flight",
      sections: [
        {
          title: "Aircraft Check",
          fields: [
            { type: "SHORT_TEXT", label: "Drone Serial Number", name: "serial", required: true, order: 1 },
            { type: "CHECKBOXES", label: "Visual Inspection", name: "visual_check", required: true, options: ["Propellers intact", "Frame undamaged", "Camera/gimbal secure", "Battery seated properly", "No loose wires", "Landing gear OK"], order: 2 },
            { type: "NUMBER", label: "Battery Level (%)", name: "battery_level", required: true, order: 3 },
            { type: "MULTIPLE_CHOICE", label: "Firmware up to date?", name: "firmware", required: true, options: ["Yes", "No", "Unknown"], order: 4 },
          ],
        },
        {
          title: "Environment Check",
          fields: [
            { type: "MULTIPLE_CHOICE", label: "Weather Conditions", name: "weather", required: true, options: ["Clear", "Partly Cloudy", "Overcast", "Light Rain", "Windy"], order: 1 },
            { type: "MULTIPLE_CHOICE", label: "Wind Speed", name: "wind", required: true, options: ["Calm (0-5 km/h)", "Light (5-15 km/h)", "Moderate (15-25 km/h)", "Strong (25+ km/h)"], order: 2 },
            { type: "MULTIPLE_CHOICE", label: "Is the airspace clear?", name: "airspace_clear", required: true, options: ["Yes", "No - other aircraft", "No - restricted zone"], order: 3 },
            { type: "LONG_TEXT", label: "Notes / Anomalies", name: "notes", required: false, order: 4 },
          ],
        },
      ],
      settings: { submitButtonText: "Complete Inspection", confirmationMessage: "Inspection recorded. Safe flying!" },
    },
  },
  {
    id: "contact-form",
    name: "Contact Form",
    description: "Simple contact form for inquiries",
    icon: "mail",
    category: "General",
    data: {
      title: "Contact Us",
      description: "Send us a message and we'll get back to you",
      sections: [
        {
          title: "Your Message",
          fields: [
            { type: "SHORT_TEXT", label: "Name", name: "name", required: true, order: 1 },
            { type: "EMAIL", label: "Email", name: "email", required: true, order: 2 },
            { type: "DROPDOWN", label: "Subject", name: "subject", required: true, options: ["General Inquiry", "Technical Support", "Partnership", "Feedback", "Other"], order: 3 },
            { type: "LONG_TEXT", label: "Message", name: "message", placeholder: "How can we help?", required: true, order: 4 },
          ],
        },
      ],
      settings: { submitButtonText: "Send Message", confirmationMessage: "Thank you! We'll respond within 24 hours." },
    },
  },
]
