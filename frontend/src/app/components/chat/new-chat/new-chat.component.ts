import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { MessageService } from '../../../services/message.service';
import { AsyncPipe } from '@angular/common';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatOption } from '@angular/material/core';
import { MatAnchor, MatButton } from '@angular/material/button';

@Component({
	selector: 'app-new-chat',
	templateUrl: './new-chat.component.html',
	changeDetection: ChangeDetectionStrategy.Eager,
	imports: [FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatAutocompleteTrigger, MatAutocomplete, MatOption, MatError, MatAnchor, MatButton, AsyncPipe]
})
export class NewChatComponent implements OnInit {


	form: FormGroup = new FormGroup({
		username: new FormControl(null, [Validators.required]),
		content: new FormControl('', [Validators.required])
	});

	availableUsernames$: Observable<string[]> = this.messageService.availableUsernames$;

	constructor(
		public dialogRef: MatDialogRef<NewChatComponent>,
		private readonly messageService: MessageService
	) {
	}

	ngOnInit(): void {
	}

	submit() {
		this.dialogRef.close({
			receiver_id: this.form.value['username'],
			content: this.form.value['content'],
		})
	}

	close() {
		this.dialogRef.close();
	}

}
