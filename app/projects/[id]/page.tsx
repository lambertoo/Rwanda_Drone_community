'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Star,
  Heart,
  MessageSquare,
  Share2,
  Briefcase,
  Target,
  AlertTriangle,
  Trophy,
  Code,
  FileText,
  Image as ImageIcon,
  Download,
  Eye,
  ThumbsUp,
  MessageCircle
} from "lucide-react"

export default function ProjectDetailPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link href="/projects" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Link>

        {/* Project Header */}
        <div className="mb-8 relative overflow-hidden rounded-xl">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-gradient-to-br from-green-800 to-blue-900"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')",
              filter: "brightness(0.3)"
            }}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
          
          {/* Content */}
          <div className="relative z-10 p-8 text-white">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary" className="text-sm bg-white/20 text-white border-white/30 hover:bg-white/30">
                Agriculture
              </Badge>
              <Badge variant="default" className="bg-green-500/80 text-white border-green-400/50 hover:bg-green-500">
                Completed
              </Badge>
            </div>

            <h1 className="text-4xl font-bold mb-4 text-white">Agricultural Monitoring System - Musanze District</h1>
            <p className="text-xl text-white/90 mb-6 max-w-3xl">
              Comprehensive drone-based crop monitoring and analysis system for smallholder farmers in Musanze District, focusing on potato and maize cultivation optimization.
            </p>

            {/* Project Stats */}
            <div className="flex items-center gap-6 text-sm text-white/80 mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-white/80" />
                <span>January 2024 - June 2024</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-white/80" />
                <span>Musanze District, Rwanda</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-white/80" />
                <span>Led by Dr. Agnes Mukamana</span>
              </div>
            </div>

            {/* Engagement Stats */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-white/80" />
                <span className="font-semibold text-white">1234</span>
                <span className="text-white/80">views</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-white/80" />
                <span className="font-semibold text-white">89</span>
                <span className="text-white/80">likes</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-white/80" />
                <span className="font-semibold text-white">23</span>
                <span className="text-white/80">comments</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <Button className="bg-white/20 text-white border-white/30 hover:bg-white/30 hover:text-white">
                <Heart className="h-4 w-4 mr-2" />
                Like
              </Button>
              <Button variant="outline" className="text-white border-white/30 hover:bg-white/20 hover:text-white">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Project Details */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <Tabs defaultValue="overview" className="mb-6">
                          <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="methodology">Methodology</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
              <TabsTrigger value="gallery">Gallery</TabsTrigger>
            </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="prose max-w-none">
                    <p className="text-muted-foreground mb-6">
                      The Agricultural Monitoring System project represents a groundbreaking initiative to revolutionize farming practices in Rwanda's Musanze District through advanced drone technology and precision agriculture techniques.
                    </p>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <Target className="h-5 w-5 text-blue-500" />
                          Primary Goals
                        </h3>
                        <ul className="space-y-2 ml-6">
                          <li className="flex items-center gap-2">
                            <span className="text-green-500">•</span>
                            Implement comprehensive crop monitoring system using drone technology
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-green-500">•</span>
                            Provide real-time data analytics to improve farming decisions
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-green-500">•</span>
                            Increase crop yields by 25% through precision agriculture
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-green-500">•</span>
                            Train local farmers in modern agricultural techniques
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-green-500">•</span>
                            Establish sustainable monitoring protocols
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <Users className="h-5 w-5 text-purple-500" />
                          Project Scope
                        </h3>
                        <p className="mb-3">
                          The project covers <strong>2,500 hectares</strong> of agricultural land across <strong>15 sectors</strong> in Musanze District, directly benefiting over <strong>1,200 smallholder farmers</strong>.
                        </p>
                        <ul className="space-y-2 ml-6">
                          <li className="flex items-center gap-2">
                            <span className="text-blue-500">•</span>
                            <strong>Crop Health Monitoring:</strong> Regular aerial surveys to assess plant health, identify diseases, and monitor growth patterns
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-blue-500">•</span>
                            <strong>Soil Analysis:</strong> Multispectral imaging to analyze soil composition and moisture levels
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-blue-500">•</span>
                            <strong>Yield Prediction:</strong> AI-powered analytics to forecast harvest yields and optimize planning
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-blue-500">•</span>
                            <strong>Pest Detection:</strong> Early identification of pest infestations and disease outbreaks
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-blue-500">•</span>
                            <strong>Irrigation Optimization:</strong> Water usage analysis and irrigation scheduling recommendations
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <Code className="h-5 w-5 text-orange-500" />
                          Technology Stack
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2">Hardware</h4>
                            <ul className="space-y-1 text-sm">
                              <li>• 12x DJI Matrice 300 RTK drones</li>
                              <li>• Multispectral cameras (MicaSense RedEdge-MX)</li>
                              <li>• Thermal imaging sensors</li>
                              <li>• Ground control stations</li>
                              <li>• Weather monitoring equipment</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Software</h4>
                            <ul className="space-y-1 text-sm">
                              <li>• Custom data processing pipeline</li>
                              <li>• Machine learning models for crop analysis</li>
                              <li>• Li>• Web-based dashboard for administrators</li>
                              <li>• Integration with existing agricultural databases</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <Trophy className="h-5 w-5 text-yellow-500" />
                          Impact Metrics
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Crop Yield Increase</span>
                              <Badge variant="default" className="bg-green-100 text-green-800">28%</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Water Efficiency</span>
                              <Badge variant="default" className="bg-blue-100 text-blue-800">35%</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Early Detection</span>
                              <Badge variant="default" className="bg-purple-100 text-purple-800">90%</Badge>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Farmer Adoption</span>
                              <Badge variant="default" className="bg-indigo-100 text-indigo-800">85%</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Cost Reduction</span>
                              <Badge variant="default" className="bg-orange-100 text-orange-800">20%</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="methodology" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Methodology</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Phase 1: Planning & Setup</h3>
                        <p className="text-muted-foreground mb-3">
                          Initial project planning, stakeholder engagement, and technical infrastructure setup.
                        </p>
                        <ul className="space-y-2 ml-6">
                          <li>• Stakeholder mapping and engagement</li>
                          <li>• Technical requirements analysis</li>
                          <li>• Drone fleet procurement and setup</li>
                          <li>• Training program development</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-3">Phase 2: Implementation</h3>
                        <p className="text-muted-foreground mb-3">
                          Core project implementation including drone operations, data collection, and farmer training.
                        </p>
                        <ul className="space-y-2 ml-6">
                          <li>• Drone flight operations and data collection</li>
                          <li>• Data processing and analysis</li>
                          <li>• Farmer training and capacity building</li>
                          <li>• Continuous monitoring and optimization</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-3">Phase 3: Evaluation & Scaling</h3>
                        <p className="text-muted-foreground mb-3">
                          Project evaluation, impact assessment, and preparation for scaling to other districts.
                        </p>
                        <ul className="space-y-2 ml-6">
                          <li>• Impact assessment and evaluation</li>
                          <li>• Knowledge sharing and documentation</li>
                          <li>• Scaling strategy development</li>
                          <li>• Sustainability planning</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="results" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Quantitative Results</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 border rounded-lg">
                            <div className="text-2xl font-bold text-green-600">28%</div>
                            <div className="text-sm text-muted-foreground">Average increase in potato yields</div>
                          </div>
                          <div className="p-4 border rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">35%</div>
                            <div className="text-sm text-muted-foreground">Reduction in water usage</div>
                          </div>
                          <div className="p-4 border rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">90%</div>
                            <div className="text-sm text-muted-foreground">Success rate in early pest detection</div>
                          </div>
                          <div className="p-4 border rounded-lg">
                            <div className="text-2xl font-bold text-orange-600">1,200+</div>
                            <div className="text-sm text-muted-foreground">Farmers directly benefited</div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-3">Qualitative Results</h3>
                        <ul className="space-y-2 ml-6">
                          <li>• Improved farmer knowledge and skills in modern agriculture</li>
                          <li>• Enhanced community engagement and collaboration</li>
                          <li>• Established sustainable monitoring protocols</li>
                          <li>• Created employment opportunities for local drone operators</li>
                          <li>• Built strong partnerships with agricultural cooperatives</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="team" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Team</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Project Lead */}
                      <div className="border-b pb-6">
                        <h3 className="text-lg font-semibold mb-4 text-green-600">Project Lead</h3>
                        <div className="flex items-center gap-4 p-4 border rounded-lg bg-green-50">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src="/placeholder.svg" alt="Dr. Agnes Mukamana" />
                            <AvatarFallback>AM</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="text-xl font-semibold">Dr. Agnes Mukamana</h4>
                            <p className="text-lg text-muted-foreground mb-2">Project Lead & Agricultural Expert</p>
                            <p className="text-sm text-muted-foreground mb-3">University of Rwanda - Agriculture</p>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-current text-yellow-400" />
                                <span className="text-sm text-muted-foreground">4.9 (12 projects)</span>
                              </div>
                              <Badge variant="default" className="bg-green-100 text-green-800">Lead</Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Core Team */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4 text-blue-600">Core Team</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-4 p-4 border rounded-lg">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src="/placeholder.svg" alt="Drone Engineer" />
                              <AvatarFallback>DE</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h4 className="font-semibold">Sarah Mukamana</h4>
                              <p className="text-sm text-muted-foreground">Drone Engineer & Pilot</p>
                              <p className="text-xs text-muted-foreground">Rwanda Drone Academy</p>
                              <Badge variant="outline" className="mt-1">Drone Operations</Badge>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 p-4 border rounded-lg">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src="/placeholder.svg" alt="Software Developer" />
                              <AvatarFallback>SD</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h4 className="font-semibold">Eric Niyonsenga</h4>
                              <p className="text-sm text-muted-foreground">Software Developer & AI Specialist</p>
                              <p className="text-xs text-muted-foreground">Kigali Innovation Hub</p>
                              <Badge variant="outline" className="mt-1">AI & Software</Badge>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 p-4 border rounded-lg">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src="/placeholder.svg" alt="Data Analyst" />
                              <AvatarFallback>DA</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h4 className="font-semibold">Marie Uwimana</h4>
                              <p className="text-sm text-muted-foreground">Data Analyst & Researcher</p>
                              <p className="text-xs text-muted-foreground">Rwanda Agriculture Board</p>
                              <Badge variant="outline" className="mt-1">Data Analysis</Badge>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 p-4 border rounded-lg">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src="/placeholder.svg" alt="Field Coordinator" />
                              <AvatarFallback>FC</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h4 className="font-semibold">Jean Pierre Habimana</h4>
                              <p className="text-sm text-muted-foreground">Field Coordinator</p>
                              <p className="text-xs text-muted-foreground">Musanze District Office</p>
                              <Badge variant="outline" className="mt-1">Field Operations</Badge>
                            </div>
                          </div>
                        </div>
                      </div>



                      {/* Team Stats */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-3">Team Statistics</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-blue-600">6</div>
                            <div className="text-sm text-muted-foreground">Core Members</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-purple-600">15+</div>
                            <div className="text-sm text-muted-foreground">Years Experience</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-orange-600">8</div>
                            <div className="text-sm text-muted-foreground">Institutions</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="gallery" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Gallery</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                      <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Project images and videos coming soon...</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Comments Section */}
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Comments & Discussion
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Share your thoughts, ask questions, or discuss this project with the community.
                  </p>
                </CardHeader>
                <CardContent>
                  {/* Comment Form */}
                  <div className="mb-6 p-4 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/placeholder.svg" alt="User" />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <textarea
                          placeholder="Write a comment..."
                          className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          rows={3}
                        />
                        <div className="flex justify-between items-center mt-3">
                          <div className="text-sm text-muted-foreground">
                            Press Ctrl+Enter to submit
                          </div>
                          <Button size="sm">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Post Comment
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 border rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder.svg" alt="User" />
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-sm">John Doe</span>
                          <span className="text-xs text-muted-foreground">2 hours ago</span>
                          <Badge variant="outline" className="text-xs">Project Lead</Badge>
                        </div>
                        <p className="text-sm mb-2">
                          This is an excellent project! The use of drone technology for agricultural monitoring is really innovative. 
                          I'm particularly impressed with the 28% yield increase achieved.
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <button className="flex items-center gap-1 hover:text-primary">
                            <ThumbsUp className="h-3 w-3" />
                            Like (5)
                          </button>
                          <button className="flex items-center gap-1 hover:text-primary">
                            <MessageSquare className="h-3 w-3" />
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 border rounded-lg ml-8">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src="/placeholder.svg" alt="User" />
                        <AvatarFallback>JS</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-sm">Jane Smith</span>
                          <span className="text-xs text-muted-foreground">1 hour ago</span>
                        </div>
                        <p className="text-sm mb-2">
                          Great response! I'd love to learn more about the AI models used for crop analysis. 
                          Are there plans to make this technology available to other districts?
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <button className="flex items-center gap-1 hover:text-primary">
                            <ThumbsUp className="h-3 w-3" />
                            Like (2)
                          </button>
                          <button className="flex items-center gap-1 hover:text-primary">
                            <MessageSquare className="h-3 w-3" />
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 border rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder.svg" alt="User" />
                        <AvatarFallback>MK</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-sm">Mike Johnson</span>
                          <span className="text-xs text-muted-foreground">30 minutes ago</span>
                        </div>
                        <p className="text-sm mb-2">
                          The water efficiency improvements are impressive! 35% reduction is significant. 
                          How did you handle the initial setup costs for the drone infrastructure?
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <button className="flex items-center gap-1 hover:text-primary">
                            <ThumbsUp className="h-3 w-3" />
                            Like (1)
                          </button>
                          <button className="flex items-center gap-1 hover:text-primary">
                            <MessageCircle className="h-3 w-3" />
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column - Project Resources */}
          <div className="space-y-6">

            {/* Project Resources */}
            <Card>
              <CardHeader>
                <CardTitle>Project Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium text-sm">Final Project Report</p>
                        <p className="text-xs text-muted-foreground">12.3 MB • PDF • 89 downloads</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium text-sm">Dataset - Crop Yield Analysis</p>
                        <p className="text-xs text-muted-foreground">245 MB • CSV/ZIP • 34 downloads</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="font-medium text-sm">Drone Flight Logs</p>
                        <p className="text-xs text-muted-foreground">8.7 MB • JSON • 23 downloads</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="font-medium text-sm">Training Materials</p>
                        <p className="text-xs text-muted-foreground">45 MB • PDF/PPT • 67 downloads</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Code className="h-5 w-5 text-red-500" />
                      <div>
                        <p className="font-medium text-sm">Software Tools</p>
                        <p className="text-xs text-muted-foreground">156 MB • APK/EXE • 45 downloads</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
