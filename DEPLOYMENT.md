# Deployment Guide for Board Studio

## Prerequisites
- Remote server with Node.js 20+ installed
- Firebase project with Firestore enabled
- Service account key for Firebase (or use application default credentials)

## Steps

### 1. Prepare the Application
```bash
# Build the client
cd client
npm install
npm run build

# Ensure server dependencies
cd ../server
npm install
```

### 2. Configure Environment
Copy `server/.env` to the remote server and update:
- `CLIENT_URL`: Set to your domain or IP
- `FIREBASE_*`: Update with your Firebase credentials
- `PORT`: 5000 (or your choice)

### 3. Deploy to Remote Server
```bash
# Copy files to remote server
scp -r server/ user@80.65.211.200:/path/to/app/
scp client/dist/ user@80.65.211.200:/path/to/app/server/client-dist/

# On remote server
cd /path/to/app/server
npm start
```

### 4. Using Docker (Alternative)
```bash
# Build Docker image locally
cd server
docker build -t board-studio-server .

# Save and transfer image
docker save board-studio-server > board-studio-server.tar
scp board-studio-server.tar user@80.65.211.200:/path/

# On remote server
docker load < board-studio-server.tar
docker run -p 5000:5000 -e PORT=5000 board-studio-server
```

### 5. Access the Application
- API: http://80.65.211.200:5000/api
- Frontend: http://80.65.211.200:5000

## Firebase Functions (Optional)
For production, deploy functions to Firebase:
```bash
cd functions
npm install
firebase deploy --only functions
```</content>
<parameter name="filePath">c:\Users\WILBROADAY\Documents\The Board Studio\DEPLOYMENT.md