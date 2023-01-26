import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { throwError } from 'rxjs/internal/observable/throwError';
import { catchError, tap } from 'rxjs/operators';
import {
	URL_ACCOUNT,
	URL_ACCOUNT_FIND, URL_BLOCK,
	URL_COMPLETE_ACCOUNT, URL_FAKE, URL_LIKE,
	URL_LOGIN,
	URL_REGISTER,
	URL_REQUEST_PASSWORD,
	URL_RESET_PASSWORD,
	URL_VERIFY_ACCOUNT
} from '../config/urls';
import { IProfile } from '../models/user.model';
import { NotificationsService } from './notifications.service';

@Injectable({
	providedIn: 'root'
})
export class AccountService {
	badLogin: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  wrongPassword: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  message: BehaviorSubject<string> = new BehaviorSubject<string>('');
  badUsername: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  isLoggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  activeUsername: string = '';

	constructor(
		private readonly http: HttpClient,
		private readonly router: Router,
		private readonly notificationsService: NotificationsService
	) {
	}

	login(username: string, password: string) {
		this.http.get<{ completed: boolean }>(URL_LOGIN(username, password)).pipe(
			tap(() => {
				this.badLogin.next(false);
				this.wrongPassword.next(false);
			}),
			catchError((error: HttpErrorResponse) => {
				let message = '';
				if (error.status === 400) {
					message = 'incorrect combination user password';
					this.wrongPassword.next(true);
				} else if (error.status === 404) {
					message = 'username not found';
					this.badLogin.next(true);
				} else if (error.status === 417) {
					message = 'account not verified';
					this.badLogin.next(true);
				}
				return throwError(message);
			})
		).subscribe({
			next: (val: { completed: boolean }) => {
				this.activeUsername = username;
				this.isLoggedIn.next(true);
				if (val.completed) {
					this.router.navigate(['/discover']).then();
					this.notificationsService.subscribe();
				} else {
					this.router.navigate(['/profile/complete']).then();
				}
			},
			error: (error) => {
				this.message.next(error);
			}}
		);
	}

	register(body: Partial<IProfile>): Observable<string> {
		return this.http.post<string>(URL_REGISTER, body);
	}

	requestNewPassword(username: string) {
		this.http.get(URL_REQUEST_PASSWORD(username)).pipe(
			tap(() => {
				this.badUsername.next(false);
			}),
			catchError((error: HttpErrorResponse) => {
				let message = '';
				if (error.status === 417) {
					message = 'Username not found';
					this.badUsername.next(true);
				}
				return throwError(message);
			})
		).subscribe(
			() => {
				this.message.next('Check your email to reset your password.');
			},
			(error) => {
				this.message.next(error);
			}
		);
	}

	resetPassword(token: string, password: string) {
		this.http.get(URL_RESET_PASSWORD(token, password))
			.subscribe(
				() => {
					this.router.navigate(['/sign/in']).then();
				},
				(error) => {
					this.message.next(error);
				}
			);
	}

	logout() {
		this.notificationsService.unsubscribe();
		this.isLoggedIn.next(false);
    this.router.navigate(['/sign/in']).then();
	}

	validate(token: string) {
		this.http.post(URL_VERIFY_ACCOUNT, token)
			.subscribe(
				() => {
					this.router.navigate(['/sign/in']).then();
				},
				(error) => {
					this.message.next(error);
				});
	}

	complete(values: any) {
		return this.http.patch(URL_COMPLETE_ACCOUNT, values).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status >= 200 && error.status < 300) {
          return of({});
        }
        return throwError(error);
      }));
	}


  getProfile(username: string = this.activeUsername): Observable<string | IProfile> {
    return this.http.get<IProfile>(URL_ACCOUNT_FIND(username)).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status >= 200 && error.status < 300) {
          return of(error.message);
        }
        return throwError(error);
      }));
  }

  patchUser(data: Object) {
    return this.http.patch(URL_ACCOUNT, data);
  }

  likeProfile(otherUsername: string) {
    return this.http.post(URL_LIKE + otherUsername, {}).pipe(
	    catchError((error: HttpErrorResponse) => {
		    if (error.status >= 200 && error.status < 300) {
			    return of(error.message);
		    }
		    return throwError(error);
	    }));
  }

  dislikeProfile(otherUsername: string) {
    return this.http.delete(URL_LIKE + otherUsername).pipe(
	    catchError((error: HttpErrorResponse) => {
		    if (error.status >= 200 && error.status < 300) {
			    return of(error.message);
		    }
		    return throwError(error);
	    }));
  }

	blockProfile(otherUsername: string) {
    return this.http.post(URL_BLOCK + otherUsername, {}).pipe(
	    catchError((error: HttpErrorResponse) => {
		    if (error.status >= 200 && error.status < 300) {
			    return of(error.message);
		    }
		    return throwError(error);
	    }));
  }

	reportAsFake(otherUsername: string) {
    return this.http.post(URL_FAKE + '/' + otherUsername, {}).pipe(
	    catchError((error: HttpErrorResponse) => {
		    if (error.status >= 200 && error.status < 300) {
			    return of(error.message);
		    }
		    return throwError(error);
	    }));
  }
}
