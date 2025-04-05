## 2. Architecture DSL (ArchDSL) for Priority Requirements

### MVP Component Diagram

```mermaid
flowchart TD
    classDef component fill:#e3f2fd,stroke:#333,stroke-width:1px,color:#000000
    classDef datastore fill:#e8f5e9,stroke:#333,stroke-width:1px,color:#000000
    classDef interface fill:#f5f5f5,stroke:#333,stroke-width:1px,color:#000000
    classDef security fill:#ffebee,stroke:#333,stroke-width:1px,color:#000000

    C1["COMP-001: Slack Data Collector
    ---
    Responsibilities:
    • Connect to Slack API using OAuth
    • Extract messages from public channels
    • Collect user profile information
    • Collect channel information
    • Process user and message metadata
    • Handle rate limiting
    • Support incremental updates every 15 minutes for messages
    • Support daily updates for users and channels
    • Support manual refresh of user/channel data"] 
    
    C2["COMP-002: Data Repository
    ---
    Responsibilities:
    • Store raw messages and metadata
    • Store user profiles and metadata
    • Store channel information and metadata
    • Implement access controls
    • Store vector embeddings
    • Store topic metadata
    • Enable efficient querying
    • Support encryption at rest
    • Support user/channel mention resolution"]
    
    C3["COMP-003: Conversation Reconstructor
    ---
    Responsibilities:
    • Group message threads (parent + replies)
    • Group sequential messages by same user
    • Implement basic topic clustering
    • Maintain chronological ordering
    • Create logical conversation units
    • Resolve user and channel mentions"]
    
    C4["COMP-004: Embedding Service
    ---
    Responsibilities:
    • Preprocess conversation text
    • Generate conversation-level embeddings
    • Use cost-effective embedding model
    • Store embeddings efficiently
    • Support batch processing"]
    
    C5["COMP-005: Search Service
    ---
    Responsibilities:
    • Process search queries
    • Convert queries to embeddings
    • Perform vector similarity search
    • Apply channel and date filters
    • Return results with context"]
    
    C6["COMP-006: Web Interface
    ---
    Responsibilities:
    • Authenticate users
    • Present search interface
    • Display conversation results
    • Show conversation context
    • Provide topic visualizations
    • Support basic filtering
    • Display user profile information
    • Display channel information
    • Provide controls for manual user/channel data refresh"]
    
    C7["COMP-007: Topic Analysis Service
    ---
    Responsibilities:
    • Identify main conversation topics
    • Calculate topic distribution
    • Categorize discussions by topic
    • Generate topic metadata
    • Track basic topic trends"]
    
    C8["COMP-008: Insights Dashboard
    ---
    Responsibilities:
    • Display topic distributions
    • Show activity trends
    • Provide search functionality
    • Present conversation contexts
    • Support filtering by channel and date
    • Integrate all visualizations"]
    
    S1["SEC-001: Auth & Security Service
    ---
    Responsibilities:
    • Manage user authentication
    • Enforce access controls
    • Implement encryption
    • Audit sensitive data access
    • Secure API endpoints"]
    
    DS1["DS-001: PostgreSQL with pgvector
    ---
    Data Entities:
    • User profiles
    • Channels
    • Raw messages
    • Metadata (timestamps, authors)
    • Conversation units
    • Vector embeddings
    • Topic metadata
    • Activity statistics"]

    C1 -->|"IF-001: Collected Data Stream
    Provides raw Slack data"| C2
    C2 -->|"IF-002: Data Access Layer
    Provides secure CRUD operations"| C3
    C3 -->|"IF-003: Reconstructed Conversations
    Provides structured conversation units"| C4
    C4 -->|"IF-004: Conversation Embeddings
    Provides vector representations"| C2
    C3 -->|"IF-007: Conversation Units
    Provides structured conversations"| C7
    C4 -->|"IF-008: Conversation Embeddings
    Provides semantic representations"| C7
    C7 -->|"IF-009: Topic Metadata
    Provides topic distributions"| C2
    C2 -->|"IF-005: Data Retrieval
    Provides conversation and embedding data"| C5
    C5 -->|"IF-006: Search Results
    Provides relevant conversations"| C6
    C5 -->|"IF-010: Search Results
    Provides relevant conversations"| C8
    C7 -->|"IF-011: Topic Visualizations
    Provides topic distributions"| C8
    C2 -->|"IF-012: Activity Data
    Provides usage statistics"| C8
    C8 -->|"IF-013: Dashboard Interface
    Provides integrated visualization"| C6
    
    S1 -.->|"secures"| C1
    S1 -.->|"secures"| C2
    S1 -.->|"secures"| C6
    S1 -.->|"secures"| C8
    
    C1 -.->|"accesses"| DS1
    C2 -.->|"manages"| DS1
    C3 -.->|"reads/writes"| DS1
    C4 -.->|"reads/writes"| DS1
    C5 -.->|"reads"| DS1
    C7 -.->|"reads/writes"| DS1
    C8 -.->|"reads"| DS1
    
    class C1,C2,C3,C4,C5,C6,C7,C8 component
    class S1 security
    class DS1 datastore
```

### Component-to-Priority-Requirement Mapping

```mermaid
flowchart TD
    classDef component fill:#e3f2fd,stroke:#333,stroke-width:1px,color:#000000
    classDef funcReq fill:#e1f5fe,stroke:#333,stroke-width:1px,color:#000000
    classDef nonFuncReq fill:#fff9c4,stroke:#333,stroke-width:1px,color:#000000
    classDef security fill:#ffebee,stroke:#333,stroke-width:1px,color:#000000
    
    C1["COMP-001
    Slack Data Collector"]
    C2["COMP-002
    Data Repository"]
    C3["COMP-003
    Conversation Reconstructor"]
    C4["COMP-004
    Embedding Service"]
    C5["COMP-005
    Search Service"]
    C6["COMP-006
    Web Interface"]
    C7["COMP-007
    Topic Analysis Service"]
    C8["COMP-008
    Insights Dashboard"]
    S1["SEC-001
    Auth & Security Service"]
    
    F001["REQ-F001
    Slack Data Collection"]
    F002["REQ-F002
    Conversation Reconstruction"]
    F003["REQ-F003
    Conversation Embedding and Indexing"]
    F004["REQ-F004
    Topic Analysis"]
    F005["REQ-F005
    Basic Semantic Search"]
    F006["REQ-F006
    Basic Insights Dashboard"]
    F007["REQ-F007
    Slack User Information Storage"]
    F008["REQ-F008
    Slack Channel Information Storage"]
    
    NF001["REQ-NF001
    Data Privacy"]
    NF002["REQ-NF002
    Performance"]
    NF004["REQ-NF004
    Security"]
    NF005["REQ-NF005
    Basic Usability"]
    
    C1 -->|"fulfills"| F001
    C1 -->|"fulfills"| F007
    C1 -->|"fulfills"| F008
    C2 -->|"supports"| F001
    C2 -->|"supports"| F003
    C2 -->|"supports"| F004
    C2 -->|"supports"| F007
    C2 -->|"supports"| F008
    C2 -->|"enables"| NF001
    C2 -->|"enables"| NF002
    C3 -->|"fulfills"| F002
    C3 -->|"uses"| F007
    C3 -->|"uses"| F008
    C4 -->|"fulfills"| F003
    C5 -->|"fulfills"| F005
    C5 -->|"uses"| F007
    C5 -->|"uses"| F008
    C6 -->|"exposes"| F005
    C6 -->|"exposes"| F007
    C6 -->|"exposes"| F008
    C6 -->|"enables"| NF005
    C7 -->|"fulfills"| F004
    C8 -->|"fulfills"| F006
    C8 -->|"displays"| F007
    C8 -->|"displays"| F008
    C8 -->|"enables"| NF005
    S1 -->|"fulfills"| NF001
    S1 -->|"fulfills"| NF004
    
    class C1,C2,C3,C4,C5,C6,C7,C8 component
    class S1 security
    class F001,F002,F003,F004,F005,F006,F007,F008 funcReq
    class NF001,NF002,NF004,NF005 nonFuncReq
```

### MVP Deployment View

```mermaid
flowchart TD
    classDef container fill:#dcedc8,stroke:#333,stroke-width:1px,color:#000000
    classDef service fill:#e3f2fd,stroke:#333,stroke-width:1px,color:#000000
    classDef database fill:#e8f5e9,stroke:#333,stroke-width:1px,color:#000000
    
    Cloud["Cloud Provider (AWS)"]
    
    subgraph Cloud
        API["API Service Container
        ---
        • Hosts Security Service
        • Hosts Slack Data Collector
        • Runs scheduled 15-min message updates
        • Runs scheduled daily user/channel updates
        • Handles manual refresh requests"]
        
        App["Application Service Container
        ---
        • Hosts Web Interface
        • Hosts Search Service
        • Hosts Insights Dashboard
        • Provides user/channel info display
        • Offers manual refresh controls"]
        
        Worker["Worker Service Container
        ---
        • Hosts Conversation Reconstructor
        • Hosts Embedding Service
        • Hosts Topic Analysis Service
        • Processes data asynchronously
        • Resolves user/channel mentions"]
        
        DB["PostgreSQL Database
        ---
        • Raw messages
        • User profiles
        • Channel information
        • Conversation units
        • Topic metadata
        • pgvector extension for embeddings"]
        
        S3["Object Storage
        ---
        • Backup storage
        • Logs and audit trails"]
    end
    
    API --> Worker
    API --> DB
    App --> DB
    Worker --> DB
    API --> S3
    Worker --> S3
    
    class API,App,Worker service
    class DB database
    class S3 container
```

### Deployment-to-Component Mapping

```mermaid
flowchart TD
    classDef service fill:#e3f2fd,stroke:#333,stroke-width:1px,color:#000000
    classDef database fill:#e8f5e9,stroke:#333,stroke-width:1px,color:#000000
    classDef component fill:#bbdefb,stroke:#333,stroke-width:1px,color:#000000
    
    API["API Service Container"]
    App["Application Service Container"]
    Worker["Worker Service Container"]
    DB["PostgreSQL Database"]
    S3["Object Storage"]
    
    C1["COMP-001: Slack Data Collector"]
    C2["COMP-002: Data Repository"]
    C3["COMP-003: Conversation Reconstructor"]
    C4["COMP-004: Embedding Service"]
    C5["COMP-005: Search Service"]
    C6["COMP-006: Web Interface"]
    C7["COMP-007: Topic Analysis Service"]
    C8["COMP-008: Insights Dashboard"]
    S1["SEC-001: Auth & Security Service"]
    
    API -->|"hosts"| C1
    API -->|"hosts"| S1
    API -->|"partially hosts"| C2
    App -->|"hosts"| C5
    App -->|"hosts"| C6
    App -->|"hosts"| C8
    Worker -->|"hosts"| C3
    Worker -->|"hosts"| C4
    Worker -->|"hosts"| C7
    DB -->|"implements"| C2
    
    class API,App,Worker service
    class DB,S3 database
    class C1,C2,C3,C4,C5,C6,C7,C8,S1 component
```

### Implementation Sequence

```mermaid
gantt
    title MVP Implementation Sequence
    dateFormat  YYYY-MM-DD
    section Infrastructure
    Database Setup           :a1, 2023-08-01, 7d
    API Service Setup        :a2, after a1, 5d
    Worker Service Setup     :a3, after a2, 5d
    App Service Setup        :a4, after a3, 5d
    
    section Components
    Security Service         :b1, after a2, 10d
    Slack Data Collector     :b2, after b1, 12d
    User Profile Collection  :b2a, after b2, 5d
    Channel Info Collection  :b2b, after b2, 5d
    Data Repository          :b3, after b1, 15d
    User/Channel Storage     :b3a, after b3, 7d
    Conversation Reconstructor :b4, after b2, 15d
    Mention Resolution       :b4a, after b4 b3a, 5d
    Embedding Service        :b5, after b4, 12d
    Topic Analysis Service   :b6, after b5, 10d
    Search Service           :b7, after b5, 10d
    Insights Dashboard       :b8, after b6 b7, 8d
    Web Interface            :b9, after b8, 12d
    Manual Refresh Controls  :b9a, after b9, 5d
    
    section Testing & Deployment
    Security Testing         :c1, after b1, 7d
    Integration Testing      :c2, after b6 b7, 10d
    Usability Testing        :c3, after b9, 5d
    End-to-End Testing       :c4, after c3, 8d
    Deployment               :c5, after c4, 5d
```

### Component Interaction Sequence

```mermaid
sequenceDiagram
    participant User
    participant WebUI as Web Interface
    participant Dashboard as Insights Dashboard
    participant Search as Search Service
    participant Topics as Topic Analysis
    participant DataRepo as Data Repository
    participant SlackAPI as Slack API
    participant DataCollector as Slack Data Collector

    User->>WebUI: Authenticate
    WebUI->>Dashboard: Request dashboard view
    Dashboard->>DataRepo: Request activity data
    Dashboard->>Topics: Request topic distributions
    Dashboard->>Search: Request recent searches
    Dashboard->>DataRepo: Request user/channel info
    DataRepo-->>Dashboard: Return activity data
    Topics-->>Dashboard: Return topic distributions
    Search-->>Dashboard: Return recent search results
    DataRepo-->>Dashboard: Return user/channel info
    Dashboard-->>WebUI: Display dashboard
    WebUI-->>User: Show dashboard with user/channel context

    User->>WebUI: Submit search query
    WebUI->>Search: Forward search query
    Search->>DataRepo: Request relevant conversations
    DataRepo-->>Search: Return matching conversations
    Search->>DataRepo: Resolve user/channel mentions
    DataRepo-->>Search: Return resolved mentions
    Search-->>WebUI: Return search results with resolved mentions
    WebUI-->>User: Display search results
    
    User->>WebUI: Navigate to topic view
    WebUI->>Topics: Request topic details
    Topics->>DataRepo: Fetch topic metadata
    DataRepo-->>Topics: Return topic data
    Topics-->>WebUI: Return topic visualizations
    WebUI-->>User: Display topic analysis

    User->>WebUI: Request user profile refresh
    WebUI->>DataCollector: Forward refresh request
    DataCollector->>SlackAPI: Fetch latest user profiles
    SlackAPI-->>DataCollector: Return updated user data
    DataCollector->>DataRepo: Store updated user profiles
    DataCollector-->>WebUI: Confirm user data refresh
    WebUI-->>User: Display updated user information

    User->>WebUI: Request channel information refresh
    WebUI->>DataCollector: Forward refresh request
    DataCollector->>SlackAPI: Fetch latest channel information
    SlackAPI-->>DataCollector: Return updated channel data
    DataCollector->>DataRepo: Store updated channel information
    DataCollector-->>WebUI: Confirm channel data refresh
    WebUI-->>User: Display updated channel information

    note right of SlackAPI: Background processes
    SlackAPI->>DataRepo: Stream new messages
    DataRepo->>Topics: Update topic analysis
    Topics->>Dashboard: Update visualizations
    
    SlackAPI->>DataCollector: Daily user profile update
    DataCollector->>DataRepo: Store updated user profiles
    
    SlackAPI->>DataCollector: Daily channel information update
    DataCollector->>DataRepo: Store updated channel information
```

This architecture is specifically designed to fulfill the priority requirements from the Requirements DSL, providing a clear roadmap for MVP implementation while ensuring all critical functionality is addressed.
