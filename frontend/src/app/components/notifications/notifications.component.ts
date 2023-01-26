import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { INotification } from '../../models/notification.model';
import { NotificationsService } from '../../services/notifications.service';

@Component({
	selector: 'app-notifications',
	templateUrl: './notifications.component.html'
})
export class NotificationsComponent implements OnInit {

	notifications$: Observable<INotification[]> = this.notificationsService.notifications$;

	constructor(
		private readonly notificationsService: NotificationsService
	) {
	}

	ngOnInit(): void {
	}

	markRead(id: string) {
		this.notificationsService.markRead(id);
	}
}
