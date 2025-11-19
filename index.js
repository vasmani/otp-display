const express = require("express");
const SerialPortManager = require("./serialPort");
const { getOtpNumber } = require("./utils");
const { setClipboard } = require("./clipboard");

const app = express();
const port = process.env.HTTP_PORT || 63791;
const portPath = process.env.SERIAL_PORT_PATH || "/dev/tty.usbmodem22201";

const serialPortManager = new SerialPortManager(portPath, 38400);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/display", async (req, res) => {
  if (req.body && req.body.number) {
    const otp = getOtpNumber(req.body.number);

    if (otp) {
      try {
        setTimeout(() => {
          setClipboard(otp);
        }, 1000);
        // 연결 -> 전송 -> 종료를 한 번에 수행
        await serialPortManager.connectAndWrite(`${otp}`);
        console.log(`OTP 전송 성공: ${otp}`);
        res.status(200).json({ success: true, otp: otp });
      } catch (err) {
        console.log("시리얼 포트 오류:", err.message);
        res.status(503).json({
          error: "Serial port error",
          message: err.message,
        });
      }
    } else {
      res
        .status(200)
        .json({ success: false, message: "OTP를 찾을 수 없습니다." });
    }
  } else {
    res.status(400).json({ error: "Invalid request body" });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
