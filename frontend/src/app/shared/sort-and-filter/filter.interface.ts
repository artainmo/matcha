export interface IFilter {
	fame: number | null;
	distance: number | null;
	commonTags: string[];
	ageMin: number | null;
	ageMax: number | null;
}

export interface IAvailableFilters {
	fame: number[];
	distance: number[];
	commonTags: string[];
	ageMin: number | null;
	ageMax: number | null;
}
