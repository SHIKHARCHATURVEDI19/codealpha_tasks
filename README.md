# Quantum Store

A modern, high-performance e-commerce web application featuring a premium, futuristic dark-mode UI/UX. Designed for technology enthusiasts, the platform offers a sleek interface with glassmorphism effects, dynamic interactions, and a fully functional shopping cart and user dashboard.

## Features

- **Futuristic UI/UX**: Custom TailwindCSS configuration with a curated dark-mode color palette, glassmorphic panels, and neon cyan accents.
- **Product Catalog**: Dynamic product fetching and category filtering.
- **Shopping Cart**: Client-side state management for the shopping cart with real-time UI updates.
- **User Dashboard**: A personalized dashboard for users to view order history and account details.
- **Authentication**: JWT-based user authentication and registration (backend ready).
- **Responsive Design**: Fully mobile-responsive layouts for all pages.

## Tech Stack

- **Frontend**: HTML5, Vanilla JavaScript, TailwindCSS (via CDN)
- **Backend**: Node.js, Express.js
- **Database**: SQLite
- **Authentication**: JWT (JSON Web Tokens), bcrypt

## Getting Started

### Prerequisites

- Node.js (v14 or higher recommended)
- npm (Node Package Manager)

### Installation

1. **Clone the repository** (if applicable):
   ```bash
   git clone <repository-url>
   cd quantum-store
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Ensure you have a `.env` file in the root directory (it is ignored by Git for security).
   Example `.env` configuration:
   ```env
   PORT=3000
   JWT_SECRET=your_super_secret_jwt_key_here
   ```

4. **Start the server**:
   ```bash
   npm start
   ```

5. **Access the application**:
   Open your browser and navigate to `http://localhost:3000`

## Project Structure

- `/public`: Contains all static frontend assets (HTML, CSS, JS, Images).
- `server.js`: The main Express server entry point.
- `db.js`: Database initialization and schema definitions.
- `.env`: Environment configuration file (must be created locally).
- `.gitignore`: Specifies intentionally untracked files to ignore.

## License

This project is licensed under the MIT License.
