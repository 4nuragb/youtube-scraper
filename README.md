# Youtube Video Fetcher

## Prerequisites

Before getting started, ensure you have:
- Node Version Manager (nvm)
- Node.js version 23
- npm (Node Package Manager)
- Git

## Project Setup

### Clone the Repository
```bash
git clone [YOUR_REPOSITORY_URL]
cd [PROJECT_DIRECTORY]
```

### Server Setup

1. Navigate to server directory
```bash
cd server
```

2. Set Node.js version
```bash
nvm use 23
```

3. Install dependencies
```bash
npm install
```

4. Build project (if required)
```bash
npm run build
```

5. Start development server
```bash
npm run dev
```

### Client Setup

1. Navigate to client directory
```bash
cd client
```

2. Set Node.js version
```bash
nvm use 23
```

3. Install dependencies
```bash
npm install
```

4. Start client application
```bash
npm start
```

## Environment Configuration

### Create Environment Files
1. In server directory, create `.env`:
```
PORT=3000
DATABASE_URL=your_database_connection_string
```

2. In client directory, create `.env`:
```
REACT_APP_API_URL=http://localhost:3000/api
```

## Troubleshooting

### Common Issues
- **Dependency Problems**: 
  ```bash
  npm ci  # Clean install
  ```
- **Node.js Version**: 
  ```bash
  nvm install 23  # Install if not available
  ```

### Debugging Checklist
- [ ] Verify Node.js version
- [ ] Confirm dependencies installed
- [ ] Check port configurations
- [ ] Validate environment variables

## Available Scripts

### Server Scripts
- `npm run dev`: Start development server
- `npm run build`: Build project
- `npm run test`: Run tests

### Client Scripts
- `npm start`: Start development server
- `npm run build`: Create production build
- `npm run test`: Run tests

## Deployment

### Build for Production
1. Server
```bash
cd server
npm run build
```

2. Client
```bash
cd client
npm run build
```

## Best Practices
- Keep Node.js and npm updated
- Use consistent Node.js versions
- Regularly update dependencies

## Project Structure
```
project-root/
│
├── server/
│   ├── src/
│   ├── package.json
│   └── .env
│
└── client/
    ├── src/
    ├── package.json
    └── .env
```

## Recommended Workflow
1. Open two terminal windows
2. Run server in first terminal
3. Run client in second terminal
4. Ensure both are running simultaneously

