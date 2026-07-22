import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AccountService } from '../../../services/account.service';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
	selector: 'app-password-reset',
	templateUrl: './password-reset.component.html',
	changeDetection: ChangeDetectionStrategy.Eager,
	imports: [MatFormField, MatLabel, MatInput, FormsModule, ReactiveFormsModule, MatIconButton, MatSuffix, MatIcon, MatButton]
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
