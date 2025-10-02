#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h>   // needed for HTTPS
#include <SPI.h>
#include <MFRC522.h>

#define SS_PIN D8
#define RST_PIN -1  
#define BLUE_LED_PIN LED_BUILTIN  

MFRC522 rfid(SS_PIN, RST_PIN);

const char* ssid = "(Your Wifi Name/SSID)";
const char* password = "Your WIFI PassWord";
const char* serverHost = "(yourdomain.com/rfid)";  
// ⚠️ Added trailing slash to avoid 301 redirect

String lastUID = "";
unsigned long lastSendTime = 0;

void setup() {
  Serial.begin(74880);
  pinMode(BLUE_LED_PIN, OUTPUT);
  digitalWrite(BLUE_LED_PIN, LOW); 

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected. IP: " + WiFi.localIP().toString());

  SPI.begin();
  rfid.PCD_Init();
}

void loop() {
  if (rfid.PICC_IsNewCardPresent() && rfid.PICC_ReadCardSerial()) {
    String uid = "";
    for (byte i = 0; i < rfid.uid.size; i++) {
      if (rfid.uid.uidByte[i] < 0x10) uid += "0";
      uid += String(rfid.uid.uidByte[i], HEX);
    }
    uid.toUpperCase();

    if (uid != lastUID || millis() - lastSendTime > 3000) {
      digitalWrite(BLUE_LED_PIN, HIGH); 

      if (WiFi.status() == WL_CONNECTED) {
        WiFiClientSecure client;
        client.setInsecure();  // ⚠️ For testing only (disables SSL cert check)

        HTTPClient http;
        String postData = "rfidKey=" + uid;

        if (http.begin(client, serverHost)) {
          http.setFollowRedirects(HTTPC_STRICT_FOLLOW_REDIRECTS);  // ✅ follow 301/302 redirects
          http.addHeader("Content-Type", "application/x-www-form-urlencoded");
          http.addHeader("User-Agent", "ESP8266/Arduino");

          int httpCode = http.POST(postData);

          if (httpCode > 0) {
            String payload = http.getString();
            Serial.printf("Response Code: %d\n", httpCode);
            Serial.println("Server Response: " + payload);
            lastUID = uid;
            lastSendTime = millis();
          } else {
            Serial.printf("HTTP POST failed, error: %s\n", http.errorToString(httpCode).c_str());
          }
          http.end();
        } else {
          Serial.println("HTTP begin() failed");
        }
      } else {
        Serial.println("WiFi not connected");
      }

      delay(300);
      digitalWrite(BLUE_LED_PIN, LOW);
    }

    rfid.PICC_HaltA();
    rfid.PCD_StopCrypto1();
  }
}