import type { NextConfig } from "next";

// Para GitHub Pages: o site é servido de https://<user>.github.io/<repo>/
// Precisamos definir o basePath com o nome do repositório.
// Se for usar domínio próprio ou user.github.io (repo raiz), deixe basePath vazio "".
const repoName = "lista-compras-2300"; // <-- TROQUE pelo nome do seu repositório GitHub

const isGithubPages = process.env.GITHUB_ACTIONS === "true" || process.env.DEPLOY_TARGET === "gh-pages";

const nextConfig: NextConfig = {
  // Export estático para GitHub Pages (gera pasta 'out/' com HTML/CSS/JS)
  output: "export",
  
  // Necessário para GitHub Pages em subpath (user.github.io/repo/)
  basePath: isGithubPages ? `/${repoName}` : "",
  assetPrefix: isGithubPages ? `/${repoName}/` : "",
  
  // GitHub Pages não suporta otimização de imagens on-the-fly
  images: {
    unoptimized: true,
  },
  
  // Garantir trailing slash para compatibilidade com GitHub Pages
  trailingSlash: true,
  
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
