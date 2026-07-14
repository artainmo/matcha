import { Component, Input, OnInit } from '@angular/core';
import { SearchService } from "../search.service";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Observable } from 'rxjs';
import { SortAndFilterService } from "../../../shared/sort-and-filter/sort-and-filter.service";
import { MatCard, MatCardTitle, MatCardContent } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { TagsComponent } from '../../../shared/tags/tags.component';
import { MatButton } from '@angular/material/button';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-search-bar',
    templateUrl: './search-bar.component.html',
    imports: [FormsModule, ReactiveFormsModule, MatCard, MatCardTitle, MatCardContent, MatFormField, MatLabel, MatInput, TagsComponent, MatButton, AsyncPipe]
})
export class SearchBarComponent implements OnInit {

	@Input() showRelevant = false;

	loading$: Observable<boolean> = this.searchService.isLoading$;

	form: FormGroup = new FormGroup<any>({
		'ageGapMin': new FormControl(null),
		'ageGapMax': new FormControl(null),
		'fameGapMin': new FormControl(null),
		'fameGapMax': new FormControl(null),
		'location': new FormControl(null),
	})
	_tags: string[] = [];

  constructor(
		private readonly searchService: SearchService,
		private readonly sortAndFilterService: SortAndFilterService
  ) { }

  ngOnInit(): void {
		this.search();
  }

	search() {
		this.sortAndFilterService.resetFilters();
		this.searchService.search(this.getBody());
	}

	getBody() {
		const formValue = this.form.getRawValue();
		const res = {
			minAge: formValue['ageGapMin'],
			maxAge: formValue['ageGapMax'],
			minFame: formValue['fameGapMin'],
			maxFame: formValue['fameGapMax'],
			location: formValue['location'],
			tags: this._tags.length > 0 ? this._tags : null,
		} as any;
		for (const key in res) {
			if (!res[key] || (typeof res[key] === 'string' && res[key] === '') || (typeof res[key] === 'number' && res[key] === 0)) {
				delete res[key];
			}
		}
		return res;
	}

}
