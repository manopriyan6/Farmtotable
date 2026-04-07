# Farm Direct Marketplace

A farm-to-table marketplace connecting farmers directly with customers through QR code technology.

## Features

- Farmer dashboard for managing products
- QR code generation for each product
- Customer product scanning and viewing
- Local SQLite database
- JWT authentication

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. The environment variables are already configured in `.env`

### Running the Application

You need to run both the backend server and frontend development server:

1. Start the backend server (in one terminal):
```bash
npm run server
```

2. Start the frontend (in another terminal):
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### User Roles

- **Farmer**: Can create, manage, and delete products with QR codes
- **Customer**: Can scan QR codes and view product details

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Express.js
- **Database**: SQLite (better-sqlite3)
- **Auth**: JWT + bcrypt
- **QR Codes**: qrcode library
