# Lista de Compras · Plano 2300 kcal

App web interativo de lista de compras mensal baseado no Plano Nutricional Tático de 2300 kcal (6 refeições).

## Funcionalidades

- ✅ Marcar itens como comprados (com persistência no navegador)
- ✅ Editar quantidades de cada item
- ✅ Calcular preço e total da compra
- ✅ Filtrar por categoria (Proteínas, Laticínios, Carboidratos, etc.)
- ✅ Filtrar só itens não comprados
- ✅ Organizado por 6 refeições (Café, Lanche Manhã, Almoço, Lanche Tarde, Jantar, Ceia)
- ✅ Dicas de compra e itens substitutos em cada alimento
- ✅ Funciona offline depois de carregado (PWA-ready)

## Deploy no GitHub Pages

Este app é 100% estático (sem backend) e pode ser hospedado gratuitamente no GitHub Pages.

### Passo a passo

#### 1. Crie um repositório no GitHub

- Acesse https://github.com/new
- Nome do repositório: **`lista-compras-2300`** (ou outro nome — se mudar, edite a variável `repoName` em `next.config.ts`)
- Marque como **público**
- Não inicialize com README (vamos subir os arquivos locais)

#### 2. Inicialize o git local e faça push

```bash
cd /home/z/my-project

# Inicializa o repositório git (se ainda não tiver)
git init
git branch -M main

# Adiciona todos os arquivos
git add .

# Primeiro commit
git commit -m "Lista de compras interativa 2300 kcal"

# Conecta ao repositório remoto (TROQUE pelo seu usuário)
git remote add origin https://github.com/SEU-USUARIO/lista-compras-2300.git

# Faz o push
git push -u origin main
```

#### 3. Configure o GitHub Pages

- No GitHub, vá em **Settings** → **Pages**
- Em **Source**, selecione: **GitHub Actions**
- Não precisa escolher branch — o workflow já faz tudo automaticamente

#### 4. Aguarde o deploy automático

- Vá na aba **Actions** do repositório
- Você verá um workflow chamado "Deploy to GitHub Pages" rodando
- Em ~2 minutos ele vai terminar e mostrará a URL do seu site

#### 5. Acesse seu site

A URL será algo como:

```
https://SEU-USUARIO.github.io/lista-compras-2300/
```

### Deploy manual (alternativa ao GitHub Actions)

Se preferir fazer deploy manual sem GitHub Actions:

```bash
# Gera a pasta out/ com os arquivos estáticos
DEPLOY_TARGET=gh-pages bun run build:static

# Instala o gh-pages (uma vez só)
bun add -g gh-pages

# Faz o deploy da pasta out/ para a branch gh-pages
gh-pages -d out
```

Depois no GitHub: **Settings** → **Pages** → **Source: Deploy from a branch** → **Branch: `gh-pages` / `/(root)`**

## Atualizações

Sempre que quiser mudar algo (adicionar itens, mudar layout, etc.):

1. Edite os arquivos localmente
2. `git add . && git commit -m "sua mensagem"`
3. `git push`
4. O GitHub Actions rebuilda e publica automaticamente em ~2 min

## Desenvolvimento local

```bash
bun install           # instalar dependências
bun run dev           # servidor de desenvolvimento (http://localhost:3000)
bun run build:static  # gerar build estático na pasta out/
bun run lint          # checar erros de código
```

## Estrutura do projeto

```
src/
├── app/
│   ├── page.tsx           # Interface principal (lista interativa)
│   ├── layout.tsx         # Layout raiz com Sonner toaster
│   ├── api/route.ts       # Rota API dummy (force-static para export)
│   └── globals.css
├── lib/
│   └── shopping-data.ts   # Dados da lista (itens, categorias, dicas, substitutos)
└── components/ui/         # Componentes shadcn/ui

.github/workflows/
└── deploy.yml             # Workflow de deploy automático para GitHub Pages

next.config.ts             # Configurado para export estático com basePath
```

## Dados nutricionais

Lista baseada em:
- **Plano Nutricional Tático** (PDF) — 2300 kcal, 6 refeições, 5 opções por refeição
- **Estratégia do plano** (DOCX) — macros por refeição
- **Dieta 2300 calorias** (DOCX) — opções alternativas

Total: ~64 itens de compra para 30 dias.
