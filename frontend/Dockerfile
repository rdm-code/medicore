# ---------- Stage 1: build ----------
FROM node:20-alpine AS build
WORKDIR /app

# Cache node_modules — copy only manifests first
COPY package*.json ./
RUN npm ci

# Now copy sources and build
COPY . .
RUN npm run build

# ---------- Stage 2: runtime ----------
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]