import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { URL_PICTURES } from '../../../../config/urls';
import { catchError } from "rxjs/operators";
import { throwError } from "rxjs/internal/observable/throwError";
import { MatSnackBar } from "@angular/material/snack-bar";

@Injectable({
  providedIn: 'root'
})
export class PictureService {
	constructor(
		private readonly http: HttpClient,
		private _snackBar: MatSnackBar
	) { }

	getPictures() {
		return this.http.get<[path: string, user: string][]>(URL_PICTURES);
	}

	uploadPicture(file: File): Observable<string[]> {
		const data: FormData = new FormData();
		data.append('file', file);
		return this.http.post<string[]>(URL_PICTURES, data).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status >= 200 && error.status < 300) {
          return of([]);
        }
				this.openSnackBar(error.message);
        return throwError(error);
      }));
	}

	deletePicture(file: string) {
		return this.http.delete(URL_PICTURES, {
			body: {
				storage_path: file
			}
		});
	}

	openSnackBar(message: string) {
		this._snackBar.open(message);
	}
}
