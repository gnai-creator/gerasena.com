# gerasena.com

Gerasena.com é uma aplicação completa para geração e análise de jogos da Mega‑Sena. O projeto é baseado em [Next.js](https://nextjs.org) e combina uma interface web com APIs e scripts que processam os resultados oficiais da loteria.

## Visão geral do sistema

- **Geração de jogos**
  - **Manual:** o usuário escolhe características estatísticas (soma, média, frequência histórica etc.) e o sistema cria combinações a partir desses critérios.
  - **Automática:** o módulo `analyzeHistorico` usa [TensorFlow.js](https://www.tensorflow.org/js) para analisar os últimos `QTD_HIST` sorteios (padrão 200) anteriores ao concurso informado (ou os últimos disponíveis) e gerar combinações automaticamente. O treinamento agora utiliza uma semente fixa e validação interna para reduzir variação entre execuções. O número do último concurso é obtido e passado como `before` tanto para a análise quanto para a consulta em `/api/historico`, evitando que o sorteio previsto participe do treinamento ou de comparações.
  - As combinações são avaliadas (`evaluator.ts`) e salvas na tabela `gerador` do banco de dados.
- **Consulta de resultados**
  - Página de **histórico** com os últimos concursos e possibilidade de paginação via `/api/historico`.
  - Página de **estatísticas** que cruza os jogos gerados com resultados reais por meio de `/api/stats`.
- **Armazenamento**
  - Utiliza [libSQL/Turso](https://turso.tech/) para persistir sorteios (`history`) e jogos gerados (`gerador`).
  - Arquivo `public/mega-sena.csv` serve como fonte inicial para preencher o banco.

## Parâmetros do algoritmo genético

As páginas de geração (`/automatico` e `/manual`) e a API aceitam os
parâmetros `populationSize` e `generations` para configurar o algoritmo.
`populationSize` determina quantos jogos compõem a população inicial e
`generations` define quantos ciclos de evolução serão executados. O tempo de
execução cresce aproximadamente com `populationSize * generations`; valores
muito altos (acima de ~500 indivíduos ou dezenas de gerações) podem tornar o
processo lento, especialmente no navegador. Recomenda‑se limitar a população a
no máximo 10 000 jogos e usar quantidades moderadas de gerações.

## Pipeline de dados

- `npm run scrape:mega-sena` baixa do serviço da Caixa o CSV mais recente com os sorteios.
- `scripts/mega-sena-cron.js` agenda a atualização diária do CSV e da tabela `history`.
- `npm run seed:turso` cria as tabelas necessárias e carrega os dados iniciais no banco.
- `npm run seed:history` repopula a tabela `history` a partir do CSV existente.
- `/api/cron` expõe uma rota que lê o CSV e popula o banco em ambientes serverless.

## Desenvolvimento

1. Configure as variáveis de ambiente `TURSO_DATABASE_URL` e `TURSO_AUTH_TOKEN` para apontar para sua instância do Turso.
2. Instale as dependências:

   ```bash
   npm install
   ```

3. Execute o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

4. Acesse [http://localhost:3000](http://localhost:3000) para utilizar a aplicação.

## Scripts úteis

- `npm run scrape:mega-sena` – baixa os resultados mais recentes da Mega‑Sena.
- `npm run seed:turso` – cria as tabelas e popula a base de dados inicial.
- `npm run seed:history` – preenche a tabela de histórico a partir do CSV.
- `npm run lint` – verifica o código com ESLint/Next.

## Deploy

O projeto está preparado para ser implantado na [Vercel](https://vercel.com). Outras opções de deploy podem ser configuradas conforme a documentação do Next.js.

