# InfluenceMatch - Social Media Influencer Platform

A full-stack influencer marketing platform built with Node.js, Express, MySQL, and  JavaScript.

## Features

### User Roles
- **Influencers**: Create profiles, add social media handles, apply to campaigns
- **Brands**: Create campaigns, search influencers, manage applications
- **Admins**: Manage users, approve brand requests, view analytics

### Core Functionality
- User authentication with JWT tokens
- Campaign creation and management
- Application system for influencer-brand matching
- Real-time analytics with Chart.js
- Brand request approval workflow
- Social media handle management
- Responsive design

## Technology Stack

### Backend
- Node.js + Express.js
- MySQL with mysql2
- JWT authentication
- bcryptjs for password hashing
- CORS enabled

### Frontend
- Pure HTML, CSS, JavaScript (no frameworks)
- Chart.js for analytics visualization
- Responsive design with CSS Grid/Flexbox
- localStorage for client-side data persistence

## Setup Instructions

### 1. Database Setup
```sql
-- Create MySQL database and run the schema
mysql -u root -p
source backend/database/schema.sql
```

### 2. Backend Setup
```bash
cd backend
npm install
```

### 3. Environment Configuration
Create `backend/.env` file:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=influencematch
DB_PORT=3306
JWT_SECRET=your_jwt_secret_key_here
PORT=3000
```

### 4. Start the Server
```bash
cd backend
npm start
# or for development
npm run dev
```

## Project Structure

```
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── database/
│   │   └── schema.sql
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── campaigns.js
│   │   ├── applications.js
│   │   ├── brandRequests.js
│   │   └── analytics.js
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── login.js
│   │   ├── signup.js
│   │   ├── admin-dashboard.js
│   │   ├── brand-dashboard.js
│   │   ├── influencer-dashboard.js
│   │   └── campaigns.js
│   ├── index.html
│   ├── login.html
│   ├── signup.html
│   ├── admin-dashboard.html
│   ├── brand-dashboard.html
│   ├── influencer-dashboard.html
│   └── campaigns.html
└── README.md
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - User registration
- POST `/api/auth/login` - User login

### Users
- GET `/api/users` - Get all users (admin only)
- GET `/api/users/profile` - Get user profile
- PUT `/api/users/profile` - Update user profile
- POST `/api/users/social-media` - Add social media handle
- GET `/api/users/influencers` - Get influencers (brands only)

### Campaigns
- GET `/api/campaigns` - Get all active campaigns
- GET `/api/campaigns/brand` - Get brand's campaigns
- POST `/api/campaigns` - Create campaign
- PUT `/api/campaigns/:id` - Update campaign
- DELETE `/api/campaigns/:id` - Delete campaign

### Applications
- POST `/api/applications` - Apply to campaign
- GET `/api/applications/influencer` - Get influencer's applications
- GET `/api/applications/brand` - Get brand's applications
- PUT `/api/applications/:id/status` - Update application status

### Brand Requests
- POST `/api/brand-requests` - Submit brand request
- GET `/api/brand-requests` - Get all brand requests (admin only)
- PUT `/api/brand-requests/:id/status` - Update request status

### Analytics
- GET `/api/analytics` - Get platform analytics (admin only)

## Database Schema

### Tables
- `users` - User accounts with roles
- `social_media_handles` - Influencer social media profiles
- `brand_requests` - Brand access requests
- `campaigns` - Marketing campaigns
- `applications` - Campaign applications

## Features in Detail

### Dashboard Analytics
- User distribution charts
- Campaign status tracking
- Brand request management
- User growth metrics

### Campaign Management
- Create and edit campaigns
- Set budgets and requirements
- Track applications
- Filter by platform and status

### Influencer Features
- Profile management
- Social media handle tracking
- Application history
- Earnings tracking (placeholder)

### Brand Features
- Influencer discovery
- Campaign creation
- Application review
- Performance analytics

## Security Features
- JWT token authentication
- Password hashing with bcryptjs
- Role-based access control
- Input validation
- CORS protection

## Responsive Design
- Mobile-friendly interface
- CSS Grid and Flexbox layouts
- Professional color scheme
- Clean, minimal design

## Future Enhancements
- Payment integration
- Advanced analytics
- Real-time notifications
- File upload capabilities
- Social media API integration
- Advanced search filters
