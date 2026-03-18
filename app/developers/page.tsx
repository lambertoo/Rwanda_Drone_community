import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Code2, Globe, Lock, Zap } from 'lucide-react'

interface Endpoint {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT'
  path: string
  description: string
  auth: boolean
  params?: string
  body?: string
  response?: string
}

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  POST: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  PATCH: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  DELETE: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  PUT: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
}

function EndpointRow({ ep }: { ep: Endpoint }) {
  return (
    <div className="border rounded-lg p-4 space-y-2">
      <div className="flex items-center gap-3 flex-wrap">
        <span className={`text-xs font-bold px-2 py-0.5 rounded ${METHOD_COLORS[ep.method]}`}>
          {ep.method}
        </span>
        <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded">{ep.path}</code>
        {ep.auth && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" /> Auth required
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{ep.description}</p>
      {ep.params && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Query params:</p>
          <code className="text-xs bg-muted px-2 py-1 rounded block">{ep.params}</code>
        </div>
      )}
      {ep.body && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Request body:</p>
          <code className="text-xs bg-muted px-2 py-1 rounded block whitespace-pre">{ep.body}</code>
        </div>
      )}
    </div>
  )
}

const ENDPOINTS: Record<string, Endpoint[]> = {
  auth: [
    { method: 'POST', path: '/api/auth/register', description: 'Register a new user account', auth: false, body: '{ username, email, password, fullName, role }' },
    { method: 'POST', path: '/api/auth/login', description: 'Authenticate and receive JWT cookie', auth: false, body: '{ email, password }' },
    { method: 'POST', path: '/api/auth/logout', description: 'Clear the auth cookie', auth: true },
    { method: 'GET', path: '/api/auth/profile', description: 'Get the authenticated user profile', auth: true },
    { method: 'POST', path: '/api/auth/change-password', description: 'Change the current user password', auth: true, body: '{ currentPassword, newPassword }' },
    { method: 'POST', path: '/api/auth/forgot-password', description: 'Request a password reset email', auth: false, body: '{ email }' },
    { method: 'POST', path: '/api/auth/reset-password', description: 'Reset password using token', auth: false, body: '{ token, newPassword }' },
  ],
  forum: [
    { method: 'GET', path: '/api/forum/posts', description: 'List forum posts with optional category filter', auth: false, params: 'category, page, limit' },
    { method: 'POST', path: '/api/forum/posts', description: 'Create a new forum post', auth: true, body: '{ title, content, categoryId, tags[] }' },
    { method: 'GET', path: '/api/forum/posts/[id]', description: 'Get a single post with comments', auth: false },
    { method: 'PATCH', path: '/api/forum/posts/[id]', description: 'Edit a post (author or admin)', auth: true },
    { method: 'DELETE', path: '/api/forum/posts/[id]', description: 'Delete a post (author or admin)', auth: true },
    { method: 'POST', path: '/api/forum/posts/[id]/like', description: 'Toggle like on a post', auth: true },
    { method: 'GET', path: '/api/forum/posts/[id]/like/check', description: 'Check if the user liked a post', auth: true },
    { method: 'GET', path: '/api/forum/posts/[id]/comments', description: 'List comments on a post', auth: false },
    { method: 'POST', path: '/api/forum/posts/[id]/comments', description: 'Add a comment', auth: true, body: '{ content }' },
    { method: 'GET', path: '/api/forum/categories', description: 'List all forum categories', auth: false },
  ],
  projects: [
    { method: 'GET', path: '/api/projects', description: 'List projects (approved)', auth: false, params: 'category, status, mine, page' },
    { method: 'POST', path: '/api/projects', description: 'Create a project', auth: true, body: '{ title, description, category, status, thumbnailUrl?, githubUrl?, liveUrl? }' },
    { method: 'GET', path: '/api/projects/[id]', description: 'Get project details with comments', auth: false },
    { method: 'PATCH', path: '/api/projects/[id]', description: 'Update a project', auth: true },
    { method: 'DELETE', path: '/api/projects/[id]', description: 'Delete a project', auth: true },
    { method: 'POST', path: '/api/projects/[id]/like', description: 'Toggle like', auth: true },
  ],
  events: [
    { method: 'GET', path: '/api/events', description: 'List events', auth: false, params: 'category, upcoming, mine, page' },
    { method: 'POST', path: '/api/events', description: 'Create an event', auth: true, body: '{ title, description, date, location, category, capacity?, registrationRequired? }' },
    { method: 'GET', path: '/api/events/[id]', description: 'Get event details', auth: false },
    { method: 'PATCH', path: '/api/events/[id]', description: 'Update an event', auth: true },
    { method: 'DELETE', path: '/api/events/[id]', description: 'Delete an event', auth: true },
    { method: 'POST', path: '/api/events/[id]/rsvp', description: 'RSVP to an event', auth: true },
  ],
  opportunities: [
    { method: 'GET', path: '/api/opportunities', description: 'List opportunities', auth: false, params: 'category, employmentType, featured, page' },
    { method: 'POST', path: '/api/opportunities', description: 'Post an opportunity', auth: true, body: '{ title, description, category, employmentType, deadline? }' },
    { method: 'GET', path: '/api/opportunities/[id]', description: 'Get opportunity details', auth: false },
    { method: 'POST', path: '/api/opportunities/[id]/apply', description: 'Apply for an opportunity', auth: true },
    { method: 'POST', path: '/api/opportunities/[id]/save', description: 'Save/unsave an opportunity', auth: true },
    { method: 'GET', path: '/api/opportunities/saved', description: 'List saved opportunities', auth: true },
    { method: 'GET', path: '/api/opportunities/my-applications', description: 'List my applications', auth: true },
  ],
  courses: [
    { method: 'GET', path: '/api/courses', description: 'List published courses', auth: false, params: 'category, level, featured, mine' },
    { method: 'POST', path: '/api/courses', description: 'Create a course', auth: true, body: '{ title, description, category, level, price? }' },
    { method: 'GET', path: '/api/courses/[id]', description: 'Get course with lessons', auth: false },
    { method: 'POST', path: '/api/courses/[id]/enroll', description: 'Enroll in a course', auth: true },
    { method: 'GET', path: '/api/courses/[id]/lessons', description: 'List course lessons', auth: false },
    { method: 'POST', path: '/api/courses/[id]/lessons/[lessonId]/progress', description: 'Mark lesson progress', auth: true, body: '{ completed }' },
    { method: 'GET', path: '/api/enrollments', description: 'Get my course enrollments', auth: true },
  ],
  social: [
    { method: 'GET', path: '/api/profile/[username]', description: 'Get a user public profile', auth: false },
    { method: 'POST', path: '/api/users/[username]/follow', description: 'Toggle follow/unfollow a user', auth: true },
    { method: 'GET', path: '/api/users/[username]/follow', description: 'Get follower/following counts', auth: false },
    { method: 'GET', path: '/api/feed', description: 'Activity feed from followed users', auth: true, params: 'cursor, limit' },
    { method: 'GET', path: '/api/search', description: 'Global search across all content', auth: false, params: 'q (required), type (optional)' },
  ],
  public: [
    { method: 'GET', path: '/api/stats', description: 'Public community statistics', auth: false },
    { method: 'GET', path: '/api/health', description: 'Health check — returns { status: "ok" }', auth: false },
    { method: 'GET', path: '/api/forum/categories', description: 'All forum categories', auth: false },
    { method: 'GET', path: '/api/event-categories', description: 'All event categories', auth: false },
    { method: 'GET', path: '/api/project-categories', description: 'All project categories', auth: false },
    { method: 'GET', path: '/api/resource-categories', description: 'All resource categories', auth: false },
  ],
}

export default function DevelopersPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Code2 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Developer API</h1>
          <Badge>v1</Badge>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Rwanda Drone Community exposes a REST API for building integrations. All endpoints are relative to the base URL.
          Authenticated endpoints require a valid session cookie obtained from <code className="bg-muted px-1 rounded text-xs">/api/auth/login</code>.
        </p>
      </div>

      {/* Info Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5 flex gap-3">
            <Globe className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Base URL</p>
              <code className="text-xs text-muted-foreground">https://your-domain.com</code>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 flex gap-3">
            <Lock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Authentication</p>
              <p className="text-xs text-muted-foreground">HTTP-only cookie (JWT)</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 flex gap-3">
            <Zap className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Format</p>
              <p className="text-xs text-muted-foreground">JSON request & response</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick auth example */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Start</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted rounded-lg p-4 overflow-x-auto leading-relaxed">
{`# 1. Login to get session cookie
curl -X POST /api/auth/login \\
  -H "Content-Type: application/json" \\
  -c cookies.txt \\
  -d '{"email":"you@example.com","password":"yourpass"}'

# 2. Use the cookie in subsequent requests
curl /api/forum/posts \\
  -b cookies.txt

# 3. Access protected routes
curl /api/enrollments \\
  -b cookies.txt`}
          </pre>
        </CardContent>
      </Card>

      {/* Endpoint tabs */}
      <Tabs defaultValue="auth">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="auth">Auth</TabsTrigger>
          <TabsTrigger value="forum">Forum</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="public">Public</TabsTrigger>
        </TabsList>

        {Object.entries(ENDPOINTS).map(([key, endpoints]) => (
          <TabsContent key={key} value={key} className="space-y-3 mt-4">
            {endpoints.map(ep => (
              <EndpointRow key={`${ep.method}-${ep.path}`} ep={ep} />
            ))}
          </TabsContent>
        ))}
      </Tabs>

      {/* Error codes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Standard Error Codes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {[
              ['400', 'Bad Request — missing or invalid fields'],
              ['401', 'Unauthorized — no valid session'],
              ['403', 'Forbidden — insufficient permissions'],
              ['404', 'Not Found — resource does not exist'],
              ['409', 'Conflict — duplicate resource'],
              ['429', 'Too Many Requests — rate limit exceeded'],
              ['500', 'Internal Server Error'],
            ].map(([code, desc]) => (
              <div key={code} className="flex items-start gap-3">
                <code className="bg-muted px-2 py-0.5 rounded text-xs font-bold min-w-[3rem]">{code}</code>
                <span className="text-muted-foreground">{desc}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
