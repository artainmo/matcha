import { Component } from '@angular/core';
import { SearchService } from "./search.service";
import { Observable } from 'rxjs';
import { IUserResult } from "../../shared/search.interface";
import { SortAndFilterService } from "../../shared/sort-and-filter/sort-and-filter.service";
import { IFilter } from "../../shared/sort-and-filter/filter.interface";

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
})
export class SearchComponent {

	results$: Observable<IUserResult[]> = this.searchService.resultsBS.asObservable();
	sortArg$: Observable<string> = this.sortAndFilterService.sortBS.asObservable();
	filterArg: IFilter = {
		birthday: [], commonTags: [], distance: [], fame: []
	};
	isLoading$: Observable<boolean> = this.searchService.isLoading$;

  constructor(
		private readonly searchService: SearchService,
		private readonly sortAndFilterService: SortAndFilterService,
  ) { }

	log(filters: IFilter) {
		this.filterArg = {...filters};
	}
}
