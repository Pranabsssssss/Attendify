#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <SPI.h>
#include <MFRC522.h>

#define SS_PIN D4
#define RST_PIN D3
MFRC522 rfid(SS_PIN, RST_PIN);

// WiFi credentials
const char *ssid = "YOUR_WIFI_NAME";
const char *password = "YOUR_WIFI_PASSWORD";

// Server
const char *serverName = "http://192.168.1.100:3000/rfid"; // replace with your server IP

// Max retries for sending data
const int MAX_RETRIES = 3;

void setup()
{
    Serial.begin(115200);
    connectWiFi();
    SPI.begin();
    rfid.PCD_Init();
    Serial.println("Place your RFID card near the reader...");
}

void loop()
{
    if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial())
        return;

    // Get UID
    String uid = getUID();
    Serial.println("UID: " + uid);

    // Send UID (and optionally name if new)
    sendUIDToServer(uid);

    rfid.PICC_HaltA();
    rfid.PCD_StopCrypto1();
    delay(1000);
}

// ------------------ Functions ------------------

void connectWiFi()
{
    WiFi.begin(ssid, password);
    Serial.print("Connecting to WiFi");
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        Serial.print(".");
        attempts++;
        if (attempts > 20)
        { // 10 seconds timeout
            Serial.println("\nFailed to connect to WiFi. Restarting...");
            ESP.restart();
        }
    }
    Serial.println("\nWiFi connected. IP: " + WiFi.localIP().toString());
}

String getUID()
{
    String uid = "";
    for (byte i = 0; i < rfid.uid.size; i++)
    {
        if (rfid.uid.uidByte[i] < 0x10)
            uid += "0";
        uid += String(rfid.uid.uidByte[i], HEX);
    }
    uid.toUpperCase();
    return uid;
}

void sendUIDToServer(String uid)
{
    if (WiFi.status() != WL_CONNECTED)
    {
        Serial.println("WiFi disconnected. Reconnecting...");
        connectWiFi();
    }

    HTTPClient http;
    int attempt = 0;
    bool success = false;

    while (attempt < MAX_RETRIES && !success)
    {
        http.begin(serverName);
        http.addHeader("Content-Type", "application/json");

        // Optionally, you can add "name" for new cards by uncommenting below
        // String name = getNameFromSerial(); // implement function if needed
        // String postData = "{\"uid\":\"" + uid + "\", \"name\":\"" + name + "\"}";

        String postData = "{\"uid\":\"" + uid + "\"}";
        int httpResponseCode = http.POST(postData);

        if (httpResponseCode > 0)
        {
            String response = http.getString();
            Serial.println("Server Response: " + response);
            success = true;
        }
        else
        {
            Serial.printf("HTTP POST failed, code: %d. Retrying...\n", httpResponseCode);
            attempt++;
            delay(500);
        }
        http.end();
    }

    if (!success)
    {
        Serial.println("Failed to send UID to server after multiple attempts.");
    }
}

// Optional: function to get name from Serial Monitor
String getNameFromSerial()
{
    Serial.println("Enter user name for new UID:");
    while (!Serial.available())
    {
        delay(100);
    }
    String name = Serial.readStringUntil('\n');
    name.trim();
    return name;
}
