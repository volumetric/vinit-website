# Project Overview
This chrome extension will allow users to be able to get an LLM generated summary for any youtube video. So that they don't have to watch the whole content and can simply read this summary to understand the core ideas.

# Core Features
1. This chrome extension will add a new tab in the Description block called: "Content Diet" button on every YoutTube video page. 
    1. The tabs names in the description block should be called "Description" to keep all the description data as it is, and a new "Content Diet" tab to show things related to this chrome extension. i.e. the extract wisdom, etc.
    2. Inside this "Content Diet" tab, It will add a button called "Extract Wisdom". Clicking on which will show the extracted wisdom right below it. This "Extract Wisdom" button should look similar to other buttons on the Youtube video page i.e. the Like, Share and Download buttons.
    3. When adding the buttons and tabs in the page, keep the same look and feel as the page. it should blend in nicely in the YT video page.
2. When the "Extract Wisdom" button is clicked it will call an API to get the extracted wisdom data
    1. When the user click on this button, it should make an API call to "http://localhost:3000/content-diet/api/transform?prompt=extract_wisdom&yt_videoid=xxxxxxxx", sending the YT video id from the page, to extract information from the Youtube video transcript.
    2. For now, the API might fail. So keep the placeholder text for extracted wisdom as it is. Do not implement this API for now.

# Docs
1. Youtube Sample Video Page Stucture: You can refer to the sample_youtube_video_page_metedata_section.html in the same directory to understand the HTML structure of the YouTube video meteadata information in video page to figure out the right CSS selectores and styling. The "Extract Wisdom" buttons and the summary of the video transcript will be added only in this section of the page.

# Project file stucture
xxxx