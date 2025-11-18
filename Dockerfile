# Imagem leve com Nginx
FROM nginx:alpine

# Remove config padrão
RUN rm -rf /usr/share/nginx/html/*

# Copia todos os arquivos do front para a pasta pública do Nginx
COPY . /usr/share/nginx/html

# Expõe a porta padrão HTTP
EXPOSE 80

# Sobe o Nginx em modo "foreground"
CMD ["nginx", "-g", "daemon off;"]