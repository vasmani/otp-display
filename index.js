require("dotenv").config({ path: ".env.local" });

const PocketBase = require("pocketbase").default;
const EventSource = require("eventsource");
const SerialPortManager = require("./serialPort");
const { getOtpNumber } = require("./utils");

// Node.js 환경을 위한 EventSource 설정
global.EventSource = EventSource;

const portPath = process.env.SERIAL_PORT_PATH || "/dev/tty.usbmodem22201";
const pocketbaseUrl = process.env.POCKETBASE_URL;
const collectionName = process.env.COLLECTION_NAME;

const serialPortManager = new SerialPortManager(portPath, 38400);
const pb = new PocketBase(pocketbaseUrl);

async function subscribeToCollection() {
  try {
    console.log(`PocketBase 연결 중: ${pocketbaseUrl}`);
    console.log(`컬렉션 구독 중: ${collectionName}`);

    // 컬렉션 구독
    await pb.collection(collectionName).subscribe("*", async (e) => {
      // console.log("새 레코드 수신:", e.record);
      if (e.action !== "create") return;

      const text = e.record.text;

      if (!text) {
        console.log("text 필드가 없습니다.");
        return;
      }
      const otp = getOtpNumber(text);

      if (!otp) {
        console.log("OTP를 찾을 수 없습니다:", text);
        return;
      }
      console.log("OTP 추출됨:", otp);

      try {
        // 연결 -> 전송 -> 종료를 한 번에 수행
        await serialPortManager.connectAndWrite(`${otp}`);
        console.log(`OTP 전송 성공: ${otp}`);
      } catch (err) {
        console.error("시리얼 포트 오류:", err.message);
      }
    });

    console.log(
      `구독 성공! ${collectionName} 컬렉션의 새 레코드를 감시합니다.`
    );
  } catch (err) {
    console.error("PocketBase 구독 오류:", err.message);
    console.log("5초 후 재연결 시도...");
    setTimeout(subscribeToCollection, 5000);
  }
}

// 프로그램 시작
console.log("OTP Display 서비스 시작");
console.log(`시리얼 포트: ${portPath}`);
console.log(`PocketBase URL: ${pocketbaseUrl}`);
console.log(`컬렉션: ${collectionName}`);
subscribeToCollection();

// 종료 처리
process.on("SIGINT", () => {
  console.log("\n서비스 종료 중...");
  pb.cancelAllSubscriptions();
  process.exit(0);
});
