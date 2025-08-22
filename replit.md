# EduManage Pro - School Management System

## Overview

EduManage Pro is a comprehensive school management system built with modern web technologies. It provides a complete solution for managing students, teachers, academic activities, attendance, finances, and administrative tasks in educational institutions. The system features a responsive web interface with role-based access control and comprehensive data management capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern component development
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Context API for authentication and TanStack React Query for server state management
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **Build Tool**: Vite for fast development and optimized production builds
- **Component Structure**: Modular component architecture with reusable UI components, page-specific components, and shared utilities

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules for modern JavaScript features
- **API Design**: RESTful API architecture with /api prefix for all endpoints
- **Data Layer**: Currently using in-memory storage with plans for database integration
- **Session Management**: Express sessions with PostgreSQL session store (connect-pg-simple)
- **Development Setup**: Hot module replacement and error overlay for development experience

### Data Storage Solutions
- **Current Implementation**: In-memory storage using Map data structures for rapid prototyping
- **Planned Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Local Storage**: Browser localStorage for client-side data persistence and offline capabilities
- **Schema Management**: Zod schemas for runtime validation and type inference
- **Migration System**: Drizzle Kit for database migrations and schema management

### Authentication and Authorization
- **Authentication**: Custom authentication context with localStorage persistence
- **Session Management**: Express sessions for server-side session handling
- **Role-Based Access**: Support for admin, teacher, student, and parent roles
- **Route Protection**: Client-side route guards based on authentication status
- **Demo Credentials**: Built-in demo login for development and testing

### Key Features and Modules
- **Student Management**: Registration, profiles, ID cards, and status tracking
- **Academic Management**: Curriculum planning, class scheduling, and assignment management
- **Attendance System**: Daily attendance tracking with bulk operations and reporting
- **Grading System**: Grade management, report card generation, and academic analytics
- **Financial Management**: Fee collection, invoice generation, and financial reporting
- **Communication**: Announcement system and notification management
- **Library Management**: Book catalog, issue tracking, and inventory management
- **HR Management**: Staff management, payroll, and employee records
- **Facilities Management**: Resource booking, maintenance tracking, and facility oversight
- **Transportation**: Route management, vehicle tracking, and student transport coordination
- **Hostel Management**: Room allocation, mess management, and resident tracking
- **Examination System**: Exam scheduling, result management, and performance analytics
- **Reporting System**: Comprehensive reports with data visualization and export capabilities
- **Administrative Tools**: System settings, user management, and configuration options

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: Database connectivity for Neon PostgreSQL
- **drizzle-orm & drizzle-zod**: Type-safe ORM with Zod integration for schema validation
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight React router for navigation

### UI and Design System
- **@radix-ui/react-***: Comprehensive set of headless UI primitives for accessibility
- **tailwindcss**: Utility-first CSS framework for responsive design
- **class-variance-authority & clsx**: Dynamic className generation utilities
- **lucide-react**: Modern icon library for consistent iconography
- **@hookform/resolvers**: Form validation resolvers for React Hook Form

### Development and Build Tools
- **vite**: Fast build tool with HMR and optimized bundling
- **typescript**: Static type checking for improved code quality
- **esbuild**: Fast JavaScript bundler for server-side code
- **@replit/vite-plugin-***: Replit-specific development enhancements

### Utility Libraries
- **date-fns**: Date manipulation and formatting utilities
- **nanoid**: Unique ID generation for data entities
- **connect-pg-simple**: PostgreSQL session store for Express
- **embla-carousel-react**: Carousel component for image galleries and content sliders