import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { INotification } from '../../models/notification.model';
import { NotificationsService } from '../../services/notifications.service';
import { MatList, MatListItem } from '@angular/material/list';
import { AsyncPipe } from '@angular/common';
import { MatLine } from '@angular/material/core';
import { MatMiniFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/divider';

@Component({
    selector: 'app-notifications',
    templateUrl: './notifications.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatList, MatListItem, MatLine, MatMiniFabButton, MatIcon, MatDivider, AsyncPipe]
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
