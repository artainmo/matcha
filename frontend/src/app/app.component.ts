import { Component, OnInit } from '@angular/core';
import { map, Observable } from 'rxjs';
import { AccountService } from './services/account.service';
import { NotificationsService } from './services/notifications.service';
import { Location } from '@angular/common';
import { Router } from "@angular/router";


@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
	title = 'Matcha';
	isLoggedIn$: Observable<boolean> = this.accountService.isLoggedIn.asObservable();
	hasNewNotifications$: Observable<number> = this.notificationsService.hasNewNotifications$;
  username: string | null = '';
	route: string = '';

	constructor(
		private readonly accountService: AccountService,
		private readonly notificationsService: NotificationsService,
		private readonly location: Location,
		private readonly router: Router,
	) {
	}

  ngOnInit() {
    this.isLoggedIn$.pipe(map(() => {
      this.username = this.accountService.activeUsername;
    })).subscribe();
		this.location.onUrlChange((val) => {
			this.route = val;
		});
  }

  logout() {
		this.accountService.logout();
	}

	openMyProfile() {
		this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
			this.router.navigate(['profile', this.username]).then();
		});
	}
}
