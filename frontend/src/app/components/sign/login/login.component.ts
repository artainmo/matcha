import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AccountService } from '../../../services/account.service';
import { FormsModule } from '@angular/forms';
import { MatError, MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { AsyncPipe } from '@angular/common';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	changeDetection: ChangeDetectionStrategy.Eager,
	imports: [FormsModule, MatFormField, MatLabel, MatInput, MatError, MatIconButton, MatSuffix, MatIcon, MatButton, RouterLink, AsyncPipe]
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
