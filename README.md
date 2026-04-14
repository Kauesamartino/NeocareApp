# 🏥 NeoCare — Plataforma Inteligente de Bem-Estar

## Integrantes

Kaue Vinicius Samartino da Silva — RM559317

Davi Praxedes Santos Silva — RM560719

João dos Santos Cardoso de Jesus — RM560400

## Link vídeo apresentação

https://youtu.be/m2Vd2BtW98U

---

## 🎯 Sobre o Projeto

### Problema

O estresse é um dos principais problemas de saúde do mundo moderno. Muitas pessoas convivem com altos níveis de estresse diariamente, mas só percebem os sinais quando o corpo e a mente já estão em colapso — resultando em condições graves como ansiedade, burnout ou AVC.

### Solução

**NeoCare** é um aplicativo mobile que integra monitoramento de sinais vitais e estresse com uma API backend para persistência de dados e uma integração Oracle APEX para métricas de saúde e recomendações personalizadas. O usuário registra medições, acompanha indicadores em um dashboard e recebe alertas preventivos.

---

## 📱 Telas do App (10 rotas distintas)

O app usa `@react-navigation/native-stack` com navegação condicional baseada no estado de autenticação.

### Telas não-autenticadas

| # | Tela | Rota | Descrição |
|---|------|------|-----------|
| 1 | **Login** | `Login` | Username + senha, autenticação via API REST com JWT |
| 2 | **Cadastro (Intro)** | `Cadastro` | Visão geral das 3 etapas de registro |
| 3 | **Dados Pessoais** | `CadastroDadosPessoais` | Nome, CPF (formatação progressiva), email, telefone, data de nascimento, sexo, altura, peso |
| 4 | **Credenciais** | `CadastroCredenciais` | Username, senha com indicador de força (Fraca/Média/Forte), confirmação |
| 5 | **Endereço** | `CadastroEndereco` | CEP com autopreenchimento via ViaCEP, endereço completo, resumo final e envio |

### Telas autenticadas

| # | Tela | Rota | Descrição |
|---|------|------|-----------|
| 6 | **Home (Dashboard)** | `Home` | Métricas reais da API Java + recomendações APEX e ações rápidas |
| 7 | **Perfil** | `Perfil` | Visualização e edição dos dados pessoais + endereço via API |
| 8 | **Medição** | `Medicao` | Registro de sinais vitais (BPM, SpO₂, PA) ou estresse (HRV, GSR) |
| 9 | **Notificações** | `Notificacoes` | Lista de alertas reais por usuário com severidade e data/hora |
| 10 | **Sobre o App** | `SobreApp` | Conteúdo institucional da plataforma e jornada de monitoramento |

---

## 📊 Funcionalidades

### 🔐 Autenticação
- Login com JWT via `POST /api/auth/login` — token persistido em AsyncStorage
- Cadastro em 3 etapas com validação completa a cada passo
- Sessão sobrevive ao fechamento do app (restauração automática do token)
- Rotas protegidas no Navigator (não condicional em tela)
- Logout limpa AsyncStorage e redireciona ao Login

### 🏠 Dashboard (HomeScreen)
- Saudação personalizada com nome do usuário (API backend)
- Grid de métricas de saúde reais: BPM, oxigenação, pressão e HRV (API Java)
- Recomendações personalizadas com prioridade e ação de conclusão (Oracle APEX - mock permitido)
- Resumo de saúde com total de medições vitais, medições de estresse e alertas ativos
- Pull-to-refresh para atualizar dados
- Botões de ação rápida: "Nova Medição", "Meu Perfil", "Notificações" e "Sobre o App"

### 📈 Medições (MedicaoScreen)
- **Aba Sinais Vitais**: BPM, SpO₂ (%), pressão sistólica/diastólica → `POST /medicoes/medicao_vital`
- **Aba Estresse**: HRV (ms), condutividade da pele (μS) → `POST /medicoes/medicao_estresse`
- Valores de referência exibidos para cada campo
- Validação numérica antes do envio
- ActivityIndicator durante submissão
- Alerta de sucesso com resumo dos dados registrados
- Usa `useMutation` do TanStack Query com `invalidateQueries` após sucesso
- Fallback automático de dispositivo: se não houver ativo, usa ID aleatório entre 1 e 3

### 🔔 Notificações
- Tela dedicada para alertas reais (`Notificacoes`)
- Consome endpoint de alertas por usuário da API Java
- Exibe severidade, valor detectado, mensagem e data da notificação

### ℹ️ Sobre o App
- Tela institucional dedicada (`SobreApp`)
- Apresenta missão, funcionamento da plataforma e visão de privacidade

### 👤 Perfil (ProfileScreen)
- Exibe dados do usuário (pessoais + endereço) via `GET /usuarios/username/{username}`
- Avatar com iniciais do nome (cor gerada por hash)
- Modo de edição inline — todos os campos editáveis exceto CPF
- Salva alterações via `PUT /usuarios`
- Botão de refresh para recarregar dados da API
- Modal de perfil com 3 abas: Info, Saúde, Configurações

### ✅ Validações
- **CPF**: aceito para testes com 11 dígitos + formatação progressiva (`000.000.000-00`)
- **CEP**: 8 dígitos + busca automática via ViaCEP (`https://viacep.com.br/ws/{cep}/json/`)
- **Email**: regex de formato
- **Telefone**: 10–11 dígitos locais com formatação progressiva `+55 (XX) XXXXX-XXXX`
- **Senha**: 8+ caracteres, maiúscula, minúscula, número
- **Username**: 3–20 caracteres, alfanumérico + underscore

### 🌙 Tema (Claro/Escuro)
- `ThemeContext` lê a preferência do sistema via `useColorScheme()`
- Cores definidas para light e dark: background, surface, card, primary, text, border, etc.
- Telas `ProfileScreen` e `MedicaoScreen` respondem ao tema ativo

---

## 🔗 Integrações

### API Backend (Neocare-API)

**Base URL**: `https://neocare-api.onrender.com`

| Método | Endpoint | Uso no App |
|--------|----------|------------|
| `POST` | `/api/auth/login` | Login — retorna `{ token, username, roles }` |
| `POST` | `/usuarios` | Cadastro completo (dados pessoais + credenciais + endereço) |
| `GET` | `/usuarios/username/{username}` | Carregar perfil do usuário logado |
| `PUT` | `/usuarios` | Atualizar perfil |
| `POST` | `/medicoes/medicao_vital` | Registrar sinais vitais (BPM, SpO₂, PA) |
| `POST` | `/medicoes/medicao_estresse` | Registrar medição de estresse (HRV, GSR) |
| `GET` | `/medicoes/vitais/usuario/{usuarioId}` | Histórico de sinais vitais por usuário |
| `GET` | `/medicoes/estresse/usuario/{usuarioId}` | Histórico de estresse por usuário |
| `GET` | `/api/alertas/usuario/{usuarioId}` | Listagem de alertas do usuário |
| `GET` | `/api/dispositivos/usuario/{usuarioId}` | Dispositivos do usuário (ativo/fallback) |

Todas as chamadas autenticadas enviam `Authorization: Bearer {token}` no header.

### Oracle APEX

**Base URL**: `https://apex.oracle.com/pls/apex/neocare`

| Método | Endpoint | Uso no App |
|--------|----------|------------|
| `GET` | `/metricas/{username}` | Métricas de saúde do dashboard |
| `GET` | `/resumo-diario/{username}` | Resumo diário (sono, passos, meditação, água, exercícios) |
| `GET` | `/recomendacoes/{username}` | Recomendações personalizadas |
| `PUT` | `/recomendacoes/{username}/{id}/concluir` | Marcar recomendação como concluída |
| `POST` | `/atividade/{username}/agua` | Registrar ingestão de água |
| `POST` | `/atividade/{username}/exercicio` | Registrar exercício |
| `POST` | `/atividade/{username}/meditacao` | Registrar meditação |

Os dados do APEX alimentam o dashboard da HomeScreen via TanStack Query (`useQuery`).

### ViaCEP

- `GET https://viacep.com.br/ws/{cep}/json/` — preenchimento automático de endereço no cadastro

---

## 🛠️ Tecnologias

| Tecnologia | Versão | Finalidade |
|------------|--------|-----------|
| **React Native** | 0.81.4 | Framework mobile |
| **Expo** | ~54.0.12 | Plataforma de build e desenvolvimento |
| **TypeScript** | ~5.9.2 | Tipagem estática |
| **React** | 19.1.0 | Biblioteca de UI |
| **React Navigation** | ^7.1.18 | Stack Navigator com rotas tipadas |
| **TanStack Query** | ^5.96.2 | Cache, fetching, mutations (`useQuery`/`useMutation`) |
| **Axios** | ^1.13.2 | Cliente HTTP com interceptors |
| **AsyncStorage** | ^2.2.0 | Persistência local (JWT, dados do usuário) |
| **React Native SVG** | — | Ícones vetoriais (BootstrapEye) |

---

## 🏗️ Arquitetura

```
NeocareApp/
├── App.tsx                         # Providers (QueryClient → Theme → Auth) + Navigator
├── contexts/
│   ├── AuthContext.tsx              # Login, register, logout, JWT, AsyncStorage
│   └── ThemeContext.tsx             # Tema claro/escuro via useColorScheme
├── screens/
│   ├── LoginScreen/                # Autenticação com API REST
│   ├── CadastroScreen/             # Intro das 3 etapas
│   ├── CadastroDadosPessoaisScreen/# Step 1: dados pessoais + validação CPF
│   ├── CadastroCredenciaisScreen/  # Step 2: username + senha com força
│   ├── CadastroEnderecoScreen/     # Step 3: CEP (ViaCEP) + envio final
│   ├── HomeScreen/                 # Dashboard com métricas reais + recomendações
│   ├── MedicaoScreen/              # Registro de vitais/estresse (mutation)
│   ├── NotificacoesScreen/         # Lista de alertas reais
│   ├── SobreAppScreen/             # Conteúdo institucional do app
│   └── ProfileScreen/              # Visualização/edição de perfil
├── hooks/
│   ├── useUserProfile.ts           # Formatação e refresh de perfil
│   ├── useHealthMetrics.ts         # Derivação de métricas reais (históricos API Java)
│   ├── useHealthOverview.ts        # Resumo consolidado de saúde + alertas
│   ├── useAlertas.ts               # useQuery → API /api/alertas/usuario/{id}
│   ├── useDispositivos.ts          # useQuery → API /api/dispositivos/usuario/{id}
│   ├── useRecommendations.ts       # useQuery + useMutation → APEX /recomendacoes
│   ├── useMedicoes.ts              # useMutation + históricos + fallback de dispositivo
│   └── useProfileModal.ts          # Estado do modal de perfil
├── services/
│   ├── api.ts                      # Axios client → Neocare-API (backend)
│   ├── apexService.ts              # Axios client → Oracle APEX
│   └── cepService.ts               # ViaCEP (busca de endereço)
├── _components/
│   ├── Profile/                    # ProfileModal, EditProfileModal
│   └── icons/                      # BootstrapEye (SVG toggle)
├── types/
│   ├── cadastro.ts                 # DadosPessoais, Credenciais, Endereco, CadastroCompleto
│   └── navigation.ts              # RootStackParamList com tipagem forte
└── utils/
    ├── cpfUtils.ts                 # validateCPF, formatCPF (algoritmo oficial)
    ├── formatUtils.ts              # formatCEP, formatTelefone, formatDate
    ├── errorUtils.ts               # AppError, ErrorType enum, mapApiError
    └── AsyncStorageUtils.ts        # Classes utilitárias de storage
```

### Separação de responsabilidades

- **Screens** — apenas UI e orquestração de hooks/navigation
- **Hooks** — lógica de negócio, TanStack Query, formatação de dados
- **Services** — chamadas HTTP puras (Axios), sem lógica de UI
- **Contexts** — estado global (auth e tema)
- **Utils** — funções puras sem dependência de React (validação, formatação, erros)
- **Types** — interfaces e tipos compartilhados

---

## 🔄 Fluxo de Autenticação

```
App inicia
  ↓
AuthProvider.checkAuthState() — lê token do AsyncStorage
  ↓
Token existe?
  → SIM: restaura user, isAuthenticated = true → Stack autenticado (Home, Perfil, Medicao)
  → NÃO: isAuthenticated = false → Stack público (Login, Cadastro)

Login:
  username + password → POST /api/auth/login → { token, username, roles }
  → salva em AsyncStorage → isAuthenticated = true → Home

Cadastro (3 etapas):
  Step 1 (dados pessoais) → Step 2 (credenciais) → Step 3 (endereço + CEP)
  → POST /usuarios → sucesso → alerta → redireciona ao Login

Logout:
  → limpa AsyncStorage → isAuthenticated = false → Login
```

---

## 🔁 Uso de TanStack Query

| Hook | Tipo | Query Key | Endpoint |
|------|------|-----------|----------|
| `useHealthMetrics` | composição | `['medicoes', ...]` | API Java (histórico de medições) |
| `useHealthOverview` | composição | `['medicoes', ...]`, `['alertas', ...]` | API Java (métricas + alertas) |
| `useAlertas` | `useQuery` | `['alertas', 'usuario']` | `/api/alertas/usuario/{usuarioId}` |
| `useDispositivos` | `useQuery` | `['dispositivos', 'usuario']` | `/api/dispositivos/usuario/{usuarioId}` |
| `useRecommendations` | `useQuery` + `useMutation` | `['recommendations', username]` | APEX `/recomendacoes/{username}` |
| `useMedicoes` | `useMutation` + `useQuery` | `['medicoes', 'vital', 'historico']`, `['medicoes', 'estresse', 'historico']` | API `/medicoes/...` |

- `staleTime` configurado em 2–5 minutos
- `invalidateQueries` chamado após toda mutation
- Estados `isLoading`, `isFetching`, `isError` usados nas telas
- QueryClient configurado no `App.tsx` com 2 retries

---

## 🚀 Instalação

### Pré-requisitos
- **Node.js** 18+
- **npm** ou **yarn**
- **Expo Go** no dispositivo físico ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779))

### Executar localmente

```bash
git clone https://github.com/Kauesamartino/NeocareApp.git
cd NeocareApp
npm install
npx expo start
```

Escaneie o QR Code com o Expo Go ou execute em emulador:

```bash
npm run android   # Android
npm run ios       # iOS (macOS)
```

---

## 🔧 Scripts

| Comando | Descrição |
|---------|-----------|
| `npm start` | Inicia Expo Dev Server |
| `npm run android` | Executa no Android |
| `npm run ios` | Executa no iOS |
| `npm run web` | Executa no navegador |
| `npx tsc --noEmit` | Verificação de tipos TypeScript |

---

## 🌐 API Endpoints — Exemplos

### Login
```http
POST /api/auth/login
Content-Type: application/json

{ "username": "kauesamartino", "password": "senha123" }
```
```json
{ "token": "eyJhbGciOiJIUzI1NiIs...", "username": "kauesamartino", "roles": ["USER"] }
```

### Cadastro
```http
POST /usuarios
Content-Type: application/json

{
  "nome": "Kaue", "sobrenome": "Samartino", "cpf": "471.691.468-27",
  "email": "kaue@email.com", "telefone": "(11) 99999-9999",
  "dataNascimento": "2000-01-15", "sexo": "MASCULINO",
  "altura": 1.75, "peso": 70.0,
  "credenciais": { "username": "kauesamartino", "password": "Senha123", "fullName": "Kaue Samartino" },
  "endereco": { "logradouro": "Rua X", "bairro": "Centro", "cep": "02314-070", "numero": "100", "cidade": "São Paulo", "uf": "SP" }
}
```

### Medição Vital
```http
POST /medicoes/medicao_vital
Content-Type: application/json

{ "usuarioId": 1, "dispositivoId": 1, "batimentosPorMinuto": 72, "oxigenacaoSangue": 98.0, "pressaoSistolica": 120, "pressaoDiastolica": 80 }
```

### Medição de Estresse
```http
POST /medicoes/medicao_estresse
Content-Type: application/json

{ "usuarioId": 1, "dispositivoId": 1, "variacaoFrequenciaCardiaca": 45.5, "condutividadePele": 2.3 }
```

---

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

Desenvolvido por Kauesamartino.
