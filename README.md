# DSS Workflow Frontend

A modern, responsive Next.js frontend for the DSS Workflow network monitoring and threat detection system. Built with TypeScript, Tailwind CSS, and shadcn/ui components.

## 🚀 Features

### Dashboard
- **Real-time Statistics**: Total logs, anomalies, blocked IPs, and unblocked IPs
- **Live Traffic Charts**: Interactive line charts showing network activity over time
- **Logs Distribution**: Donut charts with attack type breakdowns
- **Attack Logs Table**: Recent security incidents with detailed information

### Pages & Navigation
- **Home Dashboard**: Main monitoring interface with key metrics
- **Logs Page**: Searchable, paginated table of all system logs
- **Incidents Page**: Filterable list of security incidents with detail views
- **Authentication**: Secure login form with validation

### User Experience
- **Theme Support**: Light/dark mode with persistent user preference
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Real-time Updates**: Live data refresh with WebSocket support
- **Error Handling**: Comprehensive error boundaries and loading states

## 🛠 Tech Stack

- **Framework**: Next.js 15.4.1 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod validation
- **Theme**: next-themes
- **Icons**: Lucide React

## 📁 Project Structure

```
DDS-Test/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx               # Root layout with theme provider
│   ├── page.tsx                 # Home dashboard
│   ├── not-found.tsx            # 404 error page
│   ├── error.tsx                # 500 error page
│   ├── logs/                    # Logs page
│   ├── incidents/               # Incidents page
│   └── auth/login/              # Authentication
├── components/                   # Reusable components
│   ├── ui/                      # shadcn/ui components
│   ├── layout/                  # Layout components
│   ├── dashboard/               # Dashboard-specific components
│   └── theme-provider.tsx       # Theme provider
├── lib/                         # Utilities and API
│   ├── api.ts                   # API client
│   ├── utils.ts                 # Utility functions
│   └── websocket.ts             # WebSocket connection
├── types/                       # TypeScript type definitions
└── public/                      # Static assets
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- FastAPI backend running (optional for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd DDS-Test
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure your environment variables:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

### Component Development

#### Client vs Server Components
- **Client Components**: Use `'use client'` directive for interactive components
- **Server Components**: Default for static content and layouts
- **Interval-based**: Use `useEffect` with `setInterval` for real-time data

#### Example Client Component
```tsx
'use client'

import { useState, useEffect } from 'react'

export function RealTimeComponent() {
  const [data, setData] = useState(null)
  
  useEffect(() => {
    const fetchData = async () => {
      // Fetch data logic
    }
    
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])
  
  return <div>Component content</div>
}
```

### API Integration

The project includes a comprehensive API client in `lib/api.ts`:

```typescript
import { logsApi, incidentsApi } from '@/lib/api'

// Fetch logs with filtering
const logs = await logsApi.getLogs({ 
  skip: 0, 
  limit: 20, 
  is_anomaly: true 
})

// Fetch incidents
const incidents = await incidentsApi.getIncidents({ 
  status: 'open' 
})
```

### Styling Guidelines

- Use Tailwind CSS classes for styling
- Follow the design system defined in `components/ui`
- Use CSS variables for theme colors
- Implement responsive design with mobile-first approach

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#3b82f6)
- **Secondary**: Orange (#f97316)
- **Destructive**: Red (#ef4444)
- **Success**: Green (#22c55e)
- **Warning**: Yellow (#eab308)

### Typography
- **Font**: Geist Sans (primary), Geist Mono (code)
- **Sizes**: Follow Tailwind's text scale
- **Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Components
- **Cards**: Rounded corners, subtle shadows
- **Buttons**: Consistent variants (default, outline, ghost, destructive)
- **Tables**: Clean, minimal design with proper spacing
- **Charts**: Interactive with tooltips and legends

## 🔒 Security

### Authentication
- Form validation with Zod schemas
- Secure token storage
- Protected routes (to be implemented)

### API Security
- CORS configuration
- Request/response interceptors
- Error handling for unauthorized access

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px (full-width stacking)
- **Tablet**: 768px - 1024px (2-column grid)
- **Desktop**: > 1024px (multi-column layout)

### Mobile Features
- Collapsible sidebar
- Touch-friendly buttons
- Optimized table scrolling
- Simplified navigation

## 🧪 Testing

### Component Testing
```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### E2E Testing
```bash
# Run Playwright tests
npm run test:e2e
```

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_WS_URL`: WebSocket URL (optional)

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

### Development Guidelines
1. **Follow TypeScript best practices**
2. **Use proper component separation**
3. **Implement error boundaries**
4. **Add comprehensive comments**
5. **Follow the existing code style**

### Code Style
- **Functions**: camelCase
- **Components**: PascalCase
- **Files**: kebab-case
- **Constants**: UPPER_SNAKE_CASE

### Git Workflow
1. Create feature branch
2. Make changes with proper commits
3. Add tests if applicable
4. Submit pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Check the [documentation](docs/)
- Review the [changes log](changes.md)
- Open an issue on GitHub

## 🔄 Changelog

See [changes.md](changes.md) for a detailed list of all changes and improvements made to the project. 