import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { DiscoverService } from './discover.service';
import { IUserResult } from "../../shared/search.interface";
import { IFilter } from "../../shared/sort-and-filter/filter.interface";
import { SortAndFilterService } from "../../shared/sort-and-filter/sort-and-filter.service";
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { SortAndFilterComponent } from '../../shared/sort-and-filter/sort-and-filter.component';
import { MatList, MatListSubheaderCssMatStyler, MatListItem } from '@angular/material/list';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatLine } from '@angular/material/core';
import { MatDivider } from '@angular/material/divider';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { SortPipe } from '../../shared/sort-and-filter/sort.pipe';
import { FilterPipe } from '../../shared/sort-and-filter/filter.pipe';

@Component({
    selector: 'app-discover',
    templateUrl: './discover.component.html',
    imports: [NgIf, SortAndFilterComponent, MatList, MatListSubheaderCssMatStyler, NgFor, MatListItem, MatButton, RouterLink, MatIcon, MatLine, MatDivider, MatProgressSpinner, AsyncPipe, SortPipe, FilterPipe]
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
