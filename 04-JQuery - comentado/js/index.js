/*
 * ====================================================================
 *  HOME SWEET HOME - DASHBOARD
 *  Ficha 3 (JavaScript) + Ficha 4 (jQuery)
 * ====================================================================
 *
 *  O QUE ESTE FICHEIRO FAZ:
 *   1. Liga/desliga o ícone das luzes e da música quando se carrega
 *      nos interruptores (switches).
 *   2. Gera temperaturas aleatórias para a cozinha e para a sala,
 *      de 5 em 5 segundos.
 *   3. Mostra a data e a hora atuais (a hora atualiza a cada segundo).
 *   4. Vai buscar o tempo (meteorologia) à API do OpenWeatherMap e
 *      mostra há quanto tempo os dados foram obtidos.
 *
 *  ONDE É CARREGADO:
 *   No fim do index.html, DEPOIS do jQuery:
 *     <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
 *     <script src="js/index.js"></script>
 *   Tem de ser por esta ordem porque este ficheiro usa o "$", que é
 *   criado pelo jQuery. Se o jQuery viesse depois, o browser dava o
 *   erro "$ is not defined".
 *
 *  ABREVIATURAS NOS COMENTÁRIOS:
 *   "Cap 3 slide X" -> slides de JavaScript
 *   "Cap 4 slide X" -> slides de jQuery
 * ====================================================================
 */


/*
 * --------------------------------------------------------------------
 *  $(function () { ... });
 * --------------------------------------------------------------------
 *  É o atalho de $(document).ready(function () { ... }) (Cap 4 slides 6 e 7).
 *
 *  Peça a peça:
 *   - "$"            -> a função principal do jQuery (Cap 4 slide 4).
 *                       "$" é só um nome mais curto para "jQuery".
 *   - function () {} -> uma função anónima (sem nome) com todo o código.
 *   - $( função )    -> quando passamos uma FUNÇÃO ao $, o jQuery
 *                       guarda-a e executa-a quando o HTML da página
 *                       estiver todo carregado (o "DOM pronto").
 *
 *  Porque é útil:
 *   1. Garante que os elementos (#kitchen-temperature, #weather-get, ...)
 *      já existem quando o código os tenta encontrar.
 *   2. Tudo o que é declarado cá dentro (variáveis e funções) fica
 *      "fechado" dentro desta função e não fica visível no resto da
 *      página (Cap 3 slide 14: "var" pertence à função onde é declarada).
 *      Assim não há conflitos com outros scripts.
 *
 *  A função fecha mesmo no fim do ficheiro, com "});".
 */
$(function () {

  /*
   * 'use strict' ativa o "modo estrito" do JavaScript.
   * O browser fica mais exigente e dá erro em situações que normalmente
   * deixaria passar em silêncio. Exemplo: usar uma variável que nunca
   * foi declarada com var/let/const. Ajuda a apanhar erros de escrita
   * (ex.: escrever "lastFech" em vez de "lastFetch").
   * Só se aplica ao código dentro desta função.
   */
  'use strict';


  /* ==================================================================
   *  1. FUNÇÕES AUXILIARES
   *  Pequenas funções usadas noutras partes do código.
   * ================================================================== */

  /*
   * twoDigits(n)
   * ------------
   * Recebe um número e devolve-o como TEXTO com 2 algarismos.
   *   twoDigits(8)  -> "08"
   *   twoDigits(15) -> "15"
   * É usada no relógio (09:05:03 em vez de 9:5:3), na data
   * (2026-10-05 em vez de 2026-10-5) e nas horas do sol (7h05).
   */
  function twoDigits(n){
    // Se o número tem só um algarismo (0 a 9)...
    if (n <10) {
      // ...junta um "0" à frente.
      // Como '0' é texto (string), o "+" junta (concatena) em vez de somar:
      // '0' + 8 -> "08"   (e não 8)
      return '0' + n;
    }
    // Se tem 2 algarismos, devolve-o tal como está, mas em texto.
    // '' + n -> texto vazio + número = o número convertido em texto.
    // Assim a função devolve SEMPRE texto, seja qual for o caso.
    return '' + n;
  }

  /*
   * randomTemperature()
   * -------------------
   * Devolve uma temperatura aleatória entre 10.0 e 30.0 °C,
   * com uma casa decimal.
   *
   * Passo a passo (Cap 3 slide 28: Math.random e Math.floor):
   *   1) Math.random()          -> número aleatório entre 0 e 0.999...
   *   2) * 201                  -> entre 0 e 200.999...
   *   3) Math.floor(...)        -> arredonda PARA BAIXO: inteiro de 0 a 200
   *   4) + 100                  -> inteiro de 100 a 300
   *   5) / 10                   -> 10.0 a 30.0
   *
   * Exemplo: Math.random() = 0.5 -> 100.5 -> 100 -> 200 -> 20.0
   *
   * Porque não fazer logo Math.random() * 20 + 10?
   * Daria números como 19.374829..., com muitas casas decimais.
   * Gerar primeiro um INTEIRO e só no fim dividir por 10 garante
   * exatamente uma casa decimal.
   */
  function randomTemperature() {
    return (Math.floor(Math.random() * 201) + 100) / 10;
  }


  /* ==================================================================
   *  2. INTERRUPTORES (luzes e música)
   *  Quando se carrega num switch, o ícone ao lado muda de aspeto
   *  e de cor (ligado / desligado).
   * ================================================================== */

  /*
   * createToggleHandler(iconId, iconOn, iconOff, colorOn, colorOff)
   * ---------------------------------------------------------------
   * É uma função que CRIA e DEVOLVE outra função.
   * A função devolvida é a que vai correr a cada clique.
   *
   * Isto chama-se CLOSURE (Cap 3 slide 25): a função de dentro
   * "lembra-se" dos parâmetros (iconId, iconOn, ...) mesmo depois de
   * createToggleHandler já ter terminado.
   *
   * Vantagem: a lógica do interruptor está escrita UMA só vez e é
   * reutilizada nos 4 interruptores, mudando só os parâmetros.
   *
   * Parâmetros:
   *   iconId   -> id do ícone <i> a alterar        (ex.: 'kitchen-lights-icon')
   *   iconOn   -> classe do ícone quando LIGADO    (ex.: 'fa-solid')
   *   iconOff  -> classe do ícone quando DESLIGADO (ex.: 'fa-regular')
   *   colorOn  -> classe da cor quando LIGADO      (ex.: 'text-warning' = amarelo)
   *   colorOff -> classe da cor quando DESLIGADO   (ex.: 'text-secondary' = cinzento)
   */
  function createToggleHandler(iconId, iconOn, iconOff, colorOn, colorOff) {

    // Esta é a função devolvida. É ela que o jQuery executa a cada clique.
    return function () {

      /*
       * Seleciona o ícone pelo id (Cap 4 slide 10).
       * '#' + iconId junta o "#" ao id, ex.: '#kitchen-lights-icon'.
       * No jQuery (tal como no CSS), "#" quer dizer "procura por id".
       *
       * O resultado é guardado numa variável para não ter de procurar
       * o elemento várias vezes (Cap 4 slide 10: "guarde numa variável
       * qualquer seleção de que possa voltar a precisar").
       *
       * O "$" no início do nome ($icon) não faz nada de especial: é só
       * uma convenção para lembrar que é um objeto jQuery e não um
       * elemento DOM normal (Cap 4 slides 19 e 32).
       */
      var $icon = $('#' + iconId);

      /*
       * .hasClass(classe) devolve true se o elemento tiver essa classe,
       * false se não tiver (Cap 4 slide 17).
       * É assim que sabemos em que estado está o dispositivo:
       * se o ícone tem a classe "ligado", então está ligado.
       */
      if ($icon.hasClass(iconOn)) {

        /*
         * ESTAVA LIGADO -> DESLIGAR
         *
         * .removeClass(...) tira classes; .addClass(...) põe classes
         * (Cap 4 slide 17).
         *
         * iconOn + ' ' + colorOn junta as duas classes num texto
         * separado por espaço, ex.: 'fa-solid text-warning'.
         * O jQuery aceita várias classes de uma vez, separadas por espaços.
         *
         * Os dois métodos estão ENCADEADOS (chaining, Cap 4 slide 12):
         * .removeClass() devolve o próprio $icon, por isso podemos
         * chamar .addClass() logo a seguir, na mesma linha.
         *
         * Exemplo nas luzes:
         *   antes:  fa-solid   fa-lightbulb text-warning    (lâmpada cheia, amarela)
         *   depois: fa-regular fa-lightbulb text-secondary  (lâmpada contorno, cinzenta)
         */
        $icon.removeClass(iconOn + ' ' + colorOn).addClass(iconOff + ' ' + colorOff);

      } else {

        /*
         * ESTAVA DESLIGADO -> LIGAR
         * O mesmo que em cima, mas ao contrário: tira as classes de
         * "desligado" e põe as de "ligado".
         */
        $icon.removeClass(iconOff + ' ' + colorOff).addClass(iconOn + ' ' + colorOn);
      }
    };
  }

  /*
   * REGISTAR OS EVENTOS DE CLIQUE
   * -----------------------------
   * $('#id').on('click', função) diz ao browser:
   * "sempre que este elemento for clicado, executa esta função"
   * (Cap 4 slide 25).
   *
   * Repara: createToggleHandler(...) É CHAMADA aqui (tem parênteses),
   * e o que ela DEVOLVE (a função de dentro) é que fica registada
   * como resposta ao clique.
   *
   * O switch do Bootstrap muda sozinho entre ligado/desligado.
   * Este código só trata do ícone e da cor ao lado.
   */

  /*
   * LUZES
   * No Font Awesome a lâmpada acesa e a apagada são o MESMO ícone
   * (fa-lightbulb) com estilos diferentes:
   *   fa-solid   -> desenho cheio     (ligada)
   *   fa-regular -> só o contorno     (desligada)
   * Por isso troca-se o estilo e não o nome do ícone.
   * Cores do Bootstrap: text-warning = amarelo, text-secondary = cinzento.
   */

  // Luz da cozinha
  $('#kitchen-lights-toggle').on('click',
    createToggleHandler('kitchen-lights-icon', 'fa-solid', 'fa-regular', 'text-warning', 'text-secondary'));

  // Luz do teto da sala
  $('#living-ceiling-lights-toggle').on('click',
    createToggleHandler('living-ceiling-lights-icon', 'fa-solid', 'fa-regular', 'text-warning', 'text-secondary'));

  // Luz ambiente da sala
  $('#living-ambient-lights-toggle').on('click',
    createToggleHandler('living-ambient-lights-icon', 'fa-solid', 'fa-regular', 'text-warning', 'text-secondary'));

  /*
   * MÚSICA
   * Aqui troca-se mesmo de ícone:
   *   fa-volume-high  -> coluna com som   (ligada)
   *   fa-volume-xmark -> coluna com um X  (desligada)
   * Cores: text-primary = azul, text-danger = vermelho.
   */
  $('#living-music-toggle').on('click',
    createToggleHandler('living-music-icon', 'fa-volume-high', 'fa-volume-xmark', 'text-primary', 'text-danger'));


  /* ==================================================================
   *  3. TEMPERATURAS DA CASA (simuladas, de 5 em 5 segundos)
   * ================================================================== */

  /*
   * updateTemperatures()
   * --------------------
   * Gera uma temperatura nova para a cozinha e outra para a sala
   * e escreve-as na página.
   */
  function updateTemperatures() {

    /*
     * $('#kitchen-temperature') seleciona o <span id="kitchen-temperature">.
     * .text(valor) substitui o texto que está dentro do elemento
     * (Cap 4 slides 12 e 13).
     *   - Com argumento  -> ESCREVE (setter): .text('20.1 °C')
     *   - Sem argumento  -> LÊ (getter):      .text()
     *
     * randomTemperature() + ' °C' junta o número com a unidade,
     * ex.: 20.1 + ' °C' -> "20.1 °C"
     */
    $('#kitchen-temperature').text(randomTemperature() + ' °C');
    $('#living-temperature').text(randomTemperature() + ' °C');
  }

  // Chama a função logo uma vez ao abrir a página, para não aparecerem
  // os valores fixos do HTML (21.6 e 22.6) durante os primeiros 5 segundos.
  updateTemperatures();

  /*
   * setInterval(função, milissegundos) executa a função repetidamente,
   * a cada X milissegundos, para sempre (Cap 3 slide 32).
   * 5000 ms = 5 segundos.
   *
   * ATENÇÃO: passa-se o NOME da função, SEM parênteses.
   *   setInterval(updateTemperatures, 5000)    -> certo: o browser chama-a
   *   setInterval(updateTemperatures(), 5000)  -> errado: chamava-a uma vez
   *                                               agora e passava o resultado
   */
  setInterval(updateTemperatures, 5000);


  /* ==================================================================
   *  4. RELÓGIO (data e hora)
   * ================================================================== */

  /*
   * updateDate()
   * ------------
   * Escreve a data atual no formato AAAA-MM-DD (ex.: 2026-10-05).
   */
  function updateDate() {

    /*
     * new Date() cria um objeto Date com a data e hora DESTE momento
     * (o tipo Date aparece no Cap 3 slide 8).
     * Os métodos get...() tiram cada parte:
     *   getFullYear() -> ano com 4 algarismos (2026)
     *   getMonth()    -> mês de 0 a 11  (ATENÇÃO: janeiro = 0, dezembro = 11!)
     *   getDate()     -> dia do mês, de 1 a 31
     */
    var now = new Date();

    // Junta as partes com "-" e escreve no <span id="clock-date">.
    $('#clock-date').text(
      now.getFullYear() + '-' +
      twoDigits(now.getMonth() + 1) + '-' +   // +1 porque os meses começam em 0
      twoDigits(now.getDate())
    );
  }

  /*
   * updateTime()
   * ------------
   * Escreve a hora atual no formato HH:MM:SS (ex.: 18:47:05).
   *   getHours()   -> 0 a 23
   *   getMinutes() -> 0 a 59
   *   getSeconds() -> 0 a 59
   * Cria um new Date() em CADA chamada para ler sempre a hora atual,
   * e não a hora a que a página foi aberta.
   */
  function updateTime() {
    var now = new Date();

    $('#clock-time').text(
      twoDigits(now.getHours()) + ':' +
      twoDigits(now.getMinutes()) + ':' +
      twoDigits(now.getSeconds())
    );
  }

  // A data só é escrita uma vez, quando a página é carregada.
  updateDate();

  // A hora é escrita logo ao abrir (para não esperar 1 segundo)...
  updateTime();

  // ...e depois atualizada a cada 1000 ms = 1 segundo.
  setInterval(updateTime, 1000);


  /* ==================================================================
   *  5. PAINEL DO TEMPO (Ficha 4, exercício 2)
   *  Vai buscar a meteorologia à API do OpenWeatherMap.
   *
   *  O que é uma API?
   *  É um endereço (URL) de um servidor que, em vez de devolver uma
   *  página para ver, devolve DADOS para o nosso código usar.
   *  Neste caso devolve os dados no formato JSON.
   * ================================================================== */

  /*
   * Chave pessoal da API (obtida em openweathermap.org > "My API keys").
   * Vai no fim do URL (&appid=...) para o servidor saber quem está a
   * fazer o pedido. Se estiver errada, a API responde com erro 401.
   *
   * NOTA: se o repositório Git for público, esta chave fica visível
   * a toda a gente.
   */
  var API_KEY = "146c7f1861612071896319f4c3aa7d11";

  /*
   * Momento (objeto Date) em que se receberam os últimos dados da API.
   * Começa a null, que quer dizer "ainda não há dados" (Cap 3 slide 8).
   *
   * Está declarada AQUI FORA das funções para ser partilhada:
   *   - fetchWeather()      ESCREVE aqui quando chegam os dados;
   *   - updateLastUpdate()  LÊ daqui para calcular quanto tempo passou.
   */
  var lastFetch = null;


  /*
   * formatHour(unixSeconds)
   * -----------------------
   * Converte o nascer/pôr do sol da API num texto como "7h46".
   *
   * A API devolve estas horas em "tempo Unix": número de SEGUNDOS
   * passados desde 1 de janeiro de 1970 (ex.: 1759645560).
   * O new Date(...) espera MILISSEGUNDOS, por isso multiplica-se por 1000.
   *
   * Exemplo: unixSeconds = 1759645560
   *   -> new Date(1759645560000) -> 5 de outubro de 2026, 07:46
   *   -> "7" + "h" + "46" -> "7h46"
   *
   * As horas não levam twoDigits (fica "7h46", como na Figura 1 da ficha);
   * os minutos levam (fica "7h05" e não "7h5").
   *
   * Nota: getHours() dá a hora no fuso horário do computador.
   * Para Leiria está certo; para uma cidade noutro fuso mostra a hora
   * correspondente em Portugal.
   */
  function formatHour(unixSeconds) {
    var date = new Date(unixSeconds * 1000);
    return date.getHours() + 'h' + twoDigits(date.getMinutes());
  }


  /*
   * timeAgo(seconds)
   * ----------------
   * Converte um número de segundos no texto "há quanto tempo"
   * (Ficha 4, alínea 2c):
   *   - menos de 60 s           -> em segundos  ("11 seconds ago")
   *   - de 60 s até 3599 s      -> em minutos   ("5 minutes ago")
   *   - 3600 s (1 hora) ou mais -> em horas     ("2 hours ago")
   *
   *   60 s   = 1 minuto
   *   3600 s = 60 x 60 = 1 hora
   */
  function timeAgo(seconds) {
    var value;   // o número a mostrar (ex.: 5)
    var unit;    // a unidade a mostrar (ex.: 'minute')

    // if / else if / else: só um dos três blocos é executado (Cap 3 slide 15).
    if (seconds <60) {
      // Menos de 1 minuto: mostra os segundos tal como estão.
      value = seconds;
      unit = 'second';
    } else if (seconds <3600) {
      // Menos de 1 hora: converte para minutos.
      // Math.floor arredonda para baixo: 119 s / 60 = 1.98 -> 1 minuto.
      value = Math.floor(seconds / 60);
      unit = 'minute';
    } else {
      // 1 hora ou mais: converte para horas.
      value = Math.floor(seconds / 3600);
      unit = 'hour';
    }

    /*
     * Plural: se o valor não for 1, junta um "s" à unidade.
     *   1 -> "1 minute ago"
     *   2 -> "2 minutes ago"
     * "!==" quer dizer "diferente de" (compara valor e tipo).
     */
    if (value !== 1) {
      unit = unit + 's';
    }

    // Junta tudo: 5 + ' ' + 'minutes' + ' ago' -> "5 minutes ago"
    return value + ' ' + unit + ' ago';
  }


  /*
   * updateLastUpdate()
   * ------------------
   * Calcula há quantos segundos chegaram os dados e escreve o texto
   * no painel ("Last Update").
   * É chamada a cada segundo (setInterval no fim do ficheiro), por isso
   * o texto vai mudando sozinho: 1 second ago, 2 seconds ago, ...
   */
  function updateLastUpdate() {

    /*
     * Se ainda não há dados (ou o último pedido deu erro), lastFetch é
     * null e não há nada a calcular.
     * "===" quer dizer "igual a" (compara valor e tipo).
     * "return" sem valor sai logo da função.
     */
    if (lastFetch === null) {
      return;
    }

    /*
     * new Date() - lastFetch
     *   Subtrair duas datas dá a diferença em MILISSEGUNDOS.
     *   Ex.: agora - 30 segundos atrás = 30000 ms.
     * / 1000       -> converte para segundos (30000 / 1000 = 30)
     * Math.floor   -> tira as casas decimais (30.4 -> 30)
     */
    var seconds = Math.floor((new Date() - lastFetch) / 1000);

    // Converte em texto ("30 seconds ago") e escreve no <span id="weather-last-update">.
    $('#weather-last-update').text(timeAgo(seconds));
  }


  /*
   * fetchWeather(city)
   * ------------------
   * Faz o pedido à API do OpenWeatherMap para a cidade indicada
   * e, quando a resposta chega, preenche o painel do tempo.
   */
  function fetchWeather(city) {

    /*
     * Constrói o URL do pedido, com a estrutura dada na ficha (alínea 2b):
     * https://api.openweathermap.org/data/2.5/weather?units=metric&q=leiria&appid=...
     *
     *   ?             -> início dos parâmetros
     *   units=metric  -> temperaturas em °C (sem isto vinham em Kelvin)
     *   &             -> separa um parâmetro do seguinte
     *   q=...         -> nome da cidade
     *   appid=...     -> a chave da API
     *
     * encodeURIComponent(city) prepara o texto para ir dentro de um URL:
     * espaços e acentos são convertidos em códigos.
     *   Ex.: "Caldas da Rainha" -> "Caldas%20da%20Rainha"
     * Para "Leiria" fica igual.
     */
    var url = 'https://api.openweathermap.org/data/2.5/weather?units=metric' +
      '&q=' + encodeURIComponent(city) +
      '&appid=' + API_KEY;

    /*
     * $.ajax({...}) faz um pedido AJAX (Cap 4 slides 30 a 32):
     * o browser pede os dados ao servidor SEM recarregar a página.
     *
     * Recebe um objeto com as opções:
     *   url      -> o endereço a pedir (o que construímos em cima)
     *   dataType -> 'json': o jQuery converte a resposta (que chega como
     *               texto) num objeto JavaScript, que se lê com pontos:
     *               response.main.temp
     *
     * O pedido é ASSÍNCRONO: o browser envia-o e continua a fazer outras
     * coisas (o relógio continua a andar). Quando a resposta chega, o
     * jQuery chama uma de duas funções (callbacks, Cap 4 slide 23):
     *   .done(função) -> se correu bem
     *   .fail(função) -> se correu mal
     */
    $.ajax({
      url: url,
      dataType: 'json'
    }).done(function (response) {

      /*
       * CORREU BEM
       * "response" é o objeto com os dados que a API devolveu.
       * Parte da resposta (só o que usamos):
       * {
       *   "main": {
       *     "temp": 21.09,       <- temperatura atual
       *     "temp_min": 19.94,   <- mínima
       *     "temp_max": 21.29,   <- máxima
       *     "humidity": 93       <- humidade em %
       *   },
       *   "sys": {
       *     "sunrise": 1759645560,  <- nascer do sol (tempo Unix)
       *     "sunset": 1759687440    <- pôr do sol (tempo Unix)
       *   }
       * }
       * Para ler um valor percorre-se o objeto com pontos (Cap 3 slide 17):
       *   response.main.temp -> 21.09
       *
       * Dica: escreve console.log(response); aqui dentro e abre a
       * consola do browser (F12) para veres a resposta completa.
       */

      // Escreve cada valor no <span> respetivo, com .text() (Cap 4 slide 13).
      $('#weather-temp').text(response.main.temp + ' °C');
      $('#weather-temp-max').text(response.main.temp_max + ' °C');
      $('#weather-temp-min').text(response.main.temp_min + ' °C');
      $('#weather-humidity').text(response.main.humidity + '%');

      // As horas do sol passam primeiro pela formatHour() para ficarem "7h46".
      $('#weather-sunrise').text(formatHour(response.sys.sunrise));
      $('#weather-sunset').text(formatHour(response.sys.sunset));

      // Guarda o momento em que os dados chegaram (para o "Last Update").
      lastFetch = new Date();

      // Escreve logo "0 seconds ago", sem esperar pelo próximo segundo.
      updateLastUpdate();

    }).fail(function (xhr, status) {

      /*
       * CORREU MAL (Cap 4 slide 32)
       *   xhr    -> objeto com os detalhes do pedido falhado.
       *             xhr.status é o código HTTP do erro:
       *               401 -> chave da API errada ou ainda não ativa
       *               404 -> cidade não encontrada
       *               0   -> sem ligação à internet
       *   status -> texto curto com o tipo de erro (ex.: "error")
       */

      // Mostra o erro na consola do browser (F12), para ajudar a perceber o problema.
      console.log('Error ' + status + ' (' + xhr.status + ')');

      // Volta a pôr lastFetch a null. Senão, o setInterval do fim do
      // ficheiro voltava a escrever "x seconds ago" passado 1 segundo
      // e apagava a mensagem de erro.
      lastFetch = null;

      // Mostra o erro no próprio painel, ex.: "Error 404".
      $('#weather-last-update').text('Error ' + xhr.status);
    });
  }


  /*
   * BOTÃO "GET"
   * -----------
   * Quando se clica no botão, vai buscar o tempo da cidade que está
   * escrita na caixa de texto.
   */
  $('#weather-get').on('click', function () {

    /*
     * $('#weather-city').val() LÊ o que está escrito no input
     * (.val() sem argumentos = getter, Cap 4 slide 13).
     * $.trim(...) tira os espaços a mais no início e no fim
     * (Cap 4 slide 22), ex.: "  Leiria " -> "Leiria".
     */
    var city = $.trim($('#weather-city').val());

    // .length é o número de caracteres do texto (Cap 3 slide 11).
    // Só faz o pedido se a caixa não estiver vazia.
    if (city.length > 0) {
      fetchWeather(city);
    }
  });


  /*
   * TECLA ENTER NA CAIXA DE TEXTO
   * -----------------------------
   * Carregar em Enter faz o mesmo que clicar no botão "Get".
   *
   * 'keyup' é o evento "largou-se uma tecla".
   * "e" é o objeto evento que o jQuery passa à função, com informação
   * sobre o que aconteceu (Cap 4 slide 26).
   * e.key é o nome da tecla largada ('Enter', 'a', 'Backspace', ...).
   */
  $('#weather-city').on('keyup', function (e) {
    if (e.key === 'Enter') {
      // .click() SEM argumentos não regista nada: DISPARA o evento de
      // clique no botão, como se o utilizador tivesse clicado nele.
      $('#weather-get').click();
    }
  });


  /*
   * Vai buscar o tempo logo ao abrir a página, para a cidade que já
   * está escrita na caixa (value="Leiria" no HTML).
   */
  fetchWeather($('#weather-city').val());

  /*
   * Atualiza o texto "Last Update" a cada segundo (1000 ms),
   * para o "há quanto tempo" ir mudando sozinho (alínea 2c).
   */
  setInterval(updateLastUpdate,1000);

}); // <- fim do $(function () { ... }) que começou no topo do ficheiro
