#!/bin/bash

# FridgeWise - Script di avvio solo Backend
echo "🔧 Avvio Backend FridgeWise..."

# Colori per output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Vai nella cartella backend
if [ ! -d "backend" ]; then
    echo -e "${RED}❌ Cartella backend non trovata.${NC}"
    exit 1
fi

cd backend

# Controlla se le dipendenze sono installate
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installazione dipendenze backend...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Errore nell'installazione dipendenze${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Avvio server backend...${NC}"
echo -e "${BLUE}🌐 Server disponibile su: http://localhost:5000${NC}"
echo -e "${YELLOW}💡 Premi Ctrl+C per fermare il server${NC}"
echo ""

npm run dev
