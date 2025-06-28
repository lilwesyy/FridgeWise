# FridgeWise 🥘

> Transform your fridge contents into delicious recipes with AI-powered ingredient recognition

## Overview

FridgeWise is a smart recipe suggestion app that uses AI to identify ingredients from photos and suggests recipes based on what you have available. Say goodbye to food waste and hello to creative cooking!

## Features

### 🔍 **Smart Ingredient Detection**
- Take photos of your fridge or pantry
- AI-powered ingredient recognition via OpenAI Vision API
- Manual editing and refinement of detected ingredients

### 🍳 **Recipe Matching**
- Intelligent algorithm matching your ingredients to recipes
- Match percentage scoring based on available ingredients
- Filters for prep time, difficulty, and cuisine type

### 📊 **Nutrition Tracking**
- Automatic nutritional calculations per serving
- Daily and weekly nutrition summaries
- Macro and micronutrient breakdown

### 👤 **User Profiles**
- Dietary preferences and allergies
- Recipe history and favorites
- Premium features for advanced tracking

## Tech Stack

- **Backend**: Node.js + Express + MongoDB
- **Frontend**: Vue.js 3 + Pinia
- **Deployment**: Docker containerization
- **Storage**: Cloudinary for images
- **AI**: OpenAI Vision API
- **Nutrition**: Spoonacular/USDA API

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- MongoDB (via Docker)

### Development Setup

1. **Clone and setup**
   ```bash
   git clone <repository-url>
   cd FridgeWise
   cp .env.example .env
   ```

2. **Configure environment variables**
   ```bash
   # Edit .env with your API keys
   OPENAI_API_KEY=your_openai_key
   CLOUDINARY_URL=your_cloudinary_url
   SPOONACULAR_API_KEY=your_spoonacular_key
   ```

3. **Start with Docker**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017

## Project Structure

```
FridgeWise/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── models/         # MongoDB models
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Auth, validation, etc.
│   │   └── routes/         # API routes
│   ├── tests/              # Backend tests
│   └── package.json
├── frontend/               # Vue.js application
│   ├── src/
│   │   ├── components/     # Vue components
│   │   ├── views/          # Page components
│   │   ├── stores/         # Pinia stores
│   │   └── services/       # API services
│   ├── public/             # Static assets
│   └── package.json
├── docker-configs/         # Docker configuration files
├── scripts/               # Deployment and utility scripts
└── docs/                  # Documentation
```

## API Documentation

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Ingredients
- `POST /api/ingredients/detect-from-image` - AI ingredient detection
- `GET /api/ingredients/search` - Search ingredients
- `POST /api/ingredients/custom-add` - Add custom ingredient

### Recipes
- `POST /api/recipes/suggest` - Get recipe suggestions
- `GET /api/recipes/details/:id` - Get recipe details
- `POST /api/recipes/save-favorite` - Save favorite recipe

### Nutrition
- `GET /api/nutrition/calculate/:recipeId` - Calculate recipe nutrition
- `GET /api/nutrition/daily-summary` - Get daily nutrition summary

## Development Phases

### Phase 1: Foundation (Week 1)
- [x] Project setup and Docker configuration
- [x] Basic backend API structure
- [x] User authentication system
- [x] Photo upload functionality
- [x] Basic ingredient detection

### Phase 2: Core Features (Week 2)
- [ ] Recipe matching algorithm
- [ ] Frontend component development
- [ ] Recipe display and filtering
- [ ] Basic nutrition calculation

### Phase 3: Enhancement (Week 3)
- [ ] UI/UX polish
- [ ] Error handling and validation
- [ ] Performance optimization
- [ ] Premium features

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions, please open an issue in the GitHub repository or contact us at support@fridgewise.com

---

**Made with ❤️ for reducing food waste and inspiring home cooking**
