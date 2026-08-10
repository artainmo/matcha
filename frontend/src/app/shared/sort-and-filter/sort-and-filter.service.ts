import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IUserResult } from "../search.interface";
import { IAvailableFilters } from "./filter.interface";

@Injectable({
	providedIn: 'root'
})
export class SortAndFilterService {
	sortBS: BehaviorSubject<string> = new BehaviorSubject<string>('');
	availableFiltersBS: BehaviorSubject<IAvailableFilters> = new BehaviorSubject<IAvailableFilters>({
		ageMin: null,
		ageMax: null,
		distance: [],
		fame: [],
		commonTags: []
	});

	constructor() {
	}

	initFilters(res: IUserResult[]) {
		const availableFilters: IAvailableFilters = {
			ageMin: null,
			ageMax: null,
			distance: [],
			fame: [],
			commonTags: []
		};
		for (const item of res) {
			if (!(availableFilters.distance.includes(item.distance)))
				availableFilters.distance.push(item.distance);
			if (!(availableFilters.fame.includes(item.fame)))
				availableFilters.fame.push(item.fame);
			for (const tag of item.tags) {
				if (!(availableFilters.commonTags.includes(tag)))
					availableFilters.commonTags.push(tag);
			}
		}
		this.availableFiltersBS.next(availableFilters);
	}

	resetFilters() {
		this.availableFiltersBS.next({
			ageMin: null,
			ageMax: null,
			distance: [],
			fame: [],
			commonTags: []
		});
	}
}
