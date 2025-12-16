# 멀티스테이지 빌드
# Stage 1: React 빌드
FROM node:18-alpine AS react-build

WORKDIR /app

# 클라이언트 의존성 설치
COPY client/package*.json ./client/
RUN cd client && npm install

# 클라이언트 소스 복사 및 빌드
COPY client/ ./client/
RUN cd client && npm run build

# Stage 2: Node.js 서버
FROM node:18-alpine

WORKDIR /app

# 서버 의존성 설치
COPY package*.json ./
RUN npm install --production

# 서버 소스 복사
COPY server/ ./server/

# 빌드된 React 앱 복사
COPY --from=react-build /app/client/build ./client/build

# 포트 노출
EXPOSE 5000

# 환경 변수 설정
ENV NODE_ENV=production
ENV PORT=5000
ENV FRONTEND_URL=http://localhost:5000

# 서버 시작
CMD ["node", "server/index.js"]

