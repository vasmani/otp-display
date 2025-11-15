const { SerialPort } = require("serialport");

class SerialPortManager {
  constructor(portPath, baudRate = 38400) {
    this.portPath = portPath;
    this.baudRate = baudRate;
    this.sp = null;
  }

  async connectAndWrite(data) {
    return new Promise((resolve, reject) => {
      try {
        // 기존 인스턴스가 있으면 리스너 제거
        if (this.sp) {
          this.sp.removeAllListeners();
        }

        this.sp = new SerialPort({
          path: this.portPath,
          baudRate: this.baudRate,
          autoOpen: false,
        });

        this.sp.open((err) => {
          if (err) {
            console.error(
              `시리얼 포트 연결 실패 (${this.portPath}):`,
              err.message
            );
            reject(err);
            return;
          }

          console.log(`시리얼 포트 연결 성공: ${this.portPath}`);

          setTimeout(() => {
            // 데이터 전송
            this.sp.write(data, (writeErr) => {
              if (writeErr) {
                console.error("데이터 전송 실패:", writeErr.message);
                this.close();
                reject(writeErr);
                return;
              }

              console.log(`데이터 전송 성공: ${data}`);

              // 전송 완료 후 잠시 대기 후 연결 종료
              setTimeout(() => {
                this.close();
                resolve();
              }, 1500);
            });
          }, 1800);
        });

        this.sp.on("error", (err) => {
          console.error("시리얼 포트 오류:", err.message);
          this.close();
          reject(err);
        });
      } catch (err) {
        console.error("시리얼 포트 초기화 실패:", err.message);
        reject(err);
      }
    });
  }

  close() {
    if (this.sp) {
      if (this.sp.isOpen) {
        this.sp.close((err) => {
          if (err) {
            console.error("시리얼 포트 종료 중 오류:", err.message);
          } else {
            console.log("시리얼 포트 연결 종료");
          }
        });
      }
      this.sp.removeAllListeners();
    }
  }
}

module.exports = SerialPortManager;
