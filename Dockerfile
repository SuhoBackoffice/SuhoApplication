##########################################################
# 1단계: 빌드용 스테이지 (Builder)
##########################################################

FROM node:22-slim AS builder

WORKDIR /app

# 의존성 정의 파일만 복사 (캐시 최적화)
COPY package*.json ./

# 의존성 설치 (peer deps 충돌 무시)
RUN npm install --legacy-peer-deps

# 전체 소스 복사
COPY . .

# Next.js 프로젝트 빌드 (빌드 시점에 환경변수 사용)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Next.js 빌드
RUN npm run build


##########################################################
# 2단계: 실제 서비스용 스테이지 (Production)
##########################################################

FROM node:22-slim

WORKDIR /app

# 프로덕션 환경변수 설정
ENV NODE_ENV=production

# 빌드된 결과물 + 필수 파일만 복사
COPY --from=builder /app/.next .next
COPY --from=builder /app/public public
COPY --from=builder /app/package*.json ./

# 프로덕션 의존성만 설치
RUN npm install --only=production --legacy-peer-deps

# 컨테이너 3000 포트 개방
EXPOSE 3000

# Next.js 서버 실행
CMD ["npm", "run", "start"]
