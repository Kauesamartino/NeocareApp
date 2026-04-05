# Copilot Instructions — Neocare Mobile App

Projeto de aplicativo mobile desenvolvido com React Native (Expo) e TypeScript, integrado a uma API backend via HTTP (`https://neocare-api.onrender.com`) e ao Oracle APEX para funcionalidades de saúde e bem-estar.

---

## Objetivo do Repositório

Este repositório sustenta a entrega técnica do Challenge com foco em:

- Aplicativo mobile funcional com mínimo de 6 telas distintas e navegação real via React Navigation;
- Integração HTTP com API backend usando TanStack Query (`useQuery`, `useMutation`);
- Sistema de autenticação real com persistência via AsyncStorage e controle de rotas protegidas;
- Funcionalidade integrada ao Oracle APEX com consumo de API REST exposta pelo APEX;
- Arquitetura organizada com separação clara entre UI, lógica de negócio e acesso a dados;
- Documentação e vídeo de apresentação demonstrando o funcionamento real do app.

---

## Requisitos Avaliativos e Pesos

| Critério | Pontos |
|---|---|
| Navegação entre telas | 5 |
| Integração com API backend (HTTP) | 15 |
| Sistema de autenticação (Login) | 20 |
| Funcionalidade integrada com Oracle APEX | 20 |
| Arquitetura e organização do código | 20 |
| Documentação e apresentação da entrega | 20 |
| **Total** | **100** |

---

## Fluxo Obrigatório em Toda Tarefa

```
1. Entender qual requisito avaliativo a tarefa atende
2. Verificar se a solução evita todas as penalidades listadas
3. Implementar respeitando a separação de responsabilidades
4. Validar dados, contratos e estados de UI (loading, erro, sucesso)
5. Confirmar que o resultado é demonstrável em apresentação de 5 minutos
```

Se faltar informação sobre a API backend, Oracle APEX ou critério avaliativo, parar e levantar a dúvida ao usuário em vez de assumir detalhes críticos.

---

## Agentes do Workspace

Use agentes especializados para manter foco e rastreabilidade por área de responsabilidade.

| Agente | Propósito |
|---|---|
| `neocare-architecture` | Estrutura de pastas, contratos de navegação, separação de camadas, revisão de organização geral |
| `neocare-logic` | Hooks, services, contextos, integração com API, autenticação, TanStack Query |
| `neocare-visual` | Componentes de UI, estilos, temas (claro/escuro), estados de loading e erro, acessibilidade |
| `neocare-validation` | Revisão de aderência aos critérios avaliativos, consistência entre camadas |
| `neocare-penalties` | Verificação proativa de penalidades, checklist de entrega, conformidade do repositório |

---

## Stack Técnica

### Mobile

- **Framework**: React Native com Expo (SDK ~54)
- **Linguagem**: TypeScript
- **Navegação**: `@react-navigation/native` + `@react-navigation/native-stack`
- **HTTP / Estado servidor**: TanStack Query (`@tanstack/react-query`) + Axios
- **Persistência local**: `@react-native-async-storage/async-storage`
- **Estado global de auth**: React Context API

### Backend

- **API principal**: `https://neocare-api.onrender.com`
- **API Oracle APEX**: endpoint REST exposto pelo APEX (definido pelo grupo)

---

## Estrutura de Pastas Esperada

```
screens/               ← uma pasta por tela, com index.tsx
_components/           ← componentes reutilizáveis compartilhados
hooks/                 ← hooks customizados (TanStack Query isolado aqui)
services/              ← chamadas HTTP, clientes axios, funções de API
contexts/              ← React Context (auth, tema, etc.)
types/                 ← interfaces e tipos TypeScript
utils/                 ← funções puras sem dependência de UI
assets/                ← imagens, fontes, ícones
```

Regras:

- Cada tela é uma pasta separada em `screens/` — nunca agrupar telas não relacionadas;
- Chamadas HTTP ficam em `services/`, nunca diretamente em componentes de tela;
- TanStack Query hooks ficam em `hooks/`, isolados da camada de UI;
- Lógica de autenticação centralizada no `AuthContext`;
- Tipos compartilhados ficam em `types/`.

---

## Regras de Navegação

- **Obrigatório**: usar `@react-navigation/native` com rotas explicitamente declaradas;
- **Proibido**: controle de telas via `useState`, condicionais `if/else` ou renderização condicional como substituto de navegação;
- **Proibido**: modais simulando telas — o critério exige 6 telas distintas com rotas reais;
- Rotas protegidas controladas pelo estado de autenticação do `AuthContext`;
- O Stack Navigator deve separar explicitamente rotas autenticadas e não-autenticadas.

---

## Regras de Integração com API

- **Obrigatório**: TanStack Query para todas as requisições (`useQuery` para leitura, `useMutation` para escrita);
- **Proibido**: dados mockados, valores fixos no código ou arquivos locais substituindo chamadas reais;
- **Proibido**: atualização manual da interface com `useState` após mutações — usar `invalidateQueries`;
- A interface deve exibir estados de carregamento (`ActivityIndicator` ou equivalente) durante requisições;
- Erros de rede devem ser capturados e exibidos ao usuário;
- CRUD completo (Create, Read, Update, Delete) acessível via interface nas funcionalidades dependentes de API.

---

## Regras de Autenticação

- Token recebido do backend persistido em AsyncStorage;
- O `AuthContext` deve expor: `user`, `isAuthenticated`, `isLoading`, `login`, `logout`, `register`;
- Telas protegidas não podem ser acessadas sem autenticação — controle via Navigator, não condicionais em tela;
- Sessão deve sobreviver ao fechamento e reabertura do app;
- **Proibido**: login com usuário/senha fixos no código, controle de acesso apenas com `useState` local.

---

## Regras de Integração com Oracle APEX

- O Oracle APEX deve expor pelo menos um endpoint REST com lógica real de negócio;
- O app deve consumir esse endpoint de forma essencial — a funcionalidade não pode funcionar sem o APEX;
- A integração deve ser demonstrável em vídeo: mostrar o APEX, a chamada e o reflexo no app;
- **Proibido**: usar o APEX apenas como banco de dados simples sem lógica associada;
- **Proibido**: endpoint APEX não utilizado pela interface do app.

---

## Regras de Tema

- **Obrigatório**: o app deve suportar tema (claro e/ou escuro);
- Usar `useColorScheme` do React Native ou um `ThemeContext` para controlar o tema;
- Cores, fundos e textos devem responder ao tema ativo;
- A ausência de tratamento de tema implica penalidade de -20 pontos.

---

## Regras Globais de Implementação

- Nomear arquivos, funções e variáveis de forma autoexplicativa e consistente;
- Não duplicar código em múltiplas telas — abstrair em hook ou componente reutilizável;
- Não concentrar regras de negócio em componentes de tela;
- Toda decisão de arquitetura deve ser justificável durante a apresentação;
- Quando houver trade-off entre sofisticação e clareza, priorizar clareza.

---

## Penalidades Críticas a Evitar

| Penalidade | Impacto |
|---|---|
| Não entregar via GitHub Classroom | -20 pts |
| Ausência de vídeo de apresentação | -20 pts |
| README ausente ou insuficiente | -10 pts |
| App sem suporte a tema (claro/escuro) | -20 pts |
| App fora do escopo das aulas | -60 pts |
| Remoção de telas/funcionalidades de sprints anteriores | -100 pts (nota zero) |
| Histórico de commits incoerente ou artificial | -50 pts |
| Integrações simuladas ou incompletas | -40 pts |
| Navegação simulada (modal/useState como tela) | -30 pts |
| Autenticação fictícia ou facilmente burlável | -40 pts |
| APEX usado de forma irrelevante ou desconectado do app | -50 pts |
| Arquitetura inadequada ou código não manutenível | -30 pts |
| App não funcional (crash, build failure, fluxos quebrados) | -100 pts (nota zero) |
| Vídeo incompatível com o app entregue | -100 pts (nota zero) |

---

## Documentação Obrigatória (README.md)

O README deve conter no mínimo:

- Descrição do problema escolhido;
- Descrição geral da solução proposta;
- Tecnologias utilizadas;
- Instruções básicas para execução do projeto;
- Link para o vídeo de apresentação no YouTube.

---

## Checklist de Entrega

Antes de finalizar qualquer sprint, verificar:

- [ ] Mínimo de 6 telas distintas com rotas declaradas no Navigator
- [ ] TanStack Query instalado e usado em todas as requisições
- [ ] CRUD completo acessível via interface nas duas funcionalidades principais
- [ ] Estados de loading visíveis durante requisições
- [ ] `invalidateQueries` acionado após mutações (sem refresh manual)
- [ ] Token persistido em AsyncStorage e sessão restaurada ao reabrir o app
- [ ] Telas protegidas inacessíveis sem autenticação
- [ ] Funcionalidade APEX integrada e demonstrável
- [ ] Tema claro/escuro implementado
- [ ] README.md completo com link do vídeo
- [ ] Histórico de commits com mensagens claras e evolução gradual
- [ ] Nenhuma tela ou funcionalidade de sprint anterior foi removida
- [ ] Vídeo de até 5 minutos com narração demonstrando o app real

---

## Regra Final

Toda implementação deve responder a esta pergunta:

**se o avaliador abrir o app agora, conseguirá ver todas as 6 telas, autenticar, usar o CRUD, interagir com o Oracle APEX e confirmar que o código está bem organizado — tudo sem intervenção manual?**
