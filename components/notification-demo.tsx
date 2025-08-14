"use client"

import { Button } from "@/components/ui/button"
import { useNotification } from "@/components/ui/notification"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function NotificationDemo() {
  const { showNotification } = useNotification()

  const showSuccessNotification = () => {
    showNotification('success', 'Success!', 'This is a success notification')
  }

  const showErrorNotification = () => {
    showNotification('error', 'Error!', 'This is an error notification')
  }

  const showInfoNotification = () => {
    showNotification('info', 'Info', 'This is an info notification')
  }

  const showLongNotification = () => {
    showNotification('info', 'Long Notification', 'This notification will stay visible for 10 seconds', 10000)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Notification System Demo</CardTitle>
        <CardDescription>
          Test the global notification system that's available across the whole app
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button onClick={showSuccessNotification} className="w-full" variant="default">
          Show Success Notification
        </Button>
        <Button onClick={showErrorNotification} className="w-full" variant="destructive">
          Show Error Notification
        </Button>
        <Button onClick={showInfoNotification} className="w-full" variant="outline">
          Show Info Notification
        </Button>
        <Button onClick={showLongNotification} className="w-full" variant="secondary">
          Show Long Notification (10s)
        </Button>
      </CardContent>
    </Card>
  )
} 