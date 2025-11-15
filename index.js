const { SerialPort } = require("serialport");
const express = require("express");
const app = express();

const port = process.env.HTTP_PORT || 63791;
const portPath = process.env.SERIAL_PORT_PATH || "/dev/tty.usbmodem22201";

const sp = new SerialPort({
  path: portPath,
  baudRate: 38400,
  autoOpen: true,
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/otp-sms", (req, res) => {
  if (req.body && req.body.body) {
    const otp = getOtpNumber(req.body.body);
    otp &&
      sp.write(`${otp}`, (err) => {
        if (err) return console.log("Error on write:", err.message);
      });
  }
  res.status(200).send("ok");
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

function getOtpNumber(smsBody) {
  const otpMatch = smsBody.match(/\b\d{4,10}\b/);
  return otpMatch ? otpMatch[0] : null;
}
