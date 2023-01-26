import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IProfile } from '../../../models/user.model';
import { AccountService } from '../../../services/account.service';

export interface IRegisterStep1 {
	email: string;
	username: string;
	firstname: string;
	lastname: string;
	password: string;
}

@Component({
	selector: 'app-register',
	templateUrl: './register.component.html',
})
export class RegisterComponent {

	loading: boolean = false;
	success: boolean = false;
	error: boolean = false;
	errorMessage: string = '';

	form: FormGroup = new FormGroup({
		email: new FormControl('', [Validators.required, Validators.email]),
		username: new FormControl('', [Validators.required, Validators.minLength(6)]),
		firstname: new FormControl('', [Validators.required, Validators.minLength(1)]),
		lastname: new FormControl('', [Validators.required, Validators.minLength(1)]),
		password: new FormControl('', [Validators.required, Validators.pattern(/^.*(?=.{6,})(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[\ \!\"\#\$\%\&\'\(\)\*\+\,\-\.\/\:\;\<\=\>\?\@\[\]\^\_\`\{\|]).*$/)]),
	});

	constructor(
		private readonly accountService: AccountService
	) {
	}

	submit() {
		this.loading = true;
		this.error = false;
		const body: Partial<IProfile> = this.form.getRawValue();
		this.accountService.register(body).subscribe(
			() => {
				this.success = true;
				this.error = false;
				this.loading = false;
			}, (response: HttpErrorResponse) => {
				this.error = true;
				this.errorMessage = response.error;
				this.loading = false;
			}
		);
	}
}
