# SMS to MAX7219

## Flow

### iphone에서 단축어 등록

- sms로 필터링된 내용을 전달(예, `인증번호` 문구를 포함한 문자)
- `/display` 로 POST, `number: 'xxxx'` 형식으로 내용을 body에 전달
- 내용중 숫자만 뽑아내어 serial로 전송한다.
- 아두이노는 max7218 8digit 7segment 연결. 소스는 `arduino/` 하위에 있음

### 환경변수

`.env.local.example`을 `.env.local`로 복사하고, 내용을 수정한다.

- HTTP_PORT = 63791
- SERIAL_PORT_PATH = /dev/tty.usbmodem22201
- COPY_TO_CLIPBOARD = false ## 클립보드에 복사할지 여부
- AUTO_TYPE = true ## 자동으로 타이핑할지 여부

## test command

```
curl -d '{"number":"138374"}' -H "Content-Type: application/json" -X POST http://localhost:63791/display
```
