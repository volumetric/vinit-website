document.addEventListener('DOMContentLoaded', function() {
  // Load saved settings
  chrome.storage.sync.get(['topicWhitelist', 'topicBlacklist', 'channelWhitelist', 'channelBlacklist'], function(result) {
    // Populate lists with saved settings
    // ... (implementation details)
  });

  // Add event listeners for buttons
  document.getElementById('add-topic-whitelist').addEventListener('click', addToList('topic-whitelist'));
  document.getElementById('add-topic-blacklist').addEventListener('click', addToList('topic-blacklist'));
  document.getElementById('add-channel-whitelist').addEventListener('click', addToList('channel-whitelist'));
  document.getElementById('add-channel-blacklist').addEventListener('click', addToList('channel-blacklist'));

  document.getElementById('save').addEventListener('click', saveSettings);
});

function addToList(listId) {
  // Add item to the specified list
  // ... (implementation details)
}

function saveSettings() {
  // Save all settings to chrome.storage.sync
  // ... (implementation details)
}