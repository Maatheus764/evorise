# Evorise

Experiência web premium para apresentar a automação inteligente da Evorise. O site mantém a estética roxo premium + preto fosco, 
traz animações sutis e suporte completo a três idiomas, operando como aplicação estática servida por um dev server Node.js sem
necessidade de dependências externas.

## ✨ Principais recursos
- **Interface multilíngue (PT, EN, ES)** com persistência da preferência no `localStorage` e atualização em tempo real do conteúdo.
- **Tema claro/escuro dinâmico**, respeitando a preferência do sistema e com alternância manual acessível no cabeçalho.
- **Microanimações leves** (fade-in on scroll, glow dinâmico, carrossel suave) implementadas com CSS e JavaScript vanilla.
- **Design responsivo** que preserva a identidade visual da Evorise em telas mobile e desktop.
- **Seções completas**: hero com mockup animado, demonstração do produto, benefícios, cases com carrossel, sobre, ferramentas,
  contato e página dedicada ao produto.

## 🛠️ Stack
- HTML semântico otimizado para acessibilidade.
- CSS customizado inspirado em utilitários Tailwind para garantir o visual minimalista e moderno.
- JavaScript modular para gerenciamento de tema, idiomas, carrossel e microinterações.
- Servidor de desenvolvimento Node.js (`server/devServer.js`) para servir os arquivos estáticos.

## 📁 Estrutura de pastas
```
public/
 ├─ index.html              # Landing page principal
 ├─ produto/index.html      # Página dedicada ao agente Evorise
 └─ assets/
     ├─ css/styles.css      # Estilos globais e animações
     └─ js/app.js           # Lógica de idioma, tema e interações
locales/                    # Catálogo de traduções (pt, en, es)
server/devServer.js         # Servidor HTTP estático para desenvolvimento
```

## 🚀 Como executar localmente
1. Instale as dependências (nenhuma é necessária, mas o comando cria o `package-lock.json` se desejar):
   ```bash
   npm install
   ```
2. Execute o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
3. Acesse [http://localhost:3000](http://localhost:3000) para visualizar o site.

O servidor estático serve diretamente os arquivos em `public/`, portanto qualquer alteração é refletida ao recarregar a página.

---
Projeto criado para transmitir tecnologia, elegância e credibilidade — alinhado ao posicionamento da Evorise.
