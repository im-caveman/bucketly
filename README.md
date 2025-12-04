# Bucketly

Bucketly is a gamified bucket list tracking application that helps you turn dreams into achievements. Track your goals, compete with friends, and celebrate every milestone.

## Features

- **Bucket List Tracking**: Create and manage your bucket list items.
- **Gamification**: Earn points and badges for completing items.
- **Social Features**: Follow friends, see their progress, and compete on the leaderboard.
- **Memories**: Upload photos and reflections for completed items.
- **Progress Tracking**: Visualize your journey with charts and statistics.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **State Management**: Zustand / SWR
- **Testing**: Vitest

## Getting Started

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/bucketly.git
    cd bucketly
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Copy `.env.example` to `.env.local` and fill in your Supabase credentials.
    ```bash
    cp .env.example .env.local
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```

## Deployment

This project is ready to be deployed on Vercel.

1.  Push your code to a GitHub repository.
2.  Import the project into Vercel.
3.  Set the environment variables in Vercel project settings (copy from `.env.local`).
4.  Deploy!

## Security

- **Authentication**: Handled by Supabase Auth.
- **RLS**: Row Level Security is enabled on all database tables.
- **Headers**: Security headers are configured in `next.config.ts`.

## License

MIT
