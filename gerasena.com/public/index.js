// Dependências
const { Builder, By, Key } = require("selenium-webdriver");
const fs = require("fs");
const axios = require("axios");
const { until } = require("selenium-webdriver");

// Função para iniciar o driver Selenium
async function iniciarDriver() {
  const chrome = require("selenium-webdriver/chrome");
  const options = new chrome.Options();

  // Configurações para modo headless
  options.addArguments("--headless"); // Executa sem abrir o navegador
  options.addArguments("--disable-gpu"); // Desativa a aceleração por GPU
  options.addArguments("--no-sandbox"); // Necessário em alguns ambientes de servidor
  options.addArguments("--disable-dev-shm-usage"); // Necessário para evitar erros de memória compartilhada em containers
  options.addArguments(
    "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  );
  options.addArguments("--enable-unsafe-swiftshader");
  const driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();
  return driver;
}

// Função para extrair números sorteados
async function extrairNumerosSorteados(driver, ulId = null, ulClass = null) {
  let sorteios = [];

  if (ulId) {
    const ulElement = await driver.findElement(By.id(ulId));
    const liElements = await ulElement.findElements(By.tagName("li"));
    sorteios = await Promise.all(
      liElements.map(async (li) => await li.getText())
    );
  } else if (ulClass) {
    const ulElements = await driver.findElements(By.className(ulClass));
    for (const ulElement of ulElements) {
      const liElements = await ulElement.findElements(By.tagName("li"));
      const sorteio = await Promise.all(
        liElements.map(async (li) => await li.getText())
      );
      sorteios.push(sorteio);
    }
  }

  return sorteios;
}

// Função principal para scraping
async function scrapeResultsWithSelenium(
  url,
  sorteioNum,
  sorteioAntigo,
  filename
) {
  const driver = await iniciarDriver();
  try {
    await driver.get(url);

    // Preenche o campo de busca com o número do sorteio
    const buscaConcurso = await driver.wait(
      until.elementLocated(By.id("buscaConcurso")),
      10000
    );
    await buscaConcurso.clear();
    await buscaConcurso.sendKeys(sorteioNum.toString(), Key.RETURN);

    // Aguarde a página carregar
    await driver.sleep(10000);

    // Determinar UL ID ou classe com base no arquivo
    let parsedResults;
    if (["milionaria.csv", "mega-sena.csv", "quina.csv"].includes(filename)) {
      parsedResults = await extrairNumerosSorteados(driver, "ulDezenas");
    } else if (filename === "dupla-sena.csv") {
      parsedResults = await extrairNumerosSorteados(
        driver,
        null,
        "numbers dupla-sena"
      );
    } else {
      parsedResults = await extrairNumerosSorteados(
        driver,
        null,
        "lista-dezenas"
      );
    }

    // Extração de informações de concurso e data
    const spanElements = await driver.findElements(By.className("ng-binding"));
    let concursoNumero = null;
    let concursoData = null;

    for (const span of spanElements) {
      const texto = await span.getText();
      if (texto.includes("Concurso")) {
        const partes = texto.split(" ");
        concursoNumero = partes[1];
        concursoData = partes[2].replace(/[()]/g, "");
        break;
      }
    }

    if (concursoNumero && parseInt(concursoNumero) <= sorteioAntigo) {
      console.log("Não há resultados novos");
      return { concursoNumero, concursoData, results: null };
    }

    console.log(`Resultados: ${JSON.stringify(parsedResults)}`);
    return { concursoNumero, concursoData, results: parsedResults };
  } catch (err) {
    console.error("Erro ao realizar o scraping:", err);
    return { concursoNumero: null, concursoData: null, results: null };
  } finally {
    await driver.quit();
  }
}

const file_mapping = [
  "https://loterias.caixa.gov.br/Paginas/Mega-Sena.aspx",
];
const game_types = [
  "lotofacil",
  "lotomania",
  "dupla-sena",
  "mega-sena",
  "quina",
  "milionaria",
];

// Função para realizar scraping e salvar resultados
async function scrapeAndSaveResults(filename, sorteioNum, sorteioAntigo) {
  const url = file_mapping[game_types.indexOf(filename.replace(".csv", ""))];

  const { concursoNumero, concursoData, results } =
    await scrapeResultsWithSelenium(url, sorteioNum, sorteioAntigo, filename);

  if (results) {
    const data = `${concursoNumero},${concursoData},${results.join(",")}\n`;
    fs.appendFileSync(filename, data);
    console.log("Resultados salvos com sucesso");
  } else {
    console.log("Nenhum novo resultado encontrado.");
  }
}

// Exemplo de chamada
(async () => {
  while (true) {
    for (let index = 0; index < file_mapping.length; index++) {
      const filename = file_mapping[index];
      console.log(filename);

      const ultimoSorteio = fs
        .readFileSync(game_types[index] + ".csv", "utf8")
        .split("\n")
        .slice(-2)[0]
        .split(",")[0];

      await scrapeAndSaveResults(
        game_types[index] + ".csv",
        parseInt(ultimoSorteio) + 1,
        ultimoSorteio
      );

      // Aguarda 15 segundos antes de continuar para a próxima iteração
      await new Promise((resolve) => setTimeout(resolve, 15000));
    }
  }
})();
