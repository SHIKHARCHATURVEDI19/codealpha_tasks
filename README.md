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
