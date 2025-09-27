FROM node:18-alpine
WORKDIR /app
COPY app/ .
RUN if [ -f package.json ]; then npm install --legacy-peer-deps; fi
CMD ["node", "index.js"]
