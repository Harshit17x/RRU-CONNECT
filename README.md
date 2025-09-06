# RRU Connect - University Dating Platform

A modern, responsive dating platform designed specifically for university students. Connect with fellow students at RRU through an intuitive swiping interface, real-time messaging, and comprehensive profile management.

## 🌟 Features

### ✨ User Authentication
- **Login & Signup**: Secure user registration and login system
- **Profile Creation**: Complete profile setup with personal information
- **Image Upload**: Upload and manage profile pictures

### 💖 Matching & Discovery
- **Card-based Swiping**: Tinder-style profile browsing
- **Smart Matching**: Like, super-like, or pass on profiles
- **Match Notifications**: Celebration popup when you get a match
- **Profile Details**: View complete profiles with bio, interests, and location

### 💬 Real-time Messaging
- **Match Chat**: Message with your matches instantly
- **Conversation History**: View all your conversations in one place
- **Live Responses**: Simulated responses from matches for demo purposes
- **Message Status**: See delivery status and timestamps

### 👤 Profile Management
- **Editable Profiles**: Update your information anytime
- **Interest Tags**: Add and display your hobbies and interests
- **Location & Occupation**: Share your professional and location details
- **Photo Management**: Easy profile picture upload and management

### 📱 Responsive Design
- **Mobile-First**: Optimized for all device sizes
- **Touch-Friendly**: Easy navigation on mobile devices
- **Modern UI**: Beautiful gradients and smooth animations
- **Accessibility**: Clean, readable interface

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No additional installations required!

### Installation

1. **Download the files**:
   ```
   - index.html
   - styles.css
   - script.js
   ```

2. **Open the website**:
   - Simply double-click `index.html` to open in your browser
   - Or serve it using a local web server for better performance

3. **Start using**:
   - Create an account or login with demo credentials
   - Complete your profile
   - Start swiping and matching!

## 📖 How to Use

### 1. **Sign Up / Login**
- Visit the homepage and choose "Sign Up" for new users
- Fill in your details including name, email, age, and gender
- Or use "Login" if you already have an account

### 2. **Complete Your Profile**
- Navigate to the "Profile" section
- Add your bio, interests, location, and occupation
- Upload a profile picture (optional)
- Save your changes

### 3. **Discover Matches**
- Go to the "Discover" section
- Browse through profile cards
- Use the action buttons:
  - ❌ **Red X**: Pass/Reject
  - ⭐ **Star**: Super Like
  - ❤️ **Heart**: Like

### 4. **View Your Matches**
- Check the "Matches" section to see who liked you back
- Click on any match to start a conversation

### 5. **Start Messaging**
- Go to the "Messages" section
- Click on any conversation to open the chat
- Type your message and press Enter or click Send
- Enjoy automated responses from matches (demo feature)

## 🛠️ Technical Details

### Built With
- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with Flexbox and Grid
- **Vanilla JavaScript**: No frameworks - pure JS functionality
- **Font Awesome**: Beautiful icons
- **Local Storage**: Data persistence in browser

### Architecture
- **Single Page Application (SPA)**: Smooth navigation between sections
- **Component-based Structure**: Modular code organization
- **Responsive Design**: Mobile-first approach
- **Progressive Enhancement**: Works without JavaScript (basic functionality)

## 🎨 Customization

### Colors
The website uses CSS custom properties (variables) for easy theming:

```css
:root {
    --primary-color: #ff4458;    /* Main brand color */
    --secondary-color: #ff8a8a;  /* Secondary brand color */
    --accent-color: #ffd700;     /* Accent color for special actions */
    --success-color: #28a745;    /* Success/like color */
}
```

## 🚀 Usage Instructions

1. **Open `index.html`** in your web browser
2. **Sign up** with any email and password (demo mode)
3. **Complete your profile** in the Profile section
4. **Start swiping** in the Discover section
5. **Check your matches** and start conversations!

---

**Made with ❤️ for RRU students**

*Connect, Chat, and find your campus match! 🎓💕*

# LoveConnect Dating App

A modern, full-stack dating application built with React.js and Node.js.

## Features

✨ **Core Features:**
- User authentication (register, login, logout)
- Profile management with photo uploads
- Smart matching algorithm
- Swipe-based discovery system
- Real-time messaging with Socket.io
- Geolocation-based matching
- Match notifications

🛡️ **Security & Privacy:**
- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- Input validation
- Secure file uploads

📱 **Modern UI/UX:**
- Responsive design with Tailwind CSS
- Smooth animations with Framer Motion
- Card-based swipe interface
- Real-time notifications
- Mobile-first approach

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **Socket.io** for real-time communication
- **JWT** for authentication
- **Multer** for file uploads
- **bcrypt** for password hashing

### Frontend  
- **React.js** with hooks
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Axios** for API calls
- **Socket.io-client** for real-time features

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your settings:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dating-app
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=30d
NODE_ENV=development
```

5. Start the backend server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The app will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/photos` - Upload profile photo
- `GET /api/users/discover` - Get potential matches

### Matches
- `POST /api/matches/like/:userId` - Like a user
- `POST /api/matches/dislike/:userId` - Dislike a user
- `GET /api/matches` - Get user matches

### Messages
- `POST /api/messages/:matchId` - Send a message
- `GET /api/messages/:matchId` - Get match messages

## Project Structure

```
dating-app/
├── backend/
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── uploads/         # File uploads
│   └── server.js        # Main server file
└── frontend/
    ├── src/
    │   ├── components/  # Reusable components
    │   ├── pages/       # Page components
    │   ├── context/     # React context
    │   ├── services/    # API services
    │   ├── hooks/       # Custom hooks
    │   └── utils/       # Utility functions
    └── public/          # Static assets
```

## Development Scripts

### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests

### Frontend
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- MongoDB team for the flexible database
- Socket.io for real-time communication

---

Made with ❤️ for connecting hearts worldwide
