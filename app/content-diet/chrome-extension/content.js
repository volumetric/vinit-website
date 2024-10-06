function filterYouTubeFeed() {
  chrome.storage.sync.get(['topicWhitelist', 'topicBlacklist', 'channelWhitelist', 'channelBlacklist'], function(settings) {
    // Select all video elements on the page
    const videoElements = document.querySelectorAll('ytd-rich-item-renderer');

    videoElements.forEach(video => {
      const channelName = video.querySelector('#text.ytd-channel-name').textContent.trim();
      const videoTitle = video.querySelector('#video-title').textContent.trim();

      // Check if the video matches the user's preferences
    //   if (shouldShowVideo(channelName, videoTitle, settings)) {
    //     video.style.display = 'block';
    //   } else {
    //     video.style.display = 'none';
    //   }
    });
  });
}

function shouldShowVideo(channelName, videoTitle, settings) {
  // Implement logic to determine if the video should be shown based on user settings
  // ... (implementation details)
}

// Run the filter function when the page loads and whenever it changes
filterYouTubeFeed();
const observer = new MutationObserver(filterYouTubeFeed);
observer.observe(document.body, { childList: true, subtree: true });

function addContentDietTab() {
  const descriptionElement = document.querySelector('#description-inner');
  if (descriptionElement && !document.querySelector('.content-diet-tabs')) {
    // Create tab structure
    const tabContainer = document.createElement('div');
    tabContainer.className = 'content-diet-tabs';
    tabContainer.innerHTML = `
      <div class="content-diet-tab-buttons">
        <button class="content-diet-tab-button active" data-tab="description">Description</button>
        <button class="content-diet-tab-button" data-tab="content-diet">Content Diet</button>
      </div>
      <div class="content-diet-tab-content">
        <div class="content-diet-tab-pane active" id="description-tab"></div>
        <div class="content-diet-tab-pane" id="content-diet-tab">
          <button id="extractWisdomBtn" class="yt-spec-button-shape-next yt-spec-button-shape-next--tonal yt-spec-button-shape-next--mono yt-spec-button-shape-next--size-m">
            <div class="yt-spec-button-shape-next__icon" style="height:24px;width:24px;">
              <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"></path></svg>
            </div>
            <span class="yt-spec-button-shape-next__button-text-content">Extract Wisdom</span>
          </button>
          <div id="extracted-wisdom-content">
            <p>Click the "Extract Wisdom" button to get insights from this video.</p>
          </div>
        </div>
      </div>
    `;

    // Move original description content to the description tab
    const descriptionTab = tabContainer.querySelector('#description-tab');
    while (descriptionElement.firstChild) {
      descriptionTab.appendChild(descriptionElement.firstChild);
    }

    // Replace original content with new tab structure
    descriptionElement.appendChild(tabContainer);

    // Add event listeners for tab switching
    const tabButtons = tabContainer.querySelectorAll('.content-diet-tab-button');
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const tabName = button.getAttribute('data-tab');
        switchTab(tabName);
      });
    });

    // Add event listener for Extract Wisdom button
    const extractWisdomBtn = tabContainer.querySelector('#extractWisdomBtn');
    extractWisdomBtn.addEventListener('click', handleExtractWisdom);

    console.log('Content Diet tab added successfully');
    return true;
  }
  return false;
}

// New function to ensure Content Diet tab is added
function ensureContentDietTab() {
  let attempts = 0;
  const maxAttempts = 10;
  const interval = 1000; // 1 second

  function tryAddingTab() {
    if (addContentDietTab()) {
      console.log('Content Diet tab added successfully after ' + attempts + ' attempts');
      return;
    }

    attempts++;
    if (attempts < maxAttempts) {
      setTimeout(tryAddingTab, interval);
    } else {
      console.error('Failed to add Content Diet tab after ' + maxAttempts + ' attempts');
    }
  }

  tryAddingTab();
}

function switchTab(tabName) {
  const tabButtons = document.querySelectorAll('.content-diet-tab-button');
  const tabPanes = document.querySelectorAll('.content-diet-tab-pane');

  tabButtons.forEach(button => {
    button.classList.toggle('active', button.getAttribute('data-tab') === tabName);
  });

  tabPanes.forEach(pane => {
    pane.classList.toggle('active', pane.id === `${tabName}-tab`);
  });
}

// Update handleExtractWisdom function
async function handleExtractWisdom() {
  const videoId = new URLSearchParams(window.location.search).get('v');
  if (!videoId) {
    console.error('Could not find video ID');
    return;
  }

  const wisdomContent = document.querySelector('#extracted-wisdom-content');
  wisdomContent.innerHTML = '<p>Extracting wisdom... Please wait.</p>';

  // Mock function to get transcript (in a real scenario, you'd fetch this from YouTube's API)
  const transcript = await getMockTranscript(videoId);

  // Mock API call to extract wisdom
  const wisdom = await mockExtractWisdom(transcript);

  // Display the extracted wisdom
  displayWisdom(wisdom);
}

// Update displayWisdom function
function displayWisdom(wisdom) {
  const wisdomContent = document.querySelector('#extracted-wisdom-content');
  wisdomContent.innerHTML = `
    <h3>Extracted Wisdom</h3>
    <p><strong>Summary:</strong> ${wisdom.summary}</p>
    <h4>Key Points:</h4>
    <ul>
      ${wisdom.keyPoints.map(point => `<li>${point}</li>`).join('')}
    </ul>
    <h4>Action Items:</h4>
    <ul>
      ${wisdom.actionItems.map(item => `<li>${item}</li>`).join('')}
    </ul>
  `;
}

// Update the styles
const styles = `
  .content-diet-tabs {
    margin-top: 16px;
  }
  .content-diet-tab-buttons {
    display: flex;
    border-bottom: 1px solid var(--yt-spec-10-percent-layer);
    margin-bottom: 16px;
  }
  .content-diet-tab-button {
    background: none;
    border: none;
    padding: 8px 16px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    color: var(--yt-spec-text-secondary);
  }
  .content-diet-tab-button.active {
    color: var(--yt-spec-text-primary);
    border-bottom: 2px solid var(--yt-spec-text-primary);
  }
  .content-diet-tab-pane {
    display: none;
  }
  .content-diet-tab-pane.active {
    display: block;
  }
  #extractWisdomBtn {
    margin-bottom: 16px;
  }
`;

// Update the initialization
function initContentDiet() {
  ensureContentDietTab();
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

// Run the initialization when the page loads and when navigating between videos
function observePageChanges() {
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      initContentDiet();
    }
  }).observe(document, {subtree: true, childList: true});
}

initContentDiet();
observePageChanges();

// Mock function to get transcript
async function getMockTranscript(videoId) {
  // In reality, you would fetch the actual transcript here
  return `This is a mock transcript for video ${videoId}. It contains the full text of the video's speech.`;
}

// Mock API call to extract wisdom
async function mockExtractWisdom(transcript) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Return mock wisdom
  return {
    summary: "This video discusses important topics and provides valuable insights.",
    keyPoints: [
      "Point 1: Lorem ipsum dolor sit amet",
      "Point 2: Consectetur adipiscing elit",
      "Point 3: Sed do eiusmod tempor incididunt"
    ],
    actionItems: [
      "Action 1: Implement the learned strategies",
      "Action 2: Share the knowledge with others",
      "Action 3: Practice the techniques regularly"
    ]
  };
}