import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { IMessage } from '../../../models/message.model';
import { MessageService } from '../../../services/message.service';

@Component({
  selector: 'app-new-chat',
  templateUrl: './new-chat.component.html',
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
  ) { }

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
