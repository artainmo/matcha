import { Pipe, PipeTransform } from '@angular/core';
import { IMessage } from '../../../models/message.model';
import { AccountService } from '../../../services/account.service';

@Pipe({name: 'filterUsername'})
export class FilterUsernamePipe implements PipeTransform {
	transform(messages: IMessage[] | null, username: string | null): IMessage[] {
		if (messages === null){
			return [];
		}
		return messages.filter((message: IMessage) => message.sender_id === username || message.receiver_id === username);
	}
}


@Pipe({name: 'getLatests'})
export class GetLatestsPipe implements PipeTransform {

	constructor(
		private readonly accountService: AccountService
	) {
	}

	transform(messages: IMessage[] | null): IMessage[] {
		if (messages === null)
			return [];
		const activeUsername: string = this.accountService.activeUsername ?? '';
		const presentUsernames: string[] = [];
		return messages.filter((message: IMessage) => {
			const usernameToCheck = message.sender_id === activeUsername ? message.receiver_id : message.sender_id;
			if (presentUsernames.includes(usernameToCheck))
				return false;
			presentUsernames.push(usernameToCheck);
			return true;
		});
	}
}
