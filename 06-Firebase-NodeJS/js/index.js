import { database } from "./firebase.js";
import {
  ref,
  onChildAdded,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const container = document.getElementById("messages");
const allowedTypes = ["success", "warning", "danger", "primary"];

// 1. Referência ao nó "messages"
const messagesRef = ref(database, "messages");

// 2. Listener: corre 1x por cada filho existente e 1x por cada filho novo
onChildAdded(
  messagesRef,
  (snapshot) => {
    const msg = snapshot.val();
    const type = allowedTypes.includes(msg.type) ? msg.type : "primary";

    // 3. Criar o alerta com as classes Bootstrap
    const alert = document.createElement("div");
    alert.classList.add("alert", `alert-${type}`);
    alert.textContent = msg.text;

    // 4. Acrescentar ao contentor
    container.appendChild(alert);
  },
  (error) => {
    console.error("Erro ao ler mensagens:", error);
  }
);