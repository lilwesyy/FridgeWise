#!/bin/bash

# FridgeWise - Script per fermare tutti i processi
echo "🛑 Fermando tutti i servizi FridgeWise..."

# Colori per output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}🔍 Ricerca processi in esecuzione...${NC}"

# Ferma processi npm run dev
PROCS=$(pgrep -f "npm run dev")
if [ ! -z "$PROCS" ]; then
    echo -e "${YELLOW}🔧 Fermando processi npm...${NC}"
    pkill -f "npm run dev"
fi

# Ferma processi vite (frontend)
VITE_PROCS=$(pgrep -f "vite")
if [ ! -z "$VITE_PROCS" ]; then
    echo -e "${YELLOW}🎨 Fermando Vite (Frontend)...${NC}"
    pkill -f "vite"
fi

# Ferma processi node del server (backend)
NODE_PROCS=$(pgrep -f "node.*server.js")
if [ ! -z "$NODE_PROCS" ]; then
    echo -e "${YELLOW}🔧 Fermando Node.js (Backend)...${NC}"
    pkill -f "node.*server.js"
fi

# Ferma processi nodemon se presenti
NODEMON_PROCS=$(pgrep -f "nodemon")
if [ ! -z "$NODEMON_PROCS" ]; then
    echo -e "${YELLOW}🔄 Fermando Nodemon...${NC}"
    pkill -f "nodemon"
fi

# Aspetta un momento per la terminazione
sleep 2

# Verifica se ci sono ancora processi
REMAINING=$(pgrep -f "(npm run dev|vite|node.*server.js|nodemon)")
if [ ! -z "$REMAINING" ]; then
    echo -e "${RED}⚠️  Alcuni processi non si sono fermati, forzando la terminazione...${NC}"
    pkill -9 -f "(npm run dev|vite|node.*server.js|nodemon)"
fi

echo -e "${GREEN}✅ Tutti i servizi FridgeWise sono stati fermati${NC}"

# Mostra le porte che potrebbero essere ancora in uso
echo ""
echo -e "${YELLOW}🔍 Controllo porte in uso:${NC}"

# Controlla porta 5000 (backend)
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${RED}   ⚠️  Porta 5000 ancora in uso${NC}"
    lsof -Pi :5000 -sTCP:LISTEN
else
    echo -e "${GREEN}   ✅ Porta 5000 libera${NC}"
fi

# Controlla porta 3001 (frontend)
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${RED}   ⚠️  Porta 3001 ancora in uso${NC}"
    lsof -Pi :3001 -sTCP:LISTEN
else
    echo -e "${GREEN}   ✅ Porta 3001 libera${NC}"
fi
