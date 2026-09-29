FROM node:22.23.3-bookworm-slim AS build

WORKDIR /service

COPY package.json package-lock.json ./
COPY frontend/package.json frontend/package.json
RUN npm ci

COPY frontend frontend
RUN npm run build:frontend

FROM node:22.23.3-bookworm-slim AS runtime

ENV NODE_ENV=production
WORKDIR /service

COPY package.json package-lock.json ./
COPY frontend/package.json frontend/package.json
RUN npm ci --omit=dev

COPY --from=build --chown=node:node /service/frontend/dist frontend/dist
COPY --from=build --chown=node:node /service/frontend/public frontend/public
COPY --from=build --chown=node:node /service/frontend/views frontend/views

USER node
EXPOSE 3000

CMD ["npm", "run", "start", "--workspace", "@brightstart/training-frontend"]
