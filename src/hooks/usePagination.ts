import { useState } from 'react';

// Reusable pagination hook isolating page index state
export function usePagination(initialPage = 1) {
	const [page, setPage] = useState(initialPage);
	return [page, setPage] as const;
}
