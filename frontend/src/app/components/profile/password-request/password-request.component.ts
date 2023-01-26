import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from '../../../services/account.service';

@Component({
	selector: 'app-password-request',
	templateUrl: './password-request.component.html',
})
export class PasswordRequestComponent implements OnInit {
	unknownUsername$ = this.accountService.badUsername.asObservable();
	username: string = '';
	message$ = this.accountService.message.asObservable();

	constructor(
		private readonly router: Router,
		private readonly accountService: AccountService
	) {
	}

	request() {
		this.accountService.requestNewPassword(this.username);
	}

	ngOnInit(): void {
		this.accountService.message.next('');
	}

}
