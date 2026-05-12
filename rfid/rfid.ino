/*
 * Attendify - RFID Attendance System (Server-Driven Display)
 * Hardware: NodeMCU ESP8266 + RC522 RFID + TM1637 Clock + I2C LCD 16x2
 * Domain: attendify.asose.me
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <SPI.h>
#include <MFRC522.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <TM1637Display.h>
#include <time.h>

// ================= COFIGURATION =================
const char* ssid = "Saini's Tech 4G";
const char* password = "SAINISTANDARD";
const char* apiUrl = "http://attendify.asose.me/api/rfid"; 
const char* apiKey = "pranabfromtx";

// ================= PIN DEFINITIONS =================
#define SS_PIN     D8    
#define LCD_SDA    D2
#define LCD_SCL    D1
#define TM_CLK_PIN D3
#define TM_DIO_PIN D4
#define BULB_PIN   D0    

// ================= OBJECTS =================
MFRC522 rfid(SS_PIN, -1);
LiquidCrystal_I2C lcd(0x27, 16, 2);
TM1637Display tm(TM_CLK_PIN, TM_DIO_PIN);

// ================= VARIABLES =================
unsigned long lastClockUpdate = 0;
bool colonState = false;
unsigned long lastCardRead = 0;
String lastCardUID = "";
unsigned long messageClearTime = 0; // When to reset LCD
bool showingMessage = false;

// ================= HELPER FUNCTIONS =================
void lcdShow(String line1, String line2) {
    lcd.clear();
    // Center text logic
    int p1 = (16 - line1.length()) / 2;
    if(p1 < 0) p1 = 0;
    lcd.setCursor(p1, 0);
    lcd.print(line1);

    int p2 = (16 - line2.length()) / 2;
    if(p2 < 0) p2 = 0;
    lcd.setCursor(p2, 1);
    lcd.print(line2);
}

void bulbSignal(int times, int delayMs) {
    for(int i=0; i<times; i++) {
        digitalWrite(BULB_PIN, HIGH);
        delay(delayMs);
        digitalWrite(BULB_PIN, LOW);
        if(i < times-1) delay(delayMs);
    }
}

// ================= SETUP =================
void setup() {
    Serial.begin(115200);
    pinMode(BULB_PIN, OUTPUT);
    digitalWrite(BULB_PIN, LOW);

    Wire.begin(LCD_SDA, LCD_SCL);
    lcd.init();
    lcd.backlight();
    lcdShow("Attendify", "Booting...");

    tm.setBrightness(0x0f);
    
    SPI.begin();
    rfid.PCD_Init();
    
    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid, password);
    
    while (WiFi.status() != WL_CONNECTED) {
        delay(250);
        Serial.print(".");
    }
    
    lcdShow("WiFi Connected", WiFi.localIP().toString());
    bulbSignal(1, 200);
    configTime(19800, 0, "pool.ntp.org");
    
    delay(1000);
    lcdShow("Attendify", "Tap Your Card");
}

// ================= LOOP =================
void loop() {
    // 1. NON-BLOCKING CLOCK
    if (millis() - lastClockUpdate >= 500) {
        lastClockUpdate = millis();
        time_t now = time(nullptr);
        struct tm* p_tm = localtime(&now);
        if (p_tm->tm_year > 120) { 
            int disp = (p_tm->tm_hour * 100) + p_tm->tm_min;
            colonState = !colonState;
            tm.showNumberDecEx(disp, colonState ? 0x40 : 0, true);
        }
    }

    // 2. LCD RESET LOGIC
    if (showingMessage && millis() > messageClearTime) {
        lcdShow("Attendify", "Tap Your Card");
        showingMessage = false;
        lastCardUID = ""; // Allow re-scanning same card after message clears
    }

    // 3. SCAN CARD
    if (!rfid.PICC_IsNewCardPresent()) return;
    if (!rfid.PICC_ReadCardSerial()) return;

    String uid = "";
    for (byte i = 0; i < rfid.uid.size; i++) {
        if (rfid.uid.uidByte[i] < 0x10) uid += "0";
        uid += String(rfid.uid.uidByte[i], HEX);
    }
    uid.toUpperCase();

    // Debounce: Ignore same card if message is still showing
    if (uid == lastCardUID && showingMessage) {
         rfid.PICC_HaltA();
         rfid.PCD_StopCrypto1();
         return;
    }
    lastCardUID = uid;

    lcdShow("Attendify", "Processing...");

    if (WiFi.status() == WL_CONNECTED) {
        WiFiClient client;
        client.setTimeout(2500);
        HTTPClient http;
        http.begin(client, apiUrl);
        http.addHeader("Content-Type", "application/json");
        http.addHeader("x-api-key", apiKey);

        int httpCode = http.POST("{\"rfidUid\":\"" + uid + "\"}");
        String payload = http.getString();
        http.end();

        String line1 = "Attendify";
        String line2 = "Server Error"; // Default 500 error if not 200/JSON

        // Simple JSON Parse for line1/line2
        // If HTTP 200 or 400 or JSON returned properly, we parse lines
        if(httpCode == 200 || httpCode == 400 || httpCode == 404) {
            int l1 = payload.indexOf("\"line1\":\"");
            if(l1 > 0) {
                int end = payload.indexOf("\"", l1+9);
                if(end > l1) line1 = payload.substring(l1+9, end);
            }

            int l2 = payload.indexOf("\"line2\":\"");
            if(l2 > 0) {
                int end = payload.indexOf("\"", l2+9);
                if(end > l2) line2 = payload.substring(l2+9, end);
            }
        }

        lcdShow(line1, line2);
        
        // Feedback
        if(httpCode == 200 && payload.indexOf("\"success\":true") >= 0) {
             bulbSignal(1, 200);
        } else {
             bulbSignal(3, 100);
        }

        // Keep message for 1.5 seconds
        messageClearTime = millis() + 1500;
        showingMessage = true;

    } else {
        lcdShow("Attendify", "WiFi Error");
        bulbSignal(3, 100);
        messageClearTime = millis() + 1500;
        showingMessage = true;
    }

    rfid.PICC_HaltA();
    rfid.PCD_StopCrypto1();
}
