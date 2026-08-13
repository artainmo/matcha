import { COMMA, ENTER, SPACE } from '@angular/cdk/keycodes';
import {
	ChangeDetectionStrategy,
	Component,
	Input,
	model,
	ModelSignal,
	OnInit,
	signal,
	WritableSignal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { Observable } from 'rxjs';
import { TagsService } from './tags.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { AsyncPipe } from '@angular/common';

@Component({
	selector: 'app-tags',
	templateUrl: './tags.component.html',
	changeDetection: ChangeDetectionStrategy.Eager,
	imports: [AsyncPipe, MatFormFieldModule, MatAutocompleteModule, MatChipsModule, MatIconModule, FormsModule]
})
export class TagsComponent implements OnInit {

	readonly separatorKeysCodes = [ENTER, COMMA, SPACE] as const;
	availableTags: Observable<string[]> = this.tagsService.availableTags$;
	readonly _tags: WritableSignal<string[]> = signal([]);
	currentTag: ModelSignal<string> = model('');

	constructor(
		private readonly tagsService: TagsService
	) {
	}

	@Input()
	get tags(): string[] {
		return this._tags();
	}

	set tags(ts: string[]) {
		this._tags.set(ts);
	}

	ngOnInit(): void {
		this.currentTag.subscribe(value => {
			!!value ? this.tagsService.searchTags(value) : this.tagsService.resetSearch();
		});
	}

	add(event: MatChipInputEvent): void {
		const value = (event.value || '').trim();

		// Add our fruit
		if (value) {
			this._tags.update(fruits => [...fruits, value]);
		}

		// Clear the input value
		this.currentTag.set('');
	}

	selected(event: MatAutocompleteSelectedEvent): void {
		this._tags.update(tags => [...tags, event.option.viewValue]);
		this.currentTag.set('');
		event.option.deselect();
	}

	remove(tag: string) {
		this._tags.update(tags => {
			const index = tags.indexOf(tag);
			if (index < 0) {
				return tags;
			}

			tags.splice(index, 1);
			return [...tags];
		});
	}
}
