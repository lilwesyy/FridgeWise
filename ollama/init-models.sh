#!/bin/bash

echo "🔍 Checking if llava:7b model exists..."

# Wait for Ollama service to be ready
while ! curl -s http://localhost:11434/api/tags > /dev/null; do
    echo "⏳ Waiting for Ollama service to start..."
    sleep 2
done

# Check if llava:7b is already installed
if ollama list | grep -q "llava:7b"; then
    echo "✅ llava:7b model already exists"
else
    echo "📥 Pulling llava:7b model..."
    ollama pull llava:7b
    echo "✅ llava:7b model downloaded successfully"
fi

echo "🎯 Available models:"
ollama list