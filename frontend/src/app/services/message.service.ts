import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, Subscription, take, timer } from 'rxjs';
import {URL_LIKE_CONNECTIONS, URL_MESSAGES} from '../config/urls';
import { IMessage } from '../models/message.model';

@Injectable({
	providedIn: 'root'
})
export class MessageService {

	messagesBS: BehaviorSubject<IMessage[]> = new BehaviorSubject<IMessage[]>([]);
	messages$: Observable<IMessage[]> = this.messagesBS.asObservable();
	messagesSubscription: Subscription = new Subscription;
	availableUsernamesBS: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
	availableUsernames$: Observable<string[]> = this.availableUsernamesBS.asObservable();

	constructor(
		private readonly http: HttpClient
	) {
	}

	openChat() {
		this.getContacts();
		this.messagesSubscription = timer(0, 10000)
			.pipe(map(() => {
				this.getMessages();
			}))
			.subscribe();
	}

	private getMessages() {
		this.http.get<IMessage[]>(URL_MESSAGES)
			.pipe(
				take(1)
			)
			.subscribe(
				(messages: IMessage[]) => {
					this.messagesBS.next(messages);
				}
			)
	}

	closeChat() {
		this.messagesSubscription.unsubscribe();
	}

	send(message: IMessage) {
		this.http
			.post(URL_MESSAGES + '/' + message.receiver_id, {content: message.content}, {
				responseType: 'text',
				headers: new HttpHeaders({
					'Accept': 'text/html, application/xhtml+xml, */*',
					'Content-Type': 'application/x-www-form-urlencoded'
				}),
			})
			.subscribe()
	}

	private getContacts() {
    this.http.get<string[]>(URL_LIKE_CONNECTIONS).subscribe(
      (usernames: string[]) => {
        this.availableUsernamesBS.next(usernames);
      }
    )
	}
}
