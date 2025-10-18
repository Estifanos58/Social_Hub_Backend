
# SocialHub Backend

<p align="center">
Db Diagram Link:- https://dbdiagram.io/d/68f383782e68d21b41193984
</p>
----------------------------------
<img width="1221" height="1276" alt="Social-hub_light" src="https://github.com/user-attachments/assets/3ff5eb19-88fd-481c-a4c5-d4fd0ad78a72" />
----------------------------------
## Overview

**SocialHub Backend** is a robust, scalable, and feature-rich GraphQL API server for a modern social networking platform. Built with [NestJS](https://nestjs.com/) and [Prisma ORM](https://www.prisma.io/), it powers real-time social interactions, messaging, notifications, and user management with a modular, event-driven architecture.

---

## Features

- **Authentication & Authorization**: JWT-based authentication, refresh tokens, OAuth (Google, GitHub), email verification, password reset, and account privacy controls.
- **User Profiles & Social Graph**: Rich user profiles, follow/unfollow, followers/following lists, user search, and suggestions.
- **Posts & Reactions**: Create, delete, and fetch posts with image support, paginated feeds, and multiple reaction types (like, love, haha, etc.).
- **Comments & Replies**: Nested comments, replies, and efficient pagination for large threads.
- **Notifications**: Real-time and persistent notifications for comments, reactions, follows, and more, with unread counts and read tracking.
- **Messaging & Chatrooms**: Direct and group chatrooms, real-time messaging (subscriptions), unread counts, and read receipts.
- **GraphQL API**: Strongly-typed schema, modular resolvers, CQRS pattern, and GraphQL subscriptions for real-time updates.
- **Event-Driven**: Uses NestJS CQRS and event emitter for decoupled business logic and side effects (e.g., notifications on new followers).
- **Prisma ORM**: Type-safe, performant database access with PostgreSQL, migrations, and advanced relations.
- **Redis PubSub**: Real-time GraphQL subscriptions and scalable event delivery.
- **Testing**: Unit and e2e tests with Jest.

---

## Architecture

- **NestJS**: Modular, dependency-injected, and testable application structure.
- **CQRS**: Command and Query Responsibility Segregation for scalable, maintainable business logic.
- **Prisma**: Modern ORM for PostgreSQL, with a rich schema for users, posts, comments, reactions, notifications, chatrooms, and more.
- **GraphQL**: Apollo Server with code-first schema, subscriptions, and context-aware resolvers.
- **Redis**: For pub/sub and scalable real-time features.

---

## Tech Stack

- **Node.js** (NestJS, TypeScript)
- **GraphQL** (Apollo, graphql-ws)
- **Prisma ORM** (PostgreSQL)
- **Redis** (PubSub, caching)
- **Jest** (Testing)
- **Docker** (Recommended for deployment)

---

## Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL database
- Redis server

### Installation

```bash
git clone <repo-url>
cd social-hub_backend
npm install
```

### Environment Setup

Copy `.env.example` to `.env` and configure your database, Redis, and JWT secrets:

```bash
cp .env.example .env
# Edit .env with your credentials
```

### Database Migration

```bash
npx prisma migrate deploy
# or for development
npx prisma migrate dev
```

### Running the Server

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

### Testing

```bash
# Unit tests
npm run test
# e2e tests
npm run test:e2e
# Coverage
npm run test:cov
```

---

## API Reference

- **GraphQL Playground**: Available at `/graphql` in development mode.
- **Authentication**: JWT via HTTP-only cookies, OAuth, and email flows.
- **Subscriptions**: Real-time updates for messaging, notifications, and more.

---

## Folder Structure

- `src/` - Main source code
  - `auth/` - Authentication, guards, and resolvers
  - `user/` - User profile, follow, search, and CQRS handlers
  - `post/` - Posts, reactions, and related events
  - `comment/` - Comments, replies, and pagination
  - `notification/` - Notification logic and queries
  - `message/` - Chatrooms, messages, and subscriptions
  - `mail/` - Email sending and templates
  - `prisma.service.ts` - Prisma integration
  - `pubsub.ts` - Redis PubSub setup
  - `types/` - GraphQL and DTO types
  - `utils/` - Utility functions
- `prisma/` - Prisma schema and migrations
- `test/` - Test suites

---

## Contributing

Contributions are welcome! Please open issues and submit pull requests for new features, bug fixes, or improvements.

---

## License

This project is licensed under the MIT License.
