import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const DEFAULTS: Record<string, { title: string; content: string }> = {
  privacy: {
    title: 'Privacy Policy',
    content: `# Privacy Policy\n\n*Last updated: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}*\n\n## 1. Introduction\n\nRwanda Drone Community ("we", "us", or "our") is committed to protecting your personal information. This policy explains how we collect, use, and safeguard your data when you use our platform.\n\n## 2. Information We Collect\n\n- **Account information**: name, email address, and password when you register.\n- **Profile data**: bio, location, organisation, and any information you choose to share on your public profile.\n- **Usage data**: pages visited, features used, and interactions within the platform.\n- **Uploaded content**: project files, event flyers, resource documents, and profile photos.\n\n## 3. How We Use Your Information\n\n- To provide and improve platform features.\n- To send relevant notifications about events, opportunities, and community updates.\n- To verify identity and prevent fraud.\n- To comply with applicable Rwandan laws and regulations.\n\n## 4. Data Sharing\n\nWe do not sell your personal data. We may share information with:\n- Service providers who help us operate the platform (hosting, email delivery).\n- Regulatory authorities when legally required.\n\n## 5. Data Security\n\nWe implement industry-standard security measures including encrypted storage and secure HTTPS connections.\n\n## 6. Your Rights\n\nYou may request access to, correction of, or deletion of your personal data by contacting us at **privacy@rwandadrone.rw**.\n\n## 7. Contact\n\nFor any privacy-related questions, contact us at **privacy@rwandadrone.rw**.`,
  },
  terms: {
    title: 'Terms of Use',
    content: `# Terms of Use\n\n*Last updated: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}*\n\n## 1. Acceptance\n\nBy accessing or using the Rwanda Drone Community platform, you agree to these Terms of Use. If you do not agree, please do not use the platform.\n\n## 2. Eligibility\n\nYou must be at least 16 years old and comply with all applicable Rwandan laws and CAA regulations to use this platform.\n\n## 3. User Accounts\n\n- You are responsible for keeping your credentials confidential.\n- You must provide accurate registration information.\n- One person may not maintain more than one account.\n\n## 4. Acceptable Use\n\nYou agree **not** to:\n- Post false, misleading, or harmful content.\n- Infringe on any intellectual property rights.\n- Distribute malware or conduct unauthorised data collection.\n- Violate Rwanda Civil Aviation Authority drone regulations.\n\n## 5. Content Ownership\n\nYou retain ownership of content you upload. By posting, you grant Rwanda Drone Community a non-exclusive licence to display and distribute your content on the platform.\n\n## 6. Moderation\n\nWe reserve the right to remove content or suspend accounts that violate these terms, without prior notice.\n\n## 7. Limitation of Liability\n\nThe platform is provided "as is". We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform.\n\n## 8. Governing Law\n\nThese terms are governed by the laws of the Republic of Rwanda.\n\n## 9. Contact\n\nFor questions about these terms, contact **legal@rwandadrone.rw**.`,
  },
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: `page_${slug}` },
    })

    if (setting) {
      const data = JSON.parse(setting.value)
      return NextResponse.json({ slug, title: data.title, content: data.content, updatedAt: setting.updatedAt })
    }

    // Return default
    const def = DEFAULTS[slug]
    return NextResponse.json({ slug, title: def.title, content: def.content, updatedAt: null })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
