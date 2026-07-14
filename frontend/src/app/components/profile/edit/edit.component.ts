import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { IProfile } from "../../../models/user.model";
import { ActivatedRoute, Router } from "@angular/router";
import { AccountService } from "../../../services/account.service";
import { FormControl, FormGroup, ValidationErrors, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpErrorResponse } from "@angular/common/http";
import { tap } from 'rxjs';

import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatFormField, MatLabel, MatHint, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { TagsComponent } from '../../../shared/tags/tags.component';
import { PictureSelectionComponent } from '../shared/picture-selection/picture-selection.component';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-edit',
    templateUrl: './edit.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatProgressSpinner, FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatHint, MatSelect, MatOption, TagsComponent, PictureSelectionComponent, MatError, MatButton]
})
export class EditComponent implements OnInit {
  profile!: IProfile;
  loading = true;
  _tags: string[] = [];
	profile_picture: string = '';
	locationErrorValue: string = '';
	mailErrorValue: string = '';

  form: FormGroup = new FormGroup({
    gender: new FormControl('', [Validators.required]),
    birthday: new FormControl(null, [Validators.required]),
    preferences: new FormControl('', [Validators.required]),
    biography: new FormControl('', [Validators.required]),
    firstname: new FormControl('', [Validators.required]),
    lastname: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required]),
	  geolocation: new FormControl('', []),
  });

  constructor(
    private readonly route: ActivatedRoute,
    private readonly accountService: AccountService,
    private readonly router: Router
  ) {
  }

  ngOnInit(): void {
    this.accountService.getProfile().subscribe(
      (profile: string | IProfile) => {
        if (typeof profile == 'string') return;
        this.profile = profile;
        this._tags = this.profile.tags;
        this.profile_picture = this.profile.profile_picture;
        this.form.setValue({
          biography: profile.biography,
          gender: profile.gender,
          birthday: new Date(profile.birthday),
          preferences: profile.sexual_orientation,
          firstname: profile.firstname,
          lastname: profile.lastname,
          email: profile.email,
	        geolocation: profile.geolocation,
        });
        this.loading = false;
      }
    );
	}

  save() {
    this.loading = true;
    const formValue = this.form.getRawValue();
    const data = {
      biography: this.form.get('biography')?.touched ? formValue['biography'] : undefined,
      gender: this.form.get('gender')?.touched ? formValue['gender'] : undefined,
      birthday: this.form.get('birthday')?.touched ? formValue['birthday'] : undefined,
      sexual_orientation: this.form.get('preferences')?.touched ? formValue['preferences'] : undefined,
      firstname: this.form.get('firstname')?.touched ? formValue['firstname'] : undefined,
      lastname: this.form.get('lastname')?.touched ? formValue['lastname'] : undefined,
      email: this.form.get('email')?.touched ? formValue['email'] : undefined,
	    geolocation: this.form.get('geolocation')?.touched ? formValue['geolocation'] : '',
	    profile_picture: this.profile_picture,
	    tags: this._tags
    };
    this.accountService.patchUser(data).subscribe(
      () => {
        this.loading = false;
				this.router.navigate(['/profile', this.profile.username]).then();
      },(error: HttpErrorResponse) => {
				if (error.error === 'Wrong geolocation') {
					this.locationErrorValue = this.form.controls['geolocation'].value;
					this.form.controls['geolocation'].setErrors({
						'wrongLocation': true
					});
				}
				if (error.error === 'Mail is not valid') {
					this.mailErrorValue = this.form.controls['geolocation'].value;
					this.form.controls['email'].setErrors({
						'wrongEmail': true
					});
				}
        this.loading = false;
      }
    );
  }
}
