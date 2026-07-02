<div align="center">

# Kauã Aissa — Portfolio

**Developer Full Stack | Automation**

Portfólio pessoal premium construído com Next.js, animações cinematográficas e uma cena 3D interativa. Bilíngue (🇧🇷 PT / 🇺🇸 EN), com tema claro/escuro e design inspirado no padrão Awwwards.

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-0055FF?logo=framer&logoColor=white)](https://www.framer.com/motion/)

</div>

---

## ✨ Destaques

- **Cena 3D interativa** — esfera renderizada via [Spline](https://spline.design) com coreografia sincronizada ao scroll, parallax por movimento do cursor e revelação suave (fade-in) só após o carregamento completo.
- **Animações cinematográficas** — transições, magnetic tilt nos projetos e microinterações com [Framer Motion](https://www.framer.com/motion/).
- **Internacionalização (i18n)** — roteamento por locale (`/pt` e `/en`) com dicionários carregados sob demanda.
- **Tema claro/escuro** — alternância com `next-themes` e tokens de design em CSS variables.
- **Design system próprio** — componentes acessíveis baseados em Radix + `class-variance-authority`.
- **Performance** — otimização de imagens com `next/image`, fontes com `next/font` e prerender estático das rotas.

## 🧱 Stack

| Camada | Tecnologia |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| UI | [React 19](https://react.dev) + [TypeScript 5](https://www.typescriptlang.org) |
| Estilização | [Tailwind CSS 4](https://tailwindcss.com) |
| Animações | [Framer Motion 12](https://www.framer.com/motion/) |
| 3D | [@splinetool/react-spline](https://github.com/splinetool/react-spline) + runtime |
| Componentes | [Radix UI](https://www.radix-ui.com) · [lucide-react](https://lucide.dev) · CVA |
| Tema | [next-themes](https://github.com/pacocoursey/next-themes) |

## 📂 Estrutura

```text
src/
├─ app/
│  ├─ [lang]/            # Rotas por locale (pt/en)
│  ├─ globals.css        # Tokens de design + temas
│  ├─ layout.tsx         # Metadata e layout raiz
│  └─ page.tsx
├─ components/
│  ├─ 3d/                # SphereStage + DynamicStageModel (Spline)
│  ├─ sections/          # Hero, About, Projects, Metrics, Footer
│  ├─ shared/            # Navbar e componentes compartilhados
│  └─ ui/                # Design system (button, etc.)
├─ dictionaries/         # Conteúdo pt.json / en.json
├─ hooks/                # Hooks de scrollytelling e utilidades
├─ i18n/                 # Config de locale + get-dictionary
├─ lib/                  # site.ts (fonte única de identidade)
└─ assets/               # Imagens e ícones
```

## 🚀 Como rodar localmente

**Pré-requisitos:** [Node.js](https://nodejs.org) 18.18+ e npm.

```bash
# 1. Instale as dependências
npm install

# 2. Ambiente de desenvolvimento
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) — a rota raiz redireciona para o locale padrão (`/pt`).

> **Nota sobre o build:** os scripts `dev` e `build` usam a flag `--webpack` em vez do Turbopack para garantir compatibilidade do build neste ambiente.

### Scripts disponíveis

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento (webpack) |
| `npm run build` | Build de produção |
| `npm run start` | Servir o build de produção |
| `npm run lint` | Análise estática com ESLint |

## 🌐 Internacionalização

O idioma é definido pelo segmento de rota:

- `/pt` → Português (padrão)
- `/en` → English

Para adicionar ou editar textos, ajuste os arquivos em [`src/dictionaries`](src/dictionaries). Novos locales podem ser registrados em [`src/i18n/config.ts`](src/i18n/config.ts).

## ☁️ Deploy

O projeto é otimizado para deploy na [Vercel](https://vercel.com/new):

1. Faça o push do repositório para o GitHub.
2. Importe o projeto na Vercel.
3. O build roda automaticamente com o script `build`.

Também é compatível com qualquer plataforma que suporte Next.js (Node runtime).

## 📫 Contato

- **GitHub:** [KauaAissa](https://github.com/KauaAissa)
- **LinkedIn:** [kauaaissa](https://www.linkedin.com/in/kauaaissa/)
- **E-mail:** kaua.aissa.dev@gmail.com

---

<div align="center">
<sub>© Kauã Aissa — Todos os direitos reservados.</sub>
</div>
