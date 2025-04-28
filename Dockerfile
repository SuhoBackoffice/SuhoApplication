# 1단계: 빌드용 스테이지
FROM node:22-slim AS builder

WORKDIR /app

# package.json, package-lock.json만 복사 (npm install 최적화)
COPY package*.json ./

# 의존성 설치 (peer deps 충돌 무시)
RUN npm install --legacy-peer-deps

# 소스 전체 복사
COPY . .

# Next.js 빌드
RUN npm run build

# 2단계: 실제 서비스용 스테이지
FROM node:22-slim

WORKDIR /app

# 프로덕션 모드 설정
ENV NODE_ENV=production

# 빌드된 결과물 복사
COPY --from=builder /app/.next .next
COPY --from=builder /app/public public
COPY --from=builder /app/package*.json ./

# 프로덕션 의존성만 설치
RUN npm install --only=production --legacy-peer-deps

# Next.js 기본 포트로 작동
EXPOSE 3000

# 앱 실행
CMD ["npm", "run", "start"]
