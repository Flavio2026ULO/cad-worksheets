// =====================================================================
//  Ficha 7 - Estufa Inteligente
//  js/index.js  →  DASHBOARD EM TEMPO REAL (Desafios B e C)
//
//  O que este ficheiro faz:
//   - LÊ greenhouse/sensors e greenhouse/actuators com onValue e
//     atualiza os cards sempre que algo muda (sem refresh);
//   - ESCREVE em greenhouse/actuators com set() quando o utilizador
//     carrega num botão (liga/desliga a ventoinha ou a rega).
// =====================================================================


// ---------------------------------------------------------------------
// 1. IMPORTS
// ---------------------------------------------------------------------
// Funções do Web SDK (mesma versão 11.0.1 do firebase.js):
//   ref             → cria uma referência para um caminho da base de dados
//   onValue         → fica à escuta de um nó (ler - slides Cap. 6)
//   set             → grava dados num caminho (escrever - slides Cap. 6)
//   serverTimestamp → hora do servidor Firebase (igual ao
//                     ServerValue.TIMESTAMP do Node.js)
import {
  ref,
  onValue,
  set,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// A base de dados exportada pelo nosso firebase.js.
import { database } from "./firebase.js";


// ---------------------------------------------------------------------
// 2. REFERÊNCIAS PARA OS NÓS
// ---------------------------------------------------------------------
// Os caminhos têm de ser IGUAIS aos do nodejs-app/app.js. Se um disser
// "greenhouse/sensors" e o outro "greenhouse/sensor", nenhum dá erro,
// mas a página nunca recebe dados.
const sensorsRef = ref(database, "greenhouse/sensors");
const actuatorsRef = ref(database, "greenhouse/actuators");


// ---------------------------------------------------------------------
// 3. ESTADO DOS ATUADORES NA PÁGINA
// ---------------------------------------------------------------------
// Guarda o último estado recebido da Firebase.
// É preciso para o botão saber se deve LIGAR ou DESLIGAR (ponto 7).
const actuatorState = {
  fan: false,
  irrigation: false,
};


// ---------------------------------------------------------------------
// 4. FUNÇÕES AUXILIARES
// ---------------------------------------------------------------------

// Converte milissegundos (ex.: 1793129037908) numa hora legível,
// por exemplo "14:02:35". Se não houver hora, mostra "--:--".
function formatTime(ms) {
  if (!ms) {
    return "--:--";
  }
  return new Date(ms).toLocaleTimeString("pt-PT");
}

// Atalho para mudar o texto de um elemento pelo seu id.
// Usa-se textContent (e não innerHTML) porque só se mete texto:
// é mais seguro e não interpreta HTML.
function setText(id, text) {
  document.getElementById(id).textContent = text;
}


// ---------------------------------------------------------------------
// 5. SENSORES EM TEMPO REAL (Desafio B, ponto 2)
// ---------------------------------------------------------------------
// onValue(referência, callback, callbackDeErro):
//   - corre o callback logo ao abrir a página, com o valor atual;
//   - volta a correr SEMPRE que o nó muda (o Node.js grava de 5 em 5 s).
// É por isso que a página se atualiza sem refresh.
//
// Diferença para a Ficha 6: lá usava-se onChildAdded (uma vez por cada
// mensagem nova numa lista). Aqui o nó é substituído com set(), por
// isso interessa o valor inteiro: onValue.
onValue(
  sensorsRef,
  (snapshot) => {
    // snapshot.val() → { temperature, humidity, luminosity, updatedAt }
    const data = snapshot.val();

    // Se o Node.js ainda não gravou nada, o nó não existe (null).
    // Os cards ficam com "--" até chegar a primeira leitura.
    if (!data) {
      return;
    }

    // toFixed(1) mostra sempre 1 casa decimal (ex.: 25 → "25.0").
    setText("temperature-value", `${data.temperature.toFixed(1)} °C`);
    setText("humidity-value", `${data.humidity.toFixed(1)} %`);

    // toLocaleString("en-US") põe separador de milhares: 18500 → "18,500",
    // como na Figura 2 da ficha.
    setText("luminosity-value", `${data.luminosity.toLocaleString("en-US")} lux`);

    // As três leituras foram feitas ao mesmo tempo, por isso têm a
    // mesma hora (Desafio B: "hora da última atualização").
    const time = `Reading at ${formatTime(data.updatedAt)}`;
    setText("temperature-time", time);
    setText("humidity-time", time);
    setText("luminosity-time", time);
  },
  (error) => {
    // Corre se a leitura falhar, por exemplo se as regras da base de
    // dados não deixarem ler (permission_denied).
    console.error("Erro a ler os sensores:", error);
    setText("temperature-time", "Error reading data");
  }
);


// ---------------------------------------------------------------------
// 6. ATUADORES EM TEMPO REAL (Desafio B ponto 3 + Desafio C ponto 3)
// ---------------------------------------------------------------------

// Atualiza a linha de UM atuador na página.
//   name → "fan" ou "irrigation" (é também o início dos ids no HTML)
//   data → o objeto { on, updatedAt } vindo da Firebase
function renderActuator(name, data) {
  // Se faltar o atuador ou o campo "on", considera-se OFF.
  const on = Boolean(data && data.on);

  // Guarda o estado para o botão saber o que fazer (ponto 7).
  actuatorState[name] = on;

  // --- Badge ON/OFF -----------------------------------------------------
  // classList (slides de JavaScript) junta/tira classes do Bootstrap:
  //   text-bg-success   → verde (ON)
  //   text-bg-secondary → cinzento (OFF)
  // O segundo argumento de toggle() diz se a classe fica (true) ou sai (false).
  const badge = document.getElementById(`${name}-badge`);
  badge.textContent = on ? "ON" : "OFF";
  badge.classList.toggle("text-bg-success", on);
  badge.classList.toggle("text-bg-secondary", !on);

  // --- Botão ------------------------------------------------------------
  // O texto diz o que o botão VAI fazer: se está ON, oferece desligar.
  const button = document.getElementById(`${name}-btn`);
  button.textContent = on ? "Turn off" : "Turn on";

  // O botão começa desativado no HTML (ainda não se sabe o estado).
  // Quando chegam dados, ativa-se.
  button.disabled = false;

  // --- Hora da última mudança -------------------------------------------
  setText(`${name}-time`, `State at ${formatTime(data && data.updatedAt)}`);
}

// Um único listener para os dois atuadores: sempre que qualquer um muda
// (por esta página, por outro separador ou por outro computador),
// a Firebase envia o nó actuators inteiro e redesenha-se tudo.
onValue(
  actuatorsRef,
  (snapshot) => {
    // { fan: {on, updatedAt}, irrigation: {on, updatedAt} } ou null
    const data = snapshot.val() || {};
    renderActuator("fan", data.fan);
    renderActuator("irrigation", data.irrigation);
  },
  (error) => {
    console.error("Erro a ler os atuadores:", error);
  }
);


// ---------------------------------------------------------------------
// 7. LIGAR / DESLIGAR UM ATUADOR (Desafio C, ponto 1)
// ---------------------------------------------------------------------
// Grava na Firebase o estado CONTRÁRIO do atual:
//   a. se está OFF (false) → grava ON (true)
//   b. se está ON  (true)  → grava OFF (false)
//
// Repara que esta função NÃO muda o badge nem o texto do botão.
// Só escreve na Firebase. A Firebase avisa todos os clientes, o
// onValue do ponto 6 corre e é ELE que atualiza a página.
// Vantagens:
//   - a página mostra sempre o que está realmente guardado;
//   - todos os separadores abertos ficam iguais;
//   - o Node.js recebe o mesmo aviso e muda a simulação.
function toggleActuator(name) {
  const button = document.getElementById(`${name}-btn`);

  // Desativa o botão até a Firebase responder, para evitar dois
  // cliques seguidos (que ligavam e desligavam logo a seguir).
  // Volta a ficar ativo no renderActuator.
  button.disabled = true;

  // set(ref(database, caminho), objeto) - igual ao exemplo dos slides.
  // Caminho: greenhouse/actuators/fan ou greenhouse/actuators/irrigation
  set(ref(database, `greenhouse/actuators/${name}`), {
    on: !actuatorState[name],     // "!" inverte: true ↔ false
    updatedAt: serverTimestamp(), // hora do servidor Firebase
  }).catch((error) => {
    // Se a escrita falhar (ex.: regras sem permissão de escrita),
    // o estado não muda; reativa-se o botão para poder tentar outra vez.
    console.error(`Erro ao alterar ${name}:`, error);
    button.disabled = false;
  });
}


// ---------------------------------------------------------------------
// 8. LIGAR OS BOTÕES AOS EVENTOS (addEventListener - slides de JavaScript)
// ---------------------------------------------------------------------
// Quando o utilizador clica num botão, chama toggleActuator com o
// nome do atuador correspondente.
document.getElementById("fan-btn").addEventListener("click", () => {
  toggleActuator("fan");
});

document.getElementById("irrigation-btn").addEventListener("click", () => {
  toggleActuator("irrigation");
});
