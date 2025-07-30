import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Clock, DollarSign, Building, Search, Plus } from "lucide-react"

export default function JobsPage() {
  const jobs = [
    {
      title: "Agricultural Drone Pilot",
      company: "Rwanda Agricultural Board",
      location: "Musanze District",
      type: "Full-time",
      salary: "800,000 - 1,200,000 RWF/month",
      description:
        "Seeking experienced drone pilot for agricultural monitoring and crop assessment across Northern Province farms.",
      requirements: ["RCAA Commercial License", "2+ years experience", "Agricultural knowledge preferred"],
      posted: "2 days ago",
      urgent: true,
      category: "Agriculture",
    },
    {
      title: "Aerial Photography Specialist",
      company: "Kigali Real Estate Group",
      location: "Kigali",
      type: "Contract",
      salary: "50,000 - 80,000 RWF/project",
      description: "Looking for skilled aerial photographer for real estate marketing and property documentation.",
      requirements: ["Professional photography portfolio", "Drone photography experience", "Video editing skills"],
      posted: "1 week ago",
      urgent: false,
      category: "Photography",
    },
    {
      title: "Infrastructure Inspection Pilot",
      company: "Rwanda Energy Group",
      location: "Multiple Locations",
      type: "Full-time",
      salary: "1,000,000 - 1,500,000 RWF/month",
      description: "Drone pilot needed for power line and infrastructure inspection across Rwanda's electrical grid.",
      requirements: [
        "Advanced pilot certification",
        "Infrastructure inspection experience",
        "Safety training certification",
      ],
      posted: "3 days ago",
      urgent: true,
      category: "Infrastructure",
    },
    {
      title: "Mapping & Surveying Technician",
      company: "Land Survey Solutions",
      location: "Huye",
      type: "Full-time",
      salary: "600,000 - 900,000 RWF/month",
      description: "Join our team for topographic mapping and land surveying projects using advanced drone technology.",
      requirements: ["Surveying background", "GIS software knowledge", "Drone mapping experience"],
      posted: "5 days ago",
      urgent: false,
      category: "Surveying",
    },
    {
      title: "Environmental Monitoring Specialist",
      company: "Rwanda Environment Management Authority",
      location: "Kigali",
      type: "Contract",
      salary: "1,200,000 - 1,800,000 RWF/month",
      description: "Environmental monitoring using drones for forest conservation and wildlife protection projects.",
      requirements: ["Environmental science background", "Research experience", "Data analysis skills"],
      posted: "1 day ago",
      urgent: false,
      category: "Environmental",
    },
    {
      title: "Drone Training Instructor",
      company: "Rwanda Aviation Academy",
      location: "Kigali",
      type: "Part-time",
      salary: "400,000 - 600,000 RWF/month",
      description: "Teach drone piloting and safety courses to new pilots seeking RCAA certification.",
      requirements: ["RCAA Instructor certification", "Teaching experience", "Excellent communication skills"],
      posted: "1 week ago",
      urgent: false,
      category: "Education",
    },
    {
      title: "Construction Site Monitoring",
      company: "Horizon Construction Ltd",
      location: "Rubavu",
      type: "Contract",
      salary: "60,000 - 100,000 RWF/day",
      description: "Document construction progress and conduct site surveys for major infrastructure projects.",
      requirements: ["Construction industry knowledge", "Progress monitoring experience", "Report writing skills"],
      posted: "4 days ago",
      urgent: false,
      category: "Construction",
    },
    {
      title: "Emergency Response Drone Operator",
      company: "Rwanda National Police",
      location: "Nationwide",
      type: "Full-time",
      salary: "900,000 - 1,300,000 RWF/month",
      description: "Support emergency response operations with drone surveillance and search & rescue missions.",
      requirements: ["Emergency response experience", "Night flying certification", "Physical fitness requirements"],
      posted: "6 days ago",
      urgent: true,
      category: "Emergency Services",
    },
  ]

  const categories = [
    "All Categories",
    "Agriculture",
    "Photography",
    "Infrastructure",
    "Surveying",
    "Environmental",
    "Education",
    "Construction",
    "Emergency Services",
  ]

  const jobTypes = ["All Types", "Full-time", "Part-time", "Contract", "Freelance"]

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Agriculture":
        return "bg-green-100 text-green-800"
      case "Photography":
        return "bg-pink-100 text-pink-800"
      case "Infrastructure":
        return "bg-blue-100 text-blue-800"
      case "Surveying":
        return "bg-purple-100 text-purple-800"
      case "Environmental":
        return "bg-emerald-100 text-emerald-800"
      case "Education":
        return "bg-orange-100 text-orange-800"
      case "Construction":
        return "bg-yellow-100 text-yellow-800"
      case "Emergency Services":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Job Board</h1>
          <p className="text-muted-foreground">Find drone-related job opportunities across Rwanda</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Post Job
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search jobs..." className="pl-10" />
        </div>
        <Select defaultValue="All Categories">
          <SelectTrigger className="w-full md:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select defaultValue="All Types">
          <SelectTrigger className="w-full md:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {jobTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
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
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-xl">{job.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{job.company}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {job.urgent && (
                        <Badge variant="destructive" className="text-xs">
                          Urgent
                        </Badge>
                      )}
                      <Badge className={getCategoryColor(job.category)}>{job.category}</Badge>
                    </div>
                  </div>

                  <p className="text-muted-foreground">{job.description}</p>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {job.type}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {job.salary}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Requirements:</h4>
                    <div className="flex flex-wrap gap-1">
                      {job.requirements.map((req, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {req}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <div className="text-sm text-muted-foreground">Posted {job.posted}</div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Save
                    </Button>
                    <Button size="sm">Apply Now</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <CardContent className="p-8 text-center">
          <h3 className="text-xl font-semibold mb-2">Looking to Hire Drone Professionals?</h3>
          <p className="text-muted-foreground mb-4">
            Post your job listing and connect with qualified drone pilots and specialists in Rwanda
          </p>
          <Button size="lg">Post a Job Listing</Button>
        </CardContent>
      </Card>
    </div>
  )
}
