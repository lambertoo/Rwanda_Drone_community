import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Download,
  ExternalLink,
  Heart,
  Share2,
  Eye,
  MessageSquare,
} from "lucide-react"
import Link from "next/link"

interface PageProps {
  params: {
    id: string
  }
}

export default function ProjectDetailsPage({ params }: PageProps) {
  const projectId = params.id

  // Mock project data - in real app this would come from database
  const project = {
    id: projectId,
    title: "Agricultural Monitoring System - Musanze District",
    description:
      "Comprehensive drone-based crop monitoring and analysis system for smallholder farmers in Musanze District, focusing on potato and maize cultivation optimization.",
    status: "Completed",
    category: "Agriculture",
    location: "Musanze District, Rwanda",
    duration: "6 months",
    startDate: "January 2024",
    endDate: "June 2024",
    funding: "World Bank Agriculture Innovation Fund",
    lead: {
      name: "Dr. Agnes Mukamana",
      role: "Project Lead",
      organization: "University of Rwanda - Agriculture",
      avatar: "/placeholder-user.jpg",
      email: "a.mukamana@ur.ac.rw",
    },
    stats: {
      views: 1234,
      likes: 89,
      comments: 23,
      downloads: 156,
    },
    overview: `# Project Overview

The Agricultural Monitoring System project represents a groundbreaking initiative to revolutionize farming practices in Rwanda's Musanze District through advanced drone technology and precision agriculture techniques.

## Objectives

### Primary Goals
- Implement comprehensive crop monitoring system using drone technology
- Provide real-time data analytics to improve farming decisions
- Increase crop yields by 25% through precision agriculture
- Train local farmers in modern agricultural techniques
- Establish sustainable monitoring protocols

### Secondary Goals
- Create employment opportunities for local drone operators
- Develop replicable model for other districts
- Build partnerships with agricultural cooperatives
- Promote climate-smart agriculture practices

## Project Scope

The project covers 2,500 hectares of agricultural land across 15 sectors in Musanze District, directly benefiting over 1,200 smallholder farmers. Our comprehensive approach includes:

- **Crop Health Monitoring**: Regular aerial surveys to assess plant health, identify diseases, and monitor growth patterns
- **Soil Analysis**: Multispectral imaging to analyze soil composition and moisture levels
- **Yield Prediction**: AI-powered analytics to forecast harvest yields and optimize planning
- **Pest Detection**: Early identification of pest infestations and disease outbreaks
- **Irrigation Optimization**: Water usage analysis and irrigation scheduling recommendations

## Technology Stack

### Hardware
- 12x DJI Matrice 300 RTK drones
- Multispectral cameras (MicaSense RedEdge-MX)
- Thermal imaging sensors
- Ground control stations
- Weather monitoring equipment

### Software
- Custom data processing pipeline
- Machine learning models for crop analysis
- Mobile applications for farmers
- Web-based dashboard for administrators
- Integration with existing agricultural databases

## Impact Metrics

The project has achieved significant measurable outcomes:
- **Crop Yield Increase**: Average 28% improvement in potato yields
- **Water Efficiency**: 35% reduction in water usage through optimized irrigation
- **Early Detection**: 90% success rate in early pest/disease identification
- **Farmer Adoption**: 85% of participating farmers continue using the system
- **Cost Reduction**: 20% decrease in input costs through precision application`,

    methodology: `# Methodology

## Research Approach

Our methodology combines cutting-edge drone technology with traditional agricultural knowledge, creating a comprehensive monitoring system that respects local farming practices while introducing modern efficiency.

### Phase 1: Baseline Assessment (Month 1-2)
- Comprehensive field surveys and soil sampling
- Farmer interviews and needs assessment
- Historical yield data collection
- Establishment of control groups
- Drone flight pattern optimization

### Phase 2: System Implementation (Month 3-4)
- Drone deployment and calibration
- Installation of ground sensors
- Training of local operators
- Development of data processing workflows
- Integration with existing agricultural systems

### Phase 3: Data Collection (Month 3-6)
- Weekly aerial surveys during growing season
- Continuous soil and weather monitoring
- Real-time data processing and analysis
- Regular farmer feedback sessions
- System optimization based on field results

## Data Collection Protocols

### Flight Operations
- **Frequency**: Bi-weekly flights during growing season
- **Altitude**: 120 meters AGL for optimal resolution
- **Overlap**: 80% forward, 70% side overlap for accurate mapping
- **Weather Conditions**: Flights conducted in optimal weather (wind <15 km/h, clear skies)
- **Ground Control Points**: Minimum 5 GCPs per 100 hectares for accuracy

### Sensor Configuration
- **RGB Imaging**: High-resolution visual documentation
- **Multispectral**: 5-band analysis (Blue, Green, Red, Red Edge, NIR)
- **Thermal**: Soil moisture and plant stress detection
- **LiDAR**: Terrain modeling and canopy height measurement

### Data Processing Pipeline
1. **Image Preprocessing**: Radiometric calibration and geometric correction
2. **Orthomosaic Generation**: Creation of seamless field maps
3. **Index Calculation**: NDVI, NDRE, GNDVI, and custom vegetation indices
4. **Change Detection**: Temporal analysis of crop development
5. **AI Analysis**: Machine learning models for pattern recognition
6. **Report Generation**: Automated insights and recommendations

## Quality Assurance

### Accuracy Validation
- Ground truth measurements for 10% of surveyed areas
- Cross-validation with satellite imagery
- Comparison with traditional assessment methods
- Regular calibration of sensors and equipment
- Independent verification by agricultural experts

### Data Management
- Secure cloud storage with redundancy
- Version control for all datasets
- Metadata documentation for reproducibility
- Privacy protection for farmer information
- Long-term data preservation protocols`,

    results: `# Results and Outcomes

## Quantitative Results

### Crop Yield Improvements
- **Potato Yields**: Increased from 18 tons/ha to 23 tons/ha (28% improvement)
- **Maize Yields**: Increased from 3.2 tons/ha to 4.1 tons/ha (28% improvement)
- **Bean Yields**: Increased from 1.8 tons/ha to 2.3 tons/ha (28% improvement)

### Resource Efficiency
- **Water Usage**: 35% reduction through precision irrigation scheduling
- **Fertilizer Application**: 25% reduction while maintaining yield increases
- **Pesticide Usage**: 40% reduction through targeted application
- **Labor Efficiency**: 20% reduction in field inspection time

### Economic Impact
- **Average Income Increase**: $340 per farmer per season
- **Return on Investment**: 3.2:1 for participating farmers
- **Cost Savings**: $125 per hectare in reduced inputs
- **Market Access**: 60% of farmers gained access to premium markets

## Qualitative Outcomes

### Farmer Adoption and Satisfaction
- **Technology Acceptance**: 85% of farmers continue using the system
- **Satisfaction Rate**: 92% report improved farming confidence
- **Knowledge Transfer**: 78% of farmers trained others in their community
- **Behavioral Change**: 70% adopted at least 3 new practices

### Capacity Building
- **Local Operators Trained**: 24 community members certified as drone operators
- **Extension Workers**: 15 agricultural extension workers trained in drone technology
- **Farmer Groups**: 8 cooperatives integrated the system into their operations
- **Youth Engagement**: 35 young farmers became technology champions

### Environmental Benefits
- **Soil Health**: Improved soil organic matter by 15% on average
- **Biodiversity**: Increased beneficial insect populations by 22%
- **Carbon Sequestration**: Estimated 2.3 tons CO2/ha additional sequestration
- **Water Quality**: Reduced agricultural runoff by 30%

## Challenges and Lessons Learned

### Technical Challenges
- **Weather Dependency**: Rainy season limited flight operations
- **Battery Life**: Required multiple battery sets for large area coverage
- **Data Processing**: Initial delays in processing large datasets
- **Connectivity**: Limited internet connectivity in remote areas

### Solutions Implemented
- **Weather Monitoring**: Integrated weather stations for flight planning
- **Power Management**: Solar charging stations for remote operations
- **Edge Computing**: Local processing capabilities to reduce data transfer
- **Offline Capabilities**: Mobile apps function without internet connectivity

### Scaling Considerations
- **Cost Optimization**: Identified opportunities to reduce per-hectare costs by 40%
- **Training Standardization**: Developed standardized training modules
- **Equipment Maintenance**: Established local maintenance and repair capabilities
- **Sustainability**: Created revenue models for long-term operation

## Future Recommendations

### Short-term (6-12 months)
- Expand to additional 1,000 hectares in Musanze
- Integrate with national agricultural database
- Develop mobile payment integration for services
- Establish equipment leasing program

### Medium-term (1-3 years)
- Replicate model in 5 additional districts
- Develop AI models for additional crop types
- Create farmer-to-farmer knowledge sharing platform
- Establish regional training center

### Long-term (3-5 years)
- Scale to national level with government partnership
- Integrate with climate change adaptation strategies
- Develop export market linkages
- Create regional center of excellence for precision agriculture`,

    gallery: [
      {
        url: "/placeholder.svg?height=400&width=600&text=Drone+Survey+Flight",
        caption: "DJI Matrice 300 RTK conducting multispectral survey over potato fields",
        type: "image",
      },
      {
        url: "/placeholder.svg?height=400&width=600&text=NDVI+Analysis",
        caption: "NDVI analysis showing crop health variations across the field",
        type: "image",
      },
      {
        url: "/placeholder.svg?height=400&width=600&text=Farmer+Training",
        caption: "Local farmers receiving training on interpreting drone data",
        type: "image",
      },
      {
        url: "/placeholder.svg?height=400&width=600&text=Yield+Comparison",
        caption: "Before and after yield comparison showing 28% improvement",
        type: "image",
      },
      {
        url: "/placeholder.svg?height=400&width=600&text=Thermal+Imaging",
        caption: "Thermal imaging revealing irrigation efficiency patterns",
        type: "image",
      },
      {
        url: "/placeholder.svg?height=400&width=600&text=Team+Photo",
        caption: "Project team with local farmers and cooperative leaders",
        type: "image",
      },
    ],

    team: [
      {
        name: "Dr. Agnes Mukamana",
        role: "Project Lead",
        organization: "University of Rwanda",
        avatar: "/placeholder-user.jpg",
        expertise: "Agricultural Engineering, Precision Agriculture",
        bio: "Leading researcher in precision agriculture with 15+ years experience in agricultural technology implementation.",
      },
      {
        name: "Jean Baptiste Nzeyimana",
        role: "Drone Operations Manager",
        organization: "Rwanda Drone Academy",
        avatar: "/placeholder-user.jpg",
        expertise: "UAV Operations, Remote Sensing",
        bio: "Certified drone pilot with extensive experience in agricultural surveying and multispectral imaging operations.",
      },
      {
        name: "Sarah Uwimana",
        role: "Data Scientist",
        organization: "Rwanda ICT Chamber",
        avatar: "/placeholder-user.jpg",
        expertise: "Machine Learning, Agricultural Analytics",
        bio: "Specialist in AI applications for agriculture with focus on crop yield prediction and optimization algorithms.",
      },
      {
        name: "Emmanuel Habimana",
        role: "Field Coordinator",
        organization: "Musanze Agricultural Cooperative",
        avatar: "/placeholder-user.jpg",
        expertise: "Farmer Engagement, Local Agriculture",
        bio: "Local agricultural expert with deep understanding of farming practices and community engagement in Musanze District.",
      },
      {
        name: "Dr. Michael Thompson",
        role: "Technical Advisor",
        organization: "World Bank",
        avatar: "/placeholder-user.jpg",
        expertise: "Agricultural Development, Project Management",
        bio: "International development specialist with 20+ years experience in agricultural technology projects across Africa.",
      },
    ],

    downloads: [
      {
        name: "Final Project Report",
        description: "Comprehensive 85-page report detailing methodology, results, and recommendations",
        size: "12.3 MB",
        format: "PDF",
        downloads: 89,
      },
      {
        name: "Dataset - Crop Yield Analysis",
        description: "Complete dataset with yield measurements, weather data, and drone imagery analysis",
        size: "245 MB",
        format: "CSV/ZIP",
        downloads: 34,
      },
      {
        name: "Drone Flight Logs",
        description: "Detailed flight logs and metadata for all 156 survey missions",
        size: "8.7 MB",
        format: "JSON",
        downloads: 23,
      },
      {
        name: "Training Materials",
        description: "Farmer training guides and presentation materials in Kinyarwanda and English",
        size: "45 MB",
        format: "PDF/PPT",
        downloads: 67,
      },
      {
        name: "Software Tools",
        description: "Custom analysis tools and mobile applications developed for the project",
        size: "156 MB",
        format: "APK/EXE",
        downloads: 45,
      },
    ],
  }

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center gap-4">
        <Link href="/projects">
          <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Button>
        </Link>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/projects" className="hover:text-foreground">
            Projects
          </Link>
          <span>/</span>
          <span>Project Details</span>
        </div>
      </div>

      {/* Project Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline">{project.category}</Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {project.status}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold mb-4">{project.title}</h1>
              <p className="text-lg text-muted-foreground mb-4">{project.description}</p>

              {/* Project Meta */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span>
                    {project.startDate} - {project.endDate}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-red-600" />
                  <span>{project.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span>Led by {project.lead.name}</span>
                </div>
              </div>
            </div>

            {/* Project Stats */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {project.stats.views}
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  {project.stats.likes}
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  {project.stats.comments}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                  <Heart className="h-4 w-4" />
                  Like
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Project Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="methodology">Methodology</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap">{project.overview}</div>
              </div>
            </CardContent>
          </Card>

          {/* Project Details */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">{project.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Funding:</span>
                  <span className="font-medium">{project.funding}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {project.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project Lead</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={project.lead.avatar || "/placeholder.svg"} alt={project.lead.name} />
                    <AvatarFallback>
                      {project.lead.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">{project.lead.name}</h4>
                    <p className="text-sm text-blue-600 mb-1">{project.lead.role}</p>
                    <p className="text-sm text-muted-foreground mb-2">{project.lead.organization}</p>
                    <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                      <ExternalLink className="h-3 w-3" />
                      Contact
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="methodology">
          <Card>
            <CardContent className="p-6">
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap">{project.methodology}</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardContent className="p-6">
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap">{project.results}</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gallery" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {project.gallery.map((item, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="aspect-video bg-gray-100">
                  <img src={item.url || "/placeholder.svg"} alt={item.caption} className="w-full h-full object-cover" />
                </div>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">{item.caption}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {project.team.map((member, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                      <AvatarFallback>
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{member.name}</h4>
                      <p className="text-blue-600 mb-1">{member.role}</p>
                      <p className="text-sm text-muted-foreground mb-2">{member.organization}</p>
                      <p className="text-sm font-medium mb-2">{member.expertise}</p>
                      <p className="text-sm leading-relaxed">{member.bio}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Downloads Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Project Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {project.downloads.map((download, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold">{download.name}</h4>
                  <p className="text-sm text-muted-foreground mb-1">{download.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{download.size}</span>
                    <span>{download.format}</span>
                    <span>{download.downloads} downloads</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
