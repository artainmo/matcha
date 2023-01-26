import { Component, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from '../../services/message.service';

@Component({
	selector: 'app-chat',
	templateUrl: './chat.component.html',
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
