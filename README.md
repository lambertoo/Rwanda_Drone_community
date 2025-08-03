# Rwanda Drone Community Platform

*Automatically synced with your [v0.dev](https://v0.dev) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/lambrulis-projects/v0-drone-community-platform)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/lm44ObBxHhh)

## Overview

The Rwanda Drone Community Platform is a comprehensive web application designed to connect drone enthusiasts, professionals, and businesses across Rwanda. The platform facilitates knowledge sharing, project collaboration, event organization, and service provision within the drone community.

This repository will stay in sync with your deployed chats on [v0.dev](https://v0.dev).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.dev](https://v0.dev).

## 🚀 Features

- **Role-Based Authentication System** - 6 distinct user roles with specific permissions
- **Forum & Discussions** - Community-driven discussions and knowledge sharing
- **Project Showcase** - Display and discover drone projects across Rwanda
- **Event Management** - Create, manage, and RSVP for drone-related events
- **Job Board** - Post and apply for drone-related opportunities
- **Service Marketplace** - Connect service providers with clients
- **Resource Library** - Educational materials, guides, and documentation
- **Admin Dashboard** - Comprehensive platform management tools

## 👥 User Roles & Permissions

### 1. **Admin** 🛡️
**Signup:** ❌ Admin-created only

**Can Access/Post:**
- Approve or delete posts, events, listings
- Manage users and roles
- Review reported content
- Analytics dashboard
- Edit or delete any user content
- Post announcements, events, resources

### 2. **Hobbyist** 📷
**Signup:** ✅ Self-signup

**Can Access/Post:**
- Forum discussions and replies
- Drone project showcase (photos, videos, descriptions)
- RSVP for events
- Suggest a service listing
- View/download resources
- Create/edit profile with bio, location, interests

### 3. **Pilot** ✈️
**Signup:** ✅ Self-signup

**Can Access/Post:**
- All Hobbyist permissions, plus:
- Certifications and drone skills in profile
- Post or apply for drone jobs/gigs
- Submit tutorial or flying guide
- List themselves as a service provider (optional)

### 4. **Regulator** 🏛️
**Signup:** ❌ Admin-created only

**Can Access/Post:**
- Official announcements
- Rules and regulation documents (PDFs, updates)
- Respond to forum questions (under regulation category)
- Approve/reject submitted events or resources (optional)
- View analytics (optional, read-only)

### 5. **Student** 🎓
**Signup:** ✅ Self-signup

**Can Access/Post:**
- Forum discussions and replies
- Drone project showcase
- RSVP for events
- Ask questions in Q&A sections
- Download learning resources and templates
- Apply for internships/gigs (if available)

### 6. **Service Provider** 🔧
**Signup:** ✅ Self-signup

**Can Access/Post:**
- Create a service listing (e.g., training, mapping, inspection)
- Edit/update their listing
- Reply to service inquiries
- Post job openings or gig opportunities
- Upload portfolio/project samples
- Participate in relevant forum categories

## 🛠️ Technology Stack

- **Frontend:** Next.js 15, React 19, TypeScript
- **Styling:** Tailwind CSS, shadcn/ui components
- **Authentication:** Custom role-based system
- **Database:** Prisma ORM with SQLite (production-ready for PostgreSQL/MySQL)
- **Deployment:** Vercel
- **Icons:** Lucide React
- **Forms:** React Hook Form with Zod validation

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or pnpm

### Installation
```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install

# Run the development server
npm run dev
```

### Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database with initial data
npm run db:seed

# Open Prisma Studio (optional)
npm run db:studio
```

### Demo Credentials

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| **Admin** | `admin@drone.com` | `admin123` | Full system access |
| **Hobbyist** | `hobbyist@drone.com` | `hobbyist123` | Drone photography enthusiast |
| **Pilot** | `pilot@drone.com` | `pilot123` | Commercial pilot with agricultural experience |
| **Regulator** | `regulator@drone.com` | `regulator123` | RCAA regulatory officer |
| **Student** | `student@drone.com` | `student123` | University student studying drone tech |
| **Service Provider** | `service@drone.com` | `service123` | Drone repair and maintenance |

## 📁 Project Structure

```
rwanda_drone_community_platform/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (auth, forum, projects, events)
│   ├── admin/             # Admin dashboard
│   ├── forum/             # Forum pages with categories and posts
│   ├── projects/          # Project showcase and management
│   ├── events/            # Event management and registration
│   ├── jobs/              # Job board
│   ├── services/          # Service marketplace
│   ├── resources/         # Educational resources
│   ├── login/             # Authentication pages
│   └── register/          # User registration
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components (shadcn/ui)
│   ├── app-sidebar.tsx   # Main navigation sidebar
│   ├── header.tsx        # Top navigation header
│   └── theme-provider.tsx # Theme management
├── lib/                  # Utility functions and configurations
│   ├── prisma.ts        # Prisma client configuration
│   ├── auth.ts          # Authentication utilities
│   ├── types.ts         # TypeScript interfaces
│   └── utils.ts         # Helper functions
├── prisma/              # Database schema and migrations
│   ├── schema.prisma    # Prisma schema definition
│   └── seed.ts          # Database seeding script
└── public/              # Static assets
```

## 🔐 Authentication System

The platform implements a comprehensive role-based authentication system:

- **Session Management** - Secure session handling with HTTP-only cookies
- **Role-Based Access Control** - Different permissions for each user role
- **Form Validation** - Real-time validation with error handling
- **Password Security** - Minimum requirements and secure storage
- **User Profiles** - Role-specific profile fields and information

## 🎨 Design System

- **Responsive Design** - Mobile-first approach with responsive breakpoints
- **Dark/Light Mode** - Theme switching with system preference detection
- **Accessibility** - ARIA labels, keyboard navigation, and screen reader support
- **Component Library** - Consistent UI components using shadcn/ui
- **Color Coding** - Role-specific colors for easy identification

## 📊 Current Status

✅ **Completed Features:**
- Complete UI/UX design with modern, responsive interface
- Role-based authentication system with 6 user types
- All major pages implemented (Home, Forum, Projects, Events, Jobs, Services, Resources)
- Admin dashboard with user management and analytics
- **Prisma ORM integration with SQLite database**
- **Real database with seeded data (6 users, 3 categories, 2 posts, 1 project, 1 event)**
- API routes for all major features
- Theme switching (dark/light mode)
- Mobile-responsive design
- **Database status monitoring page**

🔄 **Ready for Enhancement:**
- Real authentication with proper password hashing
- File upload functionality
- Real-time notifications
- Advanced search and filtering
- Email notifications
- Payment integration for events/services
- PostgreSQL/MySQL production database

## 🚀 Deployment

Your project is live at:

**[https://vercel.com/lambrulis-projects/v0-drone-community-platform](https://vercel.com/lambrulis-projects/v0-drone-community-platform)**

## 🔧 Development

Continue building your app on:

**[https://v0.dev/chat/projects/lm44ObBxHhh](https://v0.dev/chat/projects/lm44ObBxHhh)**

## 📝 How It Works

1. Create and modify your project using [v0.dev](https://v0.dev)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## 🤝 Contributing

This platform is designed to serve the Rwanda drone community. Contributions are welcome to enhance features, improve security, and expand functionality.

## 📄 License

This project is part of the Rwanda Drone Community Platform initiative.

---

**Built with ❤️ for the Rwanda Drone Community**
