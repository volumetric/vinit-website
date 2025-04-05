# Enhanced Visual Representations of Slack Analyzer DSLs

This document contains detailed visual representations of the Domain-Specific Languages (DSLs) defined for the Slack Conversation Analyzer system.

## 1. Requirements DSL (ReqDSL)

### System Specification

```mermaid
flowchart TD
    classDef reqClass fill:#f9f9f9,stroke:#333,stroke-width:1px,color:#000000
    classDef stakeholderClass fill:#e0f7fa,stroke:#333,stroke-width:1px,color:#000000

    Spec["SCA-SPEC-001
    Slack Conversation Analyzer System
    ---
    Description: A system to analyze Slack conversations for a SaaS company"] 
    
    Founder["Stakeholder: Founder
    ---
    Needs: Understand what's happening across company communications"]
    
    Analyst["Stakeholder: Data Analyst
    ---
    Needs: Extract insights from conversation data"]
    
    Spec --> Founder
    Spec --> Analyst
    
    class Spec reqClass
    class Founder,Analyst stakeholderClass
```

### Functional Requirements

```mermaid
flowchart TD
    classDef funcReq fill:#e1f5fe,stroke:#333,stroke-width:1px,color:#000000

    F001["REQ-F001: Slack Data Collection
    ---
    Priority: High
    ---
    Description: Collect and store raw message data
    from all relevant Slack channels
    ---
    Acceptance Criteria:
    • Collect messages from public channels
    • Collect messages from private channels
    • Collect direct messages with permissions
    • Collect messages from group chats with permissions
    • Store message metadata
    • Store files and media shared on slack on S3"] 
    
    F002["REQ-F002: Thread Reconstruction
    ---
    Priority: Medium
    ---
    Description: Reconstruct conversation threads
    from individual messages
    ---
    Acceptance Criteria:
    • Group thread replies with parent messages
    • Maintain chronological ordering"]
    
    F003["REQ-F003: Conversation Embeddings
    ---
    Priority: High
    ---
    Description: Generate vector embeddings
    of messages and conversations
    ---
    Acceptance Criteria:
    • Generate embeddings at message and thread levels
    • Use appropriate embedding models"]
    
    F004["REQ-F004: Topic Analysis
    ---
    Priority: Medium
    ---
    Description: Identify common topics being
    discussed across channels
    ---
    Acceptance Criteria:
    • Identify topics without predefined categories
    • Show topic distribution across channels"]
    
    F005["REQ-F005: Semantic Search
    ---
    Priority: High
    ---
    Description: Allow searching for conversations
    by concept, not just keywords
    ---
    Acceptance Criteria:
    • Return relevant results without exact terms
    • Rank results by relevance"]
    
    F006["REQ-F006: Insight Dashboard
    ---
    Priority: Medium
    ---
    Description: Provide visualization of
    conversation insights
    ---
    Acceptance Criteria:
    • Show activity trends over time
    • Highlight emerging topics"]
    
    F001 -->|"dependency"| F002
    F001 -->|"dependency"| F003
    F002 -->|"dependency"| F003
    F003 -->|"dependency"| F004
    F003 -->|"dependency"| F005
    F004 -->|"dependency"| F006
    
    class F001,F002,F003,F004,F005,F006 funcReq
```

### Non-Functional Requirements

```mermaid
flowchart TD
    classDef nonFuncReq fill:#fff9c4,stroke:#333,stroke-width:1px,color:#000000
    
    NF001["REQ-NF001: Data Privacy
    ---
    Priority: High
    ---
    Description: Ensure appropriate access controls
    for sensitive conversations
    ---
    Acceptance Criteria:
    • Track conversation source and privacy level
    • Restrict access based on user permissions"]
    
    NF002["REQ-NF002: Performance
    ---
    Priority: Medium
    ---
    Description: System should handle conversation
    history for a 30-person company
    ---
    Acceptance Criteria:
    • Process daily conversation volume within 1 hour
    • Return search results in < 2 seconds"]
    
    NF003["REQ-NF003: Scalability
    ---
    Priority: Low
    ---
    Description: System should scale as company
    and conversation volume grows
    ---
    Acceptance Criteria:
    • Support growth to 100 employees without
      architecture changes"]
    
    class NF001,NF002,NF003 nonFuncReq
```

## 2. Architecture DSL (ArchDSL)

### Component Diagram

```mermaid
flowchart TD
    classDef component fill:#e3f2fd,stroke:#333,stroke-width:1px,color:#000000
    classDef datastore fill:#e8f5e9,stroke:#333,stroke-width:1px,color:#000000
    classDef interface fill:#f5f5f5,stroke:#333,stroke-width:1px,color:#000000

    C1["COMP-001: Slack Data Collector
    ---
    Responsibilities:
    • Connect to Slack API
    • Extract message history
    • Extract user profiles
    • Extract channel information"] 
    
    C2["COMP-002: Data Storage
    ---
    Responsibilities:
    • Store raw messages
    • Store user information
    • Store channel information
    • Store vector embeddings"]
    
    C3["COMP-003: Conversation Reconstructor
    ---
    Responsibilities:
    • Group messages into threads
    • Handle sequential messages
    • Create conversation units"]
    
    C4["COMP-004: Embedding Engine
    ---
    Responsibilities:
    • Preprocess text for embedding
    • Generate message-level embeddings
    • Generate thread-level embeddings
    • Store embeddings in vector database"]
    
    C5["COMP-005: Topic Analyzer
    ---
    Responsibilities:
    • Cluster embeddings into topics
    • Label detected topics
    • Track topic changes over time"]
    
    C6["COMP-006: Search Engine
    ---
    Responsibilities:
    • Process search queries
    • Convert queries to embeddings
    • Perform vector similarity search
    • Rank and return results"]
    
    C7["COMP-007: Insight Dashboard
    ---
    Responsibilities:
    • Generate activity visualizations
    • Show topic distributions
    • Display trend analysis"]
    
    DS1["DS-001: Supabase PostgreSQL Database
    ---
    Data Entities:
    • User profiles
    • Channels
    • Raw messages
    • Files and attachments
    • Reactions
    • Conversation threads
    • Vector embeddings"]

    C1 -->|"IF-001: Collected Data Output
    Outputs raw Slack data"| C2
    C2 -->|"IF-002: Data Access Interface
    Provides CRUD operations"| C3
    C3 -->|"IF-003: Reconstructed Conversations
    Provides structured conversation data"| C4
    C4 -->|"IF-004: Vector Embeddings
    Provides vector representations"| C2
    C4 -->|"IF-004: Vector Embeddings
    Provides vector representations"| C5
    C4 -->|"IF-004: Vector Embeddings
    Provides vector representations"| C6
    C5 -->|"IF-005: Topic Analysis
    Provides topic analysis results"| C7
    C6 -->|"IF-006: Search Results
    Provides search capabilities"| C7
    
    C1 -.->|"accesses"| DS1
    C2 -.->|"accesses"| DS1
    C3 -.->|"accesses"| DS1
    C4 -.->|"accesses"| DS1
    C5 -.->|"accesses"| DS1
    C6 -.->|"accesses"| DS1
    
    class C1,C2,C3,C4,C5,C6,C7 component
    class DS1 datastore
```

### Component-to-Requirement Fulfillment

```mermaid
flowchart TD
    classDef component fill:#e3f2fd,stroke:#333,stroke-width:1px,color:#000000
    classDef funcReq fill:#e1f5fe,stroke:#333,stroke-width:1px,color:#000000
    classDef nonFuncReq fill:#fff9c4,stroke:#333,stroke-width:1px,color:#000000
    
    C1["COMP-001
    Slack Data Collector"]
    C2["COMP-002
    Data Storage"]
    C3["COMP-003
    Conversation Reconstructor"]
    C4["COMP-004
    Embedding Engine"]
    C5["COMP-005
    Topic Analyzer"]
    C6["COMP-006
    Search Engine"]
    C7["COMP-007
    Insight Dashboard"]
    
    F001["REQ-F001
    Slack Data Collection"]
    F002["REQ-F002
    Thread Reconstruction"]
    F003["REQ-F003
    Conversation Embeddings"]
    F004["REQ-F004
    Topic Analysis"]
    F005["REQ-F005
    Semantic Search"]
    F006["REQ-F006
    Insight Dashboard"]
    
    NF001["REQ-NF001
    Data Privacy"]
    NF002["REQ-NF002
    Performance"]
    
    C1 -->|"fulfills"| F001
    C2 -->|"fulfills"| F001
    C2 -->|"fulfills"| NF001
    C2 -->|"fulfills"| NF002
    C3 -->|"fulfills"| F002
    C4 -->|"fulfills"| F003
    C5 -->|"fulfills"| F004
    C6 -->|"fulfills"| F005
    C7 -->|"fulfills"| F006
    
    class C1,C2,C3,C4,C5,C6,C7 component
    class F001,F002,F003,F004,F005,F006 funcReq
    class NF001,NF002 nonFuncReq
```

## 3. Functional DSL (FuncDSL)

### Module Structure

```mermaid
flowchart TD
    classDef module fill:#e3f2fd,stroke:#333,stroke-width:1px,color:#000000
    classDef component fill:#e8f5e9,stroke:#333,stroke-width:1px,color:#000000

    M1["MOD-001: slack_data_collector
    ---
    Collects and processes Slack data"]
    M2["MOD-002: data_storage
    ---
    Handles all database operations"]
    M3["MOD-003: conversation_reconstructor
    ---
    Reconstructs conversation threads"]
    M4["MOD-004: embedding_engine
    ---
    Generates embeddings from text"]
    M5["MOD-005: topic_analyzer
    ---
    Analyzes topics from embeddings"]
    M6["MOD-006: search_engine
    ---
    Performs semantic searches"]
    M7["MOD-007: insights_dashboard
    ---
    Visualizes insights and results"]
    
    C1["COMP-001: Slack Data Collector"]
    C2["COMP-002: Data Storage"]
    C3["COMP-003: Conversation Reconstructor"]
    C4["COMP-004: Embedding Engine"]
    C5["COMP-005: Topic Analyzer"]
    C6["COMP-006: Search Engine"]
    C7["COMP-007: Insight Dashboard"]
    
    M1 -->|"implements"| C1
    M2 -->|"implements"| C2
    M3 -->|"implements"| C3
    M4 -->|"implements"| C4
    M5 -->|"implements"| C5
    M6 -->|"implements"| C6
    M7 -->|"implements"| C7
    
    class M1,M2,M3,M4,M5,M6,M7 module
    class C1,C2,C3,C4,C5,C6,C7 component
```

### Module Functions (Detailed Examples)

```mermaid
flowchart TD
    classDef function fill:#e8f5e9,stroke:#333,stroke-width:1px,color:#000000
    classDef module fill:#e3f2fd,stroke:#333,stroke-width:1px,color:#000000
    
    MOD1["MOD-001: slack_data_collector"]
    
    F1["FUNC-001: initialize_client
    ---
    Params: slack_token (string)
    Returns: SlackClient
    ---
    Description: Set up authenticated
    Slack API client"]
    
    F2["FUNC-002: fetch_channel_history
    ---
    Params: channel_id (string), limit (int, default=1000)
    Returns: List[Message]
    ---
    Description: Retrieve message history
    for a channel"]
    
    F3["FUNC-003: fetch_all_channels
    ---
    Params: types (string, default='public_channel,private_channel')
    Returns: List[Channel]
    ---
    Description: Retrieve all accessible channels"]
    
    F4["FUNC-004: fetch_users
    ---
    Params: none
    Returns: List[User]
    ---
    Description: Retrieve all workspace users"]
    
    F5["FUNC-005: process_message_data
    ---
    Params: messages (List[Message]), channel_id (string)
    Returns: List[ProcessedMessage]
    ---
    Description: Process and transform
    raw message data"]
    
    MOD4["MOD-004: embedding_engine"]
    
    F17["FUNC-017: initialize_embedding_model
    ---
    Params: model_name (string, default='text-embedding-3-small')
    Returns: EmbeddingModel
    ---
    Description: Set up the text embedding model"]
    
    F18["FUNC-018: preprocess_text
    ---
    Params: text (string)
    Returns: string
    ---
    Description: Clean and prepare text for embedding"]
    
    F19["FUNC-019: create_text_chunks
    ---
    Params: text (string), chunk_size (int=512), overlap (int=128)
    Returns: List[string]
    ---
    Description: Split text into overlapping chunks"]
    
    F20["FUNC-020: generate_embedding
    ---
    Params: text (string), model (EmbeddingModel)
    Returns: Vector
    ---
    Description: Generate embedding vector for text"]
    
    F21["FUNC-021: batch_generate_embeddings
    ---
    Params: texts (List[string]), model (EmbeddingModel)
    Returns: List[Vector]
    ---
    Description: Generate embeddings
    for multiple texts"]
    
    MOD1 --- F1
    MOD1 --- F2
    MOD1 --- F3
    MOD1 --- F4
    MOD1 --- F5
    
    MOD4 --- F17
    MOD4 --- F18
    MOD4 --- F19
    MOD4 --- F20
    MOD4 --- F21
    
    class MOD1,MOD4 module
    class F1,F2,F3,F4,F5,F17,F18,F19,F20,F21 function
```

### Shared Types (With Complete Definitions)

```mermaid
flowchart TD
    classDef type fill:#f3e5f5,stroke:#333,stroke-width:1px,color:#000000
    
    T1["TYPE-001: Vector
    ---
    Description: Numerical vector representation of text
    ---
    Definition: List[float]"]
    
    T2["TYPE-002: Message
    ---
    Description: Slack message with metadata
    ---
    Definition: Dictionary containing:
    • ts: string (timestamp)
    • text: string (content)
    • user: string (sender ID)
    • channel: string (channel ID)
    • thread_ts: string (optional)
    • reactions: List (optional)
    • and other metadata"]
    
    T3["TYPE-003: Thread
    ---
    Description: Collection of messages in a thread
    ---
    Definition: Dictionary containing:
    • parent: Message (thread starter)
    • replies: List[Message] (responses)
    • participants: List[string] (user IDs)
    • and thread metadata"]
    
    T4["TYPE-004: Conversation
    ---
    Description: Coherent conversation unit
    ---
    Definition: List of related messages with
    context and metadata about the conversation"]
    
    T5["TYPE-005: SearchResult
    ---
    Description: Vector search result with metadata
    ---
    Definition: Dictionary containing:
    • content: string (matched content)
    • similarity_score: float (match score)
    • metadata: Dictionary (context)
    • original_message: Message reference"]
    
    class T1,T2,T3,T4,T5 type
```

## 4. Code Mapping DSL (CodeDSL)

### File Structure with Implementation Details

```mermaid
flowchart TD
    classDef folder fill:#e8f5e9,stroke:#333,stroke-width:1px,color:#000000
    classDef file fill:#f1f8e9,stroke:#333,stroke-width:1px,color:#000000
    classDef module fill:#e3f2fd,stroke:#333,stroke-width:1px,color:#000000

    App["/app
    ---
    Main application directory"]
    SC["/slack_collector
    ---
    Slack data collection module
    Implements MOD-001"]
    DB["/database
    ---
    Database access layer
    Implements MOD-002"]
    Conv["/conversation
    ---
    Conversation processing
    Implements MOD-003"]
    Emb["/embedding
    ---
    Text embedding generation
    Implements MOD-004"]
    Top["/topics
    ---
    Topic analysis
    Implements MOD-005"]
    Search["/search
    ---
    Semantic search functionality
    Implements MOD-006"]
    Dash["/dashboard
    ---
    Insights dashboard
    Implements MOD-007"]
    Utils["/utils
    ---
    Shared utility functions"]
    
    App --> SC
    App --> DB
    App --> Conv
    App --> Emb
    App --> Top
    App --> Search
    App --> Dash
    App --> Utils
    
    SC --> Client["client.py
    ---
    Slack API client implementation
    Implements FUNC-001: initialize_client"]
    SC --> Collector["collector.py
    ---
    Data collection functions
    Implements FUNC-002/003/004/005"]
    
    DB --> Connection["connection.py
    ---
    Database connection management
    Implements FUNC-006"]
    DB --> Storage["storage.py
    ---
    Data storage operations
    Implements FUNC-007/008/009/010"]
    DB --> VectorStore["vector_store.py
    ---
    Vector storage and retrieval
    Implements FUNC-011/012"]
    
    Conv --> Reconstruct["reconstruction.py
    ---
    Thread and conversation reconstruction
    Implements FUNC-013/014/015/016"]
    
    Emb --> Models["models.py
    ---
    Embedding model configuration
    Implements FUNC-017"]
    Emb --> Processor["processor.py
    ---
    Text preprocessing for embeddings
    Implements FUNC-018/019"]
    Emb --> Generator["generator.py
    ---
    Embedding generation functions
    Implements FUNC-020/021"]
    
    Top --> Clustering["clustering.py
    ---
    Embedding clustering
    Implements FUNC-022/023"]
    Top --> Labeling["labeling.py
    ---
    Topic labeling
    Implements FUNC-024"]
    Top --> Evolution["evolution.py
    ---
    Topic evolution tracking
    Implements FUNC-025"]
    
    Search --> Query["query.py
    ---
    Query processing
    Implements FUNC-026/027"]
    Search --> Engine["engine.py
    ---
    Search execution
    Implements FUNC-028/029"]
    
    Dash --> Charts["charts.py
    ---
    Chart generation
    Implements FUNC-030/031/033"]
    Dash --> Results["results.py
    ---
    Search result formatting
    Implements FUNC-032"]
    
    Utils --> Types["types.py
    ---
    Shared type definitions
    Implements TYPE-001/002/003/004/005"]
    
    class App,SC,DB,Conv,Emb,Top,Search,Dash,Utils folder
    class Client,Collector,Connection,Storage,VectorStore,Reconstruct,Models,Processor,Generator,Clustering,Labeling,Evolution,Query,Engine,Charts,Results,Types file
```

### Code Fragment Example

```mermaid
flowchart TD
    classDef code fill:#f5f5f5,stroke:#333,stroke-width:1px,color:#000000
    
    FRAG1["FRAG-001
    ---
    File: /app/slack_collector/client.py
    Implements: FUNC-001"]
    
    CODE1["def initialize_client(slack_token):
        \"\"\"Set up authenticated Slack API client\"\"\"
        from slack_sdk import WebClient
        return WebClient(token=slack_token)"]
    
    FRAG3["FRAG-003
    ---
    File: /app/database/vector_store.py
    Implements: FUNC-012"]
    
    CODE3["def query_vector_similarity(query_vector, 
                                filter_conditions=None, 
                                limit=10, 
                                connection=None):
        \"\"\"Find similar vectors using cosine similarity\"\"\"
        conn = connection or initialize_db_connection(...)
        
        # Base query
        query = \"SELECT id, content, metadata, 
                embedding <-> :query AS distance\"
        params = {\"query\": query_vector}
        
        # Add filters if provided
        if filter_conditions:
            where_clauses = []
            for key, value in filter_conditions.items():
                where_clauses.append(f\"metadata->>'{key}' = :filter_{i}\")
            
            query += \" WHERE \" + \" AND \".join(where_clauses)
        
        # Return results
        return conn.query(query, params).execute().data"]
    
    FRAG1 --- CODE1
    FRAG3 --- CODE3
    
    class FRAG1,FRAG3 code
    class CODE1,CODE3 code
```

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
