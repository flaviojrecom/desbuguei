
import { GoogleGenAI, Type } from "@google/genai";
import { TermData } from "../types";
import { supabase, isSupabaseConfigured } from "./supabase";
import { getEnv } from "../utils/env";

// 1. MOCK DATABASE (Fallback if Supabase is offline)
// Expandido com 20 termos mais comuns para funcionamento offline completo
const localDatabase: Record<string, TermData> = {
  "api": {
    id: "api",
    term: "API",
    fullTerm: "Application Programming Interface",
    category: "Desenvolvimento",
    definition: "APIs permitem que diferentes sistemas de software conversem entre si automaticamente, eliminando tarefas manuais e conectando sua empresa ao mercado digital.",
    phonetic: "Ei-pi-ai",
    slang: undefined,
    translation: "INTERFACE DE PROGRAMAÇÃO DE APLICATIVOS",
    examples: [
      { title: "AUTOMAÇÃO DE FLUXOS", description: "Elimina a intervenção humana ao conectar processos operacionais críticos." },
      { title: "SINCRONIZAÇÃO DE DADOS", description: "Mantém Vendas, RH e Financeiro atualizados em todas as plataformas." }
    ],
    analogies: [
      { title: "O GARÇOM NO RESTAURANTE", description: "Você (cliente) pede ao garçom (API), que leva o pedido à cozinha (sistema) e traz o prato." },
      { title: "TOMADA UNIVERSAL", description: "Interface padrão para conectar qualquer aparelho à energia sem saber como a rede funciona." }
    ],
    practicalUsage: {
      title: "Na reunião de alinhamento (Daily)",
      content: "Pessoal, a API de pagamentos caiu porque o gateway mudou a autenticação. Vou precisar refatorar a integração hoje à tarde pra gente voltar a vender."
    },
    relatedTerms: ["Endpoint", "JSON", "REST", "Webhook", "Gateway", "SDK"]
  },
  "docker": {
    id: "docker",
    term: "Docker",
    fullTerm: "Docker Container Platform",
    category: "Infraestrutura",
    definition: "Docker permite empacotar sua aplicação e todas suas dependências em um container isolado, garantindo que funcione igual em qualquer máquina, eliminando o clássico 'mas funciona na minha máquina'.",
    phonetic: "Dóquer",
    slang: undefined,
    translation: "PLATAFORMA DE CONTÊINERES",
    examples: [
      { title: "DEPLOY CONSISTENTE", description: "Mesma imagem Docker roda idêntica em desenvolvimento, teste e produção." },
      { title: "ESCALABILIDADE", description: "Subir múltiplas instâncias do container em segundos para lidar com picos de tráfego." }
    ],
    analogies: [
      { title: "CONTAINER DE NAVIO", description: "Assim como containers padronizados carregam qualquer mercadoria, Docker empacota qualquer app." },
      { title: "MÁQUINA VIRTUAL LEVE", description: "Como uma VM, mas muito menor e mais rápida - contém só o essencial." }
    ],
    practicalUsage: {
      title: "Na dailystandup",
      content: "A gente subiu o novo serviço em Docker e agora deploya em 30 segundos. Antes era 10 minutos manualmente."
    },
    relatedTerms: ["Kubernetes", "Contêiner", "Imagem", "Registry", "Dockerfile"]
  },
  "kubernetes": {
    id: "kubernetes",
    term: "Kubernetes",
    fullTerm: "Kubernetes Container Orchestration",
    category: "Infraestrutura",
    definition: "Kubernetes orquestra containers Docker em escala, automatizando deployment, scaling e gerenciamento de aplicações containerizadas em clusters de máquinas.",
    phonetic: "Ku-be-rné-tchis",
    slang: "K8s",
    translation: "ORQUESTRAÇÃO DE CONTÊINERES",
    examples: [
      { title: "AUTO-SCALING", description: "Aumenta/diminui containers automaticamente baseado em CPU/memória sem intervenção manual." },
      { title: "SELF-HEALING", description: "Se um container cai, Kubernetes sobe outro automaticamente." }
    ],
    analogies: [
      { title: "MAESTRO DE ORQUESTRA", description: "Kubernetes é o maestro que coordena múltiplos músicos (containers) para tocar a sinfonia (app)." },
      { title: "SISTEMA OPERACIONAL DISTRIBUÍDO", description: "Como um SO gerencia processos em um PC, K8s gerencia containers em múltiplas máquinas." }
    ],
    practicalUsage: {
      title: "Na reunião de infra",
      content: "A gente migrou pra Kubernetes e cortou 40% dos custos de servidor. O auto-scaling tá matando."
    },
    relatedTerms: ["Docker", "Pod", "Cluster", "Helm", "Service Mesh"]
  },
  "react": {
    id: "react",
    term: "React",
    fullTerm: "React - A JavaScript Library for Building User Interfaces",
    category: "Desenvolvimento",
    definition: "React é uma biblioteca JavaScript que permite construir interfaces de usuário reativas e responsivas usando componentes reutilizáveis, atualizando automaticamente a tela quando os dados mudam.",
    phonetic: "Ri-ét",
    slang: undefined,
    translation: "BIBLIOTECA DE CONSTRUÇÃO DE INTERFACES",
    examples: [
      { title: "COMPONENTES REUTILIZÁVEIS", description: "Um botão é um componente que você cria uma vez e usa em 50 lugares diferentes." },
      { title: "INTERFACE RESPONSIVA", description: "Quando um usuário clica, a tela atualiza instantaneamente sem recarregar a página." }
    ],
    analogies: [
      { title: "LEGO DE SOFTWARE", description: "React é como montar com blocos LEGO - você cria pequenas peças (componentes) e junta para fazer algo grande." },
      { title: "MAESTRO REATIVO", description: "React monitora seus dados e atualiza a tela automaticamente quando algo muda." }
    ],
    practicalUsage: {
      title: "No daily",
      content: "A gente usa React pra todos os projetos frontend agora. O Hot Module Replacement acelera muito o desenvolvimento."
    },
    relatedTerms: ["JavaScript", "Node.js", "Componente", "Estado", "Props", "JSX"]
  },
  "nodejs": {
    id: "nodejs",
    term: "Node.js",
    fullTerm: "Node.js - JavaScript Runtime Environment",
    category: "Desenvolvimento",
    definition: "Node.js permite executar JavaScript fora do navegador, no servidor, para construir APIs, servidores web e aplicações backend escaláveis.",
    phonetic: "Nód-dot-jês",
    slang: undefined,
    translation: "AMBIENTE DE EXECUÇÃO JAVASCRIPT",
    examples: [
      { title: "SERVIDOR WEB", description: "Você constrói um servidor HTTP que recebe requisições e devolve dados JSON." },
      { title: "PROCESSAMENTO ASSÍNCRONO", description: "Lidar com milhares de conexões simultâneas sem travar." }
    ],
    analogies: [
      { title: "JAVASCRIPT FORA DO NAVEGADOR", description: "Se JavaScript é o ator principal, Node.js o coloca no palco do servidor." },
      { title: "FÁBRICA DE REQUISIÇÕES", description: "Node.js é como uma fábrica que recebe pedidos (requisições) e produz respostas rapidamente." }
    ],
    practicalUsage: {
      title: "No standup",
      content: "Migramos a API de Python pra Node.js com Express e ganhamos 60% de performance. O gerenciamento de assincronismo é muito mais limpo."
    },
    relatedTerms: ["JavaScript", "Express", "NPM", "Async/Await", "JSON"]
  },
  "python": {
    id: "python",
    term: "Python",
    fullTerm: "Python - High-level Programming Language",
    category: "Desenvolvimento",
    definition: "Python é uma linguagem de programação simples e poderosa, usada para desenvolvimento backend, análise de dados, machine learning e automação, conhecida por sua sintaxe clara.",
    phonetic: "Pai-ton",
    slang: undefined,
    translation: "LINGUAGEM DE PROGRAMAÇÃO DE ALTO NÍVEL",
    examples: [
      { title: "ANÁLISE DE DADOS", description: "Processar milhões de linhas de dados com Pandas em algumas linhas de código." },
      { title: "MACHINE LEARNING", description: "Treinar modelos de IA com TensorFlow e Scikit-learn." }
    ],
    analogies: [
      { title: "LINGUAGEM PARA HUMANOS", description: "Python foi desenhada para ser fácil de ler, como um livro em português." },
      { title: "SUÍÇO DO DESENVOLVIMENTO", description: "Python faz um pouco de tudo bem - dados, web, automação, IA." }
    ],
    practicalUsage: {
      title: "Na reunião técnica",
      content: "A galera de dados usa Python pra fazer toda pipeline de ETL. Com Pandas e NumPy fica super rápido."
    },
    relatedTerms: ["Django", "FastAPI", "Pandas", "NumPy", "Scikit-learn", "TensorFlow"]
  },
  "ci-cd": {
    id: "ci-cd",
    term: "CI/CD",
    fullTerm: "Continuous Integration / Continuous Deployment",
    category: "Infraestrutura",
    definition: "CI/CD automatiza testes e deploy de código, permitindo que você faça mudanças com confiança múltiplas vezes por dia sem quebrar produção.",
    phonetic: "Ci-Ci-Dê",
    slang: undefined,
    translation: "INTEGRAÇÃO CONTÍNUA / ENTREGA CONTÍNUA",
    examples: [
      { title: "TESTES AUTOMÁTICOS", description: "Cada vez que você faz um commit, todos os testes rodam automaticamente." },
      { title: "DEPLOY AUTOMÁTICO", description: "Se os testes passarem, seu código sobe para produção automaticamente." }
    ],
    analogies: [
      { title: "LINHA DE MONTAGEM AUTOMATIZADA", description: "Como uma fábrica de carros onde cada etapa é verificada automaticamente." },
      { title: "GUARDIÃO DO CÓDIGO", description: "CI/CD é como ter um inspetor que verifica toda mudança antes de entrar em produção." }
    ],
    practicalUsage: {
      title: "No planning",
      content: "A gente usa GitHub Actions pra CI/CD. Qualquer PR que quebra os testes não merge. Ficamos muito mais confiantes em deploy."
    },
    relatedTerms: ["GitHub Actions", "Jenkins", "GitLab CI", "Deploy", "Pipeline"]
  },
  "microservices": {
    id: "microservices",
    term: "Microservices",
    fullTerm: "Microservices Architecture",
    category: "Infraestrutura",
    definition: "Arquitetura onde a aplicação é dividida em serviços pequenos, independentes e especializados que se comunicam entre si, permitindo escalabilidade e manutenção independente.",
    phonetic: "Maj-kró-sér-vices",
    slang: undefined,
    translation: "ARQUITETURA DE MICROSSERVIÇOS",
    examples: [
      { title: "ESCALAR PARTES INDEPENDENTES", description: "Se o serviço de pagamento explode de carga, você escala só ele, não a aplicação inteira." },
      { title: "TIMES INDEPENDENTES", description: "Um time cuida do serviço de autenticação, outro do carrinho de compras, sem pisar nos pés um do outro." }
    ],
    analogies: [
      { title: "RESTAURANTE COM COZINHAS ESPECIALIZADAS", description: "Em vez de uma cozinha faz tudo, você tem uma só para carnes, outra para saladas." },
      { title: "CIDADE COM BAIRROS ESPECIALIZADOS", description: "Cada bairro tem seus serviços (mercado, escola), e se um bairro cresce, você expande só aquele." }
    ],
    practicalUsage: {
      title: "Na retrospectiva",
      content: "A gente refatorou de monolito para microservices. Deploy ficou muito mais rápido porque cada serviço é independente."
    },
    relatedTerms: ["Docker", "Kubernetes", "API", "Service Mesh", "Monolito"]
  },
  "serverless": {
    id: "serverless",
    term: "Serverless",
    fullTerm: "Serverless Computing",
    category: "Infraestrutura",
    definition: "Serverless permite executar código sem gerenciar servidores - você escreve a função, faz upload e ela escala automaticamente, pagando apenas pelo tempo de execução.",
    phonetic: "Sér-ver-less",
    slang: undefined,
    translation: "COMPUTAÇÃO SEM SERVIDOR",
    examples: [
      { title: "FUNCIONA AUTOMÁTICO", description: "A função inicia em milissegundos, processa o requisito e termina. Nenhum servidor rodando à toa." },
      { title: "ESCALA INFINITA", description: "Se 100 ou 1.000.000 de requisições chegam, serverless escala automaticamente." }
    ],
    analogies: [
      { title: "ELETRICIDADE SOB DEMANDA", description: "Você não compra um gerador - paga pelo que consome quando consome." },
      { title: "RESTAURANTE DELIVERY", description: "Você cozinha sob demanda quando há pedidos, não mantém comida pronta o tempo todo." }
    ],
    practicalUsage: {
      title: "No daily",
      content: "A gente usa AWS Lambda para processar webhooks. Muito mais barato que ter um servidor rodando 24/7 esperando eventos."
    },
    relatedTerms: ["AWS Lambda", "Google Cloud Functions", "Azure Functions", "Event-Driven"]
  },
  "machine-learning": {
    id: "machine-learning",
    term: "Machine Learning",
    fullTerm: "Machine Learning - Artificial Intelligence Subfield",
    category: "Dados & IA",
    definition: "Machine Learning é a capacidade de sistemas aprenderem padrões com dados, fazendo previsões ou decisões sem serem explicitamente programados.",
    phonetic: "Machín Lérning",
    slang: "ML",
    translation: "APRENDIZADO DE MÁQUINA",
    examples: [
      { title: "RECOMENDAÇÕES", description: "Netflix aprende sua preferência de filmes e recomenda o próximo que você quer assistir." },
      { title: "DETECÇÃO DE FRAUDE", description: "Bancos usam ML para detectar transações suspeitas automaticamente." }
    ],
    analogies: [
      { title: "APRENDER COM EXEMPLOS", description: "Assim como uma criança aprende reconhecendo objetos, ML treina com exemplos." },
      { title: "PADRÃO NOS DADOS", description: "ML é como encontrar consistências em milhões de eventos para fazer previsões." }
    ],
    practicalUsage: {
      title: "No standup",
      content: "Treinamos um modelo com Scikit-learn pra prever churn de clientes. A acurácia foi 94%, muito acima do que esperávamos."
    },
    relatedTerms: ["Deep Learning", "Neural Networks", "Data Science", "Python", "TensorFlow"]
  },
  "llm": {
    id: "llm",
    term: "LLM",
    fullTerm: "Large Language Model",
    category: "Dados & IA",
    definition: "LLMs são modelos de IA treinados em bilhões de textos que conseguem entender e gerar linguagem natural, permitindo conversas, resumos e análise de texto.",
    phonetic: "Él-él-ém",
    slang: undefined,
    translation: "MODELO DE LINGUAGEM GRANDE",
    examples: [
      { title: "CHAT INTELIGENTE", description: "ChatGPT é um LLM que conversa naturalmente com você." },
      { title: "GERAÇÃO DE CÓDIGO", description: "LLMs conseguem escrever código baseado em instruções em português." }
    ],
    analogies: [
      { title: "WIKIPEDIA COM BRAÇO", description: "LLM é como Wikipedia mas que consegue responder perguntas em linguagem natural." },
      { title: "PREDITOR INTELIGENTE", description: "LLM aprendeu padrões de texto e consegue prever a próxima palavra/frase com precisão." }
    ],
    practicalUsage: {
      title: "Na reunião de produto",
      content: "Integramos um LLM na plataforma para gerar summaries automáticas de conversas. Economizamos 40% do tempo de suporte."
    },
    relatedTerms: ["GPT", "BERT", "Transformer", "Neural Networks", "AI"]
  },
  "cybersecurity": {
    id: "cybersecurity",
    term: "Cybersecurity",
    fullTerm: "Cybersecurity - Security of Computer Systems",
    category: "Segurança",
    definition: "Cybersecurity é a proteção de sistemas, redes e dados contra ataques maliciosos, usando técnicas como criptografia, firewalls e autenticação.",
    phonetic: "Cáibe-segurança",
    slang: undefined,
    translation: "SEGURANÇA CIBERNÉTICA",
    examples: [
      { title: "PROTEÇÃO DE DADOS", description: "Criptografar senhas para que hackers não consigam usá-las." },
      { title: "DETECÇÃO DE ATAQUES", description: "Monitorar acessos suspeitos e bloquear antes que danifiquem o sistema." }
    ],
    analogies: [
      { title: "SEGURANÇA DE BANCO", description: "Como um banco tem cofre, câmeras e seguranças, cybersecurity protege seus dados." },
      { title: "CASTELO COM MUROS", description: "Você constrói múltiplas camadas de defesa (muro, fossado, guarda) contra invasores." }
    ],
    practicalUsage: {
      title: "No sprint planning",
      content: "Implementamos 2FA em tudo e começamos a fazer code review focado em segurança. Reduzimos vulnerabilidades em 80%."
    },
    relatedTerms: ["Criptografia", "Firewall", "Autenticação", "Zero Trust", "VPN"]
  },
  "zero-trust": {
    id: "zero-trust",
    term: "Zero Trust",
    fullTerm: "Zero Trust Security Model",
    category: "Segurança",
    definition: "Zero Trust é uma estratégia de segurança que não confia em ninguém por padrão - cada acesso é verificado, cada dispositivo é autenticado, mesmo dentro da rede.",
    phonetic: "Zíro Trust",
    slang: undefined,
    translation: "CONFIANÇA ZERO",
    examples: [
      { title: "NUNCA CONFIE", description: "Um funcionário VPN não tem acesso automático - precisa provar quem é toda vez." },
      { title: "SEGMENTAÇÃO", description: "Um dev não pode acessar dados de RH só porque está na rede corporativa." }
    ],
    analogies: [
      { title: "PARANOIA COMO SEGURANÇA", description: "Zero Trust é paranoia sistemática - assume que todo acesso é suspeito até prova contrária." },
      { title: "PASSAPORTE CONSTANTE", description: "Como um aeroporto que pede documento a cada passagem de pórtico, Zero Trust pede prova a cada acesso." }
    ],
    practicalUsage: {
      title: "Na reunião de compliance",
      content: "Implementamos Zero Trust e agora tudo precisa de MFA, IP whitelisting e certificado. Mais chato mas muito mais seguro."
    },
    relatedTerms: ["MFA", "VPN", "Firewall", "Autenticação", "Criptografia"]
  },
  "firewall": {
    id: "firewall",
    term: "Firewall",
    fullTerm: "Firewall - Network Security System",
    category: "Segurança",
    definition: "Firewall é um sistema que controla o tráfego entre redes, permitindo ou bloqueando conexões baseado em regras de segurança.",
    phonetic: "Fáier-wol",
    slang: undefined,
    translation: "PAREDE DE FOGO",
    examples: [
      { title: "BLOQUEAR PORTAS", description: "Fechar a porta 3389 para impedir RDP de fora." },
      { title: "INSPECIONAR TRÁFEGO", description: "Analisar dados que entram para detectar malware." }
    ],
    analogies: [
      { title: "PORTEIRO DO PRÉDIO", description: "Firewall é como um porteiro que verifica cada pessoa que entra." },
      { title: "ADUANEIRO DIGITAL", description: "Assim como aduaneiro verifica bagagens, firewall verifica pacotes de dados." }
    ],
    practicalUsage: {
      title: "No standup infra",
      content: "Configuramos regras no firewall pra bloquear IPs que tentam força bruta. Diminuiu ataques em 95%."
    },
    relatedTerms: ["VPN", "Proxy", "IDS", "Criptografia", "Segurança"]
  },
  "vpn": {
    id: "vpn",
    term: "VPN",
    fullTerm: "Virtual Private Network",
    category: "Segurança",
    definition: "VPN cria um túnel criptografado para suas conexões, ocultando seu IP real e protegendo dados de serem interceptados, como se você estivesse dentro de uma rede privada.",
    phonetic: "Vê-pê-ên",
    slang: undefined,
    translation: "REDE PRIVADA VIRTUAL",
    examples: [
      { title: "ACESSAR REDE CORPORATIVA", description: "Um funcionário em casa acessa o servidor corporativo com segurança." },
      { title: "WIFI PÚBLICO SEGURO", description: "Usar WiFi do aeroporto sem risco porque VPN criptografa tudo." }
    ],
    analogies: [
      { title: "ENVELOPE SELADO", description: "VPN é como colocar sua carta em um envelope selado antes de enviar pelo correio." },
      { title: "TÚNEL INVISÍVEL", description: "Você trafega através de um túnel secreto onde ninguém vê para onde está indo." }
    ],
    practicalUsage: {
      title: "No daily standup",
      content: "Implementamos VPN obrigatória pra acessar produção. Agora não precisa whitelist de IP, é mais seguro e flexível."
    },
    relatedTerms: ["Criptografia", "Firewall", "Proxy", "Segurança", "Autenticação"]
  },
  "encryption": {
    id: "encryption",
    term: "Encryption",
    fullTerm: "Encryption - Data Security Technique",
    category: "Segurança",
    definition: "Encryption converte dados em código que só pode ser lido com uma chave secreta, impedindo que informações sensíveis sejam lidas se interceptadas.",
    phonetic: "En-crip-ção",
    slang: undefined,
    translation: "CRIPTOGRAFIA",
    examples: [
      { title: "SENHA SEGURA", description: "Seu password é criptografado no banco de dados - nem o admin consegue ler." },
      { title: "MENSAGENS PRIVADAS", description: "WhatsApp usa criptografia end-to-end, nem WhatsApp consegue ler suas mensagens." }
    ],
    analogies: [
      { title: "COFRE COM SENHA", description: "Encryption é como um cofre que só quem tem a senha consegue abrir." },
      { title: "CÓDIGO SECRETO", description: "Como um código militar onde só quem tem a chave consegue decodificar." }
    ],
    practicalUsage: {
      title: "Na reunião de compliance",
      content: "Implementamos criptografia end-to-end nos dados de clientes. Agora cumpre LGPD e dados sensíveis ficam realmente privados."
    },
    relatedTerms: ["Criptografia", "Hash", "SSL/TLS", "Chave", "Segurança"]
  },
  "agile": {
    id: "agile",
    term: "Agile",
    fullTerm: "Agile Software Development",
    category: "Agile & Produto",
    definition: "Agile é uma metodologia que prioriza entrega contínua, feedback rápido e adaptação, em vez de planejamento rígido - você trabalha em ciclos curtos e muda conforme aprende.",
    phonetic: "A-jáil",
    slang: undefined,
    translation: "DESENVOLVIMENTO ÁGIL",
    examples: [
      { title: "SPRINTS", description: "Trabalhar em ciclos de 2 semanas entregando features completas." },
      { title: "FEEDBACK CONTÍNUO", description: "Usuários testam o que você fez e você adapta rapidamente." }
    ],
    analogies: [
      { title: "DANÇA vs APRESENTAÇÃO TEÓRICA", description: "Agile é como aprender dança praticando, não lendo um livro sobre dança." },
      { title: "RODAS DE CARRO ENQUANTO DIRIGE", description: "Em vez de construir o carro perfeito no garagem, você constrói, dirige, e ajusta a rota." }
    ],
    practicalUsage: {
      title: "No retro",
      content: "Adotamos Agile e mudou tudo. Agora entregamos features a cada sprint e o cliente vê progresso semana a semana."
    },
    relatedTerms: ["Scrum", "Kanban", "Sprint", "Backlog", "Retrospectiva"]
  },
  "scrum": {
    id: "scrum",
    term: "Scrum",
    fullTerm: "Scrum - Agile Framework",
    category: "Agile & Produto",
    definition: "Scrum é um framework Agile que organiza o trabalho em sprints (ciclos), com reuniões diárias, planejamento e retrospectivas para melhorar continuamente.",
    phonetic: "Escrom",
    slang: undefined,
    translation: "FRAMEWORK ÁGIL",
    examples: [
      { title: "DAILY STANDUP", description: "Reunião de 15min toda manhã - o que fiz, o que vou fazer, bloqueadores." },
      { title: "SPRINT REVIEW", description: "Mostrar o que foi entregue na sprint pra stakeholders validarem." }
    ],
    analogies: [
      { title: "RUGBY STRATEGY", description: "Scrum vem do rugby - time trabalha junto num movimento sincronizado." },
      { title: "CICLOS CONSTANTES", description: "Como um motor com pistões em ciclos contínuos, Scrum tem sprints repetidas." }
    ],
    practicalUsage: {
      title: "No sprint planning",
      content: "Usamos Scrum com sprints de 2 semanas. Estimativa com story points, daily standup, e retro toda sexta. Matador pra equipes ágeis."
    },
    relatedTerms: ["Agile", "Sprint", "Backlog", "Story Point", "Retrospectiva"]
  },
  "kanban": {
    id: "kanban",
    term: "Kanban",
    fullTerm: "Kanban - Agile Methodology",
    category: "Agile & Produto",
    definition: "Kanban é uma metodologia visual que organiza o trabalho em colunas (To Do, Doing, Done), limitando o que está em progresso para melhorar fluxo e reduzir gargalos.",
    phonetic: "Kan-bam",
    slang: undefined,
    translation: "METODOLOGIA DE FLUXO CONTÍNUO",
    examples: [
      { title: "LIMITE WIP", description: "Máximo 3 tarefas por dev simultaneamente - foco melhor, menos context switching." },
      { title: "VISUALIZAR BLOQUEADORES", description: "Se muitas tarefas ficam em 'Code Review', você vê que é um gargalo." }
    ],
    analogies: [
      { title: "CORREIA DE MONTAGEM", description: "Kanban é como uma correia de fábrica - visualiza fluxo e tira bloqueadores." },
      { title: "TÁXI COM LIMITE DE PASSAGEIROS", description: "Em vez de carregar todos, você limita pra ir mais rápido." }
    ],
    practicalUsage: {
      title: "No daily",
      content: "Migramos de Scrum para Kanban porque precisava de mais flexibilidade. Agora prioridades mudam sem quebrar sprint."
    },
    relatedTerms: ["Agile", "WIP Limit", "Backlog", "Fluxo", "Scrum"]
  },
  "mvp": {
    id: "mvp",
    term: "MVP",
    fullTerm: "Minimum Viable Product",
    category: "Agile & Produto",
    definition: "MVP é a versão mais simples do seu produto com apenas as features essenciais para resolver o problema principal, permitindo validar a ideia com usuários reais rapidamente.",
    phonetic: "Ém-vê-pê",
    slang: undefined,
    translation: "PRODUTO VIÁVEL MÍNIMO",
    examples: [
      { title: "PRIMEIRO PROTÓTIPO", description: "Uber começou permitindo chamar um carro por SMS - viável e testava a demanda." },
      { title: "FEEDBACK RÁPIDO", description: "Lançar com 3 features e ouvir cliente antes de gastar 6 meses desenvolvendo tudo." }
    ],
    analogies: [
      { title: "AVIÃO ANTES DE FOGUETE", description: "Antes de enviar um foguete pra lua, você testa com um avião." },
      { title: "RECEITA MÍNIMA", description: "MVP é como fazer a receita de bolo mais simples antes de virar chef de cozinha." }
    ],
    practicalUsage: {
      title: "Na reunião de produto",
      content: "Lançamos MVP com 5 features e 2 mil usuários testaram. Feedback mostrou que feature 3 era inútil. Economizou semanas de dev."
    },
    relatedTerms: ["Produto", "Validação", "Iteração", "Agile", "Feedback"]
  },
  "product-market-fit": {
    id: "product-market-fit",
    term: "Product Market Fit",
    fullTerm: "Product-Market Fit",
    category: "Agile & Produto",
    definition: "Product-Market Fit é quando seu produto resolve um problema real que muitas pessoas têm e estão dispostas a pagar por isso - o momento em que tudo encaixa.",
    phonetic: "Próduto Márket Fit",
    slang: undefined,
    translation: "ENCAIXE PRODUTO-MERCADO",
    examples: [
      { title: "CRESCIMENTO ORGÂNICO", description: "Usuários indicam seu produto naturalmente pra amigos porque adoram." },
      { title: "RETENÇÃO ALTA", description: "Mais de 80% dos usuários continuam usando seu app depois de um mês." }
    ],
    analogies: [
      { title: "CHAVE NA FECHADURA", description: "PMF é quando você encontra a chave certa pra fechadura certa - encaixa perfeitamente." },
      { title: "SAPATO CONFORTÁVEL", description: "Quando seu produto é tão confortável que usuários não conseguem tirar." }
    ],
    practicalUsage: {
      title: "No board meeting",
      content: "Atingimos PMF quando churn caiu de 15% pra 3% e NPS foi pra 72. Aí sim começamos a gastar com marketing e scaling."
    },
    relatedTerms: ["Produto", "Mercado", "Validação", "Crescimento", "Retenção"]
  }
};

// Helper para inicializar a IA apenas quando necessário
const getAIClient = () => {
  const apiKey = getEnv('VITE_GEMINI_API_KEY');
  if (!apiKey) {
    throw new Error("API Key não configurada. Verifique as configurações no .env.local (VITE_GEMINI_API_KEY).");
  }
  return new GoogleGenAI({ apiKey });
};

// Helper to normalize IDs (e.g. "React JS" -> "react-js")
const normalizeId = (text: string) => {
    return text.toLowerCase().trim().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
}

export const getTermData = async (termId: string): Promise<TermData> => {
  // Use simple lowercase for checking localDB/keys, but slugify for DB
  const rawId = termId.toLowerCase().trim();
  const dbId = normalizeId(termId);

  console.log(`[getTermData] Buscando termo: "${termId}" (rawId: "${rawId}", dbId: "${dbId}")`);

  // 1. STRATEGY: READ-THROUGH CACHING (Supabase -> Cache Miss -> Gemini -> Save)

  // A. Check Supabase (The Source of Truth)
  if (isSupabaseConfigured()) {
      try {
          const { data, error } = await supabase
            .from('terms')
            .select('*')
            .eq('id', dbId)
            .single();

          if (data && data.content) {
              console.log("Hit from Supabase:", dbId);
              return data.content as TermData;
          }
      } catch (err) {
          console.warn("Supabase fetch failed, falling back to AI/Local", err);
      }
  }

  // B. Fallback to Local Mock (Instant response for demos)
  if (localDatabase[rawId]) {
    return localDatabase[rawId];
  }

  // C. Generate with Gemini (Cache Miss)
  try {
    console.log(`[getTermData] Cache miss - tentando gerar com Gemini...`);
    const ai = getAIClient(); // Inicializa aqui para evitar erros globais

    console.log(`[getTermData] Cliente Gemini criado. Enviando requisição...`);
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash", 
      contents: `You are a technical glossary for business executives. Define the term "${termId}".
      
      Requirements:
      1. 'fullTerm': The full English name or expansion.
      2. 'translation': Translate the essence to Portuguese.
      3. 'definition': A clear, business-focused definition in Portuguese.
      4. 'phonetic': Portuguese pronunciation hint.
      5. 'slang': Common slang (or null).
      6. 'examples': 2 business contexts.
      7. 'analogies': 2 simple analogies.
      8. 'practicalUsage': Realistic sentence in Portuguese used by developers.
      9. 'relatedTerms': Up to 6 related keywords.
      10. 'category': Pick one: Desenvolvimento, Infraestrutura, Dados & IA, Segurança, Agile & Produto.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            term: { type: Type.STRING },
            fullTerm: { type: Type.STRING },
            category: { type: Type.STRING },
            definition: { type: Type.STRING },
            phonetic: { type: Type.STRING },
            slang: { type: Type.STRING, nullable: true },
            translation: { type: Type.STRING },
            examples: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: { title: { type: Type.STRING }, description: { type: Type.STRING } }
              }
            },
            analogies: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: { title: { type: Type.STRING }, description: { type: Type.STRING } }
              }
            },
            practicalUsage: {
              type: Type.OBJECT,
              properties: { title: { type: Type.STRING }, content: { type: Type.STRING } }
            },
            relatedTerms: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });

    if (response.text) {
      try {
        const data = JSON.parse(response.text) as TermData;
      data.id = dbId; // Enforce consistent ID
      
      // Defaults
      data.examples = Array.isArray(data.examples) ? data.examples : [];
      data.analogies = Array.isArray(data.analogies) ? data.analogies : [];
      data.relatedTerms = Array.isArray(data.relatedTerms) ? data.relatedTerms : [];
      data.fullTerm = data.fullTerm || data.term;
      if (!data.practicalUsage) {
         data.practicalUsage = { title: "Contexto Geral", content: "Termo usado frequentemente em reuniões de tecnologia." };
      }

      // D. Save to Supabase (Async - Fire and Forget for user speed, await for data integrity)
      if (isSupabaseConfigured()) {
          // We insert into the 'terms' table structure defined in Phase 1
          supabase.from('terms').insert({
              id: dbId,
              term: data.term,
              category: data.category,
              definition: data.definition, // Plain text for search
              content: data // The full JSON blob
          }).then(({ error }) => {
              if (error) console.error("Error saving to Supabase:", error);
              else console.log("Saved to Supabase:", dbId);
          });
      }

      console.log(`[getTermData] Sucesso! Termo gerado e salvo.`);
      return data;
      } catch (jsonError) {
        console.error("[getTermData] JSON parse error - resposta malformada:", jsonError);
        console.error("[getTermData] Resposta recebida:", response.text?.substring(0, 500) + "...");
        throw new Error("API retornou JSON inválido. Tente novamente em alguns instantes.");
      }
    }
  } catch (error) {
    // Handle API rate limiting (429 - Too Many Requests)
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('429') || errorMessage.includes('quota')) {
      console.warn('[getTermData] API quota exceeded (429). Using local database fallback.');
    }

    console.error("[getTermData] AI Generation failed:", error);
    if (error instanceof Error) {
      console.error("[getTermData] Error details:", error.message);
      if (error.message.includes('API key')) {
        console.error('[getTermData] API key not configured or invalid');
      }
    }
    // Graceful degradation: if API fails, return local data or throw
  }

  console.error(`[getTermData] FALHOU: Termo "${termId}" não encontrado em nenhuma fonte`);
  throw new Error("Termo não encontrado.");
};

// --- SEEDING UTILITY (THE ROBOT) ---
// This function allows the user to populate the DB with a list of terms.
// It accepts an optional custom list. If not provided, uses a default set.
export const seedDatabase = async (onProgress: (log: string) => void, customList?: string[]) => {
    if (!isSupabaseConfigured()) {
        onProgress("ERRO: Supabase não configurado. Verifique suas chaves API.");
        return;
    }

    const defaultList = [
        "Kubernetes", "Docker", "CI/CD", "Microservices", "Serverless",
        "React", "Node.js", "Python", "Machine Learning", "LLM",
        "Cybersecurity", "Zero Trust", "Firewall", "VPN", "Encryption",
        "Agile", "Scrum", "Kanban", "MVP", "Product Market Fit"
    ];

    const listToProcess = customList && customList.length > 0 ? customList : defaultList;

    onProgress(`Iniciando carga de ${listToProcess.length} termos...`);
    onProgress(`Atenção: Isso consome tokens da sua API Key.`);

    for (const term of listToProcess) {
        if (!term.trim()) continue;
        
        onProgress(`Processando: ${term}...`);
        try {
            // Calling getTermData automatically checks DB, if missing generates via AI, and saves to DB.
            await getTermData(term);
            onProgress(`✅ ${term} salvo/verificado com sucesso.`);
        } catch (e) {
            onProgress(`❌ Erro ao processar ${term}: Tente novamente.`);
        }
        // Small delay to avoid rate limits
        await new Promise(r => setTimeout(r, 1500));
    }

    onProgress("Carga finalizada! Seu banco de dados agora está mais inteligente.");
};
