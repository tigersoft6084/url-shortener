# Stage 1: Build the react app
FROM node:14.15.4 as ui-build
ARG API_URL
WORKDIR /app

COPY ui/package.json ui/package-lock.json ./
RUN npm install

COPY ui/src/* ./src/
COPY ui/public/* ./public/
COPY ui/tsconfig.json ./
COPY ui/*.config.js ./

ENV REACT_APP_API_URL=$API_URL

RUN npm run build

# Stage 2: Build the API
FROM node:14.15.4 as api-build
WORKDIR /app

COPY api/package.json api/package-lock.json ./
RUN npm install

COPY api/src/* ./src/
COPY api/tsconfig.json ./

RUN npm run build

# Stage 3: Build the final image
FROM node:14.15.4
WORKDIR /app

COPY --from=api-build /app/build ./api
COPY --from=ui-build /app/build ./public
COPY --from=api-build /app/package.json /app/package-lock.json ./

RUN npm install --production
RUN ls -la /app/api

VOLUME "/app"
VOLUME "/data"

ENV NODE_ENV=production

CMD ["node", "api/index.js"]