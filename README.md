# CoWrite

A collaborative storytelling web application where friends take turns writing parts of a story together.

## Features

- **User Authentication**: Secure JWT-based authentication with email/password
- **Circles**: Create private writing groups and invite friends via email
- **Collaborative Stories**: Take turns adding to stories with your circle members
- **Real-time Updates**: WebSocket-powered live updates when someone adds to a story
- **Contributor Highlighting**: Click on a contributor's name to highlight their parts of the story

## Tech Stack

### Backend
- Ruby on Rails 7.2 (API mode)
- PostgreSQL
- Action Cable for WebSockets
- JWT for authentication

### Frontend
- React 18 with TypeScript
- Vite
- Tailwind CSS
- React Router
- React Query
- Axios

## Development Setup

### Prerequisites
- Ruby 3.3.10 (managed via rbenv)
- Node.js 18+
- PostgreSQL

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd CoWrite
```

2. Install Ruby dependencies:
```bash
bundle install
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
cd ..
```

4. Set up the database:
```bash
rails db:create
rails db:migrate
rails db:seed
```

5. Start the development servers:
```bash
bin/dev
```

This starts:
- Rails API on http://localhost:3001
- React frontend on http://localhost:3000

### Default Accounts (Development)

After seeding:
- **Super Admin**: admin@cowrite.com / password123
- **Test Users**: alice@example.com, bob@example.com, charlie@example.com (all use password123)

## Project Structure

```
CoWrite/
├── app/                    # Rails application
│   ├── channels/           # Action Cable channels
│   ├── controllers/api/    # API controllers
│   ├── models/             # ActiveRecord models
│   └── services/           # Business logic (JWT, etc.)
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts (Auth)
│   │   ├── pages/          # Page components
│   │   ├── services/       # API client
│   │   └── types/          # TypeScript types
│   └── ...
├── config/                 # Rails configuration
├── db/                     # Database migrations and seeds
└── ...
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login
- `DELETE /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Circles
- `GET /api/circles` - List user's circles
- `POST /api/circles` - Create a circle
- `GET /api/circles/:id` - Get circle details
- `PATCH /api/circles/:id` - Update circle
- `DELETE /api/circles/:id` - Delete circle
- `POST /api/circles/:id/invitations` - Invite user to circle

### Stories
- `GET /api/circles/:circle_id/stories` - List circle's stories
- `POST /api/circles/:circle_id/stories` - Start a new story
- `GET /api/stories/:id` - Get story with contributions
- `PATCH /api/stories/:id/complete` - Mark story as complete

### Contributions
- `POST /api/stories/:story_id/contributions` - Add to a story

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for Dokku deployment instructions.

## Environment Variables

### Development
No environment variables required - uses defaults.

### Production
- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY_BASE` - Rails secret key
- `ADMIN_EMAIL` - Super admin email
- `ADMIN_PASSWORD` - Super admin password
- `FRONTEND_URL` - Frontend URL for CORS
- `REDIS_URL` - Redis URL for Action Cable

## License

MIT
