'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle, XCircle, AlertTriangle, Eye, Clock, ExternalLink } from 'lucide-react';
import { Star } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';

interface PublishedItem {
  id: string;
  title: string;
  description?: string;
  author: {
    name: string;
    email: string;
  };
  category?: {
    name: string;
  };
  createdAt: string;
  type: 'forum' | 'project' | 'event' | 'resource' | 'opportunity' | 'service';
}

interface PublishedData {
  success: boolean;
  data: {
    forumPosts: any[];
    projects: any[];
    events: any[];
    resources: any[];
    opportunities: any[];
    services: any[];
  };
  counts: {
    forum: number;
    project: number;
    event: number;
    resource: number;
    opportunity: number;
    service: number;
  };
}

export default function ReviewContentsPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [publishedItems, setPublishedItems] = useState<PublishedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<any>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const fetchPublishedItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/review-contents', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch published items');
      }
      
      const data = await response.json();
      setPublishedItems(data);
    } catch (error) {
      console.error('Error fetching published items:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch published items',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (type: string, id: string, action: 'unapprove' | 'approve') => {
    try {
      setActionLoading(`${type}-${id}-${action}`);
      
      // Map plural types to singular for API
      const typeMap: { [key: string]: string } = {
        'forumPosts': 'forum',
        'projects': 'project',
        'events': 'event',
        'resources': 'resource',
        'opportunities': 'opportunity',
        'services': 'service'
      };
      
      const apiType = typeMap[type] || type;
      
      const response = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ type: apiType, id, action }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${action} item`);
      }

      toast({
        title: 'Success',
        description: `Item ${action === 'unapprove' ? 'unpublished' : 'approved'} successfully`,
      });

      // Refresh the published items
      await fetchPublishedItems();
    } catch (error) {
      console.error(`Error ${action}ing item:`, error);
      toast({
        title: 'Error',
        description: `Failed to ${action === 'unapprove' ? 'unpublish' : 'approve'} item: ${error}`,
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleFeatureToggle = async (type: string, id: string, currentFeatured: boolean) => {
    try {
      setActionLoading(`${type}-${id}-feature`)

      const typeMap: { [key: string]: string } = {
        'forumPosts': 'forum',
        'projects': 'project',
        'events': 'event',
        'resources': 'resource',
        'opportunities': 'opportunity',
        'services': 'service'
      }

      const apiType = typeMap[type] || type

      const response = await fetch('/api/admin/feature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ type: apiType, id, featured: !currentFeatured })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to toggle feature')
      }

      toast({ title: 'Success', description: `Item ${!currentFeatured ? 'featured' : 'unfeatured'} successfully` })
      await fetchPublishedItems()
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to toggle feature', variant: 'destructive' })
    } finally {
      setActionLoading(null)
    }
  }

  const handlePreview = (item: any, type: string) => {
    setPreviewItem({ ...item, type });
    setPreviewOpen(true);
  };

  const renderPreviewContent = (item: any) => {
    if (!item) return null;

    switch (item.type) {
      case 'forumPosts':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Content:</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{item.content}</p>
            </div>
            {item.tags && item.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold">Tags:</h3>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'projects':
        return (
          <div className="space-y-6">
            {item.fullDescription && (
              <div>
                <h3 className="text-lg font-semibold">Full Description:</h3>
                <p className="text-gray-700">{item.fullDescription}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {item.location && (
                <div>
                  <h3 className="text-lg font-semibold">Location:</h3>
                  <p className="text-gray-700">{item.location}</p>
                </div>
              )}
              {item.duration && (
                <div>
                  <h3 className="text-lg font-semibold">Duration:</h3>
                  <p className="text-gray-700">{item.duration}</p>
                </div>
              )}
              {item.startDate && (
                <div>
                  <h3 className="text-lg font-semibold">Start Date:</h3>
                  <p className="text-gray-700">{item.startDate}</p>
                </div>
              )}
              {item.endDate && (
                <div>
                  <h3 className="text-lg font-semibold">End Date:</h3>
                  <p className="text-gray-700">{item.endDate}</p>
                </div>
              )}
              {item.funding && (
                <div>
                  <h3 className="text-lg font-semibold">Funding:</h3>
                  <p className="text-gray-700">{item.funding}</p>
                </div>
              )}
              {item.status && (
                <div>
                  <h3 className="text-lg font-semibold">Status:</h3>
                  <Badge variant="outline" className="capitalize">{item.status}</Badge>
                </div>
              )}
            </div>

            {item.objectives && item.objectives.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold">Objectives:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  {item.objectives.map((obj: string, index: number) => (
                    <li key={index}>{obj}</li>
                  ))}
                </ul>
              </div>
            )}

            {item.challenges && item.challenges.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold">Challenges:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  {item.challenges.map((challenge: string, index: number) => (
                    <li key={index}>{challenge}</li>
                  ))}
                </ul>
              </div>
            )}

            {item.outcomes && item.outcomes.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold">Outcomes:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  {item.outcomes.map((outcome: string, index: number) => (
                    <li key={index}>{outcome}</li>
                  ))}
                </ul>
              </div>
            )}

            {item.methodology && (
              <div>
                <h3 className="text-lg font-semibold">Methodology:</h3>
                <p className="text-gray-700">{item.methodology}</p>
              </div>
            )}

            {item.results && (
              <div>
                <h3 className="text-lg font-semibold">Results:</h3>
                <p className="text-gray-700">{item.results}</p>
              </div>
            )}

            {item.technologies && item.technologies.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold">Technologies:</h3>
                <div className="flex flex-wrap gap-2">
                  {item.technologies.map((tech: string, index: number) => (
                    <Badge key={index} variant="outline">{tech}</Badge>
                  ))}
                </div>
              </div>
            )}

            {item.teamMembers && item.teamMembers.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold">Team Members:</h3>
                <div className="space-y-3">
                  {item.teamMembers.map((member: any, index: number) => (
                    <div key={index} className="border rounded-lg p-3 bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{member.name}</h4>
                        {member.projectLead && (
                          <Badge variant="default" className="text-xs">Project Lead</Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        {member.role && (
                          <div><strong>Role:</strong> {member.role}</div>
                        )}
                        {member.email && (
                          <div><strong>Email:</strong> {member.email}</div>
                        )}
                        {member.organization && (
                          <div><strong>Organization:</strong> {member.organization}</div>
                        )}
                        {member.expertise && (
                          <div><strong>Expertise:</strong> {member.expertise}</div>
                        )}
                      </div>
                      {member.bio && (
                        <p className="text-sm text-gray-600 mt-2">{member.bio}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {item.resources && item.resources.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold">Resources:</h3>
                <div className="space-y-2">
                  {item.resources.map((resource: any, index: number) => (
                    <div key={index} className="border rounded-lg p-3 bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{resource.title}</h4>
                        <a 
                          href={resource.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 hover:underline flex items-center gap-1 text-sm"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Download
                        </a>
                      </div>
                      {resource.description && (
                        <p className="text-sm text-gray-600">{resource.description}</p>
                      )}
                      <div className="flex gap-4 text-xs text-gray-500 mt-2">
                        {resource.type && <span>Type: {resource.type}</span>}
                        {resource.size && <span>Size: {Math.round(resource.size / 1024)} KB</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {item.gallery && item.gallery.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold">Gallery:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {item.gallery.map((image: any, index: number) => (
                    <div key={index} className="relative">
                      <img 
                        src={image.url} 
                        alt={image.caption || 'Gallery image'} 
                        className="w-full h-48 object-cover rounded-lg" 
                      />
                      {image.caption && (
                        <p className="text-sm text-gray-600 mt-2">{image.caption}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'events':
        return (
          <div className="space-y-4">
            {item.fullDescription && (
              <div>
                <h3 className="text-lg font-semibold">Full Description:</h3>
                <p className="text-gray-700">{item.fullDescription}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold">Start Date:</h3>
                <p className="text-gray-700">{new Date(item.startDate).toLocaleString()}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold">End Date:</h3>
                <p className="text-gray-700">{new Date(item.endDate).toLocaleString()}</p>
              </div>
            </div>
            {item.location && (
              <div>
                <h3 className="text-lg font-semibold">Location:</h3>
                <p className="text-gray-700">{item.location}</p>
              </div>
            )}
            {item.venue && (
              <div>
                <h3 className="text-lg font-semibold">Venue:</h3>
                <p className="text-gray-700">{item.venue}</p>
              </div>
            )}
          </div>
        );

      case 'resources':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">File:</h3>
              <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                {item.fileUrl.split('/').pop()}
              </a>
            </div>
            <div>
              <h3 className="text-lg font-semibold">File Type:</h3>
              <p className="text-gray-700">{item.fileType}</p>
            </div>
            {item.fileSize && (
              <div>
                <h3 className="text-lg font-semibold">File Size:</h3>
                <p className="text-gray-700">{item.fileSize}</p>
              </div>
            )}
          </div>
        );

      case 'opportunities':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold">Company:</h3>
                <p className="text-gray-700">{item.company}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Type:</h3>
                <p className="text-gray-700 capitalize">{item.opportunityType}</p>
              </div>
            </div>
            {item.location && (
              <div>
                <h3 className="text-lg font-semibold">Location:</h3>
                <p className="text-gray-700">{item.location}</p>
              </div>
            )}
            {item.salary && (
              <div>
                <h3 className="text-lg font-semibold">Salary:</h3>
                <p className="text-gray-700">{item.salary}</p>
              </div>
            )}
            {item.requirements && (
              <div>
                <h3 className="text-lg font-semibold">Requirements:</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{item.requirements}</p>
              </div>
            )}
            {item.applicationDeadline && (
              <div>
                <h3 className="text-lg font-semibold">Application Deadline:</h3>
                <p className="text-gray-700">{new Date(item.applicationDeadline).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        );

      case 'services':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold">Service Type:</h3>
                <p className="text-gray-700 capitalize">{item.serviceType}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Location:</h3>
                <p className="text-gray-700">{item.location}</p>
              </div>
            </div>
            {item.price && (
              <div>
                <h3 className="text-lg font-semibold">Price:</h3>
                <p className="text-gray-700">{item.price}</p>
              </div>
            )}
            {item.availability && (
              <div>
                <h3 className="text-lg font-semibold">Availability:</h3>
                <p className="text-gray-700">{item.availability}</p>
              </div>
            )}
            {item.experience && (
              <div>
                <h3 className="text-lg font-semibold">Experience:</h3>
                <p className="text-gray-700">{item.experience}</p>
              </div>
            )}
          </div>
        );

      default:
        return <p className="text-gray-700">No preview available for this content type.</p>;
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin' && !authLoading) {
      fetchPublishedItems();
    }
  }, [user, authLoading]);

  if (authLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">
                You need admin privileges to access this page.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'forum': return '💬';
      case 'project': return '🚁';
      case 'event': return '📅';
      case 'resource': return '📄';
      case 'opportunity': return '💼';
      case 'service': return '🔧';
      default: return '📝';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'forum': return 'bg-blue-100 text-blue-800';
      case 'project': return 'bg-green-100 text-green-800';
      case 'event': return 'bg-purple-100 text-purple-800';
      case 'resource': return 'bg-orange-100 text-orange-800';
      case 'opportunity': return 'bg-yellow-100 text-yellow-800';
      case 'service': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderPublishedItems = (items: any[], type: string) => {
    if (!items || items.length === 0) {
      return (
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No published items</h3>
          <p className="text-muted-foreground">
            No {type} items are currently published.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {items.map((item) => (
          <Card key={item.id} className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{getTypeIcon(type)}</span>
                    <Badge className={getTypeColor(type)}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Badge>
                    {item.category && (
                      <Badge variant="outline">{item.category.name}</Badge>
                    )}
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Published
                    </Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{item.title}</CardTitle>
                  {item.description && (
                    <CardDescription className="line-clamp-2 mt-1">
                      {item.description}
                    </CardDescription>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>By {item.author?.fullName || item.author?.username || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                  {item.approvedAt && (
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      <span>Approved {new Date(item.approvedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePreview(item, type)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Preview
                  </Button>
                  {['projects','events','services','opportunities'].includes(type) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleFeatureToggle(type, item.id, item.isFeatured || false)}
                      disabled={actionLoading === `${type}-${item.id}-feature`}
                      className={item.isFeatured ? 'text-yellow-600 hover:text-yellow-700' : ''}
                    >
                      <Star className={`w-4 h-4 mr-1 ${item.isFeatured ? 'fill-yellow-400' : ''}`} />
                      {item.isFeatured ? 'Unfeature' : 'Feature'}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAction(type, item.id, 'unapprove')}
                    disabled={actionLoading === `${type}-${item.id}-unapprove`}
                    className="text-orange-600 hover:text-orange-700"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Unpublish
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const totalPublished = publishedItems ? Object.values(publishedItems.counts).reduce((sum, count) => sum + count, 0) : 0;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Review Published Content</h1>
        <p className="text-muted-foreground mt-2">
          Review and manage already published content. You can unpublish content to remove it from public view.
        </p>
        {publishedItems && (
          <div className="flex items-center gap-4 mt-4">
            <Badge variant="outline" className="text-lg px-3 py-1">
              Total Published: {totalPublished}
            </Badge>
          </div>
        )}
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="all">
            All ({totalPublished})
          </TabsTrigger>
          <TabsTrigger value="forum">
            Forum ({publishedItems?.counts.forum || 0})
          </TabsTrigger>
          <TabsTrigger value="projects">
            Projects ({publishedItems?.counts.project || 0})
          </TabsTrigger>
          <TabsTrigger value="events">
            Events ({publishedItems?.counts.event || 0})
          </TabsTrigger>
          <TabsTrigger value="resources">
            Resources ({publishedItems?.counts.resource || 0})
          </TabsTrigger>
          <TabsTrigger value="opportunities">
            Opportunities ({publishedItems?.counts.opportunity || 0})
          </TabsTrigger>
          <TabsTrigger value="services">
            Services ({publishedItems?.counts.service || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                All Published Content
              </CardTitle>
              <CardDescription>
                Review all content that is currently published and visible to the public
              </CardDescription>
            </CardHeader>
            <CardContent>
              {totalPublished === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No published content</h3>
                  <p className="text-muted-foreground">
                    No content is currently published and visible to the public.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {publishedItems?.data.forumPosts && publishedItems.data.forumPosts.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        💬 Forum Posts ({publishedItems.data.forumPosts.length})
                      </h3>
                      {renderPublishedItems(publishedItems.data.forumPosts, 'forumPosts')}
                    </div>
                  )}
                  {publishedItems?.data.projects && publishedItems.data.projects.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        🚁 Projects ({publishedItems.data.projects.length})
                      </h3>
                      {renderPublishedItems(publishedItems.data.projects, 'projects')}
                    </div>
                  )}
                  {publishedItems?.data.events && publishedItems.data.events.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        📅 Events ({publishedItems.data.events.length})
                      </h3>
                      {renderPublishedItems(publishedItems.data.events, 'events')}
                    </div>
                  )}
                  {publishedItems?.data.resources && publishedItems.data.resources.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        📄 Resources ({publishedItems.data.resources.length})
                      </h3>
                      {renderPublishedItems(publishedItems.data.resources, 'resources')}
                    </div>
                  )}
                  {publishedItems?.data.opportunities && publishedItems.data.opportunities.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        💼 Opportunities ({publishedItems.data.opportunities.length})
                      </h3>
                      {renderPublishedItems(publishedItems.data.opportunities, 'opportunities')}
                    </div>
                  )}
                  {publishedItems?.data.services && publishedItems.data.services.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        🔧 Services ({publishedItems.data.services.length})
                      </h3>
                      {renderPublishedItems(publishedItems.data.services, 'services')}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forum" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                💬 Forum Posts
              </CardTitle>
              <CardDescription>
                Published forum posts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderPublishedItems(publishedItems?.data.forumPosts || [], 'forumPosts')}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🚁 Projects
              </CardTitle>
              <CardDescription>
                Published projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderPublishedItems(publishedItems?.data.projects || [], 'projects')}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📅 Events
              </CardTitle>
              <CardDescription>
                Published events
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderPublishedItems(publishedItems?.data.events || [], 'events')}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📄 Resources
              </CardTitle>
              <CardDescription>
                Published resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderPublishedItems(publishedItems?.data.resources || [], 'resources')}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="opportunities" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                💼 Opportunities
              </CardTitle>
              <CardDescription>
                Published opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderPublishedItems(publishedItems?.data.opportunities || [], 'opportunities')}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🔧 Services
              </CardTitle>
              <CardDescription>
                Published services
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderPublishedItems(publishedItems?.data.services || [], 'services')}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {previewItem && getTypeIcon(previewItem.type)}
              Preview: {previewItem?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">Author:</h3>
                <p className="text-gray-700">{previewItem?.author?.fullName || previewItem?.author?.username}</p>
              </div>
              <div>
                <h3 className="font-semibold">Created:</h3>
                <p className="text-gray-700">{previewItem && new Date(previewItem.createdAt).toLocaleString()}</p>
              </div>
            </div>
            
            {previewItem?.description && (
              <div>
                <h3 className="font-semibold">Description:</h3>
                <p className="text-gray-700">{previewItem.description}</p>
              </div>
            )}

            {renderPreviewContent(previewItem)}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setPreviewOpen(false)}
              >
                Close
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (previewItem) {
                    handleAction(previewItem.type, previewItem.id, 'unapprove');
                    setPreviewOpen(false);
                  }
                }}
                disabled={actionLoading?.includes(previewItem?.id)}
                className="text-orange-600 hover:text-orange-700"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Unpublish
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
