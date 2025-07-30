import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Clock, DollarSign, Search, Briefcase, Plus } from "lucide-react"

export default function JobsPage() {
  const jobs = [
    {
      title: "Drone Pilot for Agricultural Mapping",
      company: "AgriTech Solutions Rwanda",
      location: "Musanze",
      type: "Full-time",
      salary: "800,000 - 1,200,000 RWF",
      posted: "2 days ago",
      description:
        "Seeking experienced drone pilot for agricultural mapping projects across Northern Province. Must have RCAA certification and experience with multispectral imaging.",
      requirements: [
        "RCAA Drone Pilot License",
        "2+ years experience",
        "Agricultural knowledge preferred",
        "Own drone equipment",
      ],
      category: "Agriculture",
      urgent: false,
    },
    {
      title: "Aerial Photography Specialist",
      company: "SkyView Media",
      location: "Kigali",
      type: "Contract",
      salary: "Per project basis",
      posted: "1 day ago",
      description: "Looking for creative drone photographer for real estate and event photography. Portfolio required.",
      requirements: [
        "Professional photography experience",
        "High-quality drone equipment",
        "Portfolio of aerial work",
        "Flexible schedule",
      ],
      category: "Photography",
      urgent: true,
    },
    {
      title: "Construction Site Surveyor",
      company: "BuildRight Construction",
      location: "Kigali",
      type: "Part-time",
      salary: "600,000 - 800,000 RWF",
      posted: "3 days ago",
      description: "Part-time position for drone-based construction site surveying and progress monitoring.",
      requirements: [
        "Surveying background",
        "Drone mapping experience",
        "CAD software knowledge",
        "Available weekends",
      ],
      category: "Construction",
      urgent: false,
    },
    {
      title: "Drone Maintenance Technician",
      company: "Rwanda Drone Services",
      location: "Kigali",
      type: "Full-time",
      salary: "500,000 - 700,000 RWF",
      posted: "5 days ago",
      description: "Technical role maintaining and repairing various drone models. Electronics background required.",
      requirements: [
        "Electronics/Engineering degree",
        "Drone repair experience",
        "Problem-solving skills",
        "Tool proficiency",
      ],
      category: "Technical",
      urgent: false,
    },
    {
      title: "Wildlife Conservation Drone Operator",
      company: "Rwanda Wildlife Conservation",
      location: "Akagera National Park",
      type: "Contract",
      salary: "Competitive",
      posted: "1 week ago",
      description: "Operate drones for wildlife monitoring and anti-poaching efforts in national parks.",
      requirements: ["Conservation experience", "Long-range drone operation", "Wildlife knowledge", "Physical fitness"],
      category: "Conservation",
      urgent: false,
    },
    {
      title: "Drone Training Instructor",
      company: "Rwanda Aviation Academy",
      location: "Kigali",
      type: "Full-time",
      salary: "900,000 - 1,300,000 RWF",
      posted: "1 week ago",
      description: "Teach drone operation and safety courses. RCAA instructor certification required.",
      requirements: [
        "RCAA Instructor License",
        "Teaching experience",
        "Excellent communication",
        "Curriculum development",
      ],
      category: "Education",
      urgent: false,
    },
  ]

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Full-time":
        return "bg-green-100 text-green-800"
      case "Part-time":
        return "bg-blue-100 text-blue-800"
      case "Contract":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Agriculture":
        return "bg-emerald-100 text-emerald-800"
      case "Photography":
        return "bg-pink-100 text-pink-800"
      case "Construction":
        return "bg-orange-100 text-orange-800"
      case "Technical":
        return "bg-blue-100 text-blue-800"
      case "Conservation":
        return "bg-green-100 text-green-800"
      case "Education":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Job Board</h1>
          <p className="text-muted-foreground">Find drone-related career opportunities across Rwanda</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Post Job
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search jobs..." className="pl-10" />
        </div>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Job Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="full-time">Full-time</SelectItem>
            <SelectItem value="part-time">Part-time</SelectItem>
            <SelectItem value="contract">Contract</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            <SelectItem value="kigali">Kigali</SelectItem>
            <SelectItem value="musanze">Musanze</SelectItem>
            <SelectItem value="huye">Huye</SelectItem>
            <SelectItem value="rubavu">Rubavu</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="agriculture">Agriculture</SelectItem>
            <SelectItem value="photography">Photography</SelectItem>
            <SelectItem value="construction">Construction</SelectItem>
            <SelectItem value="technical">Technical</SelectItem>
            <SelectItem value="conservation">Conservation</SelectItem>
            <SelectItem value="education">Education</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Job Listings */}
      <div className="space-y-4">
        {jobs.map((job, index) => (
          <Card
            key={index}
            className={`hover:shadow-lg transition-shadow ${job.urgent ? "border-l-4 border-l-red-500" : ""}`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-xl">{job.title}</h3>
                      <p className="text-muted-foreground">{job.company}</p>
                    </div>
                    <div className="flex gap-2">
                      {job.urgent && (
                        <Badge variant="destructive" className="text-xs">
                          Urgent
                        </Badge>
                      )}
                      <Badge className={getTypeColor(job.type)}>{job.type}</Badge>
                      <Badge className={getCategoryColor(job.category)}>{job.category}</Badge>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {job.salary}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Posted {job.posted}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">{job.description}</p>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Requirements:</h4>
                    <div className="flex flex-wrap gap-1">
                      {job.requirements.map((req, reqIndex) => (
                        <Badge key={reqIndex} variant="outline" className="text-xs">
                          {req}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button>Apply Now</Button>
                  <Button variant="outline" size="sm">
                    Save Job
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <CardContent className="p-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Briefcase className="h-8 w-8 text-blue-600" />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-semibold">Looking to hire drone professionals?</h3>
              <p className="text-muted-foreground">
                Post your job and connect with qualified drone operators across Rwanda
              </p>
            </div>
          </div>
          <Button size="lg">Post a Job</Button>
        </CardContent>
      </Card>
    </div>
  )
}
