## 5. Deployment DSL (DeployDSL)

### Environment Configuration

```mermaid
flowchart LR
    classDef env fill:#e1f5fe,stroke:#333,stroke-width:1px,color:#000000

    Dev["ENV-001: Development
    ---
    Description: Local development environment"]
    Staging["ENV-002: Staging
    ---
    Description: Pre-production testing environment"]
    Prod["ENV-003: Production
    ---
    Description: Production environment"]
    
    Dev --- Staging --- Prod
    
    class Dev,Staging,Prod env
```

### Infrastructure Components with Configuration

```mermaid
flowchart TD
    classDef env fill:#e1f5fe,stroke:#333,stroke-width:1px,color:#000000
    classDef infra fill:#fff9c4,stroke:#333,stroke-width:1px,color:#000000

    Dev["ENV-001: Development"]
    Staging["ENV-002: Staging"]
    Prod["ENV-003: Production"]
    
    Supabase["INFRA-001: Supabase PostgreSQL
    ---
    Service: Managed Supabase
    Config: Pro tier, Small compute
    Extensions: vector, pg_trgm"]
    
    AppServer["INFRA-002: App Server
    ---
    Service: EC2
    Instance: t3.medium
    Autoscaling: true
    Min/Max: 1-3 instances"]
    
    Collector["INFRA-003: Data Collector
    ---
    Service: Lambda
    Runtime: python3.9
    Memory: 1024MB
    Timeout: 900s
    Schedule: rate(1 hour)"]
    
    Embedder["INFRA-004: Embedding Processor
    ---
    Service: ECS
    CPU: 1
    Memory: 2048MB
    Autoscaling: true
    Min/Max: 1-5 instances"]
    
    Dashboard["INFRA-005: Web Dashboard
    ---
    Service: S3 + CloudFront
    Bucket: slack-analyzer-dashboard-${ENV}
    CloudFront: enabled"]
    
    SearchAPI["INFRA-006: Search API
    ---
    Service: API Gateway + Lambda
    Path: /api/search
    Method: POST
    Auth: API Key"]
    
    Dev --> Supabase
    
    Staging --> Supabase
    Staging --> AppServer
    Staging --> Collector
    Staging --> Embedder
    Staging --> Dashboard
    Staging --> SearchAPI
    
    Prod --> Supabase
    Prod --> AppServer
    Prod --> Collector
    Prod --> Embedder
    Prod --> Dashboard
    Prod --> SearchAPI
    
    class Dev,Staging,Prod env
    class Supabase,AppServer,Collector,Embedder,Dashboard,SearchAPI infra
```

### Service Deployment Details

```mermaid
flowchart TD
    classDef service fill:#e8f5e9,stroke:#333,stroke-width:1px,color:#000000
    classDef infra fill:#fff9c4,stroke:#333,stroke-width:1px,color:#000000
    classDef component fill:#e3f2fd,stroke:#333,stroke-width:1px,color:#000000

    S1["SVC-001: slack-collector-service
    ---
    Type: Scheduled Lambda Function
    Docker: slack-analyzer/collector:latest
    Env Vars: SLACK_BOT_TOKEN, SUPABASE_URL, SUPABASE_KEY"]
    
    S2["SVC-002: embedding-service
    ---
    Type: Container Service
    Docker: slack-analyzer/embedding:latest
    Env Vars: OPENAI_API_KEY, SUPABASE_URL, SUPABASE_KEY"]
    
    S3["SVC-003: analysis-service
    ---
    Type: EC2 Application
    Systemd Service: slack-analyzer
    Docker Compose: true
    Env Vars: SUPABASE_URL, SUPABASE_KEY"]
    
    S4["SVC-004: search-api-service
    ---
    Type: API Gateway Lambda
    Docker: slack-analyzer/search-api:latest
    Env Vars: SUPABASE_URL, SUPABASE_KEY"]
    
    S5["SVC-005: dashboard-ui
    ---
    Type: Static Website
    Build Command: npm run build
    Source: /dashboard
    Output: /dashboard/build
    Env Vars: REACT_APP_API_URL"]
    
    C1["COMP-001: Slack Data Collector"]
    C4["COMP-004: Embedding Engine"]
    C3_5["COMP-003/005: Conversation Reconstructor & Topic Analyzer"]
    C6["COMP-006: Search Engine"]
    C7["COMP-007: Insight Dashboard"]
    
    I3["INFRA-003: Lambda Data Collector"]
    I4["INFRA-004: ECS Embedding Processor"]
    I2["INFRA-002: EC2 App Server"]
    I6["INFRA-006: API Gateway + Lambda"]
    I5["INFRA-005: S3 + CloudFront"]
    
    S1 -->|"implements"| C1
    S2 -->|"implements"| C4
    S3 -->|"implements"| C3_5
    S4 -->|"implements"| C6
    S5 -->|"implements"| C7
    
    S1 -->|"deployed to"| I3
    S2 -->|"deployed to"| I4
    S3 -->|"deployed to"| I2
    S4 -->|"deployed to"| I6
    S5 -->|"deployed to"| I5
    
    class S1,S2,S3,S4,S5 service
    class C1,C4,C3_5,C6,C7 component
    class I3,I4,I2,I6,I5 infra
```

### CI/CD Workflow with Steps

```mermaid
flowchart TD
    classDef workflow fill:#e1bee7,stroke:#333,stroke-width:1px,color:#000000
    classDef step fill:#f3e5f5,stroke:#333,stroke-width:1px,color:#000000
    classDef env fill:#e1f5fe,stroke:#333,stroke-width:1px,color:#000000

    PR["Trigger: Pull Request"]
    Push["Trigger: Push to Main"]
    Release["Trigger: Release Tag"]
    
    CI1["CI-001: build-and-test
    ---
    Verifies changes in pull requests"]
    CI2["CI-002: deploy-staging
    ---
    Deploys changes to staging environment"]
    CI3["CI-003: deploy-production
    ---
    Deploys releases to production"]
    
    PR --> CI1
    Push --> CI2
    Release --> CI3
    
    CI1 --> Test["Test Steps:
    1. checkout
    2. install-dependencies
    3. run-linting
    4. run-unit-tests
    5. build-docker-images"]
    
    CI2 --> TestDeploy["Staging Deploy Steps:
    1. checkout
    2. install-dependencies
    3. run-linting
    4. run-unit-tests
    5. build-docker-images
    6. push-docker-images
    7. deploy-to-staging"]
    
    CI3 --> ProdDeploy["Production Deploy Steps:
    1. checkout
    2. install-dependencies
    3. build-docker-images
    4. push-docker-images
    5. deploy-to-production"]
    
    TestDeploy --> Staging["ENV-002: Staging"]
    ProdDeploy --> Prod["ENV-003: Production"]
    
    class CI1,CI2,CI3 workflow
    class Test,TestDeploy,ProdDeploy step
    class Staging,Prod env
```

These enhanced diagrams provide a more detailed visual representation of the Slack Analyzer system, including descriptions, responsibilities, configurations, and other important details from the original textual DSLs.
