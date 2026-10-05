/*
 * ============================================================
 *  Home Sweet Home - Dashboard
 *  Ficha 3 - JavaScript, Exercício 2
 * ============================================================
 *
 * Wrapper pedido na alínea 1c da ficha.
 * - É uma função anónima que se executa imediatamente: o "()"
 *   no fim chama a função assim que é definida.
 * - Tudo o que é declarado cá dentro fica "fechado" nesta função
 *   e não polui o espaço global da página (slide 14: as variáveis
 *   "var" pertencem à função onde são declaradas).
 */
var app = (function () {

  /*
   * 'use strict' ativa o "modo estrito" do JavaScript.
   * O browser passa a ser mais exigente e dá erro em situações
   * que normalmente deixaria passar em silêncio (por exemplo,
   * usar uma variável que nunca foi declarada).
   */
  'use strict';


  /* ============================================================
   *  FUNÇÕES AUXILIARES
   * ============================================================ */

  /*
   * twoDigits(n)
   * Recebe um número e devolve-o como texto com 2 dígitos.
   *   twoDigits(8)  -> "08"
   *   twoDigits(15) -> "15"
   * Serve para o relógio mostrar 09:05:03 em vez de 9:5:3.
   */
  function twoDigits(n) {
    // Se o número tem só um algarismo (0 a 9)...
    if (n < 10) {
      // ...juntamos um "0" à frente. Como '0' é uma string,
      // o operador + faz concatenação em vez de soma.
      return '0' + n;
    }
    // Caso contrário devolvemos o próprio número como string.
    // '' + n converte o número para texto (string vazia + número).
    return '' + n;
  }

  /*
   * randomTemperature()
   * Devolve uma temperatura aleatória entre 10.0 e 30.0 °C,
   * com uma casa decimal (alínea 2e).
   *
   * Como funciona, passo a passo:
   *   1) Math.random()        -> número entre 0 (incl.) e 1 (excl.)
   *   2) * 201                -> número entre 0 e 200.999...
   *   3) Math.floor(...)      -> arredonda para baixo: inteiro de 0 a 200
   *   4) + 100                -> inteiro de 100 a 300
   *   5) / 10                 -> 10.0 a 30.0, com uma casa decimal
   *
   * Gerar primeiro um inteiro e só depois dividir por 10 evita
   * valores "estranhos" como 19.200000000000003, que aparecem
   * por causa do formato IEEE 754 dos números (slide 9).
   */
  function randomTemperature() {
    return (Math.floor(Math.random() * 201) + 100) / 10;
  }


  /* ============================================================
   *  ALÍNEAS 2c e 2d - TOGGLES (luzes e música)
   * ============================================================ */

  /*
   * createToggleHandler(...)
   * Exemplo de CLOSURE (slide 25): uma função que devolve outra
   * função. A função devolvida "lembra-se" dos parâmetros
   * (iconId, iconOn, ...) mesmo depois de createToggleHandler
   * ter terminado.
   *
   * Assim escrevemos a lógica do toggle UMA vez e reutilizamo-la
   * para as 4 situações (3 luzes + música), mudando só os
   * parâmetros.
   *
   * Parâmetros:
   *   iconId   -> id do elemento <i> do ícone a alterar
   *   iconOn   -> classe do ícone quando está LIGADO
   *   iconOff  -> classe do ícone quando está DESLIGADO
   *   colorOn  -> classe de cor quando está LIGADO
   *   colorOff -> classe de cor quando está DESLIGADO
   */
  function createToggleHandler(iconId, iconOn, iconOff, colorOn, colorOff) {

    // Esta é a função que vai ser executada a cada clique.
    return function () {

      // Vamos buscar o elemento do ícone pelo id (slide 28)
      // e guardamos a sua lista de classes (slide 37).
      var iconClasses = document.getElementById(iconId).classList;

      // contains() diz-nos se o ícone tem a classe "ligado".
      // É assim que sabemos em que estado o dispositivo está.
      if (iconClasses.contains(iconOn)) {
        // ---- Estava LIGADO -> vamos DESLIGAR ----
        iconClasses.remove(iconOn);    // tira o ícone "ligado"
        iconClasses.remove(colorOn);   // tira a cor "ligado"
        iconClasses.add(iconOff);      // põe o ícone "desligado"
        iconClasses.add(colorOff);     // põe a cor "desligado"
      } else {
        // ---- Estava DESLIGADO -> vamos LIGAR ----
        iconClasses.remove(iconOff);   // tira o ícone "desligado"
        iconClasses.remove(colorOff);  // tira a cor "desligado"
        iconClasses.add(iconOn);       // põe o ícone "ligado"
        iconClasses.add(colorOn);      // põe a cor "ligado"
      }
    };
  }

  /*
   * Registar os eventos de clique (slide 30).
   *
   * addEventListener('click', função) diz ao browser:
   * "sempre que este elemento for clicado, executa esta função".
   *
   * O switch do Bootstrap já muda sozinho entre on/off (alínea 2c).
   * O nosso código trata apenas de atualizar o ícone e a cor (2d).
   */

  /*
   * LUZES
   * No Font Awesome, a lâmpada acesa e a apagada são o mesmo
   * ícone (fa-lightbulb) com estilos diferentes:
   *   fa-solid   -> lâmpada cheia    (ligada)
   *   fa-regular -> lâmpada contorno (desligada)
   * Por isso trocamos o estilo, não o nome do ícone.
   * Cores: amarelo (text-warning) ligada, cinzento (text-secondary) desligada.
   */
  document.getElementById('kitchen-lights-toggle').addEventListener('click',
    createToggleHandler('kitchen-lights-icon', 'fa-solid', 'fa-regular', 'text-warning', 'text-secondary'));

  document.getElementById('living-ceiling-lights-toggle').addEventListener('click',
    createToggleHandler('living-ceiling-lights-icon', 'fa-solid', 'fa-regular', 'text-warning', 'text-secondary'));

  document.getElementById('living-ambient-lights-toggle').addEventListener('click',
    createToggleHandler('living-ambient-lights-icon', 'fa-solid', 'fa-regular', 'text-warning', 'text-secondary'));

  /*
   * MÚSICA
   * Aqui trocamos mesmo de ícone:
   *   fa-volume-high  -> coluna com som  (ligada)
   *   fa-volume-xmark -> coluna com "X"  (desligada)
   * Cores: azul (text-primary) ligada, vermelho (text-danger) desligada.
   */
  document.getElementById('living-music-toggle').addEventListener('click',
    createToggleHandler('living-music-icon', 'fa-volume-high', 'fa-volume-xmark', 'text-primary', 'text-danger'));


  /* ============================================================
   *  ALÍNEA 2e - TEMPERATURAS (a cada 5 segundos)
   * ============================================================ */

  /*
   * updateTemperatures()
   * Gera uma temperatura nova para cada divisão e escreve-a
   * na página.
   *
   * textContent (NÃO está nos slides) substitui o texto que
   * está dentro do elemento. Ex.: <span>21.6 °C</span> passa
   * a <span>17.3 °C</span>.
   */
  function updateTemperatures() {
    document.getElementById('kitchen-temperature').textContent = randomTemperature() + ' °C';
    document.getElementById('living-temperature').textContent = randomTemperature() + ' °C';
  }

  // Chamamos a função logo uma vez, para a página não mostrar
  // os valores antigos do HTML durante os primeiros 5 segundos.
  updateTemperatures();

  // setInterval (slide 32) chama updateTemperatures a cada
  // 5000 milissegundos = 5 segundos, para sempre.
  // Repara que passamos o NOME da função, sem (): quem a chama
  // é o browser, no momento certo.
  setInterval(updateTemperatures, 5000);


  /* ============================================================
   *  ALÍNEA 2f - DATA E HORA
   * ============================================================ */

  /*
   * updateDate()
   * Escreve a data atual no formato AAAA-MM-DD (ex.: 2026-09-29).
   *
   * new Date() cria um objeto com a data e hora deste momento.
   * Os métodos get...() (NÃO estão nos slides) tiram cada parte:
   *   getFullYear() -> ano com 4 dígitos (2026)
   *   getMonth()    -> mês de 0 a 11 (ATENÇÃO: janeiro = 0!)
   *   getDate()     -> dia do mês, de 1 a 31
   */
  function updateDate() {
    var now = new Date();
    document.getElementById('clock-date').textContent =
      now.getFullYear() + '-' +
      twoDigits(now.getMonth() + 1) + '-' +   // +1 porque os meses começam em 0
      twoDigits(now.getDate());
  }

  /*
   * updateTime()
   * Escreve a hora atual no formato HH:MM:SS (ex.: 18:47:55).
   *   getHours()   -> 0 a 23
   *   getMinutes() -> 0 a 59
   *   getSeconds() -> 0 a 59
   * Criamos um new Date() a cada chamada para ler sempre a hora
   * atual, e não a hora de quando a página abriu.
   */
  function updateTime() {
    var now = new Date();
    document.getElementById('clock-time').textContent =
      twoDigits(now.getHours()) + ':' +
      twoDigits(now.getMinutes()) + ':' +
      twoDigits(now.getSeconds());
  }

  // A ficha pede a data "quando a página é carregada":
  // basta chamar a função uma vez.
  updateDate();

  // Mostrar a hora logo ao abrir, sem esperar 1 segundo.
  updateTime();

  // Depois atualizar a hora a cada 1000 ms = 1 segundo.
  setInterval(updateTime, 1000);

})(); // <- estes () executam a função imediatamente