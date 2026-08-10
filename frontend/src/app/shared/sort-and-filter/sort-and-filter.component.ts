import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SortAndFilterService } from "./sort-and-filter.service";
import { IAvailableFilters, IFilter } from "./filter.interface";
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
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';

@Component({
	selector: 'app-sort-and-filter',
	templateUrl: './sort-and-filter.component.html',
	styleUrls: ['./sort-and-filter.component.css'],
	changeDetection: ChangeDetectionStrategy.Eager,
	imports: [MatFormField, MatLabel, MatSelect, FormsModule, ReactiveFormsModule, MatOption, MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, MatCheckbox, MatRadioButton, MatRadioGroup, AsyncPipe]
})
export class SortAndFilterComponent implements OnInit {

	@Input() showRelevant = false;

	sortBy: FormControl = new FormControl(this.showRelevant ? 'Relevant' : 'Location');
	@Output()
	appliedFilters: EventEmitter<IFilter> = new EventEmitter<IFilter>();
	_appliedFilter: IFilter = {
		ageMin: null,
		ageMax: null,
		distance: null,
		fame: null,
		commonTags: []
	};
	availableFilters$: Observable<IAvailableFilters> = this.sortAndFilterService.availableFiltersBS.asObservable()
		.pipe(tap((val: IAvailableFilters) => {
			this._appliedFilter = {
				ageMin: val.ageMin,
				ageMax: val.ageMax,
				fame: null,
				distance: null,
				commonTags: []
			};
			this.appliedFilters.emit(this._appliedFilter);
		}));

	constructor(
		private readonly sortAndFilterService: SortAndFilterService
	) {
	}

	ngOnInit(): void {
		this.sortAndFilterService.sortBS.next(this.showRelevant ? 'Relevant' : 'Location');
		this.sortBy.valueChanges.subscribe((val: string) => this.sortAndFilterService.sortBS.next(val));
	}

	toggleFameSelection(filter: number) {
		if (this._appliedFilter.fame === filter) {
			this._appliedFilter.fame = null;
		} else {
			this._appliedFilter.fame = filter;
		}
		this.appliedFilters.emit(this._appliedFilter);
	}

	toggleDistanceSelection(filter: number) {
		if (this._appliedFilter.distance === filter) {
			this._appliedFilter.distance = null;
		} else {
			this._appliedFilter.distance = filter;
		}
		this.appliedFilters.emit(this._appliedFilter);
	}

	updateCommonTagsList(filter: string) {
		const index = this._appliedFilter.commonTags.indexOf(filter);
		if (!this._appliedFilter.commonTags.includes(filter))
			this._appliedFilter.commonTags.push(filter);
		else
			this._appliedFilter.commonTags.splice(index, 1);
		this.appliedFilters.emit(this._appliedFilter);
	}

	updateAgeMin(ageMin: number | string | null) {
		this._appliedFilter.ageMin = this.normalizeAgeValue(ageMin);
		this.appliedFilters.emit(this._appliedFilter);
	}

	updateAgeMax(ageMax: number | string | null) {
		this._appliedFilter.ageMax = this.normalizeAgeValue(ageMax);
		this.appliedFilters.emit(this._appliedFilter);
	}

	private normalizeAgeValue(value: number | string | null): number | null {
		if (value === null || value === '') {
			return null;
		}
		const normalized = Number(value);
		return Number.isNaN(normalized) ? null : normalized;
	}
}
