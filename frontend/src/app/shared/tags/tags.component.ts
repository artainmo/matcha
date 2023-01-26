import { COMMA, ENTER, SPACE } from '@angular/cdk/keycodes';
import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { map, Observable, Subscription } from 'rxjs';
import { TagsService } from './tags.service';

@Component({
	selector: 'app-tags',
	templateUrl: './tags.component.html'
})
export class TagsComponent implements OnInit, OnDestroy {
	@ViewChild('tags') inputTag!: ElementRef;

	addOnBlur = true;
	readonly separatorKeysCodes = [ENTER, COMMA, SPACE] as const;

  @Input()
  get tags(): string[] {return this._tags;}
  set tags(ts: string[]) {
    this._tags = ts;
  }

	control: FormControl = new FormControl<string>('')

	_tags: string[] = [];
	availableTags: Observable<string[]> = this.tagsService.availableTags$;
	alreadyInList: boolean = false;
	private subscription!: Subscription;

	constructor(
		private readonly tagsService: TagsService
	) {
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
