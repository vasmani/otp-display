function getOtpNumber(smsBody) {
  const otpMatch = smsBody.match(/\b\d{4,10}\b/);
  return otpMatch ? otpMatch[0] : null;
}

module.exports = { getOtpNumber };
