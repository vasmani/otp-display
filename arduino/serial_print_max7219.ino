#include <max7219.h> // https://github.com/JemRF/max7219
#include <math.h>

// Pin configuration
// DIN - 12
// CS  - 11
// CLK - 10

#define LEFT 0
#define RIGHT 1

MAX7219 max7219;

String targetText = "";
bool displayingMessage = false;
bool holding = false;      // 최종 숫자 고정 후 사인 점멸
bool scrollingOut = false; // fade out

unsigned long startTime = 0;
unsigned long lastFixTime = 0;
unsigned long lastRandomUpdate = 0;
unsigned long lastBlinkUpdate = 0;

const unsigned long firstFixDelay = 600; // 첫 자리 고정
const unsigned long fixInterval = 300;   // 자리별 고정
const unsigned long holdDuration = 7000; // 최종 숫자 유지
const unsigned long randomInterval = 30; // 랜덤 숫자 갱신
const unsigned long blinkInterval = 50;  // brightness 갱신
const unsigned long fadeDuration = 1000; // fade out 1초

int fixIndex = 0;
int scrollStep = 0;
String displayBuffer = "";
float blinkPhase = 0.0;
float brightness = 1.0;

void setup()
{
  Serial.begin(38400);
  max7219.Begin();
  max7219.MAX7219_SetBrightness((int)brightness);
}

void loop()
{
  unsigned long now = millis();

  if (Serial.available())
  {
    targetText = Serial.readStringUntil('\n');
    targetText.trim();
    if (targetText.length() < 1)
      targetText = "0";
    fixIndex = 0;
    displayingMessage = true;
    holding = false;
    scrollingOut = false;
    startTime = now;
    lastFixTime = now;
    lastRandomUpdate = now;
    lastBlinkUpdate = now;

    // displayBuffer 초기화 → 랜덤 숫자
    displayBuffer = "";
    for (int i = 0; i < targetText.length(); i++)
    {
      displayBuffer += char('0' + random(0, 10));
    }
    max7219.DisplayText(displayBuffer.c_str(), RIGHT);
  }

  if (displayingMessage)
  {
    // 1️⃣ 자리별 고정 전
    if (fixIndex < targetText.length())
    {
      max7219.MAX7219_SetBrightness(10);
      // 랜덤 숫자 갱신
      if (now - lastRandomUpdate >= randomInterval)
      {
        for (int i = fixIndex; i < targetText.length(); i++)
        {
          displayBuffer[i] = '0' + random(0, 10);
        }
        max7219.DisplayText(displayBuffer.c_str(), RIGHT);
        lastRandomUpdate = now;
      }

      // 자리별 고정
      if (fixIndex == 0 && now - startTime >= firstFixDelay)
      {
        displayBuffer[fixIndex] = targetText[fixIndex];
        fixIndex++;
        lastFixTime = now;
        max7219.DisplayText(displayBuffer.c_str(), RIGHT);
      }
      else if (fixIndex > 0 && now - lastFixTime >= fixInterval)
      {
        displayBuffer[fixIndex] = targetText[fixIndex];
        fixIndex++;
        lastFixTime = now;
        max7219.DisplayText(displayBuffer.c_str(), RIGHT);
      }
    }
    // 2️⃣ 모든 자리 고정 후 사인 점멸
    else if (!scrollingOut)
    {
      if (!holding)
      {
        holding = true;
        lastBlinkUpdate = now;
      }

      if (now - lastBlinkUpdate >= blinkInterval)
      {
        blinkPhase += 0.1;
        brightness = (sin(blinkPhase) + 1.0) / 2.0 * 14.0 + 1.0;
        max7219.MAX7219_SetBrightness((int)brightness);
        lastBlinkUpdate = now;
      }

      if (now - lastFixTime >= holdDuration)
      {
        scrollingOut = true;
        scrollStep = 0;
        startTime = now;
      }
    }
    // 3️⃣ fade out
    else if (scrollingOut)
    {
      const int scrollInterval = 80; // 밀리는 속도 (ms)
      int len = targetText.length();

      if (now - lastFixTime >= scrollInterval)
      {
        scrollStep++;
        lastFixTime = now;

        // 공백 + 문자열 조합
        String scrolled = "";
        for (int i = 0; i < scrollStep; i++)
          scrolled += " ";
        scrolled += targetText;

        // 길이가 디스플레이보다 길어지면 오른쪽부터 필요한 만큼만 자름
        // (RIGHT 정렬 사용 시 문제가 없지만 안전하게)
        if (scrolled.length() > len + 8)
        {
          scrollingOut = false;
          displayingMessage = false;
          max7219.Clear();
          return;
        }

        max7219.DisplayText(scrolled.c_str(), RIGHT);
      }
    }
  }
  // 메시지 없을 때 "-" 표시 + 사인 점멸
  else
  {
    if (now - lastBlinkUpdate >= blinkInterval)
    {
      blinkPhase += 0.1;
      brightness = (sin(blinkPhase) + 1.0) / 2.0 * 14.0 + 1.0;
      max7219.MAX7219_SetBrightness((int)brightness);
      max7219.DisplayText("-", RIGHT);
      lastBlinkUpdate = now;
    }
  }
}
