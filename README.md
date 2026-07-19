# Vibe | Social Media Application (CodeAlpha Task)

*This project was developed as a task for **CodeAlpha**.*

A hyper-modern, resume-worthy social media application built with Django and Vanilla JavaScript.

## 🎨 Design & Architecture
- **Vercel-Inspired UI:** A premium black/white monochromatic theme with subtle grays.
- **Glassmorphism:** 24px rounded corners, thin glass borders, and aggressive background blurring.
- **Aurora Background:** A pure CSS animated mesh gradient (purple/blue/pink) that floats slowly behind the UI.
- **Mouse Glow:** A custom JavaScript radial glow that tracks your cursor across the UI.
- **AJAX Everywhere:** Liking, commenting, following, and bookmarking all happen seamlessly without page reloads.

## ✨ Core Features
- **User Profiles:** Custom user models with avatars, cover images, and follower metrics.
- **Post Feed:** Create posts with text and image uploads via a floating glass modal.
- **Live Search:** Instant AJAX-powered search for users and posts.
- **Interactions:**
  - Instagram-style double-click to like (with heart explosion animation).
  - Slide-up bottom sheet for comments.
  - Follow/Unfollow users.
  - Bookmark posts.
- **Responsive Layout:** Desktop sidebar, tablet adjustments, and a mobile bottom navigation bar.

## 🛠️ Tech Stack
- **Backend:** Python, Django (with SQLite for local development)
- **Frontend:** HTML5, CSS3 (Custom Design System), Vanilla JavaScript (ES6+), Google Fonts (Inter), Lucide Icons.

## 🚀 Local Development Setup

1. **Clone the repository and navigate into the folder:**
   ```bash
   cd social-media-app
   ```

2. **Create and activate a virtual environment:**
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\Activate.ps1
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install Dependencies:**
   ```bash
   pip install django pillow
   ```

4. **Run Database Migrations:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. **Seed the Database with Dummy Data:**
   ```bash
   python dummy_data.py
   ```
   *(This creates simulated users (alice, bob, carol) with default passwords (`password123`), along with dummy posts, comments, likes, and follows).*

6. **Start the Development Server:**
   ```bash
   python manage.py runserver
   ```

7. **Access the App:**
   Open your browser to `http://127.0.0.1:8000/` and log in with any of the seeded accounts (e.g., `alice` / `password123`).
