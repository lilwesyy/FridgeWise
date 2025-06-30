#!/bin/bash

echo "🚀 Starting Ollama service..."

# Start Ollama in the background
ollama serve &
OLLAMA_PID=$!

# Wait a bit for the service to start
sleep 5

echo "🔧 Running model initialization..."
# Run model initialization in background
/ollama-init/init-models.sh &

echo "✅ Ollama is ready!"

# Keep the main process running
wait $OLLAMA_PID