# Script Writer - AI-Powered Script Generation Platform

A modern React TypeScript application that helps users generate professional script outlines using AI services like OpenAI and DeepSeek.

## 🚀 Features

### 🤖 AI Integration
- **Dual AI Provider Support**: Choose between OpenAI (GPT-4) and DeepSeek
- **Automatic Script Generation**: AI generates detailed, professional script outlines
- **Smart Prompting**: Optimized prompts for script writing and creative content
- **Real-time Generation**: Live feedback during AI processing

### 📝 Modern Editing Experience
- **Markdown Editor**: Live preview markdown editor for script outlines
- **Real-time Rendering**: See formatted output while editing
- **Professional Formatting**: Headers, lists, emphasis, and code blocks
- **Export Ready**: Content formatted for professional use

### 🎨 User Interface
- **Modern Design**: Clean, professional interface built with Ant Design
- **Responsive Layout**: Works on desktop and mobile devices
- **Fixed Sidebar Navigation**: Easy navigation between pages
- **Form Persistence**: Values persist across page navigation
- **Loading States**: Clear feedback during AI generation

### 🔧 Technical Features
- **TypeScript**: Full type safety throughout the application
- **React Router**: Seamless navigation between pages
- **Component Architecture**: Modular, reusable components
- **State Management**: Efficient form data handling
- **Error Handling**: Comprehensive error boundaries and user feedback

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   └── Side.tsx         # Navigation sidebar
├── Form/                # Form components (legacy)
├── LandingPage/         # Main form page
│   ├── LandingPage.tsx  # AI configuration form
│   └── ApiConfigForm.css # Form styling
├── Menu/                # Main application layout
│   ├── Menu.tsx         # App framework and routing
│   └── Menu.css         # Layout styling
├── OutlinePage/         # Script outline editor
│   └── OutlinePage.tsx  # AI-powered outline generation
└── router.tsx           # Legacy router (deprecated)
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key or DeepSeek API key

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd script-app

# Install dependencies
npm install

# Start development server
npm start
```

### Environment Setup
1. Obtain an API key from [OpenAI](https://platform.openai.com/) or [DeepSeek](https://platform.deepseek.com/)
2. The application will prompt you to enter your API key in the form

## 📖 Usage Guide

### 1. Configure AI Settings
- Navigate to the home page
- Select your preferred AI provider (OpenAI or DeepSeek)
- Enter your API key
- Provide a detailed script description

### 2. Generate Script Outline
- Click "Submit" to process your request
- The app automatically navigates to the outline page
- AI generates a professional script outline based on your description
- View the formatted result in the markdown editor

### 3. Edit and Refine
- Use the live markdown editor to modify the generated outline
- See real-time preview of formatting changes
- Use toolbar buttons for easy markdown formatting
- Regenerate or clear content as needed

### 4. Navigation
- Use the sidebar to navigate between pages
- Form values persist when returning to the home page
- Outline content is maintained during editing sessions

## 🔌 API Integration

### OpenAI Integration
```typescript
const openai = new OpenAI({
  apiKey: userApiKey,
  dangerouslyAllowBrowser: true
});

const completion = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [
    { role: "system", content: "You are a professional script writer..." },
    { role: "user", content: userPrompt }
  ]
});
```

### DeepSeek Integration
```typescript
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: userApiKey,
  dangerouslyAllowBrowser: true
});

const completion = await openai.chat.completions.create({
  model: "deepseek-chat",
  messages: [/* same structure as OpenAI */]
});
```

## 🏗️ Architecture Overview

### Component Hierarchy
```
MainFramework (Menu.tsx)
├── Header (Navigation bar)
├── Side (Navigation sidebar)
└── Content (Route-based pages)
    ├── LandingPage (AI configuration form)
    └── OutlinePage (Markdown editor with AI generation)
```

### Data Flow
1. **Form Input**: User configures AI settings and script description
2. **State Management**: Parent component stores form data
3. **Navigation**: React Router passes data between pages
4. **AI Processing**: Appropriate API called based on provider selection
5. **Content Display**: Markdown editor renders and allows editing

### State Management
- **Parent State**: Form data persisted in MainFramework component
- **Local State**: Component-specific UI states (loading, editing)
- **Router State**: Data passed between routes for navigation
- **Form Persistence**: Values maintained across page navigation

## 🔧 Development

### Available Scripts
- `npm start` - Start development server
- `npm test` - Run test suite
- `npm run build` - Build for production
- `npm run eject` - Eject from Create React App (one-way operation)

### Key Dependencies
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Ant Design** - UI component library
- **React Router** - Navigation
- **OpenAI SDK** - AI API integration
- **@uiw/react-md-editor** - Markdown editing

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Important Security Notes
- **API Keys**: In production, move API calls to backend services
- **CORS**: Current implementation uses `dangerouslyAllowBrowser: true`
- **Environment Variables**: Store sensitive configuration in environment variables

## 📝 Future Enhancements

- [ ] Backend API integration for secure key management
- [ ] User authentication and project saving
- [ ] Multiple script formats (screenplay, stage play, etc.)
- [ ] Export to various formats (PDF, Word, Final Draft)
- [ ] Collaboration features
- [ ] Version history and project management
- [ ] Additional AI providers (Anthropic, Gemini)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is part of Tsinghua University coursework.

## 🏫 Academic Context

Developed as part of software engineering coursework at Tsinghua University. This project demonstrates modern web development practices, AI integration, and professional software architecture.
