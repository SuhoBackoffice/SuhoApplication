# 1단계: Build 단계
FROM node:22-slim AS builder

WORKDIR /app

# package.json, package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm install

# 프로젝트 소스 복사
COPY . .

# Next.js 빌드
RUN npm run build

# 2단계: 실제 서비스용 (경량 이미지)
FROM node:22-slim

WORKDIR /app

# production 환경변수
ENV NODE_ENV=production

# 빌드된 결과물 복사
COPY --from=builder /app/.next .next
COPY --from=builder /app/public public
COPY --from=builder /app/package*.json ./

# 의존성 설치 (production 모드)
RUN npm install --only=production

# 환경변수 포트 (Next.js 기본 포트)
ENV PORT 3000

# 서버 시작
CMD ["npm", "run", "start"]
