import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { DiscoverService } from './discover.service';
import { IUserResult } from "../../shared/search.interface";
import { IFilter } from "../../shared/sort-and-filter/filter.interface";
import { SortAndFilterService } from "../../shared/sort-and-filter/sort-and-filter.service";
import { AsyncPipe } from '@angular/common';
import { SortAndFilterComponent } from '../../shared/sort-and-filter/sort-and-filter.component';
import { MatList, MatListItem, MatListItemLine, MatListItemMeta, MatListItemTitle, MatListSubheaderCssMatStyler } from '@angular/material/list';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/divider';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { SortPipe } from '../../shared/sort-and-filter/sort.pipe';
import { FilterPipe } from '../../shared/sort-and-filter/filter.pipe';

@Component({
	selector: 'app-discover',
	templateUrl: './discover.component.html',
	styleUrls: ['./discover.component.css'],
	changeDetection: ChangeDetectionStrategy.Eager,
	imports: [SortAndFilterComponent, MatList, MatListSubheaderCssMatStyler, MatListItem, MatButton, RouterLink, MatIcon, MatListItemTitle, MatListItemLine, MatListItemMeta, MatDivider, MatProgressSpinner, AsyncPipe, SortPipe, FilterPipe]
})
export class DiscoverComponent implements OnInit {

	results$: Observable<IUserResult[]> = this.discoverService.suggestions$;
	sortArg$: Observable<string> = this.sortAndFilterService.sortBS.asObservable();
	filterArg: IFilter = {
		ageMin: null, ageMax: null, commonTags: [], distance: null, fame: null
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
