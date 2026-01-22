'use strict';

const HOW_TO_USE_PAGE_URL = 'https://saasminded.dev/youtube-nonstop-browser-extension/';
const UNINSTALL_REASON_PAGE_URL = 'https://saasminded.dev/youtube-nonstop-feedback/';
const CHANGELOG_PAGE_URL = 'https://saasminded.dev/youtube-new-features-questionnaire/';

chrome.runtime.onInstalled.addListener((details) => {
	chrome.runtime.setUninstallURL(UNINSTALL_REASON_PAGE_URL);

	if (details.reason === 'install') {
		chrome.tabs.create({ url: HOW_TO_USE_PAGE_URL });
	} else if (details.reason === 'update') {
		// Open on update
		// chrome.tabs.create({ url: CHANGELOG_PAGE_URL });
	}

	// After install or update, reload existing YouTube tabs to to ensure the content script is active.
	chrome.tabs.query({ url: '*://*.youtube.com/*' }, (tabs) => {
		for (const tab of tabs) {
			chrome.tabs.reload(tab.id);
		}
	});
});
