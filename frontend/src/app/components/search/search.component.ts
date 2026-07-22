import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SearchService } from "./search.service";
import { Observable } from 'rxjs';
import { IUserResult } from "../../shared/search.interface";
import { SortAndFilterService } from "../../shared/sort-and-filter/sort-and-filter.service";
import { IFilter } from "../../shared/sort-and-filter/filter.interface";
import { SearchBarComponent } from './search-bar/search-bar.component';
import { SortAndFilterComponent } from '../../shared/sort-and-filter/sort-and-filter.component';
import { MatList, MatListItem, MatListSubheaderCssMatStyler } from '@angular/material/list';
import { AsyncPipe } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatLine } from '@angular/material/core';
import { MatDivider } from '@angular/material/divider';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { SortPipe } from '../../shared/sort-and-filter/sort.pipe';
import { FilterPipe } from '../../shared/sort-and-filter/filter.pipe';

@Component({
	selector: 'app-search',
	templateUrl: './search.component.html',
	changeDetection: ChangeDetectionStrategy.Eager,
	imports: [SearchBarComponent, SortAndFilterComponent, MatList, MatListSubheaderCssMatStyler, MatListItem, MatButton, RouterLink, MatIcon, MatLine, MatDivider, MatProgressSpinner, AsyncPipe, SortPipe, FilterPipe]
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
	) {
	}

	log(filters: IFilter) {
		this.filterArg = {...filters};
	}
}
