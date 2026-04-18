'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, AlertTriangle, Loader2, MailX } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <VerifyEmailInner />
    </Suspense>
  )
}

function VerifyEmailInner() {
  const params = useSearchParams()
  const router = useRouter()
  const token = params.get('token') || ''
  const [state, setState] = useState<'loading' | 'success' | 'expired' | 'error'>('loading')
  const [message, setMessage] = useState<string>('')

  useEffect(() => {
    if (!token) {
      setState('error')
      setMessage('Missing verification token.')
      return
    }
    ;(async () => {
      try {
        const r = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
        const data = await r.json()
        if (r.ok) {
          setState('success')
          setTimeout(() => router.push(data.redirectTo || '/complete-profile'), 1500)
          return
        }
        if (r.status === 410 || data.expired) {
          setState('expired')
          setMessage(data.error || 'This verification link has expired.')
        } else {
          setState('error')
          setMessage(data.error || 'Verification failed.')
        }
      } catch (e: any) {
        setState('error')
        setMessage(e.message)
      }
    })()
  }, [token, router])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {state === 'loading' && (
            <>
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-muted-foreground" />
              <CardTitle className="mt-3">Verifying your email…</CardTitle>
            </>
          )}
          {state === 'success' && (
            <>
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Email verified</CardTitle>
              <CardDescription>Redirecting you to complete your profile…</CardDescription>
            </>
          )}
          {state === 'expired' && (
            <>
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <MailX className="h-6 w-6 text-amber-600" />
              </div>
              <CardTitle>Link expired</CardTitle>
              <CardDescription>{message} Please register again to get a fresh link.</CardDescription>
            </>
          )}
          {state === 'error' && (
            <>
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle>Verification failed</CardTitle>
              <CardDescription>{message}</CardDescription>
            </>
          )}
        </CardHeader>
        {(state === 'expired' || state === 'error') && (
          <CardContent className="space-y-2">
            <Link href="/register"><Button className="w-full">Create a new account</Button></Link>
            <Link href="/"><Button variant="outline" className="w-full">Back to home</Button></Link>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
