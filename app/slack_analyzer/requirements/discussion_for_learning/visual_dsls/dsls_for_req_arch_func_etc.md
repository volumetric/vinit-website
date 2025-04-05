

# ReqDSL - Requirements Domain Specific Language
specification:
  id: SCA-SPEC-001
  name: "Slack Conversation Analyzer System"
  description: "A system to analyze Slack conversations for a SaaS company"
  stakeholders:
    - role: "Founder"
      needs: "Understand what's happening across company communications"
    - role: "Data Analyst"
      needs: "Extract insights from conversation data"

requirements:
  functional:
    - id: REQ-F001
      name: "Slack Data Collection"
      description: "Collect and store raw message data from all relevant Slack channels"
      priority: "High"
      acceptance_criteria:
        - "Should collect messages from public channels"
        - "Should collect messages from private channels with proper permissions"
        - "Should collect direct messages with proper permissions"
        - "Should store message metadata including sender, timestamp, and channel"
        
    - id: REQ-F002
      name: "Thread Reconstruction"
      description: "Reconstruct conversation threads from individual messages"
      priority: "Medium"
      dependencies: [REQ-F001]
      acceptance_criteria:
        - "Should group thread replies with parent messages"
        - "Should maintain chronological ordering"
        
    - id: REQ-F003
      name: "Conversation Embeddings"
      description: "Generate vector embeddings of messages and conversations"
      priority: "High"
      dependencies: [REQ-F001, REQ-F002]
      acceptance_criteria:
        - "Should generate embeddings at both message and thread levels"
        - "Should use appropriate embedding models for semantic understanding"
    
    - id: REQ-F004
      name: "Topic Analysis"
      description: "Identify common topics being discussed across channels"
      priority: "Medium"
      dependencies: [REQ-F003]
      acceptance_criteria:
        - "Should identify topics without requiring predefined categories"
        - "Should show topic distribution across channels"
    
    - id: REQ-F005
      name: "Semantic Search"
      description: "Allow searching for conversations by concept, not just keywords"
      priority: "High"
      dependencies: [REQ-F003]
      acceptance_criteria:
        - "Should return relevant results even when exact terms aren't used"
        - "Should rank results by relevance"
    
    - id: REQ-F006
      name: "Insight Dashboard"
      description: "Provide visualization of conversation insights"
      priority: "Medium"
      dependencies: [REQ-F004]
      acceptance_criteria:
        - "Should show activity trends over time"
        - "Should highlight emerging topics"
  
  non_functional:
    - id: REQ-NF001
      name: "Data Privacy"
      description: "Ensure appropriate access controls for sensitive conversations"
      priority: "High"
      acceptance_criteria:
        - "Should track conversation source and privacy level"
        - "Should restrict access based on user permissions"
    
    - id: REQ-NF002
      name: "Performance"
      description: "System should handle conversation history for a 30-person company"
      priority: "Medium"
      acceptance_criteria:
        - "Should process daily conversation volume within 1 hour"
        - "Should return search results in < 2 seconds"
    
    - id: REQ-NF003
      name: "Scalability"
      description: "System should scale as company and conversation volume grows"
      priority: "Low"
      acceptance_criteria:
        - "Should support growth to 100 employees without architecture changes"


==============================================

# ArchDSL - Architecture Domain Specific Language
architecture:
  id: SCA-ARCH-001
  name: "Slack Conversation Analyzer Architecture"
  description: "Component architecture for the Slack conversation analysis system"
  
components:
  - id: COMP-001
    name: "Slack Data Collector"
    description: "Collects raw data from Slack API"
    responsibilities:
      - "Connect to Slack API"
      - "Extract message history"
      - "Extract user profiles"
      - "Extract channel information"
    fulfills: [REQ-F001]
    interfaces:
      provides:
        - id: IF-001
          name: "Collected Data Output"
          description: "Outputs raw Slack data"
  
  - id: COMP-002
    name: "Data Storage"
    description: "Stores raw and processed data"
    responsibilities:
      - "Store raw messages"
      - "Store user information"
      - "Store channel information"
      - "Store vector embeddings"
    fulfills: [REQ-F001, REQ-NF001, REQ-NF002]
    interfaces:
      provides:
        - id: IF-002
          name: "Data Access Interface"
          description: "Provides CRUD operations for stored data"
  
  - id: COMP-003
    name: "Conversation Reconstructor"
    description: "Reconstructs threads and conversations from raw messages"
    responsibilities:
      - "Group messages into threads"
      - "Handle sequential messages"
      - "Create conversation units"
    fulfills: [REQ-F002]
    interfaces:
      consumes:
        - ref: IF-002
      provides:
        - id: IF-003
          name: "Reconstructed Conversations"
          description: "Provides structured conversation data"
  
  - id: COMP-004
    name: "Embedding Engine"
    description: "Generates vector embeddings from conversations"
    responsibilities:
      - "Preprocess text for embedding"
      - "Generate message-level embeddings"
      - "Generate thread-level embeddings"
      - "Store embeddings in vector database"
    fulfills: [REQ-F003]
    interfaces:
      consumes:
        - ref: IF-003
      provides:
        - id: IF-004
          name: "Vector Embeddings"
          description: "Provides vector representations of conversations"
  
  - id: COMP-005
    name: "Topic Analyzer"
    description: "Identifies and tracks conversation topics"
    responsibilities:
      - "Cluster embeddings into topics"
      - "Label detected topics"
      - "Track topic changes over time"
    fulfills: [REQ-F004]
    interfaces:
      consumes:
        - ref: IF-004
      provides:
        - id: IF-005
          name: "Topic Analysis"
          description: "Provides topic analysis results"
  
  - id: COMP-006
    name: "Search Engine"
    description: "Enables semantic search across conversations"
    responsibilities:
      - "Process search queries"
      - "Convert queries to embeddings"
      - "Perform vector similarity search"
      - "Rank and return results"
    fulfills: [REQ-F005]
    interfaces:
      consumes:
        - ref: IF-004
      provides:
        - id: IF-006
          name: "Search Results"
          description: "Provides search capabilities and results"
  
  - id: COMP-007
    name: "Insight Dashboard"
    description: "Visualizes insights from conversation analysis"
    responsibilities:
      - "Generate activity visualizations"
      - "Show topic distributions"
      - "Display trend analysis"
    fulfills: [REQ-F006]
    interfaces:
      consumes:
        - ref: IF-005
        - ref: IF-006
      provides:
        - id: IF-007
          name: "Dashboard UI"
          description: "Provides visual interface for insights"

data_stores:
  - id: DS-001
    name: "Supabase PostgreSQL Database"
    description: "Main database storing all data and vectors using pgvector"
    data_entities:
      - "User profiles"
      - "Channels"
      - "Raw messages"
      - "Files and attachments"
      - "Reactions"
      - "Conversation threads"
      - "Vector embeddings"
    accessed_by: [COMP-001, COMP-002, COMP-003, COMP-004, COMP-005, COMP-006]

communication_paths:
  - source: COMP-001
    target: COMP-002
    type: "Data Flow"
    description: "Raw Slack data is stored in database"
  
  - source: COMP-002
    target: COMP-003
    type: "Data Flow"
    description: "Raw message data retrieved for reconstruction"
  
  - source: COMP-003
    target: COMP-004
    type: "Data Flow"
    description: "Structured conversations sent for embedding"
  
  - source: COMP-004
    target: COMP-002
    type: "Data Flow"
    description: "Embeddings stored back in database"
  
  - source: COMP-004
    target: COMP-005
    type: "Data Flow"
    description: "Embeddings used for topic analysis"
  
  - source: COMP-004
    target: COMP-006
    type: "Data Flow"
    description: "Embeddings used for search operations"
  
  - source: COMP-005
    target: COMP-007
    type: "Data Flow"
    description: "Topic analysis results displayed in dashboard"
  
  - source: COMP-006
    target: COMP-007
    type: "Data Flow"
    description: "Search results displayed in dashboard"


==============================================

# FuncDSL - Functional Design Domain Specific Language
functional_design:
  id: SCA-FUNC-001
  name: "Slack Conversation Analyzer Functional Design"
  description: "Module and function design for the Slack conversation analysis system"

modules:
  - id: MOD-001
    name: "slack_data_collector"
    description: "Collects and processes Slack data"
    implements: COMP-001
    functions:
      - id: FUNC-001
        name: "initialize_client"
        description: "Set up authenticated Slack API client"
        parameters:
          - name: "slack_token"
            type: "string"
        returns: "SlackClient"
      
      - id: FUNC-002
        name: "fetch_channel_history"
        description: "Retrieve message history for a channel"
        parameters:
          - name: "channel_id"
            type: "string"
          - name: "limit"
            type: "integer"
            default: 1000
        returns: "List[Message]"
      
      - id: FUNC-003
        name: "fetch_all_channels"
        description: "Retrieve all accessible channels"
        parameters:
          - name: "types"
            type: "string"
            default: "public_channel,private_channel"
        returns: "List[Channel]"
      
      - id: FUNC-004
        name: "fetch_users"
        description: "Retrieve all workspace users"
        returns: "List[User]"
      
      - id: FUNC-005
        name: "process_message_data"
        description: "Process and transform raw message data"
        parameters:
          - name: "messages"
            type: "List[Message]"
          - name: "channel_id"
            type: "string"
        returns: "List[ProcessedMessage]"

  - id: MOD-002
    name: "data_storage"
    description: "Handles all database operations"
    implements: COMP-002
    functions:
      - id: FUNC-006
        name: "initialize_db_connection"
        description: "Create and return database connection"
        parameters:
          - name: "connection_string"
            type: "string"
        returns: "DatabaseConnection"
      
      - id: FUNC-007
        name: "store_messages"
        description: "Store processed messages in database"
        parameters:
          - name: "messages"
            type: "List[ProcessedMessage]"
          - name: "connection"
            type: "DatabaseConnection"
        returns: "None"
      
      - id: FUNC-008
        name: "store_channels"
        description: "Store channel information"
        parameters:
          - name: "channels"
            type: "List[Channel]"
          - name: "connection"
            type: "DatabaseConnection"
        returns: "None"
      
      - id: FUNC-009
        name: "store_users"
        description: "Store user information"
        parameters:
          - name: "users"
            type: "List[User]"
          - name: "connection"
            type: "DatabaseConnection"
        returns: "None"
      
      - id: FUNC-010
        name: "query_messages_by_criteria"
        description: "Retrieve messages based on search criteria"
        parameters:
          - name: "criteria"
            type: "Dict"
          - name: "connection"
            type: "DatabaseConnection"
        returns: "List[Message]"
      
      - id: FUNC-011
        name: "store_embeddings"
        description: "Store message or thread embeddings"
        parameters:
          - name: "id"
            type: "string"
          - name: "embedding"
            type: "Vector"
          - name: "metadata"
            type: "Dict"
          - name: "connection"
            type: "DatabaseConnection"
        returns: "None"
      
      - id: FUNC-012
        name: "query_vector_similarity"
        description: "Find similar vectors using cosine similarity"
        parameters:
          - name: "query_vector"
            type: "Vector"
          - name: "filter_conditions"
            type: "Dict"
            optional: true
          - name: "limit"
            type: "integer"
            default: 10
          - name: "connection"
            type: "DatabaseConnection"
        returns: "List[SimilarityResult]"

  - id: MOD-003
    name: "conversation_reconstructor"
    description: "Reconstructs conversation threads"
    implements: COMP-003
    functions:
      - id: FUNC-013
        name: "reconstruct_threads"
        description: "Group messages into threads"
        parameters:
          - name: "messages"
            type: "List[Message]"
        returns: "Dict[ThreadID, Thread]"
      
      - id: FUNC-014
        name: "identify_sequential_conversations"
        description: "Group sequential messages from same user"
        parameters:
          - name: "messages"
            type: "List[Message]"
          - name: "time_window"
            type: "integer"
            default: 300
        returns: "List[Conversation]"
      
      - id: FUNC-015
        name: "get_conversation_participants"
        description: "Extract unique participants in a conversation"
        parameters:
          - name: "conversation"
            type: "Conversation"
        returns: "List[UserID]"
      
      - id: FUNC-016
        name: "format_conversation_for_embedding"
        description: "Prepare conversation text for embedding"
        parameters:
          - name: "conversation"
            type: "Conversation"
        returns: "string"

  - id: MOD-004
    name: "embedding_engine"
    description: "Generates embeddings from text"
    implements: COMP-004
    functions:
      - id: FUNC-017
        name: "initialize_embedding_model"
        description: "Set up the text embedding model"
        parameters:
          - name: "model_name"
            type: "string"
            default: "text-embedding-3-small"
        returns: "EmbeddingModel"
      
      - id: FUNC-018
        name: "preprocess_text"
        description: "Clean and prepare text for embedding"
        parameters:
          - name: "text"
            type: "string"
        returns: "string"
      
      - id: FUNC-019
        name: "create_text_chunks"
        description: "Split text into overlapping chunks"
        parameters:
          - name: "text"
            type: "string"
          - name: "chunk_size"
            type: "integer"
            default: 512
          - name: "overlap"
            type: "integer"
            default: 128
        returns: "List[string]"
      
      - id: FUNC-020
        name: "generate_embedding"
        description: "Generate embedding vector for text"
        parameters:
          - name: "text"
            type: "string"
          - name: "model"
            type: "EmbeddingModel"
        returns: "Vector"
      
      - id: FUNC-021
        name: "batch_generate_embeddings"
        description: "Generate embeddings for multiple texts"
        parameters:
          - name: "texts"
            type: "List[string]"
          - name: "model"
            type: "EmbeddingModel"
        returns: "List[Vector]"

  - id: MOD-005
    name: "topic_analyzer"
    description: "Analyzes topics from embeddings"
    implements: COMP-005
    functions:
      - id: FUNC-022
        name: "initialize_topic_model"
        description: "Set up topic modeling"
        parameters:
          - name: "num_topics"
            type: "integer"
            optional: true
        returns: "TopicModel"
      
      - id: FUNC-023
        name: "cluster_embeddings"
        description: "Group embeddings into topics"
        parameters:
          - name: "embeddings"
            type: "List[Vector]"
          - name: "model"
            type: "TopicModel"
        returns: "Dict[TopicID, List[EmbeddingID]]"
      
      - id: FUNC-024
        name: "generate_topic_labels"
        description: "Create human-readable labels for topics"
        parameters:
          - name: "topic_terms"
            type: "Dict[TopicID, List[Term]]"
        returns: "Dict[TopicID, string]"
      
      - id: FUNC-025
        name: "track_topic_evolution"
        description: "Analyze how topics change over time"
        parameters:
          - name: "topic_distributions"
            type: "List[TimestampedTopicDistribution]"
        returns: "TopicEvolution"

  - id: MOD-006
    name: "search_engine"
    description: "Performs semantic searches"
    implements: COMP-006
    functions:
      - id: FUNC-026
        name: "parse_query"
        description: "Process and enhance search query"
        parameters:
          - name: "query_text"
            type: "string"
        returns: "ParsedQuery"
      
      - id: FUNC-027
        name: "convert_query_to_embedding"
        description: "Generate embedding for search query"
        parameters:
          - name: "query"
            type: "string"
          - name: "embedding_model"
            type: "EmbeddingModel"
        returns: "Vector"
      
      - id: FUNC-028
        name: "execute_vector_search"
        description: "Perform similarity search with filters"
        parameters:
          - name: "query_embedding"
            type: "Vector"
          - name: "filters"
            type: "Dict"
            optional: true
          - name: "limit"
            type: "integer"
            default: 10
          - name: "connection"
            type: "DatabaseConnection"
        returns: "List[SearchResult]"
      
      - id: FUNC-029
        name: "format_search_results"
        description: "Prepare search results for display"
        parameters:
          - name: "results"
            type: "List[SearchResult]"
        returns: "FormattedSearchResults"

  - id: MOD-007
    name: "insights_dashboard"
    description: "Visualizes insights and results"
    implements: COMP-007
    functions:
      - id: FUNC-030
        name: "generate_activity_chart"
        description: "Create visualization of activity over time"
        parameters:
          - name: "activity_data"
            type: "List[TimestampedActivity]"
        returns: "Chart"
      
      - id: FUNC-031
        name: "generate_topic_distribution"
        description: "Create visualization of topic distribution"
        parameters:
          - name: "topic_data"
            type: "Dict[TopicID, Frequency]"
        returns: "Chart"
      
      - id: FUNC-032
        name: "format_search_result_display"
        description: "Format search results for dashboard"
        parameters:
          - name: "search_results"
            type: "FormattedSearchResults"
        returns: "UIComponent"
      
      - id: FUNC-033
        name: "create_trend_visualization"
        description: "Visualize trends over time"
        parameters:
          - name: "trend_data"
            type: "List[TimestampedMetric]"
        returns: "Chart"

shared_types:
  - id: TYPE-001
    name: "Vector"
    description: "Numerical vector representation of text"
    definition: "List[float]"
  
  - id: TYPE-002
    name: "Message"
    description: "Slack message with metadata"
    definition: "Dict with ts, text, user, etc."
  
  - id: TYPE-003
    name: "Thread"
    description: "Collection of messages in a thread"
    definition: "Dict with parent message and replies"
  
  - id: TYPE-004
    name: "Conversation"
    description: "Coherent conversation unit"
    definition: "List of related messages"
  
  - id: TYPE-005
    name: "SearchResult"
    description: "Vector search result with metadata"
    definition: "Dict with content, similarity score, metadata"


==============================================

# CodeDSL - Code Mapping Domain Specific Language
code_mapping:
  id: SCA-CODE-001
  name: "Slack Conversation Analyzer Code Mapping"
  description: "Maps architectural and functional concepts to code implementation"

source_code:
  language: "Python"
  repository: "github.com/company/slack-analyzer"
  
file_structure:
  - path: "/app"
    description: "Main application directory"
    contains:
      - path: "/slack_collector"
        description: "Slack data collection module"
        implements: [MOD-001]
        files:
          - path: "/client.py"
            description: "Slack API client implementation"
            implements: [FUNC-001]
            
          - path: "/collector.py"
            description: "Data collection functions"
            implements: [FUNC-002, FUNC-003, FUNC-004, FUNC-005]
      
      - path: "/database"
        description: "Database access layer"
        implements: [MOD-002]
        files:
          - path: "/connection.py"
            description: "Database connection management"
            implements: [FUNC-006]
          
          - path: "/storage.py"
            description: "Data storage operations"
            implements: [FUNC-007, FUNC-008, FUNC-009, FUNC-010]
          
          - path: "/vector_store.py"
            description: "Vector storage and retrieval"
            implements: [FUNC-011, FUNC-012]
      
      - path: "/conversation"
        description: "Conversation processing"
        implements: [MOD-003]
        files:
          - path: "/reconstruction.py"
            description: "Thread and conversation reconstruction"
            implements: [FUNC-013, FUNC-014, FUNC-015, FUNC-016]
      
      - path: "/embedding"
        description: "Text embedding generation"
        implements: [MOD-004]
        files:
          - path: "/models.py"
            description: "Embedding model configuration"
            implements: [FUNC-017]
          
          - path: "/processor.py"
            description: "Text preprocessing for embeddings"
            implements: [FUNC-018, FUNC-019]
          
          - path: "/generator.py"
            description: "Embedding generation functions"
            implements: [FUNC-020, FUNC-021]
      
      - path: "/topics"
        description: "Topic analysis"
        implements: [MOD-005]
        files:
          - path: "/clustering.py"
            description: "Embedding clustering"
            implements: [FUNC-022, FUNC-023]
          
          - path: "/labeling.py"
            description: "Topic labeling"
            implements: [FUNC-024]
          
          - path: "/evolution.py"
            description: "Topic evolution tracking"
            implements: [FUNC-025]
      
      - path: "/search"
        description: "Semantic search functionality"
        implements: [MOD-006]
        files:
          - path: "/query.py"
            description: "Query processing"
            implements: [FUNC-026, FUNC-027]
          
          - path: "/engine.py"
            description: "Search execution"
            implements: [FUNC-028, FUNC-029]
      
      - path: "/dashboard"
        description: "Insights dashboard"
        implements: [MOD-007]
        files:
          - path: "/charts.py"
            description: "Chart generation"
            implements: [FUNC-030, FUNC-031, FUNC-033]
          
          - path: "/results.py"
            description: "Search result formatting"
            implements: [FUNC-032]
      
      - path: "/utils"
        description: "Shared utility functions"
        files:
          - path: "/types.py"
            description: "Shared type definitions"
            implements: [TYPE-001, TYPE-002, TYPE-003, TYPE-004, TYPE-005]

code_fragments:
  - id: FRAG-001
    file: "/app/slack_collector/client.py"
    implements: FUNC-001
    code: |
      def initialize_client(slack_token):
          """Set up authenticated Slack API client"""
          from slack_sdk import WebClient
          return WebClient(token=slack_token)
  
  - id: FRAG-002
    file: "/app/slack_collector/collector.py"
    implements: FUNC-002
    code: |
      def fetch_channel_history(channel_id, limit=1000):
          """Retrieve message history for a channel"""
          try:
              client = initialize_client(os.environ["SLACK_BOT_TOKEN"])
              response = client.conversations_history(channel=channel_id, limit=limit)
              return response["messages"]
          except SlackApiError as e:
              print(f"Error fetching messages: {e}")
              return []
  
  - id: FRAG-003
    file: "/app/database/vector_store.py"
    implements: FUNC-012
    code: |
      def query_vector_similarity(query_vector, filter_conditions=None, limit=10, connection=None):
          """Find similar vectors using cosine similarity"""
          conn = connection or initialize_db_connection(os.environ["SUPABASE_URL"])
          
          # Base query
          query = "SELECT id, content, metadata, embedding <-> :query AS distance FROM slack_embeddings"
          params = {"query": query_vector}
          
          # Add filters if provided
          if filter_conditions:
              where_clauses = []
              for i, (key, value) in enumerate(filter_conditions.items()):
                  where_clauses.append(f"metadata->>'{key}' = :filter_{i}")
                  params[f"filter_{i}"] = value
                  
              query += " WHERE " + " AND ".join(where_clauses)
          
          # Add ordering and limit
          query += " ORDER BY distance LIMIT :limit"
          params["limit"] = limit
          
          # Execute and return
          results = conn.query(query, params).execute()
          return results.data
  
  - id: FRAG-004
    file: "/app/embedding/generator.py"
    implements: FUNC-020
    code: |
      def generate_embedding(text, model=None):
          """Generate embedding vector for text"""
          if model is None:
              model = initialize_embedding_model()
              
          # Preprocess text
          clean_text = preprocess_text(text)
          
          # Generate embedding using OpenAI API
          import openai
          response = openai.Embedding.create(
              input=clean_text,
              model=model.name
          )
          
          # Extract the embedding vector
          return response['data'][0]['embedding']


==============================================

# DeployDSL - Deployment Specification Domain Specific Language
deployment:
  id: SCA-DEPLOY-001
  name: "Slack Conversation Analyzer Deployment"
  description: "Deployment configuration for the Slack conversation analysis system"

environments:
  - id: ENV-001
    name: "development"
    description: "Local development environment"
  
  - id: ENV-002
    name: "staging"
    description: "Pre-production testing environment"
  
  - id: ENV-003
    name: "production"
    description: "Production environment"

infrastructure:
  provider: "AWS"
  region: "us-west-2"
  
  components:
    - id: INFRA-001
      name: "supabase-instance"
      type: "Database"
      service: "Supabase"
      description: "Managed Supabase instance with PostgreSQL and pgvector"
      environments: [ENV-001, ENV-002, ENV-003]
      configuration:
        tier: "Pro"
        compute_size: "Small"
        extensions: ["vector", "pg_trgm"]
      
    - id: INFRA-002
      name: "app-server"
      type: "Compute"
      service: "EC2"
      description: "Application server for backend processing"
      environments: [ENV-002, ENV-003]
      configuration:
        instance_type: "t3.medium"
        autoscaling: true
        min_instances: 1
        max_instances: 3
      
    - id: INFRA-003
      name: "data-collector-function"
      type: "FaaS"
      service: "Lambda"
      description: "Serverless function for periodic data collection"
      environments: [ENV-002, ENV-003]
      implements: [MOD-001]
      configuration:
        runtime: "python3.9"
        memory: 1024
        timeout: 900
        schedule: "rate(1 hour)"
      
    - id: INFRA-004
      name: "embedding-processor"
      type: "Container"
      service: "ECS"
      description: "Container for processing embeddings"
      environments: [ENV-002, ENV-003]
      implements: [MOD-004]
      configuration:
        cpu: 1
        memory: 2048
        auto_scaling: true
        min_instances: 1
        max_instances: 5
      
    - id: INFRA-005
      name: "web-dashboard"
      type: "Static Website"
      service: "S3 + CloudFront"
      description: "Frontend for insights dashboard"
      environments: [ENV-002, ENV-003]
      implements: [MOD-007]
      configuration:
        bucket_name: "slack-analyzer-dashboard-${ENV}"
        cloudfront_enabled: true
      
    - id: INFRA-006
      name: "search-api"
      type: "API"
      service: "API Gateway + Lambda"
      description: "API for search functionality"
      environments: [ENV-002, ENV-003]
      implements: [MOD-006]
      configuration:
        path: "/api/search"
        method: "POST"
        auth: "API Key"

services:
  - id: SVC-001
    name: "slack-collector-service"
    description: "Service for collecting Slack data"
    implements: [COMP-001]
    deployment:
      type: "Scheduled Lambda Function"
      infrastructure: INFRA-003
      docker_image: "slack-analyzer/collector:latest"
      environment_variables:
        - name: "SLACK_BOT_TOKEN"
          source: "SSM"
          path: "/slack-analyzer/${ENV}/slack-token"
        - name: "SUPABASE_URL"
          source: "SSM"
          path: "/slack-analyzer/${ENV}/supabase-url"
        - name: "SUPABASE_KEY"
          source: "SSM" 
          path: "/slack-analyzer/${ENV}/supabase-key"
  
  - id: SVC-002
    name: "embedding-service"
    description: "Service for generating embeddings"
    implements: [COMP-004]
    deployment:
      type: "Container Service"
      infrastructure: INFRA-004
      docker_image: "slack-analyzer/embedding:latest"
      environment_variables:
        - name: "OPENAI_API_KEY"
          source: "SSM"
          path: "/slack-analyzer/${ENV}/openai-key"
        - name: "SUPABASE_URL"
          source: "SSM"
          path: "/slack-analyzer/${ENV}/supabase-url"
        - name: "SUPABASE_KEY"
          source: "SSM"
          path: "/slack-analyzer/${ENV}/supabase-key"
  
  - id: SVC-003
    name: "analysis-service"
    description: "Service for conversation analysis"
    implements: [COMP-003, COMP-005]
    deployment:
      type: "EC2 Application"
      infrastructure: INFRA-002
      systemd_service: "slack-analyzer"
      docker_compose: true
      environment_variables:
        - name: "SUPABASE_URL"
          source: "SSM"
          path: "/slack-analyzer/${ENV}/supabase-url"
        - name: "SUPABASE_KEY"
          source: "SSM"
          path: "/slack-analyzer/${ENV}/supabase-key"
  
  - id: SVC-004
    name: "search-api-service"
    description: "API for search functionality"
    implements: [COMP-006]
    deployment:
      type: "API Gateway Lambda"
      infrastructure: INFRA-006
      docker_image: "slack-analyzer/search-api:latest"
      environment_variables:
        - name: "SUPABASE_URL"
          source: "SSM"
          path: "/slack-analyzer/${ENV}/supabase-url"
        - name: "SUPABASE_KEY"
          source: "SSM"
          path: "/slack-analyzer/${ENV}/supabase-key"
  
  - id: SVC-005
    name: "dashboard-ui"
    description: "Frontend dashboard application"
    implements: [COMP-007]
    deployment:
      type: "Static Website"
      infrastructure: INFRA-005
      build_command: "npm run build"
      source_directory: "/dashboard"
      output_directory: "/dashboard/build"
      environment_variables:
        - name: "REACT_APP_API_URL"
          value: "https://api.slack-analyzer.example.com"

ci_cd:
  provider: "GitHub Actions"
  workflows:
    - id: CI-001
      name: "build-and-test"
      trigger: "pull_request"
      steps:
        - "checkout"
        - "install-dependencies"
        - "run-linting"
        - "run-unit-tests"
        - "build-docker-images"
    
    - id: CI-002
      name: "deploy-staging"
      trigger: "push to main"
      steps:
        - "checkout"
        - "install-dependencies"
        - "run-linting"
        - "run-unit-tests"
        - "build-docker-images"
        - "push-docker-images"
        - "deploy-to-staging"
    
    - id: CI-003
      name: "deploy-production"
      trigger: "release"
      steps:
        - "checkout"
        - "install-dependencies"
        - "build-docker-images"
        - "push-docker-images"
        - "deploy-to-production"


