# Etapa 1: Construir la aplicación React (Vite)
FROM node:20-alpine AS build
WORKDIR /app
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Servir la aplicación con Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Copiar configuración personalizada de Nginx para enrutamiento SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
