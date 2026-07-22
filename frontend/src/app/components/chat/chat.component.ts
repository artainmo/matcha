import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from '../../services/message.service';
import { ChatListComponent } from './chat-list/chat-list.component';
import { RouterOutlet } from '@angular/router';

@Component({
	selector: 'app-chat',
	templateUrl: './chat.component.html',
	changeDetection: ChangeDetectionStrategy.Eager,
	imports: [ChatListComponent, RouterOutlet]
})
export class ChatComponent implements OnInit, OnDestroy {

	constructor(
		private readonly messageService: MessageService
	) {
	}

	ngOnInit(): void {
		this.messageService.openChat();
	}

	ngOnDestroy(): void {
		this.messageService.closeChat();
	}

}
