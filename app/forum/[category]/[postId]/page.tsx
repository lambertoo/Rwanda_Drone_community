import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Heart, MessageSquare, Share2, Bookmark, Flag, ThumbsUp, Calendar, Eye } from "lucide-react"
import Link from "next/link"

interface PageProps {
  params: {
    category: string
    postId: string
  }
}

export default function ForumPostPage({ params }: PageProps) {
  const { category, postId } = params

  // Mock post data - in real app this would come from database
  const post = {
    id: postId,
    title: "Complete Guide to RCAA Drone Registration in Rwanda - Updated 2024",
    content: `# Complete Guide to RCAA Drone Registration in Rwanda

Fellow drone enthusiasts! After helping dozens of pilots navigate the RCAA registration process, I've compiled this comprehensive guide to make it easier for everyone.

## Why Register Your Drone?

The Rwanda Civil Aviation Authority (RCAA) requires all drones weighing over 250g to be registered. This isn't just bureaucracy - it's about:
- **Safety**: Ensuring all pilots understand airspace regulations
- **Accountability**: Creating a system for responsible drone operation
- **Integration**: Preparing Rwanda for advanced drone operations like delivery services

## Step-by-Step Registration Process

### Step 1: Gather Required Documents
- **National ID or Passport** (copy)
- **Drone specifications** (weight, model, serial number)
- **Insurance certificate** (minimum 50 million RWF coverage)
- **Training certificate** (from RCAA-approved training center)

### Step 2: Complete Online Application
1. Visit the RCAA website: www.rcaa.gov.rw
2. Navigate to "Drone Registration" section
3. Create an account with your email
4. Fill out the application form completely
5. Upload all required documents (PDF format, max 5MB each)

### Step 3: Pay Registration Fees
- **Individual registration**: 25,000 RWF
- **Commercial registration**: 100,000 RWF
- **Payment methods**: Bank transfer or mobile money

### Step 4: Schedule Inspection (Commercial Only)
For commercial operations, RCAA will schedule a physical inspection of your drone and equipment.

### Step 5: Receive Certificate
Processing time is typically 10-15 business days. You'll receive:
- Digital certificate via email
- Physical certificate by mail
- Unique registration number for your drone

## Common Mistakes to Avoid

❌ **Incomplete documentation** - Double-check all requirements
❌ **Wrong insurance coverage** - Must be aviation-specific insurance
❌ **Expired training certificates** - Renew before applying
❌ **Incorrect drone specifications** - Match exactly with manufacturer specs

## Pro Tips from Experience

✅ **Apply early** - Don't wait until you need to fly
✅ **Keep copies** - Scan everything before submitting
✅ **Follow up** - Check application status regularly
✅ **Join training** - Even if experienced, official training is required

## Training Centers in Rwanda

1. **Rwanda Drone Academy** (Kigali)
   - Location: Kimisagara, Nyarugenge
   - Contact: +250 788 123 456
   - Duration: 3 days
   - Cost: 150,000 RWF

2. **Aviation Training Institute** (Kigali)
   - Location: Kanombe, Kicukiro
   - Contact: +250 788 654 321
   - Duration: 5 days
   - Cost: 200,000 RWF

## Insurance Providers

- **SONARWA**: Comprehensive drone insurance packages
- **Radiant Insurance**: Competitive rates for commercial operators
- **INYANGAMUGAYO**: Specialized aviation insurance

## Renewal Process

Registration is valid for 2 years. Renewal requires:
- Updated insurance certificate
- Proof of continued training
- Payment of renewal fees (50% of original cost)

## Contact Information

**RCAA Drone Department**
- Email: drones@rcaa.gov.rw
- Phone: +250 252 502 000
- Office Hours: Monday-Friday, 8:00 AM - 5:00 PM

## Conclusion

The registration process might seem daunting, but it's straightforward once you understand the requirements. The RCAA staff are helpful and responsive to questions.

Remember: Flying an unregistered drone over 250g is illegal and can result in fines up to 2 million RWF and confiscation of equipment.

Happy flying, and welcome to the registered drone community in Rwanda! 🚁

---

*Last updated: March 2024*
*Have questions? Drop them in the comments below!*`,
    author: {
      name: "Jean Claude Uwimana",
      username: "DroneExpert_RW",
      avatar: "/placeholder-user.jpg",
      reputation: 2847,
      joinDate: "January 2022",
      posts: 156,
      isVerified: true,
    },
    category: "Regulations",
    tags: ["RCAA", "Registration", "Legal", "Guide", "Rwanda"],
    stats: {
      views: 1234,
      likes: 89,
      replies: 23,
      bookmarks: 45,
    },
    createdAt: "2024-03-10T10:30:00Z",
    isPinned: true,
    isLocked: false,
  }

  const replies = [
    {
      id: "1",
      content: `Excellent guide! I just completed my registration last week following these steps and it was smooth. 

One additional tip: Make sure your insurance certificate specifically mentions "drone operations" or "UAV coverage". Generic liability insurance won't be accepted.

Also, the RCAA staff at Kanombe are very helpful if you need to visit in person.`,
      author: {
        name: "Marie Mukamana",
        username: "SkyPilot_RW",
        avatar: "/placeholder-user.jpg",
        reputation: 1456,
        joinDate: "March 2022",
        posts: 89,
      },
      createdAt: "2024-03-10T14:20:00Z",
      likes: 12,
      replies: [
        {
          id: "1-1",
          content:
            "Thanks for the insurance tip! I was about to submit with my general business insurance. Saved me a rejection!",
          author: {
            name: "David Nkurunziza",
            username: "NewPilot_KGL",
            avatar: "/placeholder-user.jpg",
            reputation: 234,
            joinDate: "February 2024",
            posts: 12,
          },
          createdAt: "2024-03-10T15:45:00Z",
          likes: 3,
        },
      ],
    },
    {
      id: "2",
      content: `Great comprehensive guide! 

Quick question: Do I need to register each drone individually if I have multiple drones? I have 3 different models for my photography business.

Also, has anyone tried the mobile money payment option? Is it instant or does it take time to process?`,
      author: {
        name: "Patrick Habimana",
        username: "AerialPhoto_RW",
        avatar: "/placeholder-user.jpg",
        reputation: 892,
        joinDate: "June 2023",
        posts: 45,
      },
      createdAt: "2024-03-10T16:10:00Z",
      likes: 8,
      replies: [
        {
          id: "2-1",
          content: `Yes, each drone needs individual registration. I have 4 drones registered and each has its own certificate and registration number.

Mobile money payment is usually instant, but I recommend keeping the transaction receipt as proof until the payment reflects in their system.`,
          author: {
            name: "Jean Claude Uwimana",
            username: "DroneExpert_RW",
            avatar: "/placeholder-user.jpg",
            reputation: 2847,
            joinDate: "January 2022",
            posts: 156,
            isVerified: true,
          },
          createdAt: "2024-03-10T17:30:00Z",
          likes: 15,
        },
      ],
    },
    {
      id: "3",
      content: `This is incredibly helpful! I've been putting off registration for months because I thought it would be complicated.

One question about the training requirement: I'm already a certified pilot from the US. Do I still need to take the local training, or can I get an exemption?`,
      author: {
        name: "Sarah Johnson",
        username: "USPilot_RW",
        avatar: "/placeholder-user.jpg",
        reputation: 567,
        joinDate: "January 2024",
        posts: 23,
      },
      createdAt: "2024-03-11T09:15:00Z",
      likes: 6,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center gap-4">
        <Link href={`/forum/${category}`}>
          <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
            <ArrowLeft className="h-4 w-4" />
            Back to {category}
          </Button>
        </Link>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/forum" className="hover:text-foreground">
            Forum
          </Link>
          <span>/</span>
          <Link href={`/forum/${category}`} className="hover:text-foreground capitalize">
            {category}
          </Link>
          <span>/</span>
          <span>Post</span>
        </div>
      </div>

      {/* Post Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline">{post.category}</Badge>
                {post.isPinned && <Badge className="bg-yellow-100 text-yellow-800">Pinned</Badge>}
                {post.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
              <h1 className="text-2xl font-bold mb-4">{post.title}</h1>

              {/* Author Info */}
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={post.author.avatar || "/placeholder.svg"} alt={post.author.name} />
                  <AvatarFallback>
                    {post.author.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{post.author.name}</span>
                    {post.author.isVerified && <Badge className="text-xs bg-blue-100 text-blue-800">Verified</Badge>}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    @{post.author.username} • {post.author.reputation} reputation • {post.author.posts} posts
                  </div>
                </div>
              </div>
            </div>

            {/* Post Stats */}
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {post.stats.views}
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  {post.stats.likes}
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  {post.stats.replies}
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <Calendar className="h-3 w-3" />
                {new Date(post.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Post Content */}
      <Card>
        <CardContent className="p-6">
          <div className="prose prose-sm max-w-none mb-6">
            <div className="whitespace-pre-wrap">{post.content}</div>
          </div>

          <Separator className="my-6" />

          {/* Post Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                <Heart className="h-4 w-4" />
                Like ({post.stats.likes})
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                <MessageSquare className="h-4 w-4" />
                Reply
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                <Bookmark className="h-4 w-4" />
                Save
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                <Flag className="h-4 w-4" />
                Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reply Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add a Reply</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea placeholder="Share your thoughts, ask questions, or provide additional information..." rows={4} />
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Be respectful and constructive in your responses</div>
            <Button>Post Reply</Button>
          </div>
        </CardContent>
      </Card>

      {/* Replies */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Replies ({replies.length})</h2>
        {replies.map((reply) => (
          <Card key={reply.id}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={reply.author.avatar || "/placeholder.svg"} alt={reply.author.name} />
                  <AvatarFallback>
                    {reply.author.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">{reply.author.name}</span>
                    <span className="text-sm text-muted-foreground">@{reply.author.username}</span>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(reply.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="prose prose-sm max-w-none mb-4">
                    <p className="whitespace-pre-wrap">{reply.content}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" className="flex items-center gap-2 h-8 px-2">
                      <ThumbsUp className="h-3 w-3" />
                      {reply.likes}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 px-2">
                      Reply
                    </Button>
                  </div>

                  {/* Nested Replies */}
                  {reply.replies && reply.replies.length > 0 && (
                    <div className="mt-4 pl-4 border-l-2 border-gray-200 space-y-4">
                      {reply.replies.map((nestedReply) => (
                        <div key={nestedReply.id} className="flex items-start gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={nestedReply.author.avatar || "/placeholder.svg"}
                              alt={nestedReply.author.name}
                            />
                            <AvatarFallback>
                              {nestedReply.author.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{nestedReply.author.name}</span>
                              <span className="text-xs text-muted-foreground">@{nestedReply.author.username}</span>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(nestedReply.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm mb-2">{nestedReply.content}</p>
                            <div className="flex items-center gap-3">
                              <Button variant="ghost" size="sm" className="flex items-center gap-1 h-6 px-2 text-xs">
                                <ThumbsUp className="h-3 w-3" />
                                {nestedReply.likes}
                              </Button>
                              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                                Reply
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
