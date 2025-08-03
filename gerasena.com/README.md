# gerasena.com

Gerasena.com é uma aplicação web construída com [Next.js](https://nextjs.org) para gerar jogos da Mega-Sena e explorar dados dos sorteios anteriores.

## Recursos

- Geração manual e automática de combinações.
- Histórico de sorteios com gráficos e estatísticas básicas.
- Scripts para raspagem dos resultados e povoamento do banco de dados.

## Desenvolvimento

1. Instale as dependências:

```bash
npm install
```

2. Execute o servidor de desenvolvimento:

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) para ver a aplicação.

## Scripts úteis

- `npm run scrape:mega-sena` – baixa os resultados mais recentes.
- `npm run seed:turso` – popula a base de dados inicial.
- `npm run seed:history` – adiciona o histórico completo de sorteios.
- `npm run lint` – verifica o código com ESLint.

## Deploy

O projeto está preparado para ser implantado na [Vercel](https://vercel.com). Consulte a documentação do Next.js para outras opções de deploy.

