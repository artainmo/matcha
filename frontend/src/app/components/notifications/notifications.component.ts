import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { INotification } from '../../models/notification.model';
import { NotificationsService } from '../../services/notifications.service';
import { MatList, MatListItem, MatListItemLine, MatListItemMeta, MatListItemTitle } from '@angular/material/list';
import { AsyncPipe } from '@angular/common';
import { MatMiniFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/divider';

@Component({
	selector: 'app-notifications',
	templateUrl: './notifications.component.html',
	changeDetection: ChangeDetectionStrategy.Eager,
	imports: [MatList, MatListItem, MatListItemTitle, MatListItemLine, MatListItemMeta, MatMiniFabButton, MatIcon, MatDivider, AsyncPipe]
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
