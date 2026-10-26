const { initializeApp, cert } = require("firebase-admin/app");
const { getDatabase } = require("firebase-admin/database");
const serviceAccount = require("./serviceAccountKey.json");

initializeApp({
  credential: cert(serviceAccount),
  databaseURL: "https://cad-2022109866-default-rtdb.europe-west1.firebasedatabase.app",
});

const messagesRef = getDatabase().ref("messages");

// 1. Array de frases
const sentences = [
  "A new request was received.",
  "The server is running normally.",
  "Disk usage is above 80%.",
  "A user has logged in.",
  "Backup completed successfully.",
  "Connection to the sensor was lost.",
];

// 2. Array de tipos
const types = ["success", "warning", "danger", "primary"];

// Escolhe um elemento aleatório de um array
function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// 3. Função que gera e envia uma mensagem
async function sendRandomMessage() {
  const message = {
    text: randomItem(sentences),
    type: randomItem(types),
  };

  try {
    const ref = await messagesRef.push(message);
    console.log(`[${ref.key}] ${message.type}: ${message.text}`);
  } catch (err) {
    console.error("Erro ao escrever:", err);
  }
}

// 4. Executar de 5 em 5 segundos
sendRandomMessage();
setInterval(sendRandomMessage, 5000);