import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from '../../../services/account.service';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
	hide = true;
	wrongPassword$ = this.accountService.wrongPassword.asObservable();
	badLogin$ = this.accountService.badLogin.asObservable();
	user: string = '';
	password: string = '';
	message$ = this.accountService.message.asObservable();

	constructor(
		private readonly router: Router,
		private readonly accountService: AccountService
	) {
	}

	ngOnInit(): void {
		this.accountService.message.next('');
	}

	login() {
		this.accountService.login(this.user, this.password);
	}

}
