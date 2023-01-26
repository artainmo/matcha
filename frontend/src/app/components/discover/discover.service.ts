import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { URL_ACCOUNT_SUGGESTIONS } from '../../config/urls';
import { IUserResult } from "../../shared/search.interface";
import { SortAndFilterService } from "../../shared/sort-and-filter/sort-and-filter.service";

@Injectable({
  providedIn: 'root'
})
export class DiscoverService {

	suggestionsBS: BehaviorSubject<IUserResult[]> = new BehaviorSubject<IUserResult[]>([]);
	suggestions$: Observable<IUserResult[]> = this.suggestionsBS.asObservable();

	isLoadingBS: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isLoading$: Observable<boolean> = this.isLoadingBS.asObservable();

	constructor(
		private readonly http: HttpClient,
		private readonly sortAndFilterService: SortAndFilterService
	) { }

	fetchSuggestions() {
		this.isLoadingBS.next(true);
		this.http.get<IUserResult[]>(URL_ACCOUNT_SUGGESTIONS).subscribe(
			(values: IUserResult[]) => {
				this.suggestionsBS.next(values);
				this.sortAndFilterService.initFilters(values);
				this.isLoadingBS.next(false);
			}
		)
	}
}
