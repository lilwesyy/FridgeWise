#!/bin/bash
# Script per configurare Ollama con impostazioni ottimizzate

# Verifica se ollama è installato
if ! command -v ollama &> /dev/null; then
    echo "Ollama non è installato. Installarlo prima di eseguire questo script."
    exit 1
fi

# Crea un utente dedicato per Ollama se non esiste
if ! id -u ollama &>/dev/null; then
    echo "Creazione utente ollama..."
    sudo useradd -r -s /bin/false ollama
fi

# Crea il file di servizio systemd per Ollama
echo "Configurazione del servizio Ollama..."
sudo tee /etc/systemd/system/ollama.service > /dev/null <<EOF
[Unit]
Description=Ollama Service
After=network-online.target

[Service]
ExecStart=/usr/local/bin/ollama serve
User=ollama
Group=ollama
Restart=always
RestartSec=3
Environment="OLLAMA_HOST=0.0.0.0:11434"
Environment="OLLAMA_ORIGINS=*"

# Ottimizzazioni per prestazioni
Environment="OLLAMA_NUM_THREADS=4"
Environment="OLLAMA_GPU_LAYERS=0"

[Install]
WantedBy=default.target
EOF

# Ricarica i servizi systemd
sudo systemctl daemon-reload

# Assicurati che il servizio sia abilitato e avviato
sudo systemctl enable ollama
sudo systemctl restart ollama

# Attendi un po' per assicurarsi che Ollama sia in esecuzione
sleep 3

# Verifica lo stato di Ollama
echo "Verifica dello stato di Ollama..."
systemctl status ollama

# Pull dei modelli necessari
echo "Scaricando il modello llava:7b (questo potrebbe richiedere tempo)..."
ollama pull llava:7b

echo "Configurazione completata!"
echo "Modelli disponibili:"
ollama list

echo -e "\nUtilizzo di test (premere Ctrl+C per terminare):"
echo "ollama run llava:7b 'What do you see in this image?' --image /path/to/image.jpg"
