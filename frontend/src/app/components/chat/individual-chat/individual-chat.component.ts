import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs';
import { IMessage } from '../../../models/message.model';
import { MessageService } from '../../../services/message.service';
import { AsyncPipe, DatePipe } from '@angular/common';
import { FilterUsernamePipe } from '../pipes/chat.pipes';

@Component({
	selector: 'app-individual-chat',
	templateUrl: './individual-chat.component.html',
	changeDetection: ChangeDetectionStrategy.Eager,
	imports: [AsyncPipe, DatePipe, FilterUsernamePipe]
})
export class IndividualChatComponent implements OnInit {

	messages$: Observable<IMessage[]> = this.messageService.messages$;

	username: string | null = null;

	constructor(
		private readonly messageService: MessageService,
		private readonly route: ActivatedRoute
	) {
	}

	ngOnInit() {
		this.route.params.subscribe(
			(params: Params) => {
				this.username = params['id'];
			}
		);
	}


}
