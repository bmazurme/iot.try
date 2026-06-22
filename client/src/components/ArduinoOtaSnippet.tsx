import { Card, ClipboardButton, Disclosure } from '@gravity-ui/uikit';

interface ArduinoOtaSnippetProps {
  defaultFieldName: string;
}

function buildSketch(fieldName: string): string {
  return `#include <WiFi.h>
#include <WebServer.h>
#include <Update.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

WebServer server(80);

void setCors() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) delay(300);
  Serial.println(WiFi.localIP());

  // Отвечаем на CORS preflight, чтобы запрос из браузера с другого origin прошёл
  server.on("/update", HTTP_OPTIONS, []() {
    setCors();
    server.send(204);
  });

  server.on(
    "/update", HTTP_POST,
    []() {
      setCors();
      server.send(200, "text/plain", Update.hasError() ? "Update error" : "Update Success! Rebooting...");
      delay(200);
      if (!Update.hasError()) ESP.restart();
    },
    []() {
      // Имя поля формы (${fieldName}) тут не проверяется — подходит любое
      HTTPUpload& upload = server.upload();
      if (upload.status == UPLOAD_FILE_START) {
        Serial.printf("Update: %s\\n", upload.filename.c_str());
        if (!Update.begin(UPDATE_SIZE_UNKNOWN)) Update.printError(Serial);
      } else if (upload.status == UPLOAD_FILE_WRITE) {
        if (Update.write(upload.buf, upload.currentSize) != upload.currentSize) Update.printError(Serial);
      } else if (upload.status == UPLOAD_FILE_END) {
        if (Update.end(true)) {
          Serial.printf("Update Success: %u bytes\\n", upload.totalSize);
        } else {
          Update.printError(Serial);
        }
      }
    }
  );

  server.begin();
}

void loop() {
  server.handleClient();
}
`;
}

export function ArduinoOtaSnippet({ defaultFieldName }: ArduinoOtaSnippetProps) {
  const sketch = buildSketch(defaultFieldName || 'firmware');

  return (
    <Card type="container" view="raised" size="l" className="card">
      <Disclosure summary="Требования к прошивке устройства и пример скетча для Arduino IDE">
        <p className="hint">
          Загрузка по Wi-Fi выполняется прямым HTTP-запросом из браузера на устройство. Это значит, что устройство
          должно само принимать .bin файл через HTTP POST на указанный путь, а если страница приложения открыта с
          другого адреса (другого «origin»), устройство также должно отвечать заголовками CORS — иначе браузер не
          сможет прочитать ответ устройства, даже если сама прошивка прошла успешно. Готовые библиотеки вроде
          стандартного <code>HTTPUpdateServer</code> в новых версиях ядра arduino-esp32 блокируют запросы с чужого
          origin из соображений безопасности. Ниже — минимальный пример скетча, который принимает прошивку с любого
          origin и совместим с этим приложением.
        </p>
        <div className="snippet">
          <ClipboardButton
            text={sketch}
            view="outlined"
            size="s"
            className="snippet-copy"
            tooltipInitialText="Скопировать"
            tooltipSuccessText="Скопировано!"
          >
            Скопировать
          </ClipboardButton>
          <pre>
            <code>{sketch}</code>
          </pre>
        </div>
      </Disclosure>
    </Card>
  );
}
