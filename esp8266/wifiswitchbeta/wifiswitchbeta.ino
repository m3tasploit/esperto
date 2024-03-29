#include <ESP8266WiFi.h>
#include <DNSServer.h>
#include <EEPROM.h>
#include <ESP8266WebServer.h>
#include <WebSocketsClient.h>
#include <Hash.h>

//Network Properties
const IPAddress AP_IP(192, 168, 1, 1);
const char *AP_SSID = "ESP8266_Esperto";
boolean SETUP_MODE;
String SSID_LIST;
DNSServer DNS_SERVER;
ESP8266WebServer WEB_SERVER(80);
char path[] = "/";
String host = "";
const int port = 80;
boolean flag = true;
WebSocketsClient webSocket;
int pingCount = 0;
//Device Details
String DEVICE_TITLE = "ESP8266_Esperto Wifi Switch";

//Pin Definitions
const int LED = 14;
const int eprm_rst = 4;

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length){ 
    switch(type) {
        case WStype_DISCONNECTED:
           Serial.println("Disconnected! ");
            break;
        case WStype_CONNECTED:
            {
             Serial.println("Connected! ");
            webSocket.sendTXT("Connected");
            }
            break;
        case WStype_TEXT:
            Serial.println("Got data");
            processWebSocketRequest((char*)payload);
            break;
        case WStype_BIN:
            hexdump(payload, length);
            Serial.print("Got bin");
            break;
    }
}

void setup(){
  initHardware();
  // Try and restore saved settings
  if (loadSavedConfig())
  {
    if (checkWiFiConnection())
    {
      WiFi.softAPdisconnect(true);
      SETUP_MODE = false;
      startWebServer();
      webSocket.begin(host, port, path);
      webSocket.onEvent(webSocketEvent);
      return;
    }
  }
  SETUP_MODE = true;
  setupMode();
}
void loop()
{
  webSocket.loop();
        delay(100);
  if (SETUP_MODE)
  {
    DNS_SERVER.processNextRequest();
  }
  WEB_SERVER.handleClient();
  if (pingCount > 20) {
    pingCount = 0;
    webSocket.sendTXT("\"heartbeat\":\"keepalive\"");
  }
  else {
    pingCount += 1;
  }
  
    resetESP();
}
void processWebSocketRequest(String data){
  Serial.println("Data-->"+data);
  if (data == "toggle")
      {
        if (flag)
        {
          //turnoff
          digitalWrite(LED, HIGH);
          flag = false;
        }
        else
        {
          //turnon
          digitalWrite(LED, LOW);
          flag = true;
        }
      }
  }
void resetESP(){
  int state = digitalRead(eprm_rst);
  if(state ==HIGH){
    for (int i = 0; i < 128; ++i)
      {
        EEPROM.write(i, 0);
      }
      EEPROM.commit();
      ESP.restart();
    }
  
 }
void initHardware()
{
  Serial.begin(115200);
  EEPROM.begin(512);
  delay(10);
  //LED SETUP
  pinMode(LED, OUTPUT);
  pinMode(eprm_rst, INPUT);
  digitalWrite(LED, LOW);
}

boolean loadSavedConfig()
{
  Serial.println("Reading Saved Config....");
  String ssid = "";
  String password = "";
  if (EEPROM.read(0) != 0)
  {
    for (int i = 0; i < 32; ++i)
    {
      ssid += char(EEPROM.read(i));
    }
    Serial.print("SSID: ");
    Serial.println(ssid);
    for (int i = 32; i < 96; ++i)
    {
      password += char(EEPROM.read(i));
    }
    Serial.print("Password: ");
    Serial.println(password);
    //read path and host name
    for (int i = 96; i < 128; ++i)
    {
      host += char(EEPROM.read(i));
    }
    host = host.c_str();
    WiFi.begin(ssid.c_str(), password.c_str());
    return true;
  }
  else
  {
    Serial.println("Saved Configuration not found");
    return false;
  }
}

boolean checkWiFiConnection()
{
  int count = 0;
  Serial.print("Waiting to connect to the specified WiFi network");
  while (count < 30)
  {
    if (WiFi.status() == WL_CONNECTED)
    {
      Serial.println();
      Serial.println("Connected!");
      return (true);
    }
    delay(500);
    Serial.print(".");
    count++;
  }
  Serial.println("Timed out.");
  return false;
}

String makePage(String title, String contents)
{
  String s = "<!DOCTYPE html><html><head>";
  s += "<meta name=\"viewport\" content=\"width=device-width,user-scalable=0\">";
  s += "<style>";
  // Simple Reset CSS
  s += "*,*:before,*:after{-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box}html{font-size:100%;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%}html,button,input,select,textarea{font-family:sans-serif}article,aside,details,figcaption,figure,footer,header,hgroup,main,nav,section,summary{display:block}body,form,fieldset,legend,input,select,textarea,button{margin:0}audio,canvas,progress,video{display:inline-block;vertical-align:baseline}audio:not([controls]){display:none;height:0}[hidden],template{display:none}img{border:0}svg:not(:root){overflow:hidden}body{font-family:sans-serif;font-size:16px;font-size:1rem;line-height:22px;line-height:1.375rem;color:#585858;font-weight:400;background:#fff}p{margin:0 0 1em 0}a{color:#cd5c5c;background:transparent;text-decoration:underline}a:active,a:hover{outline:0;text-decoration:none}strong{font-weight:700}em{font-style:italic}";
  // Basic CSS Styles
  s += "body{font-family:sans-serif;font-size:16px;font-size:1rem;line-height:22px;line-height:1.375rem;color:#585858;font-weight:400;background:#fff}p{margin:0 0 1em 0}a{color:#cd5c5c;background:transparent;text-decoration:underline}a:active,a:hover{outline:0;text-decoration:none}strong{font-weight:700}em{font-style:italic}h1{font-size:32px;font-size:2rem;line-height:38px;line-height:2.375rem;margin-top:0.7em;margin-bottom:0.5em;color:#343434;font-weight:400}fieldset,legend{border:0;margin:0;padding:0}legend{font-size:18px;font-size:1.125rem;line-height:24px;line-height:1.5rem;font-weight:700}label,button,input,optgroup,select,textarea{color:inherit;font:inherit;margin:0}input{line-height:normal}.input{width:100%}input[type='text'],input[type='email'],input[type='tel'],input[type='date']{height:36px;padding:0 0.4em}input[type='checkbox'],input[type='radio']{box-sizing:border-box;padding:0}";
  // Custom CSS
  s += "header{width:100%;background-color: #2c3e50;top: 0;min-height:60px;margin-bottom:21px;font-size:15px;color: #fff}.content-body{padding:0 1em 0 1em}header p{font-size: 1.25rem;float: left;position: relative;z-index: 1000;line-height: normal; margin: 15px 0 0 10px}";
  s += "</style>";
  s += "<title>";
  s += title;
  s += "</title></head><body>";
  s += "<header><p>" + DEVICE_TITLE + "</p></header>";
  s += "<div class=\"content-body\">";
  s += contents;
  s += "</div>";
  s += "</body></html>";
  return s;
}

String urlDecode(String input)
{
  String s = input;
  s.replace("%20", " ");
  s.replace("+", " ");
  s.replace("%21", "!");
  s.replace("%22", "\"");
  s.replace("%23", "#");
  s.replace("%24", "$");
  s.replace("%25", "%");
  s.replace("%26", "&");
  s.replace("%27", "\'");
  s.replace("%28", "(");
  s.replace("%29", ")");
  s.replace("%30", "*");
  s.replace("%31", "+");
  s.replace("%2C", ",");
  s.replace("%2E", ".");
  s.replace("%2F", "/");
  s.replace("%2C", ",");
  s.replace("%3A", ":");
  s.replace("%3A", ";");
  s.replace("%3C", "<");
  s.replace("%3D", "=");
  s.replace("%3E", ">");
  s.replace("%3F", "?");
  s.replace("%40", "@");
  s.replace("%5B", "[");
  s.replace("%5C", "\\");
  s.replace("%5D", "]");
  s.replace("%5E", "^");
  s.replace("%5F", "-");
  s.replace("%60", "`");
  return s;
}

void startWebServer()
{
  if (SETUP_MODE)
  {
    Serial.print("Starting Web Server at IP address: ");
    Serial.println(WiFi.softAPIP());
    // Settings Page
    WEB_SERVER.on("/settings", []() {
      String s = "<h2>Wi-Fi Settings</h2><p>Please select the SSID of the network you wish to connect to and then enter the password and submit.</p>";
      s += "<form method=\"get\" action=\"setap\"><label>SSID: </label><select name=\"ssid\">";
      s += SSID_LIST;
      s += "</select><br><br>Heroku link <input name=\"host\" maxlength=32 type=\"text\">";
      s += "<br><br>Password: <input name=\"pass\" maxlength=64 type=\"password\"><br><br><input type=\"submit\"></form>";
      WEB_SERVER.send(200, "text/html", makePage("Wi-Fi Settings", s));
    });
    // setap Form Post
    WEB_SERVER.on("/setap", []() {
      for (int i = 0; i < 128; ++i)
      {
        EEPROM.write(i, 0);
      }
      String ssid = urlDecode(WEB_SERVER.arg("ssid"));
      Serial.print("SSID: ");
      Serial.println(ssid);
      String pass = urlDecode(WEB_SERVER.arg("pass"));
      Serial.print("Password: ");
      Serial.println(pass);
      String host = urlDecode(WEB_SERVER.arg("host"));
      Serial.println("Writing SSID to EEPROM...");
      for (int i = 0; i < ssid.length(); ++i)
      {
        EEPROM.write(i, ssid[i]);
      }
      Serial.println("Writing Password to EEPROM...");
      for (int i = 0; i < pass.length(); ++i)
      {
        EEPROM.write(32 + i, pass[i]);
      }
      for (int i = 0; i < host.length(); ++i)
      {
        EEPROM.write(96 + i, host[i]);
      }
      EEPROM.commit();
      Serial.println("Write EEPROM done!");
      String s = "<h1>WiFi Setup complete.</h1><p>The WifiSwitch will be connected automatically to \"";
      s += ssid;
      s += "\" after the restart.";
      WEB_SERVER.send(200, "text/html", makePage("Wi-Fi Settings", s));
      ESP.restart();
    });
    // Show the configuration page if no path is specified
    WEB_SERVER.onNotFound([]() {
      String s = "<h1>WiFi Configuration Mode</h1><p><a href=\"/settings\">Wi-Fi Settings</a></p>";
      WEB_SERVER.send(200, "text/html", makePage("Access Point mode", s));
    });
  }
  else
  {
    Serial.print("Starting Web Server at ");
    Serial.println(WiFi.localIP());
    WEB_SERVER.on("/", []() {
      IPAddress ip = WiFi.localIP();
      String ipStr = String(ip[0]) + '.' + String(ip[1]) + '.' + String(ip[2]) + '.' + String(ip[3]);
      String s = "<h1>Esperto Switch Status</h1>";
      s += "<h3>Network Details</h3>";
      s += "<p>Connected to: " + String(WiFi.SSID()) + "</p>";
      s += "<p>IP Address: " + ipStr + "</p>";
      s += "<p>heroku link: " + host + path + "</p>";
      s += "<p><a href=\"/reset\">Clear Saved Wi-Fi Settings</a></p>";
      WEB_SERVER.send(200, "text/html", makePage("Station mode", s));
    });
    WEB_SERVER.on("/reset", []() {
      for (int i = 0; i < 128; ++i)
      {
        EEPROM.write(i, 0);
      }
      EEPROM.commit();
      ESP.restart();
    });
  }
  WEB_SERVER.begin();
}

void setupMode()
{
  WiFi.mode(WIFI_STA);
  WiFi.disconnect();
  delay(100);
  int n = WiFi.scanNetworks();
  delay(100);
  Serial.println("");
  for (int i = 0; i < n; ++i)
  {
    SSID_LIST += "<option value=\"";
    SSID_LIST += WiFi.SSID(i);
    SSID_LIST += "\">";
    SSID_LIST += WiFi.SSID(i);
    SSID_LIST += "</option>";
  }
  delay(100);
  WiFi.mode(WIFI_AP);
  WiFi.softAPConfig(AP_IP, AP_IP, IPAddress(255, 255, 255, 0));
  WiFi.softAP(AP_SSID);
  DNS_SERVER.start(53, "*", AP_IP);
  startWebServer();
  Serial.print("Starting Access Point at \"");
  Serial.print(AP_SSID);
  Serial.println("\"");
}
