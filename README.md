# 채팅 서버 & 테트리스 미니게임

Node.js와 React를 활용한 실시간 채팅 서버와 테트리스 미니게임입니다.

## 기능

- 실시간 채팅 (WebSocket 기반)
- 온라인 사용자 목록
- 타이핑 인디케이터
- 테트리스 미니게임 (채팅 중 플레이 가능)

## 설치 방법

1. 모든 의존성 설치:
```bash
npm run install-all
```

2. 개발 서버 실행 (백엔드 + 프론트엔드 동시 실행):
```bash
npm run dev
```

또는 개별 실행:

백엔드만 실행:
```bash
npm run server
```

프론트엔드만 실행:
```bash
npm run client
```

## 사용 방법

1. 서버 실행 후 브라우저에서 `http://localhost:3000` 접속
2. 사용자 이름 입력 후 채팅방 입장
3. 채팅 중 상단의 "🎮 테트리스 플레이" 버튼 클릭하여 게임 시작

## 테트리스 조작법

- ← → : 좌우 이동
- ↓ : 빠르게 내리기
- ↑ / X : 블록 회전
- 스페이스바 : 일시정지 / 재시작

## Docker로 배포

### 프로덕션 빌드

1. Docker 이미지 빌드 및 실행:
```bash
npm run docker:build
npm run docker:up
```

또는 직접 docker-compose 사용:
```bash
docker-compose up -d --build
```

2. 로그 확인:
```bash
npm run docker:logs
```

3. 중지:
```bash
npm run docker:down
```

4. 브라우저에서 `http://localhost:5000` 접속

### 개발 환경 (Docker 사용)

```bash
docker build -f Dockerfile.dev -t chat-tetris-dev .
docker run -p 5000:5000 -p 3000:3000 -v $(pwd):/app chat-tetris-dev
```

## 기술 스택

- **Backend**: Node.js, Express, Socket.IO
- **Frontend**: React, Socket.IO Client
- **Communication**: WebSocket (Socket.IO)
- **Deployment**: Docker, Docker Compose

