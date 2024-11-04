#include <WiFi.h>
#include <HTTPClient.h>
#include <Arduino_JSON.h>

// Pines del sensor de ultrasonido
const int EchoPin = 4;   // GPIO4 para el Echo
const int TriggerPin = 16; // GPIO16 para el Trigger

// Pines de control para los motores
const int input1 = 33, input2 = 25, input3 = 26, input4 = 27;
const int enableA = 14, enableB = 12;

// Variables de control
const int distanciaDeteccion = 30;  // Distancia límite de detección en cm
const char* ssid = "LaCabeZona";       
const char* password = "holitademarr"; 
const String serverURL = "http://44.220.130.31:5000/iot/ultimo";  // URL del servidor para el historial

// Variable para almacenar la última acción ejecutada
String ultimaAccion = "";

void setup() {
  Serial.begin(9600);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Conectando a WiFi...");
  }
  Serial.println("Conectado a WiFi");
  Serial.println(WiFi.localIP());

  // Configurar pines de los motores y sensor
  pinMode(TriggerPin, OUTPUT); pinMode(EchoPin, INPUT);
  pinMode(enableA, OUTPUT); pinMode(enableB, OUTPUT);
  pinMode(input1, OUTPUT); pinMode(input2, OUTPUT);
  pinMode(input3, OUTPUT); pinMode(input4, OUTPUT);

  pararMotores();
}

void loop() {
  obtenerUltimoMovimiento();
  ejecutarAccion(ultimaAccion);

  // Detener por un intervalo antes de volver a consultar
  delay(5000); // Consulta cada 5 segundos, ajustar si es necesario
}

void obtenerUltimoMovimiento() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverURL);
    int httpResponseCode = http.GET();

    if (httpResponseCode == 200) {
      String payload = http.getString();
      JSONVar data = JSON.parse(payload);

      if (JSON.typeof(data) == "array" && data.length() > 0) {
        // Tomar el último registro
        ultimaAccion = (const char*)data[data.length() - 1]["name"];
        Serial.println("Última acción obtenida: " + ultimaAccion);
      } else {
        Serial.println("No se recibió un arreglo válido de datos");
      }
    } else {
      Serial.print("Error en la solicitud HTTP: ");
      Serial.println(httpResponseCode);
    }
    http.end();
  } else {
    Serial.println("Error de conexión WiFi");
  }
}

void ejecutarAccion(String accion) {
  if (accion == "Arriba") {
    avanzar(255);
  } else if (accion == "Abajo") {
    retroceder(255);
  } else if (accion == "Izquierda") {
    girarIzquierda();
  } else if (accion == "Derecha") {
    girarDerecha();
  } else if (accion == "Girar 90° Izquierda") {
    girar90Izquierda();
  } else if (accion == "Girar 90° Derecha") {
    girar90Derecha();
  } else if (accion == "Girar 180°") {
    girar180();
  } else if (accion == "Girar 360°") {
    girar360();
  } else if (accion == "STOP") {
    pararMotores();
  }
}

// Funciones de movimiento
void avanzar(int velocidad) {
  Serial.println("Avanzando...");
  moverMotores(LOW, HIGH, LOW, HIGH, velocidad, velocidad);
}

void retroceder(int velocidad) {
  Serial.println("Retrocediendo...");
  moverMotores(HIGH, LOW, HIGH, LOW, velocidad, velocidad);
}

void girarIzquierda() {
  Serial.println("Girando a la izquierda...");
  moverMotores(LOW, HIGH, HIGH, LOW, 150, 150);
}

void girarDerecha() {
  Serial.println("Girando a la derecha...");
  moverMotores(HIGH, LOW, LOW, HIGH, 150, 150);
}

void girar90Izquierda() {
  girarIzquierda();
  delay(500);  // Ajusta el tiempo para girar 90°
  pararMotores();
}

void girar90Derecha() {
  girarDerecha();
  delay(500);  // Ajusta el tiempo para girar 90°
  pararMotores();
}

void girar180() {
  girarDerecha();
  delay(1000);  // Ajusta el tiempo para girar 180°
  pararMotores();
}

void girar360() {
  girarDerecha();
  delay(2000);  // Ajusta el tiempo para girar 360°
  pararMotores();
}

void pararMotores() {
  Serial.println("Deteniendo...");
  moverMotores(LOW, LOW, LOW, LOW, 0, 0);
}

void moverMotores(int in1, int in2, int in3, int in4, int velA, int velB) {
  digitalWrite(input1, in1); digitalWrite(input2, in2);
  digitalWrite(input3, in3); digitalWrite(input4, in4);
  analogWrite(enableA, velA); analogWrite(enableB, velB);
}
