FROM ollama/ollama:latest

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Create init script to pull llava:7b model
RUN mkdir -p /ollama-init
COPY init-models.sh /ollama-init/init-models.sh
RUN chmod +x /ollama-init/init-models.sh

# Set environment
ENV OLLAMA_HOST=0.0.0.0

# Expose port
EXPOSE 11434

# Custom entrypoint that pulls models
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
