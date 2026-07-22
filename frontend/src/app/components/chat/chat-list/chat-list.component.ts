import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { IMessage } from '../../../models/message.model';
import { AccountService } from '../../../services/account.service';
import { MessageService } from '../../../services/message.service';
import { NewChatComponent } from '../new-chat/new-chat.component';
import { AsyncPipe, Location } from "@angular/common";
import { MatList, MatListItem } from '@angular/material/list';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { GetLatestsPipe } from '../pipes/chat.pipes';

@Component({
	selector: 'app-chat-list',
	templateUrl: './chat-list.component.html',
	changeDetection: ChangeDetectionStrategy.Eager,
	imports: [MatList, MatListItem, MatButton, RouterLink, MatIcon, AsyncPipe, GetLatestsPipe]
})
export class ChatListComponent implements OnInit {

	messages$: Observable<IMessage[]> = this.messageService.messages$;
	activeUsername!: string;

	route: string = '';

	constructor(
		private readonly accountService: AccountService,
		private readonly messageService: MessageService,
		private readonly dialog: MatDialog,
		private readonly location: Location
	) {
	}

	ngOnInit() {
		this.activeUsername = this.accountService.activeUsername ?? '';
		this.location.onUrlChange((val) => {
			this.route = val;
		});
	}

	openNewMessageDialog() {
		const dialogRef = this.dialog.open(NewChatComponent, {
			data: null
		});

		dialogRef.afterClosed().subscribe(
			(result: IMessage) => {
				if (result)
					this.messageService.send(result);
			}
		);
	}
}
