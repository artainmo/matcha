import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AccountService } from '../../../services/account.service';

@Component({
	selector: 'app-verify',
	templateUrl: './verify.component.html',
})
export class VerifyComponent implements OnInit {

	constructor(
		private readonly accountService: AccountService,
		private readonly route: ActivatedRoute
	) {
	}

	ngOnInit(): void {
		this.accountService.validate(this.route.snapshot.paramMap.get('token') ?? '');
	}

}
