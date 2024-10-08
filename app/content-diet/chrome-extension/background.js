chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractWisdom") {
    fetch('http://localhost:3000/content-diet/api/transform', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cognitive_tool: 'extract_wisdom',
        yt_videoid: request.videoId,
      }),
    })
    .then(response => response.json())
    .then(data => {
      sendResponse({success: true, data: data});
    })
    .catch(error => {
      sendResponse({success: false, error: error.message});
    });
    return true; // Indicates that the response is asynchronous
  }
});