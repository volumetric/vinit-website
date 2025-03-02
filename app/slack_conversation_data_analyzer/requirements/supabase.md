Supabase module in a folder name `supabase` in the `slack_conversation_data_analyzer` folder.

help me understand the Supabase features. I want to make a vector store in the cloud, using the Supabase cloud cluster, to embedd and save text chunk into the vector db and be able to do semantic search and hybrid search based on a query.

@Supabase Docs
Please see the Supabase doc and tell me how to add it in the @supabase folder in @slack_conversation_data_analyzer .  Please see if the setup code for Supabase already exists in this codebase and what else is needed If something is already there, Just tell that thing that it is already there I don't have to do anything there and give instructions on how to move forward with making this Supabase as a vector store, where I can save text chunks.


Here are some questions and answers on what kind of text chunks I want to save.

Q1. What kind of text data will you be storing in the vector store? (e.g., Slack messages, conversation snippets, etc.)
A1. I want to organize the individual slack messages from different team members in a Team slack workspace in to conversations this will be done by collecting all the information in a given slack thread using the slack thread feature. which will be for which we will use the API for it so don't worry about how I am getting the data right now just build the super base data structure in a way so that it can store that information and so these will be think of it like conversation documents where you will have several people who are working in a team talking to each other they also sometimes giving updates on the products or they are talking about a bug or an issue or a feature so these are like slack conversations mostly they are organized in threads but sometimes they are not so again don't worry about how you are getting it but think of it like you are getting these conversation documents where there is a bunch of back and forth messages from different people and when you read it together it has a coherent conversation and that is the whole document and we might want and we will have to chunk that conversation documents let's call it slack conversation document we have to chunk it in a smart way as well and then save it in the super base as a vector embedding we also want to save a bunch of metadata information about these conversations and individual messages as well like thread id on those things in the channel the slack channel in which it was spoken or and that there is an id to that thread thread unique id there is the person who said sent a specific message the timestamp any files that is added any links that is added in the message the text content itself possibly any tables that are added maybe but yeah so yeah.

Q2. What is the typical length of these text chunks?
A2. The length of these conversation documents can vary from few messages, maybe 3-5 messages, possibly 1 message as well, from 1 message or 2 messages to maybe hundreds of messages because sometimes the threads can be very long, it can have maybe up to 1000 message exchanges, sometimes it can be long as well, so we need to chunk it and split it and chunk this whole conversation documents with a bunch of people talking to each other with their role, their name and their user id, something like a user id which uniquely identifies them in the system and that can be stored as a metadata for each message, but in terms of content, you can take this whole conversation as an exchange of messages between different people within the team.

Q3. Do you need to store any metadata along with the text chunks?
A3. Yes there will be metadata for each conversation document there will be there will be the channel name for a conversation document on which thread conversation happened there will be for each message within the thread will be the user who sent the message the timestamp any files that is attached to the message I mentioned it in the point one as well some about the metadata so you can pick it from there.

Q4. Will you need to perform similarity searches on these text chunks later?
A4. Yes, we need to perform some lattice search on these text chunks using semantic search and hybrid search using vector embedding and we can use a pick a good embedding model which will help in this purpose so we can do a web search to find a good vector embedding model we have to do this and we also want to use the metadata and also want to even in the text along with vector embedding we also want to do normal keyword indexing as well so that we can do something like BM25 search and we can do a hybrid search which has both semantic and keyword based searches with a configurable alpha value. So, for me this semantic search and VM25 which gives hybrid search we will also want to use the metadata for each chunk that is stored as a way to filter things filter information like all the messages sent by one person across different conversation threads or maybe a topic based the other person that is stored as a way to filter things and find the right information when the user asks for it.


Q5. Do you have any specific requirements for the embedding model you want to use? (e.g., OpenAI's text-embedding-3-small, or others)
A5. I don't have any specific requirement I think open AI text embedding 3 small model seems like a good option because I've heard about it but if you feel that there can be some other text embedding model that can be used let me know otherwise I think we can default to open AI text embedding 3 small the latest embedding model that they have


Once you provide these details, I can help you set up Supabase with the appropriate schema and configuration for your vector store needs. I'll guide you through:
1. Setting up Supabase client
2. Creating the necessary tables with vector storage
3. Setting up the embedding pipeline
4. Creating utility functions for storing and querying vectors
5. Integration with your existing codebase
6. Please let me know your requirements so I can provide the most appropriate setup for your use case.
