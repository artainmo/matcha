import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable } from 'rxjs';
import { IUserResult } from "../../shared/search.interface";
import { URL_SEARCH } from "../../config/urls";
import { SortAndFilterService } from "../../shared/sort-and-filter/sort-and-filter.service";

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
  ) { }

	search(body: any) {
		this.isLoadingBS.next(true);
		this.http.post<IUserResult[]>(URL_SEARCH, body).subscribe(
			(res: IUserResult[]) => {
				this.resultsBS.next(res);
				this.sortAndFilterService.initFilters(res);
				this.isLoadingBS.next(false);
			}
		)
	}



}
