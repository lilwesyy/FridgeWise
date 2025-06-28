# 🚀 Script di Avvio FridgeWise

Questa cartella contiene diversi script per facilitare l'avvio e la gestione del progetto FridgeWise.

## 📋 Script Disponibili

### `./start.sh` - Avvio Completo
Avvia sia backend che frontend in parallelo con controllo automatico delle dipendenze.

```bash
./start.sh
```

**Caratteristiche:**
- ✅ Controllo prerequisiti (Node.js, npm)
- 📦 Installazione automatica dipendenze se necessarie
- 🔧 Avvio backend su http://localhost:5000
- 🎨 Avvio frontend su http://localhost:3001
- 🛑 Gestione interruzione con Ctrl+C
- 🔍 Monitoraggio PID dei processi

### `./start-backend.sh` - Solo Backend
Avvia solamente il server backend.

```bash
./start-backend.sh
```

### `./start-frontend.sh` - Solo Frontend  
Avvia solamente il server frontend.

```bash
./start-frontend.sh
```

### `./stop.sh` - Ferma Tutto
Ferma tutti i servizi FridgeWise in esecuzione.

```bash
./stop.sh
```

**Caratteristiche:**
- 🛑 Ferma tutti i processi npm, vite, node
- 🔍 Verifica processi rimanenti
- ⚡ Terminazione forzata se necessario
- 📊 Controllo stato porte 5000 e 3001

## 🎯 Utilizzo Raccomandato

### Primo Avvio
```bash
# Avvio completo per sviluppo
./start.sh
```

### Sviluppo Backend
```bash
# Solo backend per sviluppo API
./start-backend.sh
```

### Sviluppo Frontend
```bash
# Solo frontend (assicurati che il backend sia già in esecuzione)
./start-frontend.sh
```

### Fine Sessione
```bash
# Ferma tutto prima di chiudere
./stop.sh
```

## 🔧 Troubleshooting

### Errore "Permission denied"
```bash
chmod +x *.sh
```

### Porte già in uso
```bash
./stop.sh
# Aspetta qualche secondo poi
./start.sh
```

### Dipendenze non trovate
Gli script installano automaticamente le dipendenze, ma se hai problemi:

```bash
# Backend
cd backend && npm install

# Frontend  
cd frontend && npm install
```

### Reset Completo
```bash
./stop.sh
rm -rf backend/node_modules frontend/node_modules
./start.sh
```

## 📊 Porte Utilizzate

- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:3001

## 🎨 Output Colorato

Gli script utilizzano colori per migliorare la leggibilità:
- 🟢 Verde: Operazioni riuscite
- 🟡 Giallo: Informazioni/Avvisi
- 🔵 Blu: Processi in corso
- 🔴 Rosso: Errori

## 💡 Suggerimenti

1. **Sviluppo Full-Stack**: Usa `./start.sh`
2. **Debug Backend**: Usa `./start-backend.sh` 
3. **UI Design**: Usa `./start-frontend.sh`
4. **Fine Giornata**: Usa `./stop.sh`

## 🐛 Debug

Se qualcosa non funziona:

1. Controlla i log nel terminale
2. Verifica che Node.js sia installato: `node --version`
3. Verifica che npm sia installato: `npm --version`
4. Esegui `./stop.sh` e riprova con `./start.sh`
