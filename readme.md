# OTP Display with PocketBase

## Flow

### PocketBase 구독 방식

- PocketBase의 특정 컬렉션을 실시간 구독
- 새로운 레코드가 생성되면 자동으로 감지
- `text` 필드에서 숫자를 추출하여 시리얼로 전송
- 아두이노는 MAX7219 8-digit 7-segment 연결. 소스는 `arduino/` 하위에 있음

### 환경변수

`.env.local` 파일에서 다음 환경변수를 설정하세요:

- `SERIAL_PORT_PATH` - 시리얼 포트 경로 (기본값: /dev/tty.usbmodem22201)
- `POCKETBASE_URL` - PocketBase 서버 URL (필수)
- `COLLECTION_NAME` - 구독할 컬렉션 이름 (필수)

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env.local
# .env.local 파일을 편집하여 실제 값을 입력하세요

# 실행
npm start
```

## PocketBase 컬렉션 설정

구독할 컬렉션을 생성하고 다음 필드를 추가하세요:

- `text` (Text) - 표시할 숫자가 포함된 텍스트

## 동작 방식

1. 앱이 시작되면 PocketBase 컬렉션을 실시간으로 구독합니다
2. 새 레코드가 생성되면 `text` 필드에서 4~10자리 숫자를 추출합니다
3. 시리얼 포트에 연결하여 추출된 숫자를 전송합니다
4. 전송 완료 후 시리얼 포트 연결을 종료합니다
5. 연결 실패 시 5초 후 자동으로 재연결을 시도합니다

## 테스트

PocketBase Admin UI에서 컬렉션에 새 레코드를 생성하여 테스트:

```json
{
  "text": "인증번호는 138374 입니다"
}
```

추출된 OTP (138374)가 시리얼 포트로 전송됩니다.
