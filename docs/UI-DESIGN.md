# Gamaliel AI Pastor - UI Design Documentation

## Overview

Gamaliel AI Pastor features a modern, ChatGPT-inspired user interface designed for optimal user experience across all devices. The design emphasizes clarity, accessibility, and ease of use while maintaining a professional theological focus.

## Design Philosophy

### Core Principles
1. **Simplicity**: Clean, uncluttered interface that focuses on the conversation
2. **Accessibility**: Dark/light theme support, proper contrast ratios, semantic HTML
3. **Responsiveness**: Mobile-first design that scales beautifully to desktop
4. **Performance**: Optimized animations, lazy loading, and efficient rendering

## UI Components

### 1. Sidebar Navigation

**Purpose**: Primary navigation and user account management

**Features**:
- **Collapsible Design**: Toggle sidebar visibility for more screen space
- **Brand Identity**: Gamaliel AI logo with book icon
- **New Chat Button**: Quick access to start fresh conversations
- **Usage Tracker**: Real-time display of daily message quota
- **Logout Button**: Easy account management

**Technical Details**:
- Width: 256px (desktop), collapsible to 0px
- Background: Dark gray (#1F2937)
- Transitions: Smooth 300ms animation
- Icons: Lucide React icon library

**Component Code Location**: `app/chat/page.tsx` (lines 77-122)

### 2. Main Chat Interface

#### Header Bar
- **Menu Toggle**: Hamburger menu for sidebar control
- **Title**: "Gamaliel AI Pastor" branding
- **Responsive**: Sticky positioning for easy access

#### Welcome Screen
- **Icon**: Sparkles icon in blue circular background
- **Heading**: "Welcome to Gamaliel AI"
- **Description**: Clear explanation of the chatbot's purpose
- **Visibility**: Shown only when no messages exist

#### Message Display Area

**User Messages**:
- Alignment: Right-aligned
- Background: Blue (#2563EB)
- Text Color: White
- Avatar: Gray circle with "You" label
- Border Radius: 16px (rounded corners)

**Assistant Messages**:
- Alignment: Left-aligned
- Background: White (light mode) / Dark gray (dark mode)
- Text Color: Adaptive to theme
- Avatar: Blue circle with book icon
- Markdown Support: Full ReactMarkdown rendering
- Border: Subtle gray border for definition

**Loading State**:
- Animated bouncing dots (3 dots)
- Blue circular avatar with book icon
- Smooth animation with staggered delays (0ms, 150ms, 300ms)

### 3. Input Area

**Design**:
- Background: Light gray (#F3F4F6) / Dark gray (#374151)
- Border Radius: 16px (pill-shaped)
- Padding: Comfortable spacing for typing

**Features**:
- **Auto-resize Textarea**: Expands with content
- **Max Height**: 128px with scrolling
- **Keyboard Shortcuts**: Enter to send, Shift+Enter for new line
- **Send Button**: Blue circle with send icon
- **Disabled State**: Grayed out when loading or empty

**Disclaimer Text**:
- "Gamaliel AI Pastor provides Biblical guidance but is not a substitute for pastoral care."
- Positioned below input area
- Small, subtle text for legal/ethical clarity

## Color Palette

### Light Theme
- **Background**: `#F9FAFB` (gray-50)
- **Surface**: `#FFFFFF` (white)
- **Text Primary**: `#111827` (gray-900)
- **Text Secondary**: `#6B7280` (gray-500)
- **Accent**: `#2563EB` (blue-600)
- **Border**: `#E5E7EB` (gray-200)

### Dark Theme
- **Background**: `#111827` (gray-900)
- **Surface**: `#1F2937` (gray-800)
- **Text Primary**: `#F9FAFB` (gray-50)
- **Text Secondary**: `#9CA3AF` (gray-400)
- **Accent**: `#3B82F6` (blue-500)
- **Border**: `#374151` (gray-700)

## Typography

- **Font Family**: System font stack (Apple/Android native fonts)
- **Headings**: Bold, larger sizes
- **Body Text**: Regular weight, 16px base size
- **Code**: Monospace font for technical content

## Icons

**Icon Library**: Lucide React v0.344.0

**Used Icons**:
- `Book`: Assistant avatar, sidebar branding
- `Send`: Message send button
- `Menu`: Sidebar toggle
- `X`: Close sidebar
- `Plus`: New chat button
- `LogOut`: Logout button
- `Sparkles`: Welcome screen decoration

## Responsive Design

### Breakpoints
- **Mobile**: < 768px
  - Sidebar hidden by default
  - Full-width chat interface
  - Touch-optimized buttons

- **Tablet**: 768px - 1024px
  - Sidebar toggleable
  - Optimized message width

- **Desktop**: > 1024px
  - Sidebar visible by default
  - Maximum content width for readability
  - Hover states on interactive elements

### Mobile Optimizations
1. Touch-friendly button sizes (min 44x44px)
2. No hover states (uses active states instead)
3. Keyboard automatically dismisses on send
4. Optimized scrolling performance

## Accessibility Features

### Screen Reader Support
- Semantic HTML5 elements
- Proper ARIA labels
- Logical heading hierarchy
- Keyboard navigation support

### Keyboard Shortcuts
- `Enter`: Send message
- `Shift + Enter`: New line in message
- `Esc`: Close sidebar (if open)

### Visual Accessibility
- High contrast ratios (WCAG AA compliant)
- Focus indicators on interactive elements
- Clear visual hierarchy
- Readable font sizes

## Animation & Transitions

### Sidebar Toggle
- Duration: 300ms
- Easing: ease-in-out
- Property: width

### Loading Dots
- Animation: bounce
- Duration: 600ms infinite
- Delay: Staggered 0ms, 150ms, 300ms

### Message Appearance
- Smooth scroll to latest message
- Behavior: smooth scrolling

## Technical Stack

### UI Framework
- **React**: Component-based architecture
- **Next.js 14**: Server-side rendering, routing
- **TypeScript**: Type-safe development

### Styling
- **Tailwind CSS**: Utility-first CSS framework
- **CSS Modules**: Scoped styling when needed
- **Dark Mode**: CSS class-based theme switching

### State Management
- **React Hooks**: useState, useEffect, useRef
- **Local State**: Component-level state
- **No external state library needed** (simple app structure)

## File Structure

```
app/
├── chat/
│   └── page.tsx           # Main chat interface component
├── login/
│   └── page.tsx           # Login page
├── register/
│   └── page.tsx           # Registration page
└── layout.tsx             # Root layout with theme provider
```

## Future UI Enhancements

### Planned Features
1. **Chat History Sidebar**: List of previous conversations
2. **Message Reactions**: Like/dislike for feedback
3. **Code Syntax Highlighting**: Better code block rendering
4. **Export Chat**: Download conversation as PDF/text
5. **Voice Input**: Speech-to-text for accessibility
6. **Search**: Find messages in current conversation
7. **Themes**: Additional color schemes beyond light/dark
8. **Rich Media**: Support for images, videos in responses

### Performance Optimizations
1. **Virtual Scrolling**: For very long conversations
2. **Message Pagination**: Load older messages on demand
3. **Image Lazy Loading**: Defer loading of media
4. **Code Splitting**: Reduce initial bundle size

## Design Guidelines for Developers

### Adding New Components
1. Follow existing naming conventions
2. Use Tailwind classes for styling
3. Ensure responsive behavior
4. Add proper TypeScript types
5. Include accessibility attributes

### Color Usage
- Use Tailwind color palette
- Maintain contrast ratios
- Test both light and dark themes
- Use semantic color names

### Spacing
- Use Tailwind spacing scale (0.25rem increments)
- Maintain consistent padding/margins
- Use gap for flexbox spacing

## Testing Checklist

### Visual Testing
- [ ] Light theme displays correctly
- [ ] Dark theme displays correctly
- [ ] Sidebar collapse works smoothly
- [ ] Messages render with proper styling
- [ ] Loading animation appears
- [ ] Icons display correctly

### Responsive Testing
- [ ] Mobile view (320px - 767px)
- [ ] Tablet view (768px - 1023px)
- [ ] Desktop view (1024px+)
- [ ] Sidebar behavior on different screens

### Interaction Testing
- [ ] Send button enables/disables correctly
- [ ] Enter key sends message
- [ ] Shift+Enter creates new line
- [ ] Logout button works
- [ ] New chat button clears conversation

### Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Screen reader announces content
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG standards

## Version History

### v2.0 (March 13, 2026)
- Complete UI redesign with modern ChatGPT-like interface
- Added collapsible sidebar with branding
- Implemented usage tracker display
- Added welcome screen with Sparkles icon
- Improved message bubbles with avatars
- Added loading animation with bouncing dots
- Enhanced mobile responsiveness
- Integrated Lucide React icons
- Better visual hierarchy and spacing

### v1.0 (March 13, 2026)
- Initial release with basic chat interface
- Simple message display
- Basic input form
- Login/register pages

## Support & Maintenance

For UI-related issues or suggestions:
1. Open an issue on GitHub
2. Tag with `ui` or `design` label
3. Include screenshots if applicable
4. Describe expected vs actual behavior

## Credits

- **Design Inspiration**: ChatGPT, Claude, Perplexity
- **Icon Library**: Lucide (https://lucide.dev)
- **UI Framework**: Tailwind CSS (https://tailwindcss.com)
- **Component Library**: React (https://react.dev)
