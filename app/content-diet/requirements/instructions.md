# Project Overview
This chrome extension will allow users to be able to get an LLM generated summary for any youtube video. So that they don't have to watch the whole content and can simply read this summary to understand the core ideas.

# Core Features
1. This chrome extension will add a new tab in the Description block called: "Content Diet" button on every YoutTube video page. 
    1. The tabs names in the description block should be called "Description" to keep all the description data as it is, and a new "Content Diet" tab to show things related to this chrome extension. i.e. the extract wisdom, etc.
    2. Inside this "Content Diet" tab, It will add a button called "Extract Wisdom". Clicking on which will show the extracted wisdom right below it. This "Extract Wisdom" button should look similar to other buttons on the Youtube video page i.e. the Like, Share and Download buttons.
    3. When adding the buttons and tabs in the page, keep the same look and feel as the page. it should blend in nicely in the YT video page.
2. When the "Extract Wisdom" button is clicked it will call an API to get the extracted wisdom data and show it to the user.
    1. When the user click on this button, it should make an API call to "http://localhost:3000/content-diet/api/transform", passing the Youtube video id `yt_videoid` from the YT video page, and also passing `cognitive_tool` as `extract_wisdom` to extract information from the Youtube video transcript.
    2. This should be a POST request with the following JSON body:
       ```json
       {
         "cognitive_tool": "extract_wisdom",
         "yt_videoid": "xxxxxxxx"
       }
       ```
    3. Once the response is returned from the API, it should show the text in a neat Markdown format. The response will be returned in markdown format, so it should render it that way.
    4. This can be a long running API call, depending on the video length, so implement good loading state using loader animations and handle any errors, if it occurs, gracefully and properly in the UI. Also, as the API can take long to return, make sure that we don't get any timeout error.
3. Implement the Text Transformation API in the Next.js backend that the chrome extension will call
    1. The API code should be implemented in the "api" folder.
    2. API Endpoint: POST `/content-diet/api/transform`
    3. API Request Body: JSON object with `cognitive_tool` and `yt_videoid`
    4. `cognitive_tool` is the name of the tool to be used to transform the Youtube transcript text. e.g. `extract_wisdom`
    5. In the API, first it needs to fetch the Transcript of the Youtube video using the `yt_videoid` param. Use the Google Youtube's Data API v3 to do that.
    6. You can use the `YOUTUBE_API_KEY` from the env variable to authenticate this call.
    7. Handle the case properly when the transcript is not available for some reason. You can just return the API with a relevant message for the user.
    8. Once you have the Youtube video transcript, call the "Asimov Cognitiive Tools", documented below, and pass on the `cognitive_tool` name as `tool_name` and pass the Youtube video transcript text as `tool_input`. Refer to the documentation below to see the API endpoint and request & response data format.
    9. Now just pass on this data in to a consolidated json with both the YT transcript and the final LLM generated summary. Just merge both the request and response objects from the cognitive tool that you called on the backend.

# Docs
1. Documentation for the "Asimov Cognitiive Tools" APIs:
    a. The API endpoint is:
        POST `http://localhost:8020/api/tool/run`
    b. Schema of the request payload
        ```
        {
            tool_type: string, // Always set to "cognitive".
            tool_name: string, // Unique name of the tool. e.g. "extract_wisdom".
            tool_config: json object (dict), // Optional config to send to the tool, to get the desired result. e.g. LLM provider and model (`openai` and `gpt-4o`), Leave it empty
            tool_input: string // Youtube video full transcript as a single string
        }
        ```
        Schema of the request payload
        ```
        {
            tool_type: string, // Always comes back as "cognitive" for "Congitive tools"
            tool_name: string, // same tool name as the request
            tool_output: string, // LLM's generated Output as a single string, using markdown format
            tool_inspect: json object (dict) // Intermediate steps, Logs, Traces, Errors, and any extra debugging info when the tool executed
        }
        ```

# Project file stucture