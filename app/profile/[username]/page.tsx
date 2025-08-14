"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Edit, 
  MapPin, 
  Calendar, 
  Mail, 
  Globe, 
  Trophy, 
  Star, 
  Heart, 
  Users, 
  Award,
  MessageSquare,
  Briefcase,
  Activity,
  Eye,
  UserPlus,
  MessageCircle
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { AuthGuard } from "@/components/auth-guard"

interface UserProfile {
  id: string
  fullName: string
  username: string
  email: string
  bio: string
  location: string
  website?: string
  joinedDate: string
  avatar?: string
  role: string
  stats: {
    posts: number
    projects: number
    followers: number
    following: number
    reputation: number
  }
  skills: {
    name: string
    percentage: number
  }[]
  achievements: {
    name: string
    description: string
    icon: string
  }[]
}

function UserProfilePage() {
  const params = useParams()
  const username = params.username as string
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isFollowing, setIsFollowing] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Get current user from localStorage
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser))
        }

        // Fetch the profile for the specified username
        const response = await fetch(`/api/profile/${username}`)
        if (response.ok) {
          const data = await response.json()
          setProfile(data.profile)
        } else {
          console.error('Failed to fetch profile')
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }

    if (username) {
      fetchProfile()
    }
  }, [username])

  const handleFollow = async () => {
    // TODO: Implement follow functionality
    setIsFollowing(!isFollowing)
  }

  const handleMessage = () => {
    // TODO: Implement messaging functionality
    console.log('Open message dialog')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Profile not found</h1>
          <p className="text-muted-foreground">The user profile you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  const isOwnProfile = currentUser?.username === username

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile Header Banner */}
        <div className="relative mb-8 overflow-hidden rounded-xl">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-green-500"></div>
          
          {/* Profile Content */}
          <div className="relative p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-white/20 shadow-xl">
                  <AvatarImage src={profile.avatar} alt={profile.fullName} />
                  <AvatarFallback className="text-4xl font-bold bg-white/20 text-white border-2 border-white/30">
                    {profile.fullName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Profile Info */}
              <div className="flex-1 space-y-4 text-white">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h1 className="text-4xl font-bold text-white">{profile.fullName}</h1>
                    <p className="text-xl text-white/80">@{profile.username}</p>
                    <Badge variant="secondary" className="mt-2 bg-white/20 text-white border-white/30">
                      {profile.role.charAt(0).toUpperCase() + profile.role.slice(1).replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex gap-3">
                    {isOwnProfile ? (
                      <Link href="/profile/edit">
                        <Button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white border-white/30">
                          <Edit className="h-4 w-4" />
                          Edit Profile
                        </Button>
                      </Link>
                    ) : (
                      <>
                        <Button 
                          onClick={handleFollow}
                          className={`flex items-center gap-2 ${
                            isFollowing 
                              ? 'bg-white/30 hover:bg-white/40' 
                              : 'bg-white/20 hover:bg-white/30'
                          } text-white border-white/30`}
                        >
                          <UserPlus className="h-4 w-4" />
                          {isFollowing ? 'Following' : 'Follow'}
                        </Button>
                        <Button 
                          onClick={handleMessage}
                          className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white border-white/30"
                        >
                          <MessageCircle className="h-4 w-4" />
                          Message
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <p className="text-white/90 text-lg leading-relaxed max-w-3xl">{profile.bio}</p>

                <div className="flex flex-wrap items-center gap-6 text-sm text-white/80">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {profile.joinedDate}</span>
                  </div>
                  {isOwnProfile && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{profile.email}</span>
                    </div>
                  )}
                  {profile.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <a 
                        href={profile.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-white/90 hover:text-white underline"
                      >
                        {profile.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{profile.stats.posts}</div>
                <div className="text-sm text-white/80">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{profile.stats.projects}</div>
                <div className="text-sm text-white/80">Projects</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{profile.stats.followers}</div>
                <div className="text-sm text-white/80">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{profile.stats.following}</div>
                <div className="text-sm text-white/80">Following</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{profile.stats.reputation}</div>
                <div className="text-sm text-white/80">Reputation</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-muted/50">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="posts" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Posts
              </TabsTrigger>
              <TabsTrigger value="projects" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Projects
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Activity
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Skills & Expertise */}
                <Card className="border-border/50 bg-card/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      Skills & Expertise
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">Professional skills and competencies</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {profile.skills.map((skill, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-foreground">{skill.name}</span>
                          <span className="text-muted-foreground">{skill.percentage}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${skill.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Achievements */}
                <Card className="border-border/50 bg-card/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <Award className="h-5 w-5 text-green-500" />
                      Achievements
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">Earned badges and recognition</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {profile.achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="text-2xl">{achievement.icon}</div>
                        <div>
                          <div className="font-medium text-foreground">{achievement.name}</div>
                          <div className="text-sm text-muted-foreground">{achievement.description}</div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Posts Tab */}
            <TabsContent value="posts" className="mt-6">
              <Card className="border-border/50 bg-card/50">
                <CardHeader>
                  <CardTitle className="text-foreground">Recent Posts</CardTitle>
                  <p className="text-sm text-muted-foreground">Latest forum contributions</p>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No posts yet. Start contributing to the community!</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Projects Tab */}
            <TabsContent value="projects" className="mt-6">
              <Card className="border-border/50 bg-card/50">
                <CardHeader>
                  <CardTitle className="text-foreground">Projects</CardTitle>
                  <p className="text-sm text-muted-foreground">Projects created or contributed to</p>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No projects yet. Start building something amazing!</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="mt-6">
              <Card className="border-border/50 bg-card/50">
                <CardHeader>
                  <CardTitle className="text-foreground">Recent Activity</CardTitle>
                  <p className="text-sm text-muted-foreground">Latest actions and interactions</p>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No recent activity. Get involved in the community!</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

// Wrap the entire page with AuthGuard
export default function ProtectedUserProfilePage() {
  return (
    <AuthGuard>
      <UserProfilePage />
    </AuthGuard>
  )
} 