# Node API - Clean Architecture

Este projeto implementa uma API RESTful em Node.js utilizando NestJS com arquitetura limpa (Clean Architecture), seguindo os princípios de separação de responsabilidades e inversão de dependência.

## Índice

- [Arquitetura](#-arquitetura)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Camadas e Responsabilidades](#-camadas-e-responsabilidades)
- [Instalação](#-instalação)
- [Como Usar](#-como-usar)
- [Padrões e Convenções](#-padrões-e-convenções)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)

## Arquitetura

Este projeto segue os princípios da **Clean Architecture** (Arquitetura Limpa) criada por Robert C. Martin (Uncle Bob). A arquitetura é organizada em camadas concêntricas, onde as dependências sempre apontam para o centro:

```
┌─────────────────────────────────┐
│        Presentation             │  ← Controllers, DTOs, Guards
├─────────────────────────────────┤
│        Application              │  ← Use Cases, Error Handling
├─────────────────────────────────┤
│        Domain                   │  ← Entities, Interfaces, DTOs
├─────────────────────────────────┤
│        Infrastructure           │  ← Database, External Services
└─────────────────────────────────┘
```

### Princípios Seguidos:

- **Independência de Frameworks**: O domínio não depende de frameworks externos
- **Inversão de Dependência**: Interfaces definem contratos, implementações são detalhes
- **Separação de Responsabilidades**: Cada camada tem uma responsabilidade específica
- **Testabilidade**: Código isolado e facilmente testável

## Estrutura do Projeto

```
src/
├── domain/                     # Camada de Domínio (Core Business)
│   ├── dtos/                   # Data Transfer Objects do domínio
│   ├── entities/               # Entidades de negócio
│   ├── repositories/           # Interfaces dos repositórios
│   ├── services/              # Interfaces dos serviços
│   └── usecase/               # Interfaces dos casos de uso
├── application/               # Camada de Aplicação (Use Cases)
│   ├── clients/               # Casos de uso de clientes
│   ├── login/                 # Casos de uso de autenticação
│   └── error.ts              # Tratamento de erros
├── infrastructure/            # Camada de Infraestrutura
│   ├── database/              # Configurações de banco de dados
│   ├── providers/             # Provedores de dependência
│   ├── repositories/          # Implementações dos repositórios
│   ├── services/             # Implementações dos serviços
│   └── tests/                # Testes de infraestrutura
└── presentation/             # Camada de Apresentação
    ├── modules/              # Módulos NestJS
    ├── dtos/                 # DTOs de entrada/saída da API
    ├── guards/               # Guards de autenticação
    └── strategies/           # Estratégias de autenticação
```

## Camadas e Responsabilidades

### 1. Domain (Domínio)
**Localização**: `src/domain/`

**Responsabilidades**:
- Definir as **regras de negócio** fundamentais
- Conter as **entidades** do sistema
- Definir **interfaces** para repositórios e serviços
- Ser **independente** de qualquer framework ou tecnologia externa

**Componentes**:
- **Entities**: Classes que representam objetos de negócio (`client.entity.ts`, `user.entity.ts`)
- **DTOs**: Objetos de transferência de dados para o domínio
- **Repositories**: Interfaces para acesso a dados
- **Services**: Interfaces para serviços externos
- **Use Cases**: Interfaces dos casos de uso

**Exemplo**:
```typescript
// domain/entities/client.entity.ts
export class IClient {
  id: string;
  name: string;
  domain: string;
  isActive: boolean;
  userId: string;
  // ... regras de negócio
}
```

### 2. Application (Aplicação)
**Localização**: `src/application/`

**Responsabilidades**:
- Implementar **casos de uso** específicos
- Orquestrar o **fluxo de dados** entre camadas
- Aplicar **regras de negócio** de alto nível
- Tratar **erros** da aplicação

**Componentes**:
- **Use Cases**: Implementação dos casos de uso do sistema
- **Error Handling**: Tratamento centralizado de erros

**Exemplo**:
```typescript
// application/clients/create.usecase.ts
@Injectable()
export class CreateClientUseCase implements ICreateClientUseCase {
  constructor(
    private clientRepository: IClientRepository,
    private userRepository: IUserRepository,
    private hashService: IHashService,
  ) {}

  async execute(createClientDto: CreateClientDto): Promise<IClient> {
    // Lógica do caso de uso
  }
}
```

### 3. Infrastructure (Infraestrutura)
**Localização**: `src/infrastructure/`

**Responsabilidades**:
- Implementar **interfaces** definidas no domínio
- Gerenciar **conexões** com banco de dados
- Implementar **serviços externos**
- Configurar **provedores** de dependência

**Componentes**:
- **Database**: Configurações e entidades do TypeORM
- **Repositories**: Implementações concretas dos repositórios
- **Services**: Implementações de serviços (hash, JWT, etc.)
- **Providers**: Configuração de injeção de dependência

**Exemplo**:
```typescript
// infrastructure/repositories/client.repository.ts
export class ClientRepository implements IClientRepository {
  constructor(private repo: Repository<ClientOrmEntity>) {}

  async findAll(userId?: string): Promise<IClient[]> {
    // Implementação específica do TypeORM
  }
}
```

### 4. Presentation (Apresentação)
**Localização**: `src/presentation/`

**Responsabilidades**:
- Expor **endpoints** da API
- Validar **dados de entrada**
- Serializar **dados de saída**
- Gerenciar **autenticação** e **autorização**

**Componentes**:
- **Controllers**: Endpoints da API REST
- **DTOs**: Objetos de entrada e saída da API
- **Guards**: Proteção de rotas
- **Modules**: Organização dos módulos NestJS
- **Strategies**: Estratégias de autenticação

**Exemplo**:
```typescript
// presentation/modules/clients/clients.controller.ts
@ApiTags('Clients')
@Controller('clients')
@UseGuards(JwtAuthGuard)
export class ClientsController {
  constructor(private readonly clientService: ClientsService) {}

  @Get()
  async findAll(@Query('userId') userId?: string, @Request() req?) {
    return this.clientService.findAll(req.user, userId);
  }
}
```

## Instalação

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou yarn
- MySQL

### Passos

1. **Clone o repositório**:
```bash
git clone <url-do-repositorio>
cd node-api
```

2. **Instale as dependências**:
```bash
npm install
```

3. **Configure as variáveis de ambiente**:
Crie um arquivo `.env` na raiz do projeto:
```env
# Database
DB_TYPE=
DB_HOST=
DB_PORT=
DB_USERNAME=
DB_PASSWORD=
DB_DATABASE=

# JWT
JWT_SECRET=
JWT_EXPIRES_IN=

# Application
PORT=
NODE_ENV=

# CORS
CORS_ORIGIN=
```

4. **Execute as migrações**:
```bash
npm run migration:run
```

5. **Inicie a aplicação**:
```bash
npm run start:dev
```

## Como Usar

### Autenticação

**Login**:
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}
```

### Clientes

**Listar clientes**:
```bash
GET /clients
Authorization: Bearer <jwt-token>
```

**Criar cliente**:
```bash
POST /clients
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "Nome do Cliente",
  "domain": "cliente.com",
  "userEmail": "admin@cliente.com",
  "userPassword": "senha123"
}
```

## Padrões e Convenções

### Criando Novos Recursos

Para manter a consistência da arquitetura limpa, siga estes passos ao criar novos recursos:

#### 1. Defina a Entidade (Domain)
```typescript
// src/domain/entities/produto.entity.ts
export interface IProduto {
  id: string;
  nome: string;
  preco: number;
  ativo: boolean;
  // ... outras propriedades
}
```

#### 2. Crie o Repository Interface (Domain)
```typescript
// src/domain/repositories/produto.repository.ts
export interface IProdutoRepository {
  findAll(): Promise<IProduto[]>;
  findById(id: string): Promise<IProduto | null>;
  create(produto: Partial<IProduto>): Promise<IProduto>;
  update(id: string, produto: Partial<IProduto>): Promise<IProduto>;
  delete(id: string): Promise<void>;
}
```

#### 3. Implemente os Use Cases (Application)
```typescript
// src/application/produtos/create.usecase.ts
@Injectable()
export class CreateProdutoUseCase {
  constructor(private produtoRepository: IProdutoRepository) {}

  async execute(dto: CreateProdutoDto): Promise<IProduto> {
    // Lógica do caso de uso
  }
}
```

#### 4. Implemente o Repository (Infrastructure)
```typescript
// src/infrastructure/repositories/produto.repository.ts
export class ProdutoRepository implements IProdutoRepository {
  constructor(private repo: Repository<ProdutoOrmEntity>) {}

  // Implementações...
}
```

#### 5. Crie o Controller (Presentation)
```typescript
// src/presentation/modules/produtos/produtos.controller.ts
@Controller('produtos')
export class ProdutosController {
  constructor(private createProdutoUseCase: CreateProdutoUseCase) {}

  @Post()
  async create(@Body() dto: CreateProdutoDto) {
    return this.createProdutoUseCase.execute(dto);
  }
}
```

### Convenções de Nomenclatura

- **Entities**: `IProduto`, `IUsuario` (Interface com prefixo "I")
- **DTOs**: `CreateProdutoDto`, `UpdateProdutoDto`
- **Use Cases**: `CreateProdutoUseCase`, `GetAllProdutosUseCase`
- **Repositories**: `IProdutoRepository` (interface), `ProdutoRepository` (implementação)
- **Controllers**: `ProdutosController`
- **Services**: `IHashService` (interface), `BcryptHashService` (implementação)

### Fluxo de Dados

```
Request → Controller → Use Case → Repository → Database
                    ↓
Response ← Controller ← Use Case ← Repository ← Database
```

## Scripts Disponíveis

```bash
# Desenvolvimento
npm run start:dev          # Inicia em modo desenvolvimento com hot reload
npm run start:debug        # Inicia em modo debug

# Produção
npm run build              # Compila o projeto
npm run start:prod         # Inicia em modo produção

# Banco de Dados
npm run migration:generate # Gera uma nova migration
npm run migration:run      # Executa as migrations pendentes
npm run migration:revert   # Desfaz a última migration

# Qualidade de Código
npm run lint              # Executa o linter
npm run format           # Formata o código com Prettier

# Testes
npm test                 # Executa os testes
npm run test:watch       # Executa os testes em modo watch
npm run test:coverage    # Executa os testes com cobertura
```

## Tecnologias Utilizadas

- **Framework**: NestJS
- **Linguagem**: TypeScript
- **Banco de Dados**: MySQL com TypeORM
- **Autenticação**: JWT (JSON Web Tokens)
- **Validação**: class-validator, class-transformer
- **Documentação**: Swagger/OpenAPI
- **Hash**: bcryptjs
- **Testes**: Jest
- **Linter**: ESLint + Prettier
