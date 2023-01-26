import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AccountService } from './services/account.service';


@Injectable({
	providedIn: 'root'
})
export class AuthGuard implements CanActivate {

	constructor(
		private readonly router: Router,
		private readonly accountService: AccountService
	) {
	}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

		if (state.url.includes('sign') || state.url.includes('password')) {
			if (this.accountService.isLoggedIn.value) {
				this.router.navigate(['discover']).then();
				return false;
			} else {
				return true;
			}
		}
		if (this.accountService.isLoggedIn.value) {
			return true;
		}
		this.router.navigate(['sign', 'in']).then();
		return false;
	}

}
