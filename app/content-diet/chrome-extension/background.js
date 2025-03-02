let baseUrl = '';

chrome.management.getSelf((extensionInfo) => {
  baseUrl = extensionInfo.installType === 'development' 
    ? 'http://localhost:3000' 
    : 'https://vinitagrawal.com';

    baseUrl = 'https://vinitagrawal.com'
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractWisdom") {
    fetch(`${baseUrl}/content-diet/api/transform`, {
      method: 'POST',
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Origin': chrome.runtime.getURL('')
      },
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
