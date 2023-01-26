import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AccountService } from '../../../services/account.service';
import { FormControl, Validators } from "@angular/forms";

@Component({
	selector: 'app-password-reset',
	templateUrl: './password-reset.component.html',
})
export class PasswordResetComponent {
	password: string = '';
	hide: boolean = true;
	formControl: FormControl = new FormControl('', [Validators.required, Validators.pattern(/^.*(?=.{6,})(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[\ \!\"\#\$\%\&\'\(\)\*\+\,\-\.\/\:\;\<\=\>\?\@\[\]\^\_\`\{\|]).*$/)]);


	constructor(
		private readonly route: ActivatedRoute,
		private readonly accountService: AccountService
	) {
	}

	request() {
		this.accountService.resetPassword(this.route.snapshot.paramMap.get('token') ?? '', this.formControl.value);
	}

}
