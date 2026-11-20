FROM node:20-alpine

WORKDIR /app

# Сначала копируем зависимости (для кэширования слоев)
COPY package*.json ./
RUN npm install

# Копируем исходный код
COPY . .

# Открываем стандартный порт Vite
EXPOSE 5173

# Флаг --host обязателен, иначе сайт не откроется на вашем ПК
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]