# Portfolio Project

A full-stack portfolio application built with modern web technologies.

## Project Structure

```
portfolio/
├── client/          # Next.js frontend application
├── server/          # Backend API server
├── asset-download/  # Asset management
└── README.md        # This file
```

## Technologies Used

### Frontend (Client)
- **Next.js** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **ESLint** - Code linting

### Backend (Server)
- **Node.js** - Runtime environment
- **TypeScript** - Type safety
- **Prisma** - Database ORM
- **Express/FastAPI** - Web framework

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Abdelrahmansayed1/Rentai.git
   cd Rentai
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install client dependencies
   cd client
   npm install
   
   # Install server dependencies
   cd ../server
   npm install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env` in both client and server directories
   - Update the environment variables as needed

4. **Database Setup** (if using Prisma)
   ```bash
   cd server
   npx prisma generate
   npx prisma db push
   ```

5. **Run the application**
   ```bash
   # Start the server (from server directory)
   npm run dev
   
   # Start the client (from client directory)
   npm run dev
   ```

## Development

- **Client**: Runs on `http://localhost:3000`
- **Server**: Runs on `http://localhost:8000` (or as configured)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Author

Abdelrahman Sayed
