// Load environment variables
require('dotenv').config({ path: '.env.production' });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Forum categories to create if they don't exist
const categories = [
  {
    name: "General Discussion",
    description: "General drone-related discussions and community topics",
    slug: "general",
    color: "#3B82F6"
  },
  {
    name: "Technical Support",
    description: "Get help with technical issues and troubleshooting",
    slug: "technical",
    color: "#10B981"
  },
  {
    name: "Showcase",
    description: "Show off your drone projects and achievements",
    slug: "showcase",
    color: "#8B5CF6"
  },
  {
    name: "Regulations & Compliance",
    description: "Discuss regulations, compliance, and legal matters",
    slug: "regulations",
    color: "#F59E0B"
  },
  {
    name: "Community Events",
    description: "Share and discuss community events and meetups",
    slug: "events",
    color: "#EF4444"
  }
];

// 10 long-form forum posts about Drone ecosystem and community in Rwanda
const forumPosts = [
  {
    title: "The Growing Drone Ecosystem in Rwanda: Opportunities and Challenges",
    content: `Rwanda has emerged as a leading African nation in drone technology adoption, creating a vibrant ecosystem that spans agriculture, healthcare, logistics, and infrastructure monitoring. Over the past few years, we've witnessed remarkable growth in both commercial applications and community engagement.

The government's forward-thinking approach, particularly through the Rwanda Civil Aviation Authority (RCAA), has established clear regulatory frameworks that balance innovation with safety. This has attracted international companies like Zipline, which has revolutionized medical supply delivery across the country.

However, the ecosystem faces several challenges. Infrastructure for drone operations, including charging stations and maintenance facilities, is still developing. There's also a need for more skilled pilots and technicians to support the growing industry. The community must work together to address these gaps.

One of the most exciting developments is the increasing number of local startups entering the space. From agricultural monitoring services to infrastructure inspection, Rwandan entrepreneurs are finding innovative ways to leverage drone technology for local needs.

The community aspect is equally important. Regular meetups, training sessions, and knowledge-sharing events help build capacity and foster collaboration. As we continue to grow, maintaining this sense of community will be crucial for sustainable development.

What are your thoughts on the current state of Rwanda's drone ecosystem? What opportunities do you see, and what challenges should we prioritize addressing?`,
    categorySlug: "general",
    tags: ["ecosystem", "opportunities", "challenges", "community"]
  },
  {
    title: "Regulatory Landscape for Drones in Rwanda: A Comprehensive Guide",
    content: `Understanding the regulatory framework is essential for anyone operating drones in Rwanda. The RCAA has developed comprehensive regulations that cover everything from registration requirements to operational limitations.

All drones weighing more than 250 grams must be registered with the RCAA. The registration process involves providing details about the aircraft, pilot certification, and intended use. Commercial operators require additional permits and insurance coverage.

Operational restrictions include maintaining visual line of sight, respecting altitude limits (typically 120 meters), and avoiding restricted areas such as airports, military installations, and government buildings. Night operations require special authorization.

The regulatory environment is evolving, with recent updates focusing on beyond visual line of sight (BVLOS) operations and integration with air traffic management systems. These developments open new possibilities for advanced applications while maintaining safety standards.

For hobbyists, the regulations are more relaxed but still require adherence to basic safety principles. Community education about these rules is crucial to ensure everyone operates responsibly.

I've compiled a detailed guide based on the latest RCAA regulations. If you're planning to start flying, I highly recommend reviewing the official documentation and reaching out to the RCAA for any clarifications.

Have you navigated the registration process recently? What was your experience, and do you have any tips for others?`,
    categorySlug: "regulations",
    tags: ["regulations", "RCAA", "compliance", "legal"]
  },
  {
    title: "Building a Strong Drone Community in Rwanda: Lessons Learned",
    content: `Over the past three years of organizing community events and meetups, I've learned valuable lessons about building and sustaining a vibrant drone community in Rwanda. The key is creating spaces where people can learn, share, and collaborate.

Regular meetups are essential. We've found that monthly gatherings work best, alternating between technical workshops, project showcases, and networking sessions. These events attract diverse participants - from hobbyists to commercial operators, students to professionals.

One challenge we've faced is ensuring inclusivity. The drone community can sometimes feel intimidating to newcomers, especially those without technical backgrounds. We've addressed this by creating beginner-friendly sessions and mentorship programs that pair experienced pilots with newcomers.

Knowledge sharing is another critical component. We maintain an active online forum where members can ask questions, share resources, and discuss projects. This digital space complements our in-person events and helps build connections beyond physical gatherings.

Collaboration has been a game-changer. Several community members have partnered on projects, from agricultural monitoring initiatives to educational programs. These partnerships not only advance individual goals but strengthen the community as a whole.

Looking ahead, we're planning to expand our reach beyond Kigali. Regional chapters in secondary cities would help grow the community and make drone technology more accessible across Rwanda. We're also exploring partnerships with educational institutions to introduce drone technology to students.

What initiatives would you like to see in our community? How can we better support each other's growth and learning?`,
    categorySlug: "general",
    tags: ["community", "meetups", "collaboration", "networking"]
  },
  {
    title: "Agricultural Applications of Drones in Rwanda: Transforming Farming Practices",
    content: `Agriculture remains the backbone of Rwanda's economy, and drone technology is revolutionizing how farmers monitor crops, manage resources, and increase yields. The applications are diverse and impactful.

Crop monitoring is perhaps the most common use case. Drones equipped with multispectral cameras can detect early signs of disease, nutrient deficiencies, and pest infestations. This early detection allows farmers to take targeted action, reducing crop loss and minimizing chemical usage.

Precision agriculture is another game-changer. By creating detailed maps of fields, drones help farmers understand variability in soil conditions, moisture levels, and crop health. This data enables precise application of fertilizers and pesticides, reducing costs and environmental impact.

In Rwanda's hilly terrain, accessing remote fields can be challenging. Drones provide an efficient way to monitor areas that are difficult to reach on foot. This is particularly valuable during critical growth stages when regular monitoring is essential.

Several local companies are now offering agricultural drone services, making this technology accessible to smallholder farmers through service models. This approach democratizes access to advanced monitoring capabilities without requiring individual farmers to invest in equipment and training.

The impact extends beyond individual farms. Aggregated data from multiple farms can provide insights into regional agricultural trends, helping policymakers and agricultural extension services make informed decisions.

However, challenges remain. The cost of services, while decreasing, is still a barrier for some farmers. There's also a need for more training on interpreting drone data and translating insights into actionable farming practices.

I'm curious to hear from farmers and service providers: what agricultural applications have you found most valuable? What challenges are you facing, and how can the community support agricultural drone adoption?`,
    categorySlug: "showcase",
    tags: ["agriculture", "farming", "precision-agriculture", "monitoring"]
  },
  {
    title: "Drone Technology in Healthcare: Rwanda's Medical Supply Delivery Revolution",
    content: `Rwanda's partnership with Zipline has demonstrated the transformative potential of drone technology in healthcare delivery. The system has delivered millions of units of blood, vaccines, and medical supplies to remote health facilities, saving countless lives.

The success of this program has inspired other healthcare applications. Researchers are exploring the use of drones for transporting laboratory samples, enabling faster diagnosis in remote areas. Emergency medical supplies can now reach critical locations in minutes rather than hours.

Beyond logistics, drones are being used for public health surveillance. Monitoring mosquito breeding sites, tracking disease outbreaks, and assessing health infrastructure are all possible applications that could significantly impact public health outcomes.

The community has an important role to play in these developments. Pilots and technicians can contribute their expertise to healthcare initiatives, while the broader community can advocate for expanded applications and support research efforts.

However, healthcare applications come with unique challenges. Regulatory requirements are stricter, reliability standards are higher, and integration with existing healthcare systems requires careful planning. These challenges demand collaboration between drone operators, healthcare professionals, and regulators.

As we look to the future, I see opportunities for community members to contribute to healthcare drone initiatives. Whether through volunteering, research partnerships, or developing new applications, there's room for meaningful engagement.

What healthcare applications interest you most? How can we, as a community, support the expansion of drone technology in healthcare?`,
    categorySlug: "general",
    tags: ["healthcare", "medical-delivery", "Zipline", "public-health"]
  },
  {
    title: "Training and Education: Building Drone Skills in Rwanda",
    content: `Developing a skilled workforce is crucial for Rwanda's drone ecosystem to reach its full potential. Currently, there's a significant gap between the demand for qualified pilots and technicians and the available training opportunities.

Formal training programs are emerging, but they're often expensive and located primarily in Kigali. This creates barriers for aspiring pilots and technicians in rural areas. Community-driven training initiatives can help bridge this gap.

We've organized several successful training workshops covering basic flight operations, safety protocols, and maintenance basics. These workshops are designed to be accessible, using affordable equipment and focusing on practical skills that participants can immediately apply.

One approach that's worked well is peer-to-peer learning. Experienced pilots volunteer their time to mentor newcomers, creating a supportive learning environment. This not only builds skills but strengthens community bonds.

Online resources are also valuable, but they need to be complemented with hands-on practice. We've found that a combination of theoretical learning and practical flight time produces the best results. Finding safe, legal spaces for practice flights remains a challenge in urban areas.

For those interested in commercial operations, understanding business aspects is equally important. Training should cover not just technical skills but also business development, client relations, and regulatory compliance.

Looking ahead, we're exploring partnerships with technical schools and universities to integrate drone technology into formal education programs. This would create pathways for students to enter the industry with recognized qualifications.

What training needs do you have? Would you be interested in participating in or organizing community training sessions?`,
    categorySlug: "general",
    tags: ["training", "education", "skills-development", "mentorship"]
  },
  {
    title: "Infrastructure Inspection: Drones Transforming Maintenance and Monitoring",
    content: `Infrastructure inspection is one of the most practical and valuable applications of drone technology in Rwanda. From bridges and buildings to power lines and water systems, drones provide safe, efficient, and cost-effective inspection capabilities.

Traditional inspection methods often require shutting down operations, using expensive equipment like cranes or scaffolding, and putting workers in potentially dangerous situations. Drones eliminate many of these challenges while providing superior data quality.

High-resolution cameras and thermal imaging sensors allow inspectors to identify issues that might not be visible from the ground. Cracks, corrosion, structural weaknesses, and other problems can be detected early, enabling proactive maintenance.

The data collected isn't just visual. Photogrammetry techniques create detailed 3D models of structures, enabling precise measurements and change detection over time. This historical data is invaluable for understanding how infrastructure ages and planning maintenance schedules.

In Rwanda's context, this is particularly valuable for monitoring infrastructure in remote or difficult-to-access locations. Roads, bridges, and utility infrastructure in rural areas can be inspected regularly without the logistical challenges of traditional methods.

Several local companies are now offering infrastructure inspection services, and the demand is growing. Government agencies, utility companies, and private developers are recognizing the value of drone-based inspections.

However, the industry needs more trained inspectors who understand both drone operations and infrastructure assessment. This requires specialized knowledge that combines technical flying skills with engineering or architectural expertise.

I'm interested in hearing from those involved in infrastructure work: what inspection challenges are you facing? How could drone technology help, and what barriers need to be addressed?`,
    categorySlug: "technical",
    tags: ["infrastructure", "inspection", "maintenance", "monitoring"]
  },
  {
    title: "Environmental Monitoring and Conservation: Drones Protecting Rwanda's Natural Heritage",
    content: `Rwanda's commitment to environmental conservation is well-known, and drone technology offers powerful tools for monitoring and protecting the country's natural heritage. From tracking wildlife to monitoring deforestation, the applications are diverse and impactful.

In national parks, drones are being used for anti-poaching efforts, monitoring animal populations, and assessing habitat conditions. The ability to cover large areas quickly and non-invasively makes drones ideal for conservation work.

Forest monitoring is another critical application. Regular flights can track deforestation, illegal logging, and forest health. This data helps conservation organizations and government agencies respond quickly to threats and plan restoration efforts.

Water resource monitoring is equally important. Drones can assess water quality, monitor river systems, and identify pollution sources. In a country where water resources are precious, this monitoring capability is invaluable.

The community has an opportunity to contribute to these efforts. Volunteer pilots can support conservation organizations, while the broader community can advocate for environmental applications and raise awareness about conservation challenges.

However, operating in sensitive environmental areas requires special consideration. Disturbing wildlife, damaging vegetation, or interfering with research activities are concerns that must be addressed through careful planning and coordination with conservation authorities.

Data sharing is another important aspect. The environmental data collected by drones can be valuable for researchers, policymakers, and conservation organizations. Creating platforms for sharing this data could amplify its impact.

What environmental monitoring applications interest you? How can we, as a community, support conservation efforts through drone technology?`,
    categorySlug: "showcase",
    tags: ["environment", "conservation", "wildlife", "monitoring"]
  },
  {
    title: "Startup Ecosystem: Opportunities for Drone Entrepreneurs in Rwanda",
    content: `The drone industry in Rwanda presents numerous opportunities for entrepreneurs, from service providers to product developers. The growing demand, supportive regulatory environment, and expanding community create favorable conditions for new ventures.

Service-based businesses are perhaps the most accessible entry point. Agricultural monitoring, infrastructure inspection, and aerial photography services all have established markets. The key is identifying specific niches and building expertise in those areas.

Product development offers different opportunities. While manufacturing drones locally may be challenging initially, there's potential for developing specialized payloads, software solutions, and accessories tailored to local needs. The growing market provides a testing ground for innovative products.

Partnerships are crucial for success. Collaborating with established companies, government agencies, and international organizations can provide access to markets, resources, and expertise. The community can facilitate these connections.

Funding remains a challenge for many startups. While the ecosystem is growing, access to capital for drone-related businesses is still limited. Entrepreneurs need to be creative in finding funding sources, from grants to partnerships to bootstrapping.

Regulatory compliance is another important consideration. Understanding and navigating regulations is essential, but it can also be a barrier for new entrepreneurs. Community support and mentorship can help newcomers navigate these challenges.

The market is still developing, which means there's room for innovation and differentiation. Entrepreneurs who can identify unmet needs and develop solutions will find opportunities for growth.

I'm curious to hear from entrepreneurs in the space: what challenges are you facing? What support would be most valuable, and how can the community help new ventures succeed?`,
    categorySlug: "general",
    tags: ["startups", "entrepreneurship", "business", "opportunities"]
  },
  {
    title: "Future of Drones in Rwanda: Vision 2030 and Beyond",
    content: `Looking ahead, the future of drones in Rwanda is bright and full of possibilities. As technology advances and the ecosystem matures, we can expect to see even more innovative applications and greater integration into daily life.

Autonomous operations will become more common as regulations evolve and technology improves. Beyond visual line of sight (BVLOS) operations will enable new applications in logistics, agriculture, and infrastructure monitoring. This will require continued collaboration between operators, regulators, and technology providers.

Urban air mobility is another exciting frontier. While still in early stages globally, the concept of passenger-carrying drones and urban delivery systems could transform transportation in Rwanda's cities. The community should engage with these developments early to ensure they benefit local needs.

Integration with other technologies will amplify impact. Combining drones with artificial intelligence, Internet of Things sensors, and data analytics will create powerful solutions for complex challenges. The community can play a role in exploring these integrations.

Education and training will need to evolve. As applications become more sophisticated, the skills required will also advance. Continuous learning and adaptation will be essential for everyone in the ecosystem.

Community growth and engagement will be crucial. A strong, active community that shares knowledge, supports innovation, and advocates for the industry will drive continued development. This requires ongoing effort from all of us.

Regulatory frameworks will continue to evolve. The community should actively engage with regulators to ensure that regulations support innovation while maintaining safety and security. This dialogue is essential for sustainable growth.

As we look to 2030 and beyond, I'm excited about the possibilities. Rwanda has the potential to be a global leader in drone technology applications, and the community will be central to achieving that vision.

What do you envision for the future of drones in Rwanda? What developments are you most excited about, and how can we work together to make that future a reality?`,
    categorySlug: "general",
    tags: ["future", "vision", "innovation", "technology"]
  }
];

// Sample comments for posts (varied lengths and perspectives)
const sampleComments = [
  "This is a fantastic overview! I've been working in the agricultural sector for the past two years, and I can confirm that the demand for drone services is growing rapidly. The challenge we face most is helping farmers understand the value proposition and ROI.",
  "Great post! I'm particularly interested in the regulatory aspects. Has anyone here gone through the RCAA registration process recently? I'm planning to start a commercial operation and would love to hear about others' experiences.",
  "Excellent insights! The community aspect really resonates with me. I've attended a few meetups and found them incredibly valuable. We should definitely expand beyond Kigali - there's so much potential in the regions.",
  "I work with a local startup focusing on infrastructure inspection, and the market is definitely there. The key is building trust with clients and demonstrating clear value. Great to see this discussion happening!",
  "This is exactly the kind of discussion we need more of. The ecosystem is growing, but we need better coordination and knowledge sharing. How can we improve communication across different sectors?",
  "As a student studying engineering, I'm really excited about the opportunities in this field. Are there any internship or mentorship programs available? I'd love to get hands-on experience.",
  "The healthcare applications are fascinating. I've read about Zipline's success, and I'm curious about other potential healthcare uses. Has anyone explored medical sample transport or emergency response applications?",
  "Training is definitely a critical need. I've been trying to get certified as a commercial pilot, but the options are limited and expensive. Community-driven training would be a game-changer.",
  "Environmental monitoring is an area I'm passionate about. I've been working on a project to monitor forest health in the Northern Province. Would love to connect with others working on similar initiatives.",
  "The startup ecosystem needs more support. Access to funding, mentorship, and market connections are all challenges. How can we build better support systems for entrepreneurs?"
];

// Sample replies to comments (nested replies)
const sampleReplies = [
  "I completely agree! The ROI demonstration is crucial. We've found that showing farmers before-and-after data really helps them understand the value.",
  "I went through registration last month. The process was straightforward, but it took about three weeks. Make sure you have all your documentation ready - that speeds things up significantly.",
  "We're actually planning a regional meetup in Musanze next month! Keep an eye on the events page for details. Would love to have you there.",
  "Building trust is definitely key. We started with smaller projects to build our portfolio, and that helped us land bigger contracts. Persistence pays off!",
  "I think a monthly newsletter or forum digest could help. We could highlight key discussions, upcoming events, and opportunities. Anyone interested in helping organize this?",
  "Check out the mentorship program section - we're always looking for students to pair with experienced pilots. Send me a message if you're interested!",
  "I've been exploring emergency response applications. The challenge is coordination with existing emergency services, but the potential is huge, especially for rural areas.",
  "We're organizing a community training session next month. It's free for members, and we cover both theory and practical flight time. Check the events calendar!",
  "That's amazing work! I'd love to learn more about your project. Forest monitoring is so important for conservation efforts. Have you considered using multispectral sensors?",
  "I'm working on creating a resource hub for entrepreneurs - funding opportunities, mentorship connections, market research. Should be ready in a few weeks. Stay tuned!"
];

async function seedForumDiscussions() {
  try {
    console.log('🌱 Starting to seed forum discussions...\n');

    // Step 1: Create or get forum categories
    console.log('📁 Creating forum categories...');
    const categoryMap = {};
    for (const cat of categories) {
      const existing = await prisma.forumCategory.findUnique({
        where: { slug: cat.slug }
      });
      
      if (existing) {
        categoryMap[cat.slug] = existing.id;
        console.log(`   ✓ Category "${cat.name}" already exists`);
      } else {
        const created = await prisma.forumCategory.create({
          data: cat
        });
        categoryMap[cat.slug] = created.id;
        console.log(`   ✓ Created category: ${cat.name}`);
      }
    }

    // Step 2: Get all non-admin users
    console.log('\n👥 Fetching users...');
    const users = await prisma.user.findMany({
      where: { role: { not: 'admin' } },
      select: { id: true, username: true, role: true }
    });
    console.log(`   ✓ Found ${users.length} users`);

    if (users.length === 0) {
      console.log('   ⚠️  No users found. Please seed users first.');
      return;
    }

    // Step 3: Create forum posts
    console.log('\n📝 Creating forum posts...');
    const createdPosts = [];
    
    for (let i = 0; i < forumPosts.length; i++) {
      const postData = forumPosts[i];
      const categoryId = categoryMap[postData.categorySlug];
      const author = users[i % users.length]; // Distribute posts across users
      
      const post = await prisma.forumPost.create({
        data: {
          title: postData.title,
          content: postData.content,
          categoryId: categoryId,
          authorId: author.id,
          tags: postData.tags,
          isApproved: true, // Auto-approve seeded posts
          approvedAt: new Date(),
          viewsCount: Math.floor(Math.random() * 200) + 50, // Random views
        }
      });

      // Update user's posts count
      await prisma.user.update({
        where: { id: author.id },
        data: { postsCount: { increment: 1 } }
      });

      // Update category post count
      await prisma.forumCategory.update({
        where: { id: categoryId },
        data: { 
          postCount: { increment: 1 },
          lastPostAt: new Date()
        }
      });

      createdPosts.push(post);
      console.log(`   ✓ Created post: "${post.title.substring(0, 50)}..."`);
    }

    // Step 4: Create comments on posts
    console.log('\n💬 Creating comments...');
    let commentIdMap = {}; // Track comment IDs for nested replies
    
    for (let postIndex = 0; postIndex < createdPosts.length; postIndex++) {
      const post = createdPosts[postIndex];
      const numComments = Math.floor(Math.random() * 5) + 3; // 3-7 comments per post
      const postComments = [];
      
      for (let i = 0; i < numComments; i++) {
        const commentAuthor = users[Math.floor(Math.random() * users.length)];
        const commentContent = sampleComments[Math.floor(Math.random() * sampleComments.length)];
        
        const comment = await prisma.forumComment.create({
          data: {
            content: commentContent,
            postId: post.id,
            authorId: commentAuthor.id,
            parentId: null, // Top-level comment
          }
        });

        // Update user's comments count
        await prisma.user.update({
          where: { id: commentAuthor.id },
          data: { commentsCount: { increment: 1 } }
        });

        postComments.push(comment);
        commentIdMap[comment.id] = comment;
        console.log(`   ✓ Created comment on post "${post.title.substring(0, 30)}..."`);
      }

      // Step 5: Create nested replies (replies to comments)
      console.log(`\n   🔄 Creating nested replies for post "${post.title.substring(0, 30)}..."`);
      for (let i = 0; i < postComments.length; i++) {
        // 50% chance of having a reply to this comment
        if (Math.random() > 0.5 && postComments.length > 0) {
          const parentComment = postComments[i];
          const replyAuthor = users[Math.floor(Math.random() * users.length)];
          const replyContent = sampleReplies[Math.floor(Math.random() * sampleReplies.length)];
          
          const reply = await prisma.forumComment.create({
            data: {
              content: replyContent,
              postId: post.id,
              authorId: replyAuthor.id,
              parentId: parentComment.id, // This is a nested reply
            }
          });

          // Update user's comments count
          await prisma.user.update({
            where: { id: replyAuthor.id },
            data: { commentsCount: { increment: 1 } }
          });

          commentIdMap[reply.id] = reply;
          console.log(`      ✓ Created nested reply`);
        }
      }

      // Update post reply count
      const totalComments = await prisma.forumComment.count({
        where: { postId: post.id }
      });
      
      await prisma.forumPost.update({
        where: { id: post.id },
        data: {
          repliesCount: totalComments,
          lastReplyAt: new Date()
        }
      });
    }

    // Step 6: Add likes to posts
    console.log('\n❤️  Adding likes to posts...');
    for (const post of createdPosts) {
      const numLikes = Math.floor(Math.random() * 8) + 3; // 3-10 likes per post
      const usersWhoLiked = new Set();
      
      for (let i = 0; i < numLikes; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        if (usersWhoLiked.has(user.id)) continue; // Avoid duplicate likes
        usersWhoLiked.add(user.id);
        
        await prisma.forumPostLike.create({
          data: {
            userId: user.id,
            postId: post.id
          }
        });
      }

      // Update post likes count
      await prisma.forumPost.update({
        where: { id: post.id },
        data: { likesCount: usersWhoLiked.size }
      });
      
      console.log(`   ✓ Added ${usersWhoLiked.size} likes to "${post.title.substring(0, 40)}..."`);
    }

    // Step 7: Add likes to comments and nested replies
    console.log('\n❤️  Adding likes to comments and replies...');
    const allComments = await prisma.forumComment.findMany({
      where: { postId: { in: createdPosts.map(p => p.id) } }
    });

    for (const comment of allComments) {
      const numLikes = Math.floor(Math.random() * 5) + 1; // 1-5 likes per comment
      const usersWhoLiked = new Set();
      
      for (let i = 0; i < numLikes; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        if (usersWhoLiked.has(user.id) || user.id === comment.authorId) continue;
        usersWhoLiked.add(user.id);
        
        await prisma.forumCommentLike.create({
          data: {
            userId: user.id,
            commentId: comment.id
          }
        });
      }

      // Update comment likes count
      await prisma.forumComment.update({
        where: { id: comment.id },
        data: { likesCount: usersWhoLiked.size }
      });
    }
    
    console.log(`   ✓ Added likes to ${allComments.length} comments and replies`);

    // Summary
    console.log('\n✅ Successfully seeded forum discussions!');
    console.log(`\n📊 Summary:`);
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Posts: ${createdPosts.length}`);
    console.log(`   - Comments: ${allComments.length}`);
    console.log(`   - Post likes: ${createdPosts.reduce((sum, p) => sum + p.likesCount, 0)}`);
    console.log(`   - Comment likes: ${allComments.reduce((sum, c) => sum + c.likesCount, 0)}`);

  } catch (error) {
    console.error('❌ Error seeding forum discussions:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedForumDiscussions()
    .then(() => {
      console.log('\n🎉 Seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedForumDiscussions };
