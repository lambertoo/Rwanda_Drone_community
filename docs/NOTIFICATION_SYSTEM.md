# Global Notification System

This document explains how to use the global notification system that's available across the entire Rwanda Drone Community Platform.

## Overview

The notification system provides a consistent way to show success, error, and info messages to users throughout the application. Notifications appear in the top-right corner of the screen and automatically disappear after a configurable duration.

## Features

- ✅ **Global Access**: Available in any component across the app
- 🎨 **Three Types**: Success (green), Error (red), Info (blue)
- ⏱️ **Auto-dismiss**: Configurable duration (default: 5 seconds)
- 🖱️ **Manual Close**: Users can manually close notifications
- 📱 **Responsive**: Works on all screen sizes
- 🔄 **Multiple Notifications**: Supports multiple notifications simultaneously

## Usage

### 1. Import the Hook

```tsx
import { useNotification } from "@/components/ui/notification"
```

### 2. Use in Your Component

```tsx
export function MyComponent() {
  const { showNotification } = useNotification()

  const handleSuccess = () => {
    showNotification('success', 'Success!', 'Operation completed successfully')
  }

  const handleError = () => {
    showNotification('error', 'Error!', 'Something went wrong')
  }

  const handleInfo = () => {
    showNotification('info', 'Info', 'Here is some information')
  }

  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
      <button onClick={handleInfo}>Show Info</button>
    </div>
  )
}
```

## API Reference

### `showNotification(type, title, description?, duration?)`

#### Parameters

- **`type`** (required): `'success' | 'error' | 'info'`
- **`title`** (required): Main notification message
- **`description`** (optional): Additional details
- **`duration`** (optional): Time in milliseconds before auto-hide (default: 5000)

#### Examples

```tsx
// Basic success notification
showNotification('success', 'Profile Updated!')

// Error with description
showNotification('error', 'Login Failed', 'Invalid email or password')

// Info with custom duration (10 seconds)
showNotification('info', 'Processing...', 'Please wait while we save your changes', 10000)

// Success with description
showNotification('success', 'Post Created!', 'Your forum post has been published successfully')
```

## Available Methods

### `showNotification(type, title, description?, duration?)`
Shows a new notification.

### `hideNotification(id)`
Hides a specific notification by ID.

### `clearAll()`
Hides all active notifications.

## Notification Types

### Success (Green)
- ✅ **Icon**: CheckCircle
- 🎨 **Color**: Green theme
- 📝 **Use Case**: Successful operations, confirmations

### Error (Red)
- ❌ **Icon**: X
- 🎨 **Color**: Red theme
- 📝 **Use Case**: Errors, failures, warnings

### Info (Blue)
- ℹ️ **Icon**: Info
- 🎨 **Color**: Blue theme
- 📝 **Use Case**: Information, status updates

## Styling

Notifications automatically use the appropriate color scheme based on their type:

- **Success**: `bg-green-50 border-green-200 text-green-800`
- **Error**: `bg-red-50 border-red-200 text-red-800`
- **Info**: `bg-blue-50 border-blue-200 text-blue-800`

## Positioning

- **Location**: Top-right corner of the screen
- **Z-Index**: 9999 (above all other content)
- **Max Width**: 420px
- **Spacing**: 8px from top and right edges

## Best Practices

1. **Keep titles short**: Use concise, clear titles
2. **Add descriptions when needed**: Provide additional context for complex messages
3. **Use appropriate types**: Match the notification type to the message content
4. **Consider duration**: Use longer durations for important messages
5. **Don't overuse**: Avoid showing too many notifications simultaneously

## Examples in the App

### Forum Posts
```tsx
// When creating a post
showNotification('success', 'Post Created!', 'Your forum post has been published')

// When there's an error
showNotification('error', 'Post Failed', 'Unable to create post. Please try again.')
```

### Authentication
```tsx
// Login success
showNotification('success', 'Welcome back!', 'Login successful. Redirecting...')

// Login error
showNotification('error', 'Login Failed', 'Invalid email or password')
```

### User Actions
```tsx
// Profile update
showNotification('success', 'Profile Updated', 'Your profile has been saved successfully')

// Action required
showNotification('info', 'Action Required', 'Please complete your profile to continue')
```

## Migration from Local Notifications

If you have existing local notification systems in your components, you can easily migrate to the global system:

### Before (Local)
```tsx
const [notification, setNotification] = useState(null)

const showNotification = (message) => {
  setNotification(message)
  setTimeout(() => setNotification(null), 5000)
}
```

### After (Global)
```tsx
import { useNotification } from "@/components/ui/notification"

const { showNotification } = useNotification()

// Use directly
showNotification('success', 'Success!', 'Operation completed')
```

## Troubleshooting

### Notifications not showing?
- Ensure your component is wrapped within the `NotificationProvider`
- Check that you're importing `useNotification` correctly
- Verify the component is rendered within the app layout

### Notifications in wrong position?
- The system uses fixed positioning with `top-4 right-4`
- Check for CSS conflicts that might affect positioning
- Ensure z-index is not being overridden

### Multiple notifications not stacking?
- Each notification gets a unique ID
- Notifications automatically stack vertically
- Use `clearAll()` if you need to reset the stack 