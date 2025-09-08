# SchoolPilot

A modern school management system built with Node.js, Express, React, and MySQL.

## Prerequisites

- Node.js 18+
- MySQL 8.0+
- npm or yarn

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/schoolpilot.git
cd schoolpilot
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the example environment file and update the values:

```bash
cp .env.example .env
```

Edit the `.env` file with your database credentials:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=school_pilot

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 4. Initialize the Database

```bash
# Create the database and tables
npm run db:init

# Run database migrations
npm run db:migrate
```

### 5. Start the Development Server

```bash
# Start the development server
npm run dev
```

The application will be available at `http://localhost:3000`.

## Database Management

### Available Scripts

- `npm run db:init` - Initialize the database
- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Generate new migration files
- `npm run db:push` - Push schema changes to the database
- `npm run db:studio` - Open Drizzle Studio (GUI for database)
- `npm run db:drop` - Drop the database (use with caution!)
- `npm run db:reset` - Reset the database (drop, create, migrate)

### Creating Migrations

1. Make changes to your schema files in `shared/schemas/`
2. Generate a new migration:
   ```bash
   npm run db:generate
   ```
3. Review the generated migration files in `drizzle/mysql-migrations/`
4. Apply the migrations:
   ```bash
   npm run db:migrate
   ```

## Project Structure

```
schoolpilot/
├── client/                 # Frontend React application
├── server/                 # Backend Express application
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Express middleware
│   ├── models/             # Database models
│   └── index.ts            # Server entry point
├── shared/                 # Shared code between frontend and backend
│   └── schemas/            # Database schemas
├── scripts/                # Utility scripts
│   ├── init-mysql.js       # Initialize MySQL database
│   ├── run-migrations.js   # Run database migrations
│   └── drop-database.js    # Drop the database
├── drizzle/                # Database migrations
│   └── mysql-migrations/   # MySQL migration files
└── types/                  # TypeScript type definitions
```

## Development

### Code Style

- Use TypeScript for all new code
- Follow the existing code style
- Use meaningful variable and function names
- Add comments for complex logic

### Git Workflow

1. Create a new branch for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes and commit them with a descriptive message
3. Push your branch and create a pull request

## Deployment

### Production Build

```bash
# Build the application
npm run build

# Start the production server
npm start
```

### Environment Variables for Production

Make sure to set the following environment variables in production:

```env
NODE_ENV=production
DB_HOST=your-production-db-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name
```

## License

MIT
