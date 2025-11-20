// applescript를 통해 otp를 자동으로 입력하는 스크립트
const { exec } = require("child_process");

function typeOTP(otp) {
  const appleScript = `
        tell application "System Events"
            keystroke "${otp}"
            key code 36
        end tell
    `;

  exec(`osascript -e '${appleScript}'`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error typing OTP: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log(`OTP typed successfully: ${stdout}`);
  });
}

module.exports = { typeOTP };
