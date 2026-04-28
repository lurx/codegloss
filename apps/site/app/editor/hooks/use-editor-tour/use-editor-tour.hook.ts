import { useCallback, useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { EDITOR_TOUR_STEPS, TOUR_STORAGE_KEY } from './use-editor-tour.data';
import type { EditorTourController } from './use-editor-tour.types';

const FIRST_VISIT_DELAY_MS = 400;

function hasSeenTour(): boolean {
	if (typeof window === 'undefined') return true;
	try {
		return window.localStorage.getItem(TOUR_STORAGE_KEY) === '1';
	} catch {
		return true;
	}
}

function markTourSeen(): void {
	if (typeof window === 'undefined') return;
	try {
		window.localStorage.setItem(TOUR_STORAGE_KEY, '1');
	} catch {
		// ignore — private mode or quota
	}
}

export function useEditorTour(): EditorTourController {
	const startTour = useCallback(() => {
		const instance = driver({
			showProgress: true,
			allowClose: true,
			popoverClass: 'codegloss-tour',
			steps: [...EDITOR_TOUR_STEPS],
			onHighlightStarted: element => {
				if (!(element instanceof HTMLElement)) return;
				element.scrollIntoView({
					behavior: 'auto',
					block: 'center',
					inline: 'center',
				});
			},
			onDestroyed: markTourSeen,
		});
		instance.drive();
	}, []);

	useEffect(() => {
		if (hasSeenTour()) return;
		const timeoutId = window.setTimeout(startTour, FIRST_VISIT_DELAY_MS);
		return () => window.clearTimeout(timeoutId);
	}, [startTour]);

	return { startTour };
}
