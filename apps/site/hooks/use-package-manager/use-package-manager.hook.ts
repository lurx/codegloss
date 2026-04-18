'use client';

import { useCallback, useEffect, useState } from 'react';
import type { PackageManager, UsePackageManagerResult } from './use-package-manager.types';
import {
	DEFAULT_MANAGER,
	STORAGE_EVENT,
	STORAGE_KEY,
	VALID_MANAGERS,
} from './use-package-manager.constants';

function readFromStorage(): PackageManager {
	if (typeof window === 'undefined') return DEFAULT_MANAGER;
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (raw !== null && (VALID_MANAGERS as readonly string[]).includes(raw)) {
			return raw as PackageManager;
		}
	} catch {
		// ignore — private mode or disabled storage
	}
	return DEFAULT_MANAGER;
}

export function usePackageManager(): UsePackageManagerResult {
	// Initialize with the SSR-safe default so server and first client render
	// agree; the effect below lifts in the stored preference after mount.
	const [manager, setManager] = useState<PackageManager>(DEFAULT_MANAGER);

	useEffect(() => {
		setManager(readFromStorage());

		const handleChange = (event: Event) => {
			if (event instanceof CustomEvent) {
				setManager(event.detail as PackageManager);
				return;
			}
			setManager(readFromStorage());
		};

		window.addEventListener(STORAGE_EVENT, handleChange);
		window.addEventListener('storage', handleChange);
		return () => {
			window.removeEventListener(STORAGE_EVENT, handleChange);
			window.removeEventListener('storage', handleChange);
		};
	}, []);

	const setPackageManagerAction = useCallback((next: PackageManager) => {
		setManager(next);
		try {
			window.localStorage.setItem(STORAGE_KEY, next);
		} catch {
			// ignore — private mode or disabled storage
		}
		window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: next }));
	}, []);

	return [manager, setPackageManagerAction];
}
