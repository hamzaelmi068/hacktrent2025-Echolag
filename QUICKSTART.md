# Quick Start Guide

## Frontend (Next.js)

### Prerequisites
- Node.js installed (v18 or higher recommended)

### Setup & Run
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. **IMPORTANT: Install dependencies first** (required before running):
   ```bash
   npm install
   ```
   This will install Next.js and all other required packages.

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and visit:
   ```
   http://localhost:3000
   ```

The frontend will automatically reload when you make changes to the code.

### Troubleshooting
- **Error: 'next' is not recognized**: Run `npm install` first to install dependencies
- **Port 3000 already in use**: Next.js will automatically try the next available port (3001, 3002, etc.)

### Other Commands
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

---

## Backend

The backend directory appears to be empty or not yet set up. Once you have a backend:

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Follow the backend-specific setup instructions (install dependencies, configure environment variables, etc.)

3. Start the backend server (command depends on your backend framework)

---

## Running Both Together

To run both frontend and backend simultaneously:

1. Open two terminal windows/tabs
2. In Terminal 1: `cd frontend && npm run dev`
3. In Terminal 2: `cd backend && [your backend start command]`

Make sure the backend port doesn't conflict with the frontend (Next.js uses port 3000 by default).

