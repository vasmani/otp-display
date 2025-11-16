# SMS to MAX7219

## Flow

### iphone에서 단축어 등록

- sms로 필터링된 내용을 전달
- `/display` 로 POST, `number: 'xxxx'` 형식으로 내용을 body에 전달
- 내용중 숫자만 뽑아내어 serial로 전송한다.
- 아두이노는 max7218 8digit 7segment 연결. 소스는 `arduino/` 하위에 있음

### 환경변수

- HTTP_PORT
- SERIAL_PORT_PATH

## test commands

```
curl -d '{"number":"138374"}' -H "Content-Type: application/json" -X POST http://localhost:63791/display
```
