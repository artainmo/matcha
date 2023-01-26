import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IUserResult } from "../search.interface";
import { IFilter } from "./filter.interface";

@Injectable({
  providedIn: 'root'
})
export class SortAndFilterService {
	sortBS: BehaviorSubject<string> = new BehaviorSubject<string>('');
	availableFiltersBS: BehaviorSubject<IFilter> = new BehaviorSubject<IFilter>({
		birthday: [],
		distance: [],
		fame: [],
		commonTags: []
	});

  constructor() { }

	initFilters(res: IUserResult[]) {
		const availableFilters: IFilter = {
			birthday: [],
			distance: [],
			fame: [],
			commonTags: []
		};
		for (const item of res) {
			if (!(availableFilters.birthday.includes(item.birthday)))
				availableFilters.birthday.push(item.birthday);
			if (!(availableFilters.distance.includes(item.distance)))
				availableFilters.distance.push(item.distance);
			if (!(availableFilters.fame.includes(item.fame)))
				availableFilters.fame.push(item.fame);
			if (!(availableFilters.commonTags.includes(item.numberOfTags)))
				availableFilters.commonTags.push(item.numberOfTags);
		}
		this.availableFiltersBS.next(availableFilters);
	}

	resetFilters() {
		this.availableFiltersBS.next({
			birthday: [],
			distance: [],
			fame: [],
			commonTags: []
		});
	}
}
