import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AccountService } from '../../../services/account.service';
import {Router} from "@angular/router";
import { MatFormField, MatLabel, MatHint, MatSuffix } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatInput } from '@angular/material/input';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { TagsComponent } from '../../../shared/tags/tags.component';
import { PictureSelectionComponent } from '../shared/picture-selection/picture-selection.component';
import { MatButton } from '@angular/material/button';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-complete-profile',
    templateUrl: './complete-profile.component.html',
    imports: [FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatSelect, MatOption, MatInput, MatDatepickerInput, MatHint, MatDatepickerToggle, MatSuffix, MatDatepicker, TagsComponent, PictureSelectionComponent, MatButton, NgIf]
})
export class CompleteProfileComponent {

	loading: boolean = false;
	success: boolean = false;
	error: number | null = null;

	form: FormGroup = new FormGroup({
		gender: new FormControl('', [Validators.required]),
		birthday: new FormControl(null, [Validators.required]),
		preferences: new FormControl('', [Validators.required]),
		biography: new FormControl('', [Validators.required]),
	});
	_tags: string[] = [];
	favorite: string = '';

	constructor(
		private readonly accountService: AccountService,
    private readonly router: Router
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
			tags: this._tags
		};
		this.accountService.complete(data).subscribe(
			() => {
				this.success = true;
				this.loading = false;
        this.router.navigate(['/discover']).then();
			}, (response: HttpErrorResponse) => {
				this.error = response.status;
				this.loading = false;
			}
		);
	}
}
