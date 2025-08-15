# Nikwela - Public Transport Platform

A comprehensive public transport platform for Zambia, built with Expo (React Native) and Supabase. Nikwela connects commuters, drivers, and administrators in a unified transport ecosystem.

## Features

### For Commuters
- 🗺️ **Interactive Maps** - View routes and stops with real-time GPS tracking
- 🔍 **Route Search** - Find transport options with fare estimates
- ⭐ **Favorites** - Save frequently used routes and stops
- 💳 **Mobile Payments** - Pay fares via MTN Money, Airtel Money, or Zamtel Kwacha
- 📱 **Offline Support** - Access cached route data without internet

### For Drivers
- 🚗 **Trip Management** - Start, track, and complete trips
- 📍 **GPS Tracking** - Share real-time location with passengers
- 📊 **Trip History** - View completed trips and earnings
- 🎯 **Route Selection** - Choose from available transport routes

### For Administrators
- 📈 **Analytics Dashboard** - Monitor trips, revenue, and user activity
- 🛣️ **Route Management** - Create, edit, and manage transport routes
- 💰 **Fare Control** - Set and update pricing for different routes
- 👥 **User Management** - Manage driver and commuter accounts

## Technology Stack

- **Frontend**: Expo (React Native) with TypeScript
- **Backend**: Supabase (PostgreSQL + Real-time)
- **Authentication**: Supabase Auth with JWT
- **Maps**: React Native Maps with OpenStreetMap
- **Storage**: AsyncStorage for offline caching
- **Payments**: Mobile Money API integration

## Getting Started

### Prerequisites
- Node.js 16+ and npm
- Expo CLI (`npm install -g expo-cli`)
- Supabase account and project

### Installation

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd nikwela
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your Supabase credentials:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Database Setup**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the migration file: `supabase/migrations/create_nikwela_schema.sql`

4. **Start Development**
   ```bash
   npm run dev
   ```

### Project Structure

```
nikwela/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Home/Map screen
│   │   ├── routes.tsx     # Routes listing
│   │   ├── favorites.tsx  # Favorite routes
│   │   ├── driver.tsx     # Driver dashboard
│   │   ├── trips.tsx      # Trip history
│   │   ├── admin.tsx      # Admin panel
│   │   └── profile.tsx    # User profile
│   ├── auth/              # Authentication screens
│   │   ├── login.tsx      # Login screen
│   │   └── register.tsx   # Registration screen
│   └── _layout.tsx        # Root layout with auth
├── lib/
│   └── supabase.ts        # Supabase client and types
├── hooks/
│   ├── useAuth.ts         # Authentication hook
│   └── useFrameworkReady.ts # Framework initialization
├── supabase/
│   └── migrations/        # Database schema
└── assets/                # Images and static files
```

## Database Schema

The platform uses a comprehensive PostgreSQL schema with the following tables:

- **users** - User accounts with role-based access (commuter/driver/admin)
- **routes** - Transport routes with start/end points and duration
- **stops** - Individual bus stops with GPS coordinates
- **fares** - Pricing information for each route
- **trips** - Active and completed driver trips
- **payments** - Payment transaction records
- **locations** - Real-time GPS tracking data

Row Level Security (RLS) is enabled for all tables with role-based policies.

## Key Features Implementation

### Real-time GPS Tracking
- Drivers share location every 5 seconds during active trips
- Commuters can see live bus positions on the map
- Location data is stored for trip history and analytics

### Payment Integration
The platform supports multiple payment methods:
- **MTN Money** - Zambia's leading mobile money service
- **Airtel Money** - Airtel's mobile payment platform  
- **Zamtel Kwacha** - Zamtel's digital wallet
- **Cash** - Traditional cash payments

### Offline-First Architecture
- Route and stop data is cached locally using AsyncStorage
- App functions without internet for basic route information
- Syncs data when connection is restored

### Multi-Role Support
- **Commuters**: Find routes, pay fares, track buses
- **Drivers**: Manage trips, share location, view earnings
- **Administrators**: Manage routes, monitor system, set fares

## Security Features

- JWT-based authentication with Supabase
- Row Level Security (RLS) for data protection
- Role-based access control
- Secure API endpoints for sensitive operations
- Payment verification and transaction logging

## Deployment

### Mobile App
```bash
# Build for production
expo build:android  # For Google Play Store
expo build:ios      # For Apple App Store

# Or using EAS Build (recommended)
eas build --platform android
eas build --platform ios
```

### Backend
The Supabase backend is automatically managed. For additional features:

1. Set up webhook endpoints for payment processing
2. Configure real-time subscriptions for live tracking
3. Set up backup and monitoring for production use

## API Integration

### Mobile Money APIs
Integrate with Zambian mobile money providers:

```typescript
// Example MTN Money integration
const processMTNPayment = async (amount: number, phoneNumber: string) => {
  // Implementation depends on MTN Money API
  // This would typically involve:
  // 1. Initiate payment request
  // 2. Handle callback/webhook
  // 3. Update payment status in database
};
```

### Maps Integration
The platform uses react-native-maps which supports:
- Google Maps (with API key)
- OpenStreetMap (free alternative)
- Custom map styling and markers

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Production Considerations

### Performance
- Implement proper caching strategies
- Optimize map rendering for low-end devices
- Use lazy loading for large datasets
- Implement proper error boundaries

### Security
- Use environment variables for sensitive configuration
- Implement rate limiting for API endpoints
- Regular security audits and dependency updates
- Secure payment webhook endpoints

### Monitoring
- Set up error tracking (Sentry, Bugsnag)
- Monitor API performance and usage
- Track user analytics for business insights
- Set up automated backups

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Email: support@nikwela.com
- Documentation: [Link to docs]
- GitHub Issues: [Repository issues page]

---

Built with ❤️ for Zambian public transport