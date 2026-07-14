import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from '../../../services/account.service';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-password-request',
    templateUrl: './password-request.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatFormField, MatLabel, MatInput, FormsModule, MatError, MatButton, AsyncPipe]
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
