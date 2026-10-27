// =====================================================================
//  Ficha 7 - Estufa Inteligente
//  nodejs-app/app.js  →  SIMULADOR (sensores + atuadores)
//
//  O que este programa faz:
//   - Desafio A: de 5 em 5 segundos gera leituras plausíveis de
//     temperatura, humidade e luminosidade e grava-as em
//     greenhouse/sensors na Firebase.
//   - Desafio C: fica à escuta de greenhouse/actuators. Quando a página
//     Web liga/desliga a ventoinha ou a rega, a simulação reage
//     (a ventoinha arrefece, a rega humedece).
//
//  Como correr (dentro da pasta nodejs-app):  node app.js
//  Como parar:                                Ctrl + C
//
//  Este programa NÃO serve a página Web. A página é servida à parte
//  (Uniform Server / Live Server). Os dois só comunicam pela Firebase.
// =====================================================================


// ---------------------------------------------------------------------
// 1. CARREGAR MÓDULOS (sistema de módulos CommonJS - slides Cap. 7)
// ---------------------------------------------------------------------
// No Node.js usa-se require() (CommonJS). No browser usa-se import
// (ES Modules). O "npm init -y" cria um projeto CommonJS, por isso aqui
// é require.
//
// firebase-admin é o Admin SDK, instalado com:
//   npm install firebase-admin --save
// Fica na pasta node_modules e aparece em "dependencies" no package.json.

// initializeApp: liga o programa ao projeto Firebase.
// cert: transforma o JSON da conta de serviço numa credencial.
const { initializeApp, cert } = require("firebase-admin/app");

// getDatabase: dá acesso à Realtime Database.
// ServerValue: valores especiais calculados pelo servidor Firebase
//              (usamos ServerValue.TIMESTAMP para a hora).
const { getDatabase, ServerValue } = require("firebase-admin/database");

// A chave PRIVADA da conta de serviço. Com ela, o programa entra como
// administrador e ignora as regras de segurança da base de dados.
// Por isso nunca pode ir para o Git nem para o browser (.gitignore).
const serviceAccount = require("./serviceAccountKey.json");


// ---------------------------------------------------------------------
// 2. INICIALIZAR O ADMIN SDK
// ---------------------------------------------------------------------
// databaseURL tem de ser a RAIZ da base de dados: termina em
// ".firebasedatabase.app", sem "/" nem caminhos depois.
initializeApp({
  credential: cert(serviceAccount),
  databaseURL: "https://estufa-inteligente-aaaed-default-rtdb.europe-west1.firebasedatabase.app",
});


// ---------------------------------------------------------------------
// 3. REFERÊNCIAS PARA OS NÓS DA BASE DE DADOS
// ---------------------------------------------------------------------
// A Realtime Database é uma árvore JSON. Esta é a estrutura usada
// (o "contrato" que a página Web também segue):
//
//   greenhouse
//    ├─ sensors
//    │    ├─ temperature: 24.6     (°C)
//    │    ├─ humidity: 65.2        (%)
//    │    ├─ luminosity: 18500     (lx)
//    │    └─ updatedAt: 1793...    (ms, hora do servidor)
//    └─ actuators
//         ├─ fan:        { on: false, updatedAt: ... }
//         └─ irrigation: { on: false, updatedAt: ... }
//
// No Admin SDK uma referência obtém-se com db.ref("caminho").
// (No Web SDK, na página, é ref(database, "caminho").)
const db = getDatabase();
const sensorsRef = db.ref("greenhouse/sensors");
const actuatorsRef = db.ref("greenhouse/actuators");


// ---------------------------------------------------------------------
// 4. CONSTANTES DA SIMULAÇÃO
// ---------------------------------------------------------------------

// Intervalos do Desafio A. Todas as leituras têm de ficar aqui dentro
// (Desafio C, ponto 5).
const LIMITS = {
  temperature: { min: 10, max: 45 },   // °C
  humidity:    { min: 20, max: 95 },   // %
  luminosity:  { min: 0,  max: 50000 } // lx: 0 = noite, 50 000 = sol pleno
};

// De quanto em quanto tempo se grava uma leitura (em milissegundos).
const INTERVAL_MS = 5000;

// Duração de um "dia" simulado, em ciclos. 72 ciclos x 5 s = 6 minutos.
// Um dia real (24 h) seria demasiado lento para ver numa aula.
const DAY_TICKS = 72;

// Efeito de cada atuador, por ciclo de 5 segundos.
const FAN_COOLING = 0.6;        // a ventoinha baixa a temperatura 0,6 °C
const FAN_DRYING = 0.3;         // e seca um pouco o ar (-0,3 %)
const IRRIGATION_GAIN = 1.5;    // a rega sobe a humidade 1,5 %


// ---------------------------------------------------------------------
// 5. ESTADO DA SIMULAÇÃO (fica em memória enquanto o programa corre)
// ---------------------------------------------------------------------

// Valores atuais dos sensores. Começam em valores plausíveis e cada
// nova leitura parte destes (é isto que torna as variações graduais).
const sensors = {
  temperature: 22,
  humidity: 60,
  luminosity: 0,
};

// Estado atual dos atuadores, tal como está na Firebase.
// É atualizado pelo listener do ponto 9 sempre que a página muda algo.
const actuators = {
  fan: false,
  irrigation: false,
};

// Contador de ciclos, usado para saber "que horas são" no dia simulado.
let tick = 0;


// ---------------------------------------------------------------------
// 6. FUNÇÕES AUXILIARES
// ---------------------------------------------------------------------

// Garante que um valor fica dentro de [min, max].
// Ex.: clamp(50, { min: 10, max: 45 }) → 45
//      clamp(5,  { min: 10, max: 45 }) → 10
function clamp(value, limits) {
  return Math.min(limits.max, Math.max(limits.min, value));
}

// Devolve um número aleatório entre -amplitude e +amplitude.
// Math.random() dá um valor em [0, 1[. Multiplicar por 2 e subtrair 1
// passa para [-1, 1[. Multiplicar pela amplitude dá o "ruído" desejado.
// Serve para as leituras não serem perfeitas, como num sensor real.
function noise(amplitude) {
  return (Math.random() * 2 - 1) * amplitude;
}

// Arredonda a 1 casa decimal (ex.: 24.6372 → 24.6).
function round1(value) {
  return Math.round(value * 10) / 10;
}

// Converte true/false em "ON"/"OFF" para as mensagens no terminal.
function onOff(state) {
  return state ? "ON" : "OFF";
}


// ---------------------------------------------------------------------
// 7. UM PASSO DA SIMULAÇÃO (Desafio A, ponto 2 + Desafio C, ponto 4)
// ---------------------------------------------------------------------
// Calcula as novas leituras a partir das anteriores.
// Ideia geral: cada sensor aproxima-se um bocadinho de um valor "alvo"
// em vez de saltar para ele. Assim as variações são graduais.
function step() {
  tick++;

  // --- 7.1 Luminosidade: curva do sol --------------------------------
  // Math.sin dá um valor entre -1 e 1 ao longo de um ciclo completo
  // (2 * Math.PI). Ao fim de DAY_TICKS ciclos o seno dá uma volta.
  //   - metade do ciclo é positiva  → é dia (sobe até 1 e volta a 0)
  //   - metade do ciclo é negativa  → é noite (Math.max corta para 0)
  const sun = Math.sin((2 * Math.PI * tick) / DAY_TICKS);
  const lux = Math.max(0, sun) * LIMITS.luminosity.max + noise(500);

  // Os lux são inteiros (Math.round) e nunca saem de 0..50 000.
  sensors.luminosity = Math.round(clamp(lux, LIMITS.luminosity));

  // --- 7.2 Temperatura: segue o sol, a ventoinha arrefece -------------
  // sunRatio vai de 0 (noite) a 1 (sol pleno).
  const sunRatio = sensors.luminosity / LIMITS.luminosity.max;

  // Temperatura "alvo": 15 °C de noite, até 32 °C com sol pleno.
  const targetTemp = 15 + sunRatio * 17;

  // Aproxima-se 10% da distância ao alvo em cada ciclo, mais um pouco
  // de ruído. Ex.: se está a 20 °C e o alvo é 30 °C, sobe ~1 °C.
  let temp = sensors.temperature
    + (targetTemp - sensors.temperature) * 0.1
    + noise(0.2);

  // Desafio C 4a: com a ventoinha ON a temperatura desce aos poucos.
  if (actuators.fan) {
    temp -= FAN_COOLING;
  }

  // Desafio C 5: nunca sair de 10..45 °C.
  sensors.temperature = round1(clamp(temp, LIMITS.temperature));

  // --- 7.3 Humidade: tende para 60%, a rega humedece ------------------
  // Aproxima-se 5% da distância a 60% em cada ciclo, com ruído.
  let hum = sensors.humidity
    + (60 - sensors.humidity) * 0.05
    + noise(0.5);

  // Com calor o ar fica mais seco.
  if (sensors.temperature > 28) {
    hum -= 0.4;
  }

  // Desafio C 4b: com a rega ON a humidade sobe aos poucos.
  if (actuators.irrigation) {
    hum += IRRIGATION_GAIN;
  }

  // A ventoinha renova o ar e seca-o um pouco.
  if (actuators.fan) {
    hum -= FAN_DRYING;
  }

  // Desafio C 5: nunca sair de 20..95 %.
  sensors.humidity = round1(clamp(hum, LIMITS.humidity));
}


// ---------------------------------------------------------------------
// 8. GRAVAR AS LEITURAS NA FIREBASE (Desafio A, ponto 3)
// ---------------------------------------------------------------------
// Usa-se set() e não push():
//   - push() criava um filho NOVO a cada leitura (lista, como na Ficha 6);
//   - set() SUBSTITUI o conteúdo de greenhouse/sensors. Só interessa a
//     leitura atual, e a página recebe-a com onValue.
//
// set() é NÃO BLOQUEANTE (slides Cap. 7): devolve uma Promise e o
// programa continua. O .then() corre quando a Firebase confirma a
// escrita e o .catch() se houver erro (ex.: sem Internet).
function publishSensors() {
  // Primeiro calcula as novas leituras...
  step();

  // ...depois grava-as.
  sensorsRef
    .set({
      temperature: sensors.temperature,
      humidity: sensors.humidity,
      luminosity: sensors.luminosity,
      // A Firebase substitui isto pela hora DELA, em milissegundos.
      // Evita depender do relógio deste computador.
      updatedAt: ServerValue.TIMESTAMP,
    })
    .then(() => {
      // Mostra no terminal o que foi gravado, para acompanhar a simulação.
      const time = new Date().toLocaleTimeString("pt-PT");
      console.log(
        `[${time}] T=${sensors.temperature} °C  H=${sensors.humidity} %  L=${sensors.luminosity} lx` +
        `  | fan=${onOff(actuators.fan)} irrigation=${onOff(actuators.irrigation)}`
      );
    })
    .catch((error) => {
      // Um erro numa leitura não pára o programa: tenta de novo daqui a 5 s.
      console.error("Erro ao gravar os sensores:", error.message);
    });
}


// ---------------------------------------------------------------------
// 9. FICAR À ESCUTA DOS ATUADORES (Desafio C, ponto 2)
// ---------------------------------------------------------------------
// actuatorsRef.on("value", callback) é a versão Admin SDK do onValue
// dos slides (Cap. 6). O callback corre:
//   - logo uma vez, com o estado atual;
//   - de novo, sempre que alguém (a página Web) muda greenhouse/actuators.
// É programação orientada a eventos: o Node não pergunta de X em X
// segundos, a Firebase é que avisa.
function listenActuators() {
  actuatorsRef.on(
    "value",
    (snapshot) => {
      // snapshot.val() devolve o conteúdo do nó como objeto JavaScript.
      // Se o nó não existir, devolve null; "|| {}" evita erros.
      const data = snapshot.val() || {};

      // Lê o campo "on" de cada atuador. Se faltar alguma coisa, fica false.
      actuators.fan = Boolean(data.fan && data.fan.on);
      actuators.irrigation = Boolean(data.irrigation && data.irrigation.on);

      // Não é preciso fazer mais nada: o próximo step() já usa os novos
      // valores (ponto 7), e é isso que faz os sensores reagirem.
      console.log(
        `>> Atuadores: fan=${onOff(actuators.fan)} irrigation=${onOff(actuators.irrigation)}`
      );
    },
    (error) => {
      console.error("Erro a ouvir os atuadores:", error.message);
    }
  );
}


// ---------------------------------------------------------------------
// 10. GARANTIR QUE OS ATUADORES EXISTEM NA BASE DE DADOS
// ---------------------------------------------------------------------
// Na primeira execução greenhouse/actuators ainda não existe e a página
// não teria nada para mostrar. once("value") lê o nó UMA vez:
//   - se já existir, mantém o estado (não desliga o que estava ligado);
//   - se não existir, cria os dois atuadores desligados (OFF).
// Devolve a Promise para o arranque (ponto 11) esperar por ela.
function createActuatorsIfMissing() {
  return actuatorsRef.once("value").then((snapshot) => {
    if (snapshot.exists()) {
      return; // já existem: não mexer
    }
    return actuatorsRef
      .set({
        fan: { on: false, updatedAt: ServerValue.TIMESTAMP },
        irrigation: { on: false, updatedAt: ServerValue.TIMESTAMP },
      })
      .then(() => console.log("Atuadores criados (OFF)."));
  });
}


// ---------------------------------------------------------------------
// 11. ARRANQUE DO PROGRAMA
// ---------------------------------------------------------------------
// Ordem:
//   1) criar os atuadores, se faltarem;
//   2) começar a ouvir os atuadores;
//   3) gravar uma primeira leitura logo, sem esperar 5 s;
//   4) com setInterval, gravar uma leitura nova a cada 5 s.
//
// setInterval é um "timer": o event loop chama publishSensors de
// INTERVAL_MS em INTERVAL_MS (fase Timers - slides Cap. 7).
//
// Ao contrário do teste inicial, NÃO há process.exit(): o programa
// tem de continuar a correr até carregares em Ctrl + C.
console.log("Simulador da estufa a arrancar...");

createActuatorsIfMissing()
  .then(() => {
    listenActuators();
    publishSensors();
    setInterval(publishSensors, INTERVAL_MS);
  })
  .catch((error) => {
    // Erro grave no arranque (chave errada, URL errado...): termina.
    console.error("Erro no arranque:", error.message);
    process.exit(1);
  });
