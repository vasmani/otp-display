const fs = require("fs");

function getOtpNumber(smsBody) {
  const otpMatch = smsBody.match(/\b\d{4,10}\b/);
  return otpMatch ? otpMatch[0] : null;
}

function masking(str, start = 2, end = 2) {
  if (str.length <= start + end) {
    return "*".repeat(str.length);
  }
  return (
    str.substring(0, start) +
    "*".repeat(str.length - start - end) +
    str.substring(str.length - end)
  );
}
function detectUsbModemPath() {
  try {
    const entries = fs.readdirSync("/dev");
    const matches = entries
      .filter((name) => name.startsWith("tty.usbmodem"))
      .sort();
    if (matches.length > 0) {
      return `/dev/${matches[0]}`;
    }
  } catch (e) {
    // ignore
  }
  return null;
}

module.exports = { getOtpNumber, masking, detectUsbModemPath };
