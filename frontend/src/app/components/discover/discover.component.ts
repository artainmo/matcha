import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { DiscoverService } from './discover.service';
import { IUserResult } from "../../shared/search.interface";
import { IFilter } from "../../shared/sort-and-filter/filter.interface";
import { SortAndFilterService } from "../../shared/sort-and-filter/sort-and-filter.service";

@Component({
	selector: 'app-discover',
	templateUrl: './discover.component.html',
})
export class DiscoverComponent implements OnInit {

	results$: Observable<IUserResult[]> = this.discoverService.suggestions$;
	sortArg$: Observable<string> = this.sortAndFilterService.sortBS.asObservable();
	filterArg: IFilter = {
		birthday: [], commonTags: [], distance: [], fame: []
	};
	isLoading$: Observable<boolean> = this.discoverService.isLoading$;

	constructor(
		private readonly discoverService: DiscoverService,
		private readonly sortAndFilterService: SortAndFilterService,
	) {
	}

	ngOnInit(): void {
		this.sortAndFilterService.resetFilters();
		this.discoverService.fetchSuggestions();
	}

	log(filters: IFilter) {
		this.filterArg = {...filters};
	}

}
