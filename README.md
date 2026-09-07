# CodeAlpha Tasks

This repository contains multiple tasks developed for CodeAlpha.

## Task 1: Vibe | Social Media Application

A hyper-modern, resume-worthy social media application built with Django and Vanilla JavaScript.

### 🎨 Design & Architecture
- **Vercel-Inspired UI:** A premium black/white monochromatic theme with subtle grays.
- **Glassmorphism:** 24px rounded corners, thin glass borders, and aggressive background blurring.
- **Aurora Background:** A pure CSS animated mesh gradient (purple/blue/pink) that floats slowly behind the UI.
- **Mouse Glow:** A custom JavaScript radial glow that tracks your cursor across the UI.
- **AJAX Everywhere:** Liking, commenting, following, and bookmarking all happen seamlessly without page reloads.

### ✨ Core Features
- **User Profiles:** Custom user models with avatars, cover images, and follower metrics.
- **Post Feed:** Create posts with text and image uploads via a floating glass modal.
- **Live Search:** Instant AJAX-powered search for users and posts.
- **Interactions:**
  - Instagram-style double-click to like (with heart explosion animation).
  - Slide-up bottom sheet for comments.
  - Follow/Unfollow users.
  - Bookmark posts.
- **Responsive Layout:** Desktop sidebar, tablet adjustments, and a mobile bottom navigation bar.

### 🛠️ Tech Stack
- **Backend:** Python, Django (with SQLite for local development)
- **Frontend:** HTML5, CSS3 (Custom Design System), Vanilla JavaScript (ES6+), Google Fonts (Inter), Lucide Icons.

---

## Task 2: Quantum Store | E-commerce Application

A modern, high-performance e-commerce web application featuring a premium, futuristic dark-mode UI/UX. Designed for technology enthusiasts, the platform offers a sleek interface with glassmorphism effects, dynamic interactions, and a fully functional shopping cart and user dashboard.

### Features

- **Futuristic UI/UX**: Custom TailwindCSS configuration with a curated dark-mode color palette, glassmorphic panels, and neon cyan accents.
- **Product Catalog**: Dynamic product fetching and category filtering.
- **Shopping Cart**: Client-side state management for the shopping cart with real-time UI updates.
- **User Dashboard**: A personalized dashboard for users to view order history and account details.
- **Authentication**: JWT-based user authentication and registration (backend ready).
- **Responsive Design**: Fully mobile-responsive layouts for all pages.

### Tech Stack

- **Frontend**: HTML5, Vanilla JavaScript, TailwindCSS (via CDN)
- **Backend**: Node.js, Express.js
- **Database**: SQLite
- **Authentication**: JWT (JSON Web Tokens), bcrypt

### Getting Started

#### Prerequisites
- Node.js (v14 or higher recommended)
- npm (Node Package Manager)

#### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Ensure you have a `.env` file in the root directory (it is ignored by Git for security).
   Example `.env` configuration:
   ```env
   PORT=3000
   JWT_SECRET=your_super_secret_jwt_key_here
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

4. **Access the application**:
   Open your browser and navigate to `http://localhost:3000`

### 🌐 Live Cloud Deployment

This application is 100% production-ready and configured for cloud deployment:

#### Deploy to Vercel (Fast & Global CDN)
1. Go to [Vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New...** &rarr; **Project** and import `SHIKHARCHATURVEDI19/codealpha_tasks`.
3. In **Environment Variables**, add:
   - `JWT_SECRET`: `your_super_secret_jwt_key_here`
4. Click **Deploy**. Vercel will automatically read `vercel.json` and deploy both the static frontend and the serverless `/api` backend!

#### Deploy to Render
1. Connect your GitHub repository to [Render.com](https://render.com).
2. Create a new **Web Service**.
3. Render will automatically detect `render.yaml` or you can manually configure:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Set environment variable `JWT_SECRET` in the Render dashboard.

#### Deploy to Railway / VPS
1. Set up a Node service with `PORT` and `JWT_SECRET`.
2. Run `npm install && npm start`.
3. The server uses relative `/api` endpoints, ensuring seamless HTTPS operation on any domain.

### 📡 API Endpoints Overview

- `GET /api/health` - Cloud uptime health check
- `POST /api/auth/register` - Create user account
- `POST /api/auth/login` - Authenticate & obtain JWT
- `GET /api/auth/me` - Get current user profile & telemetry
- `GET /api/products` - Fetch product catalog (supports `?category=`)
- `GET /api/products/:id` - Fetch single product specifications
- `POST /api/orders` - Place new order (authenticated)
- `GET /api/orders` - Fetch authenticated user's order stream & items
- `POST /api/support/ticket` - Submit technical support diagnostics ticket

