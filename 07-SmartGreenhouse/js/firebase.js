// =====================================================================
//  Ficha 7 - Estufa Inteligente
//  js/firebase.js  →  LIGAÇÃO DA PÁGINA WEB À FIREBASE (Web SDK)
//
//  Este ficheiro só faz uma coisa: ligar-se ao projeto Firebase e
//  EXPORTAR a base de dados, para o js/index.js a poder importar.
//  (Configuração da ligação em JavaScript - slides Cap. 6)
// =====================================================================


// ---------------------------------------------------------------------
// 1. IMPORTS (ES Modules - no browser usa-se import, não require)
// ---------------------------------------------------------------------
// Os ficheiros vêm diretamente do CDN da Google (gstatic.com), por isso
// não é preciso npm na página.
// Regra da ficha: a MESMA versão (11.0.1) em todos os imports.
// Atenção: getDatabase vem de firebase-database.js, não de firebase-app.js.
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";


// ---------------------------------------------------------------------
// 2. CONFIGURAÇÃO DO PROJETO
// ---------------------------------------------------------------------
// Copiado da consola: Definições do projeto → Geral → As tuas apps.
// Estes valores IDENTIFICAM o projeto; não são uma password. São
// públicos (vão sempre para o browser). Quem protege os dados são as
// regras da Realtime Database.
// NÃO confundir com o serviceAccountKey.json, que é privado e só o
// Node.js usa.
//
// databaseURL é obrigatório: diz ao SDK em que base de dados ler e
// escrever. Tem de ser igual ao do nodejs-app/app.js.
const firebaseConfig = {
  apiKey: "AIzaSyDKcAUql5WIb2ERk9AKOZwGZp5PlekLc7g",
  authDomain: "estufa-inteligente-aaaed.firebaseapp.com",
  databaseURL: "https://estufa-inteligente-aaaed-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "estufa-inteligente-aaaed",
  storageBucket: "estufa-inteligente-aaaed.firebasestorage.app",
  messagingSenderId: "795186959169",
  appId: "1:795186959169:web:6fdb4e845eb4371aa2c7c0",
};


// ---------------------------------------------------------------------
// 3. INICIALIZAR E EXPORTAR
// ---------------------------------------------------------------------
// initializeApp cria a ligação ao projeto com a configuração acima.
const app = initializeApp(firebaseConfig);

// getDatabase(app) devolve o objeto da Realtime Database.
// "export" deixa-o disponível para outros módulos:
//   import { database } from "./firebase.js";
export const database = getDatabase(app);
