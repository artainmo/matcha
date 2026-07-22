import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SortAndFilterService } from "./sort-and-filter.service";
import { IFilter } from "./filter.interface";
import { Observable, tap } from 'rxjs';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { AsyncPipe } from '@angular/common';
import { MatOption } from '@angular/material/core';
import {
	MatAccordion,
	MatExpansionPanel,
	MatExpansionPanelHeader,
	MatExpansionPanelTitle
} from '@angular/material/expansion';
import { MatCheckbox } from '@angular/material/checkbox';

@Component({
	selector: 'app-sort-and-filter',
	templateUrl: './sort-and-filter.component.html',
	styleUrls: ['./sort-and-filter.component.css'],
	changeDetection: ChangeDetectionStrategy.Eager,
	imports: [MatFormField, MatLabel, MatSelect, FormsModule, ReactiveFormsModule, MatOption, MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, MatCheckbox, AsyncPipe]
})
export class SortAndFilterComponent implements OnInit {

	@Input() showRelevant = false;

	sortBy: FormControl = new FormControl(this.showRelevant ? 'Relevant' : 'Location');
	@Output()
	appliedFilters: EventEmitter<IFilter> = new EventEmitter<IFilter>();
	_appliedFilter: IFilter = {
		birthday: [],
		distance: [],
		fame: [],
		commonTags: []
	};
	availableFilters$: Observable<IFilter> = this.sortAndFilterService.availableFiltersBS.asObservable()
		.pipe(tap((val: IFilter) => {
			this._appliedFilter = JSON.parse(JSON.stringify(val));
			this.appliedFilters.emit(val);
		}));

	constructor(
		private readonly sortAndFilterService: SortAndFilterService
	) {
	}

	ngOnInit(): void {
		this.sortAndFilterService.sortBS.next(this.showRelevant ? 'Relevant' : 'Location');
		this.sortBy.valueChanges.subscribe((val: string) => this.sortAndFilterService.sortBS.next(val));
	}

	updateFameList(filter: number) {
		const index = this._appliedFilter.fame.indexOf(filter);
		if (!this._appliedFilter.fame.includes(filter))
			this._appliedFilter.fame.push(filter);
		else
			this._appliedFilter.fame.splice(index, 1);
		this.appliedFilters.emit(this._appliedFilter);
	}

	updateDistanceList(filter: number) {
		const index = this._appliedFilter.distance.indexOf(filter);
		if (index === -1) {
			this._appliedFilter.distance.push(filter);
		} else {
			this._appliedFilter.distance.splice(index, 1);
		}
		this.appliedFilters.emit(this._appliedFilter);
	}

	updateCommonTagsList(filter: number) {
		const index = this._appliedFilter.commonTags.indexOf(filter);
		if (!this._appliedFilter.commonTags.includes(filter))
			this._appliedFilter.commonTags.push(filter);
		else
			this._appliedFilter.commonTags.splice(index, 1);
		this.appliedFilters.emit(this._appliedFilter);
	}

	updateBirthdayList(filter: string) {
		const index = this._appliedFilter.birthday.indexOf(filter);
		if (!this._appliedFilter.birthday.includes(filter))
			this._appliedFilter.birthday.push(filter);
		else
			this._appliedFilter.birthday.splice(index, 1);
		this.appliedFilters.emit(this._appliedFilter);
	}
}
