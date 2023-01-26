import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, Subscription, take, throwError, timer } from 'rxjs';
import { URL_NOTIFICATIONS } from '../config/urls';
import { INotification } from '../models/notification.model';

@Injectable({
	providedIn: 'root'
})
export class NotificationsService {

	hasNewNotificationsBS: BehaviorSubject<number> = new BehaviorSubject<number>(0);
	hasNewNotifications$: Observable<number> = this.hasNewNotificationsBS.asObservable()
	notificationsBS: BehaviorSubject<INotification[]> = new BehaviorSubject<INotification[]>([]);
	notifications$: Observable<INotification[]> = this.notificationsBS.asObservable();
	timerSubscription: Subscription = new Subscription;

	constructor(
		private readonly http: HttpClient
	) {
	}

	subscribe() {
		this.timerSubscription = timer(0, 10000)
			.pipe(map(() => {
				this.getNotifications();
			}))
			.subscribe();
	}

	unsubscribe() {
		this.timerSubscription.unsubscribe();
	}

	private getNotifications() {
		this.http.get<INotification[]>(URL_NOTIFICATIONS)
			.pipe(
				take(1),
				catchError((error: HttpErrorResponse) => {
					if (error.status === 417) {
						return [];
					}
					return throwError(null);
				})
			)
			.subscribe(
				(notifications: INotification[]) => {
					this.notificationsBS.next(notifications);
					this.hasNewNotificationsBS.next(notifications.filter((notif: INotification) => !notif.opened).length);
				}
			)
	}

	markRead(id: string) {
		this.http.patch(URL_NOTIFICATIONS + '/' + id + '/opened/true', {}).subscribe();
	}

}
