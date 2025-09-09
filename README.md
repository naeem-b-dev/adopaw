# 🐾 AdoPaw — Pet Adoption Mobile App

> **A React Native mobile application for pet adoption built with Expo, featuring real-time chat, multi-language support, and location-based pet discovery.**

AdoPaw connects potential pet owners with shelters through an intuitive mobile platform. Built with modern React Native development practices, featuring real-time communication, comprehensive internationalization, and location-based services.

---

## ✨ Key Features

### 🏠 **Core Functionality**
- **Pet Discovery** - Browse and search pets with advanced filtering
- **Interactive Maps** - Location-based pet discovery with Google Maps integration
- **Pet Profiles** - Detailed pet information with image galleries
- **User Profiles** - Complete user management with preferences
- **Pet Registration** - Full pet listing system with image upload

### 🌍 **Internationalization**
- **Multi-language Support** - Arabic and English localization with RTL support
- **Dynamic Language Switching** - Real-time language changes
- **Cultural Adaptation** - Region-specific content and UI adaptations

### 💬 **Real-Time Communication**
- **Live Chat System** - Real-time messaging with Socket.IO integration
- **Pawlo AI Chatbot** - AI-powered pet advice and adoption guidance
- **Multi-media Support** - Image and text messaging capabilities

### 🗺️ **Location Services**
- **GPS Integration** - Current location detection and updates
- **Interactive Maps** - Google Maps with custom markers and place discovery
- **Location-based Search** - Find pets and places near your location

### 🔐 **Authentication & Security**
- **Supabase Authentication** - Secure user authentication and session management
- **JWT Tokens** - Secure token-based authentication
- **Input Validation** - Form validation and data sanitization

---

## 🛠️ Tech Stack

### **Frontend**
- **React Native (Expo SDK 53)** - Cross-platform mobile development
- **Redux Toolkit** - State management with RTK Query
- **React Query (TanStack Query)** - Server state management and caching
- **React Native Paper** - Material Design components
- **Expo Router** - File-based navigation system
- **React Native Reanimated** - Animations and gestures

### **Backend & Services**
- **Supabase** - Backend-as-a-Service (Authentication, Database, Storage)
- **Socket.IO Client** - Real-time bidirectional communication
- **Axios** - HTTP client with interceptors
- **AsyncStorage** - Local data persistence

### **Maps & Location**
- **React Native Maps** - Native map integration
- **Expo Location** - GPS and location services
- **Google Maps API** - Advanced mapping services

### **Internationalization**
- **i18next** - Internationalization framework
- **React i18next** - React integration for i18n
- **Expo Localization** - Device locale detection

### **Development Tools**
- **TypeScript** - Type-safe development
- **ESLint & Prettier** - Code quality and formatting
- **Metro Bundler** - Build system
- **Hermes Engine** - JavaScript performance

---

## 🏗️ Project Structure

```
adopaw-frontend/
├── app/                           # File-based routing (Expo Router)
│   ├── (auth)/                   # Authentication screens
│   │   ├── login.jsx            # Login with email/password
│   │   ├── signup.jsx           # User registration
│   │   ├── otp.jsx              # OTP verification
│   │   ├── pet-preferences.jsx  # Pet preference setup
│   │   └── profile-complete.jsx # Profile completion
│   ├── (onboarding)/            # User onboarding flow
│   │   ├── get-started.jsx      # Welcome screen
│   │   ├── step1-4.jsx          # Onboarding steps
│   │   └── index.jsx            # Onboarding entry
│   ├── (tabs)/                  # Main app navigation
│   │   ├── home/                # Pet discovery & listings
│   │   ├── map/                 # Location-based pet search
│   │   ├── chats/               # Real-time messaging
│   │   ├── addPet/              # Pet registration
│   │   └── profile/             # User management
│   └── _layout.jsx              # Root layout with providers
├── src/
│   ├── features/                # Feature-based architecture
│   │   ├── auth/                # Authentication system
│   │   ├── pets/                # Pet management
│   │   ├── chats/               # Real-time communication
│   │   ├── home/                # Pet discovery
│   │   ├── map/                 # Location services
│   │   ├── profile/             # User management
│   │   └── addPet/              # Pet registration
│   ├── shared/                  # Shared resources
│   │   ├── components/          # Reusable UI components
│   │   ├── services/            # Core services
│   │   ├── hooks/               # Custom React hooks
│   │   ├── utils/               # Utility functions
│   │   └── constants/           # App constants
│   ├── localization/            # Internationalization
│   │   ├── locale/              # Translation files (ar/en)
│   │   ├── hooks/               # Translation hooks
│   │   └── utils/               # i18n utilities
│   ├── theme/                   # Design system
│   └── context/                 # React contexts
└── assets/                      # Static assets
    ├── images/                  # Images & icons
    ├── fonts/                   # Custom fonts
    └── svg/                     # SVG assets
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- Android Studio / Xcode (for device testing)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/naeem-b-dev/adopaw-frontend.git
   cd adopaw-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key
   EXPO_PUBLIC_API_BASE=your-api-base-url
   EXPO_PUBLIC_BACKEND_API_URL=your-backend-url
   ```

4. **Start the development server**
   ```bash
   npx expo start
   ```

5. **Run on device/emulator**
   - Press `a` for Android
   - Press `i` for iOS
   - Scan QR code with Expo Go app

---

## 📸 Screenshots

<div align="center">
  <img src="screenshots/Screenshot 2025-08-22 181737.png" alt="Home Page - Cat Category Search" width="200" />
  <img src="screenshots/Screenshot 2025-08-22 181743.png" alt="Home Page - Dog Category Search" width="200" />
  <img src="screenshots/Screenshot 2025-08-22 193128.png" alt="Filter Options" width="200" />
  <img src="screenshots/Screenshot 2025-08-22 193138.png" alt="Home Page - Selected Cat Category" width="200" />
  <img src="screenshots/Screenshot 2025-08-23 031130.png" alt="Map Page - Nearest Places List" width="200" />
  <img src="screenshots/Screenshot 2025-08-23 031223.png" alt="Map Page - Veterinary Category Selected" width="200" />
</div>

*Screenshots showing pet discovery, filtering, and location-based features*

---

## 📱 App Features

### **Home Tab**
- Pet discovery with search and filtering
- Category-based pet browsing
- Infinite scroll with pagination
- Pull-to-refresh functionality

### **Map Tab**
- Interactive Google Maps integration
- Location-based pet and place discovery
- Search and filter places by category
- Current location tracking

### **Chats Tab**
- Real-time messaging system
- Pawlo AI chatbot for pet advice
- Image and text message support
- Chat history and suggestions

### **Add Pet Tab**
- Complete pet registration form
- Image upload and management
- Pet health and behavior information
- Location-based pet listing

### **Profile Tab**
- User profile management
- Pet preferences and settings
- Theme and language selection
- Account management

---

## 🎯 Key Technologies & Skills

### **React Native Development**
- Cross-platform mobile development
- Component-based architecture
- Custom hooks and state management
- Performance optimization

### **Real-time Features**
- Socket.IO integration for live chat
- AI chatbot implementation
- Real-time data synchronization

### **Location Services**
- GPS integration and location tracking
- Google Maps API integration
- Location-based search and filtering

### **Internationalization**
- Multi-language support (Arabic/English)
- RTL (Right-to-Left) layout support
- Dynamic language switching

### **Backend Integration**
- Supabase for authentication and database
- RESTful API integration
- Image upload and storage
- Secure data handling

---

## 🔮 Future Enhancements

### **Planned Features**
- [ ] Push notifications
- [ ] Advanced pet matching algorithm
- [ ] Video calling with shelters
- [ ] Social features and community
- [ ] Pet health tracking
- [ ] Adoption success stories

### **Technical Improvements**
- [ ] Offline mode support
- [ ] Advanced caching strategies
- [ ] Performance monitoring
- [ ] Automated testing
- [ ] CI/CD pipeline

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source. Please check the repository for licensing details.

---

## 👥 Team

This project was developed as a final project for **Tashgheel 3 - Coding Track** by the Lebanese Association for Scientific Research (LASeR):

- **Naeem B** - Mobile Developer & Frontend Architect
- **Abdelrahman Assoum** ([@abdelrahman-assoum](https://github.com/abdelrahman-assoum)) - Developer
- **Assoumn** ([@assoumn](https://github.com/assoumn)) - Developer

**Organization:** [Lebanese Association for Scientific Research (LASeR)](https://www.linkedin.com/company/lebanese-association-for-scientific-research-laser)

---

## 📞 Support

- **Email**: support@adopaw.com
- **Issues**: [GitHub Issues](https://github.com/naeem-b-dev/adopaw-frontend/issues)

---

<div align="center">

**Made with ❤️ for pet lovers everywhere**

[⭐ Star this repo](https://github.com/naeem-b-dev/adopaw-frontend) | [🐛 Report Bug](https://github.com/naeem-b-dev/adopaw-frontend/issues) | [💡 Request Feature](https://github.com/naeem-b-dev/adopaw-frontend/issues)

</div>