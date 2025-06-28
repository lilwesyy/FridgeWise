#!/bin/bash

# FridgeWise - Script di avvio solo Frontend
echo "🎨 Avvio Frontend FridgeWise..."

# Colori per output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Vai nella cartella frontend
if [ ! -d "frontend" ]; then
    echo -e "${RED}❌ Cartella frontend non trovata.${NC}"
    exit 1
fi

cd frontend

# Controlla se le dipendenze sono installate
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installazione dipendenze frontend...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Errore nell'installazione dipendenze${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Avvio server frontend...${NC}"
echo -e "${BLUE}🌐 Applicazione disponibile su: http://localhost:3001${NC}"
echo -e "${YELLOW}💡 Premi Ctrl+C per fermare il server${NC}"
echo ""

npm run dev
