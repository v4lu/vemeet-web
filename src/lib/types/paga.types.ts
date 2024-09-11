export type Sort = {
	sorted: boolean;
	unsorted: boolean;
	empty: boolean;
};

export type Pageable = {
	pageNumber: number;
	pageSize: number;
	sort: Sort;
	offset: number;
	paged: boolean;
	unpaged: boolean;
};
