#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <SPI.h>
#include <MFRC522.h>

#define SS_PIN D8
#define RST_PIN -1  // RST not connected
#define BLUE_LED_PIN LED_BUILTIN  // Onboard blue LED (active low)

MFRC522 rfid(SS_PIN, RST_PIN);

const char* ssid = "Saini's Tech 4G";
const char* password = "SAINISTANDARD";
const char* serverUrl = "http://192.168.1.6:3000/rfid";

String lastUID = "";
unsigned long lastSendTime = 0;

void setup() {
  Serial.begin(74880);
  pinMode(BLUE_LED_PIN, OUTPUT);
  digitalWrite(BLUE_LED_PIN, LOW); // LED ON (active low)
  
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
      // Turn off LED immediately on card scan
      digitalWrite(BLUE_LED_PIN, HIGH); // LED OFF (active low)
      
      if (WiFi.status() == WL_CONNECTED) {
        WiFiClient client;
        HTTPClient http;
        http.begin(client, serverUrl);
        http.addHeader("Content-Type", "application/json");

        String postData = "?rfidkey=" + uid;
        int httpCode = http.POST(postData);

        if (httpCode > 0) {
          Serial.println("UID sent to server");
          lastUID = uid;
          lastSendTime = millis();
        } else {
          Serial.println("Failed to send UID to server");
        }
        http.end();
      } else {
        Serial.println("WiFi not connected");
      }

      delay(300); // Wait 300ms before turning the LED back on

      digitalWrite(BLUE_LED_PIN, LOW); // LED ON (active low)
    }

    rfid.PICC_HaltA();
    rfid.PCD_StopCrypto1();
  }
}
