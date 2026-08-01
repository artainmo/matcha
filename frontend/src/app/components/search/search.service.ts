import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable } from 'rxjs';
import { IUserResult, IUserResultResponse } from "../../shared/search.interface";
import { URL_SEARCH } from "../../config/urls";
import { SortAndFilterService } from "../../shared/sort-and-filter/sort-and-filter.service";
import { mapUserResultResponse } from "../../shared/user-result.mapper";

@Injectable({
	providedIn: 'root'
})
export class SearchService {

	resultsBS: BehaviorSubject<IUserResult[]> = new BehaviorSubject<IUserResult[]>([]);

	isLoadingBS: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	isLoading$: Observable<boolean> = this.isLoadingBS.asObservable();

	constructor(
		private readonly http: HttpClient,
		private readonly sortAndFilterService: SortAndFilterService
	) {
	}

	search(body: any) {
		this.isLoadingBS.next(true);
		this.http.post<IUserResultResponse[]>(URL_SEARCH, body).subscribe(
			(res: IUserResultResponse[]) => {
				const users = res.map(mapUserResultResponse);
				this.resultsBS.next(users);
				this.sortAndFilterService.initFilters(users);
				this.isLoadingBS.next(false);
			}
		)
	}


}
