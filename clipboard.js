const { exec } = require("child_process");

function setClipboard(text) {
  const script = `
set theText to "${text}"

try
    display dialog "클립보드에 넣을까요?\n\n" & theText ¬
        buttons {"Cancel", "OK"} default button "OK"
    
    -- Esc를 누르지 않고 OK를 누른 경우에만 실행됨
    set the clipboard to theText

on error number -128
    -- 사용자가 Esc(또는 ⌘-. 또는 Cancel)을 누른 경우
    return "User canceled"
end try
`;

  return new Promise((resolve, reject) => {
    exec(`osascript -e '${script.replace(/'/g, "\\'")}'`, (err, stdout) => {
      if (err) {
        reject(err);
      } else {
        resolve(stdout);
      }
    });
  });
}

module.exports = { setClipboard };
