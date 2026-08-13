import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AccountService } from '../../../services/account.service';
import { Router } from "@angular/router";
import { MatFormField, MatHint, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatInput } from '@angular/material/input';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { TagsComponent } from '../../../shared/tags/tags.component';
import { PictureSelectionComponent } from '../shared/picture-selection/picture-selection.component';
import { MatButton } from '@angular/material/button';
import { NotificationsService } from '../../../services/notifications.service';


@Component({
	selector: 'app-complete-profile',
	templateUrl: './complete-profile.component.html',
	changeDetection: ChangeDetectionStrategy.Eager,
	imports: [FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatSelect, MatOption, MatInput, MatDatepickerInput, MatHint, MatDatepickerToggle, MatSuffix, MatDatepicker, MatRadioGroup, MatRadioButton, TagsComponent, PictureSelectionComponent, MatButton]
})
export class CompleteProfileComponent {

	loading: boolean = false;
	success: boolean = false;
	error: number | null = null;
	errorMessage: string = '';
	locationErrorValue: string = '';

	form: FormGroup = new FormGroup({
		gender: new FormControl('', [Validators.required]),
		birthday: new FormControl(null, [Validators.required]),
		preferences: new FormControl('', [Validators.required]),
		biography: new FormControl('', [Validators.required]),
		acceptGeolocation: new FormControl<boolean | null>(null, [Validators.required]),
		geolocation: new FormControl('', []),
	});
	_tags: string[] = [];
	favorite: string = '';

	constructor(
		private readonly accountService: AccountService,
		private readonly router: Router,
		private readonly notificationsService: NotificationsService
	) {
	}

	submit() {
		this.loading = true;
		const formValue = this.form.getRawValue();
		const data = {
			gender: formValue['gender'],
			biography: formValue['biography'],
			birthday: formValue['birthday'],
			sexual_orientation: formValue['preferences'],
			profile_picture: this.favorite,
			tags: this._tags,
			geolocation: formValue['acceptGeolocation'] ? undefined : formValue['geolocation']
		};
		this.accountService.complete(data).subscribe(
			() => {
				this.success = true;
				this.loading = false;
				this.router.navigate(['/discover']).then();
				this.notificationsService.subscribe();
			}, (response: HttpErrorResponse) => {
				this.error = response.status;
				this.errorMessage = typeof response.error === 'string' ? response.error : '';
				if (response.error === 'Wrong geolocation') {
					this.locationErrorValue = this.form.controls['geolocation'].value;
					this.form.controls['geolocation'].setErrors({
						'wrongLocation': true
					});
				}
				this.loading = false;
			}
		);
	}
}
