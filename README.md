# AI Script Generator

A comprehensive React TypeScript application for generating professional film and TV scripts using AI. The app provides a complete workflow from initial concept to detailed episode scripts with an intuitive three-stage process.

## 🚀 Features

### 🎬 Complete Script Generation Workflow
- **Project Setup**: Configure story concepts, characters, themes, and narrative styles
- **Outline Generation**: AI-powered story structure and episode breakdowns
- **Episode Development**: Detailed script generation with chat-based refinement
- **Multi-Episode Management**: Handle complex series with multiple episodes

### 🤖 Advanced AI Integration
- **Dual AI Provider Support**: OpenAI GPT-4o and DeepSeek Reasoner
- **Conversational AI**: Chat interface for iterative script refinement
- **Context-Aware Generation**: AI maintains story consistency across episodes
- **Professional Prompting**: Optimized prompts for screenplay and script writing

### 📝 Professional Editing Experience
- **MDX Editor**: Advanced markdown editor with live preview
- **Script Panel**: Dedicated script viewing and management
- **Real-time Collaboration**: Chat with AI while editing
- **Export Ready**: Professional script formatting

### 🎨 Modern User Interface
- **Three-Stage Workflow**: Landing → Outline → Episodes
- **Responsive Design**: Works on desktop and mobile
- **Navigation Protection**: Warns before losing unsaved work
- **State Persistence**: Data maintained across navigation
- **Demo Data**: Quick start with sample content

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Side.tsx         # Navigation sidebar with exit confirmation
│   └── ChatPanel.tsx    # AI conversation interface
├── contexts/            # State management
│   └── OutlineContext.tsx # Global app state and data persistence
├── LandingPage/         # Project configuration (Stage 1)
│   ├── LandingPage.tsx  # Form for story setup and AI config
│   └── ApiConfigForm.css
├── OutlinePage/         # Outline generation (Stage 2)
│   └── OutlinePage.tsx  # AI-powered outline creation and editing
├── EpisodePage/         # Episode development (Stage 3)
│   └── EpisodePage.tsx  # Multi-episode management and script generation
├── Menu/                # App layout and routing
│   ├── Menu.tsx         # Main application framework
│   └── Menu.css
└── router.tsx           # Application routing configuration
```

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** (comes with Node.js)
- **AI API Key**: OpenAI or DeepSeek account

### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd script-app

# Install dependencies
npm install

# Start development server
npm start

# Open browser to http://localhost:3000
```

### API Setup
1. **OpenAI**: Get API key from [platform.openai.com](https://platform.openai.com/)
2. **DeepSeek**: Get API key from [platform.deepseek.com](https://platform.deepseek.com/)
3. **Enter in app**: API key field in the landing page form

## 📖 Usage Guide

### Stage 1: Project Setup (Landing Page)
1. **Choose AI Provider**: Select OpenAI or DeepSeek
2. **Enter API Key**: Your AI service API key
3. **Story Synopsis**: Detailed description of your story/series
4. **Script Requirements**: Specify tone, genre, and requirements
5. **Narrative Style**: Choose linear, flashback, or intercut structure
6. **Characters & Themes**: Define main characters and story themes
7. **Demo Data**: Use "填充演示案例" for quick start

### Stage 2: Outline Generation (Outline Page)
1. **AI Generation**: Automatic outline creation based on your inputs
2. **Interactive Chat**: Refine outline through AI conversation
3. **Markdown Editing**: Direct editing with live preview
4. **Structure Validation**: Ensure proper story structure
5. **Episode Planning**: Define number and structure of episodes

### Stage 3: Episode Development (Episodes Page)
1. **Episode Management**: Left panel shows all episodes
2. **Script Generation**: Click "生成剧本" for individual episodes
3. **Multi-Panel Interface**: 
   - **Left**: Episode list and management
   - **Center**: Episode outline editing
   - **Right**: Generated script viewing
4. **AI Chat Integration**: Refine episodes through conversation
5. **Script Export**: Copy and export completed scripts

## 🔌 API Integration

### OpenAI Configuration
```typescript
const openai = new OpenAI({
  apiKey: formData.apiKey,
  dangerouslyAllowBrowser: true
});

// GPT-4o for script generation
const completion = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [
    { role: "system", content: "You are a professional screenwriter..." },
    { role: "user", content: prompt }
  ]
});
```

### DeepSeek Configuration
```typescript
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: formData.apiKey,
  dangerouslyAllowBrowser: true
});

// DeepSeek Reasoner for advanced script analysis
const completion = await openai.chat.completions.create({
  model: "deepseek-reasoner",
  messages: [/* same structure */]
});
```

## 🏗️ Architecture

### State Management
- **OutlineContext**: Global state provider managing all app data
- **Form Data Persistence**: Maintains user inputs across navigation
- **Episode State**: Complex state for multi-episode management
- **Chat History**: Conversational context preservation

### Component Architecture
```
App
├── AppRouter
└── MainFramework (Menu.tsx)
    ├── Header & Navigation
    ├── Side (Navigation with exit confirmation)
    └── Content (Route-based rendering)
        ├── LandingPage (Form with demo data)
        ├── OutlinePage (MDX editor + chat)
        └── EpisodePage (Multi-panel episode management)
```

### Data Flow
1. **Landing**: User inputs → FormData → OutlineContext
2. **Outline**: AI generation → OutlineText → Context persistence
3. **Episodes**: Multi-episode state → Script generation → Export

## 🔧 Development

### Available Scripts
- `npm start` - Development server with hot reload
- `npm test` - Run test suite
- `npm run build` - Production build
- `npm run eject` - Eject from Create React App

### Key Dependencies
- **React 18** - Modern React with hooks
- **TypeScript 4.9** - Full type safety
- **Ant Design 5** - Professional UI components
- **React Router 6** - Modern routing with data loading
- **OpenAI SDK** - AI integration
- **@mdxeditor/editor** - Advanced markdown editing
- **@uiw/react-md-editor** - Alternative markdown editor

### Development Features
- **Hot Reload**: Instant development feedback
- **TypeScript**: Comprehensive type checking
- **ESLint**: Code quality enforcement
- **Navigation Guards**: Prevent data loss during development

## 🚀 Production Deployment

### Build Process
```bash
# Create production build
npm run build

# Static files in build/ directory
# Deploy to any static hosting service
```

### Security Considerations
- **API Keys**: Store securely, consider backend proxy
- **CORS Policy**: Current client-side implementation for development
- **Environment Variables**: Use for production configuration
- **Rate Limiting**: Monitor AI API usage

## 🔮 Advanced Features

### Navigation Protection
- **Exit Confirmation**: Warns before leaving episode page with unsaved work
- **Data Persistence**: Smart state management across navigation
- **Browser Events**: Handles refresh/close tab scenarios

### AI Chat Integration
- **Contextual Conversations**: Maintains conversation history per episode
- **Smart Prompting**: Context-aware AI interactions
- **Real-time Processing**: Live feedback during AI generation

### Multi-Episode Management
- **Episode Status Tracking**: Outline → Generating → Script Ready
- **Batch Operations**: Manage multiple episodes simultaneously  
- **Script Organization**: Tabbed interface for script viewing

## 📝 Future Roadmap

- [ ] **Backend Integration**: Secure API key management
- [ ] **User Authentication**: Personal project management
- [ ] **Cloud Storage**: Project backup and sync
- [ ] **Collaboration**: Multi-user script development
- [ ] **Export Formats**: PDF, Final Draft, Fountain
- [ ] **Template System**: Genre-specific script templates
- [ ] **Version Control**: Script revision history
- [ ] **Additional AI Models**: Anthropic Claude, Google Gemini

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -m 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎯 About

AI Script Generator is a professional tool for screenwriters, content creators, and storytellers who want to leverage AI for script development while maintaining creative control and professional quality output.