import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { URL_TAGS_SEARCH } from '../../config/urls';

@Injectable({
	providedIn: 'root'
})
export class TagsService {

  availableTagsBS: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
	availableTags$: Observable<string[]> = this.availableTagsBS.asObservable();


	constructor(
		private readonly http: HttpClient
	) {
	}


	searchTags(search: string) {
		search = search.replace(/[# ]/gi, '');
		if (search.length === 0)
			return;
		this.http.get<string[]>(URL_TAGS_SEARCH(search))
			.subscribe(
				(res: string[]) => {
					this.availableTagsBS.next(res);
				}
			);
	}

	resetSearch() {
		this.availableTagsBS.next([]);
	}


}
