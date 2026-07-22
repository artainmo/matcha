import { COMMA, ENTER, SPACE } from '@angular/cdk/keycodes';
import { ChangeDetectionStrategy, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatChipGrid, MatChipInput, MatChipInputEvent, MatChipRemove, MatChipRow } from '@angular/material/chips';
import { map, Observable, Subscription } from 'rxjs';
import { TagsService } from './tags.service';
import { MatError, MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { AsyncPipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatIconButton } from '@angular/material/button';
import { MatOption } from '@angular/material/core';

@Component({
	selector: 'app-tags',
	templateUrl: './tags.component.html',
	changeDetection: ChangeDetectionStrategy.Eager,
	imports: [FormsModule, MatFormField, MatLabel, MatChipGrid, MatChipRow, MatChipRemove, MatIcon, MatChipInput, MatAutocompleteTrigger, ReactiveFormsModule, MatIconButton, MatSuffix, MatAutocomplete, MatOption, MatError, AsyncPipe]
})
export class TagsComponent implements OnInit, OnDestroy {
	@ViewChild('tags') inputTag!: ElementRef;

	addOnBlur = true;
	readonly separatorKeysCodes = [ENTER, COMMA, SPACE] as const;
	control: FormControl = new FormControl<string>('')
	availableTags: Observable<string[]> = this.tagsService.availableTags$;
	alreadyInList: boolean = false;
	private subscription!: Subscription;

	constructor(
		private readonly tagsService: TagsService
	) {
	}

	_tags: string[] = [];

	@Input()
	get tags(): string[] {
		return this._tags;
	}

	set tags(ts: string[]) {
		this._tags = ts;
	}

	ngOnInit(): void {
		this.subscription = this.control.valueChanges.pipe(
			map(value => {
				this.alreadyInList = this._tags.indexOf(value) > -1;
				!!value ? this.tagsService.searchTags(value) : this.tagsService.resetSearch();
			}),
		).subscribe();
	}

	ngOnDestroy() {
		this.subscription.unsubscribe();
	}

	add(event: MatChipInputEvent | null): void {
		const value = (event ? (event.value || '').trim() : this.control.getRawValue()).replace(/[# ]/gi, '');

		if (this._tags.indexOf(value) > -1) {
			event ? event.chipInput!.clear() : this.control.setValue('');
			return;
		}
		if (value) {
			this._tags.push(value);
		}

		if (event)
			event.chipInput!.clear()
		this.inputTag.nativeElement.value = ' ';
		this.control.setValue('');
		this.tagsService.resetSearch();
	}

	remove(tag: string) {
		const index = this._tags.indexOf(tag);

		if (index >= 0) {
			this._tags.splice(index, 1);
		}
	}
}
