import { COMMA, ENTER, SPACE } from '@angular/cdk/keycodes';
import {
	ChangeDetectionStrategy,
	Component,
	Input,
	model,
	ModelSignal,
	OnInit, output, Output,
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
	tags: ModelSignal<string[]> = model<string[]>([]);
	currentTag: ModelSignal<string> = model('');

	constructor(
		private readonly tagsService: TagsService
	) {
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
			this.tags.update(fruits => [...fruits, value]);
		}

		// Clear the input value
		this.currentTag.set('');
	}

	selected(event: MatAutocompleteSelectedEvent): void {
		this.tags.update(tags => [...tags, event.option.viewValue]);
		this.currentTag.set('');
		event.option.deselect();
	}

	remove(tag: string) {
		this.tags.update(tags => {
			const index = tags.indexOf(tag);
			if (index < 0) {
				return tags;
			}

			tags.splice(index, 1);
			return [...tags];
		});
	}
}
