'use client'

import { useAuth } from '@/lib/auth-context'
import CollaborationPanel, { CollaborationPanelProps } from './collaboration-panel'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Users } from 'lucide-react'

interface Props extends Omit<CollaborationPanelProps, 'canManage' | 'bare'> {
  ownerId: string
  /** Controls presentation. Default "sheet" renders a button that opens a right-side drawer. */
  variant?: 'sheet' | 'inline'
}

/**
 * Renders the CollaborationPanel only when the current user is the content owner.
 * Handy for server-rendered edit pages that know the ownerId at build time.
 */
export default function OwnerOnlyCollaborationPanel({ ownerId, variant = 'sheet', ...rest }: Props) {
  const { user } = useAuth()
  if (!user || user.id !== ownerId) return null

  if (variant === 'inline') {
    return <CollaborationPanel {...rest} canManage />
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="shrink-0">
          <Users className="mr-2 h-4 w-4" /> Collaborators
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Collaborators</SheetTitle>
          <SheetDescription>
            Invite people to help edit this content. They can view and edit everything except delete.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          <CollaborationPanel {...rest} canManage bare />
        </div>
      </SheetContent>
    </Sheet>
  )
}
