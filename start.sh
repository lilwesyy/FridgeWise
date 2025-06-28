#!/bin/bash

# FridgeWise - Script di avvio completo
# Avvia backend e frontend in parallelo

echo "🚀 Avvio FridgeWise..."

# Colori per output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Funzione per controllare se un comando esiste
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Controllo prerequisiti
echo -e "${YELLOW}📋 Controllo prerequisiti...${NC}"

if ! command_exists node; then
    echo -e "${RED}❌ Node.js non trovato. Installa Node.js prima di continuare.${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm non trovato. Installa npm prima di continuare.${NC}"
    exit 1
fi

# Controllo che le cartelle esistano
if [ ! -d "backend" ]; then
    echo -e "${RED}❌ Cartella backend non trovata.${NC}"
    exit 1
fi

if [ ! -d "frontend" ]; then
    echo -e "${RED}❌ Cartella frontend non trovata.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisiti verificati${NC}"

# Funzione per installare dipendenze se necessario
install_deps() {
    local dir=$1
    local name=$2
    
    echo -e "${YELLOW}📦 Controllo dipendenze $name...${NC}"
    
    cd "$dir"
    
    if [ ! -d "node_modules" ]; then
        echo -e "${BLUE}🔄 Installazione dipendenze $name...${NC}"
        npm install
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ Errore nell'installazione dipendenze $name${NC}"
            exit 1
        fi
    else
        echo -e "${GREEN}✅ Dipendenze $name già installate${NC}"
    fi
    
    cd ..
}

# Installa dipendenze
install_deps "backend" "backend"
install_deps "frontend" "frontend"

# Funzione per avviare il backend
start_backend() {
    echo -e "${BLUE}🔧 Avvio Backend...${NC}"
    cd backend
    npm run dev &
    BACKEND_PID=$!
    cd ..
    echo -e "${GREEN}✅ Backend avviato (PID: $BACKEND_PID)${NC}"
}

# Funzione per avviare il frontend
start_frontend() {
    echo -e "${BLUE}🎨 Avvio Frontend...${NC}"
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    echo -e "${GREEN}✅ Frontend avviato (PID: $FRONTEND_PID)${NC}"
}

# Avvia i servizi
echo -e "${YELLOW}🚀 Avvio servizi...${NC}"

start_backend
sleep 3  # Aspetta che il backend si avvii
start_frontend

echo ""
echo -e "${GREEN}🎉 FridgeWise avviato con successo!${NC}"
echo ""
echo -e "${BLUE}📊 Informazioni servizi:${NC}"
echo -e "   🔧 Backend: http://localhost:5000"
echo -e "   🎨 Frontend: http://localhost:3001"
echo ""
echo -e "${YELLOW}💡 Comandi utili:${NC}"
echo -e "   - Premi Ctrl+C per fermare entrambi i servizi"
echo -e "   - Backend PID: $BACKEND_PID"
echo -e "   - Frontend PID: $FRONTEND_PID"
echo ""

# Funzione per gestire l'interruzione
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Fermando i servizi...${NC}"
    
    if [ ! -z "$BACKEND_PID" ]; then
        echo -e "${BLUE}🔧 Fermando Backend...${NC}"
        kill $BACKEND_PID 2>/dev/null
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        echo -e "${BLUE}🎨 Fermando Frontend...${NC}"
        kill $FRONTEND_PID 2>/dev/null
    fi
    
    # Uccidi eventuali processi rimasti
    pkill -f "npm run dev" 2>/dev/null
    pkill -f "vite" 2>/dev/null
    pkill -f "node.*server.js" 2>/dev/null
    
    echo -e "${GREEN}✅ Servizi fermati${NC}"
    exit 0
}

# Gestisci Ctrl+C
trap cleanup INT

# Aspetta che l'utente prema Ctrl+C
echo -e "${GREEN}✨ Applicazione in esecuzione. Premi Ctrl+C per fermare.${NC}"
wait
