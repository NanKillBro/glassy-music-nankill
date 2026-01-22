// content.js

(function () {
	'use strict';

	// --- Injection Guard ---
	// This ensures the script only runs once per page, even if it's injected multiple times.
	if (window.isYtAntiIdleInjected) {
		return;
	}
	window.isYtAntiIdleInjected = true;

	// --- Constants and Selectors ---
	const SIMULATE_INTERVAL_MS = 2 * 60 * 1000;
	const USER_INTERACTION_DEBOUNCE_MS = 15 * 1000;
	const VIDEO_SELECTOR = 'video.html5-main-video';
	const EVENT_TARGET_SELECTOR = 'body';

	// --- State Variables ---
	let activityIntervalId = null;
	let lastUserInteractionTime = Date.now();
	let observer = null;

	function getVideoElement() {
		return document.querySelector(VIDEO_SELECTOR);
	}

	function isVideoPlaying(videoElement) {
		if (!videoElement) return false;
		return (
			!videoElement.paused &&
			!videoElement.ended &&
			videoElement.readyState > 2 &&
			!videoElement.seeking &&
			videoElement.currentTime > 0
		);
	}

	function recordUserInteraction() {
		lastUserInteractionTime = Date.now();
	}

	function simulateShiftKeyPress() {
		const videoElement = getVideoElement();
		const targetElement = document.querySelector(EVENT_TARGET_SELECTOR);

		if (!targetElement || !isVideoPlaying(videoElement)) {
			return;
		}

		const timeSinceLastInteraction = Date.now() - lastUserInteractionTime;
		if (timeSinceLastInteraction < USER_INTERACTION_DEBOUNCE_MS) {
			return;
		}

		try {
			const keyProps = {
				key: 'Shift',
				code: 'ShiftLeft',
				keyCode: 16,
				which: 16,
				shiftKey: true,
				bubbles: true,
				cancelable: true,
			};
			const kdEvent = new KeyboardEvent('keydown', keyProps);
			targetElement.dispatchEvent(kdEvent);
			const kuEvent = new KeyboardEvent('keyup', { ...keyProps, shiftKey: false });
			targetElement.dispatchEvent(kuEvent);
		} catch (error) {
			// Silently catch potential errors
		}
	}

	function stopSimulationInterval() {
		if (activityIntervalId !== null) {
			clearInterval(activityIntervalId);
			activityIntervalId = null;
		}
	}

	function startSimulationInterval() {
		stopSimulationInterval();
		if (getVideoElement()) {
			activityIntervalId = setInterval(
				simulateShiftKeyPress,
				SIMULATE_INTERVAL_MS
			);
			setTimeout(simulateShiftKeyPress, 5000);
		}
	}

	function stopActivityListeners() {
		window.removeEventListener('mousemove', recordUserInteraction, { capture: true });
		window.removeEventListener('mousedown', recordUserInteraction, { capture: true });
		window.removeEventListener('keydown', recordUserInteraction, { capture: true });
		window.removeEventListener('scroll', recordUserInteraction, { capture: true });
		window.removeEventListener('wheel', recordUserInteraction, { capture: true });
		window.removeEventListener('touchstart', recordUserInteraction, { capture: true });
	}

	function startActivityListeners() {
		stopActivityListeners(); // Ensure listeners are not duplicated
		const listenerOptions = { passive: true, capture: true };
		window.addEventListener('mousemove', recordUserInteraction, listenerOptions);
		window.addEventListener('mousedown', recordUserInteraction, listenerOptions);
		window.addEventListener('keydown', recordUserInteraction, listenerOptions);
		window.addEventListener('scroll', recordUserInteraction, listenerOptions);
		window.addEventListener('wheel', recordUserInteraction, listenerOptions);
		window.addEventListener('touchstart', recordUserInteraction, listenerOptions);
	}

	function setupObserver() {
		if (observer) observer.disconnect();

		observer = new MutationObserver(() => {
			const videoExists = !!getVideoElement();
			if (videoExists && activityIntervalId === null) {
				startSimulationInterval();
				startActivityListeners();
			} else if (!videoExists && activityIntervalId !== null) {
				stopSimulationInterval();
				stopActivityListeners();
			}
		});

		observer.observe(document.body, { childList: true, subtree: true });

		if (getVideoElement() && activityIntervalId === null) {
			startSimulationInterval();
			startActivityListeners();
		}
	}

	// --- Initialize ---
	if (document.body) {
		setupObserver();
	} 
})();