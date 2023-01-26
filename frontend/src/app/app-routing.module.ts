import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { ChatComponent } from './components/chat/chat.component';
import { IndividualChatComponent } from './components/chat/individual-chat/individual-chat.component';
import { NothingSelectedComponent } from './components/chat/nothing-selected/nothing-selected.component';
import { DiscoverComponent } from './components/discover/discover.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { CompleteProfileComponent } from './components/profile/complete-profile/complete-profile.component';
import { ConsultComponent } from './components/profile/consult/consult.component';
import { EditComponent } from './components/profile/edit/edit.component';
import { PasswordRequestComponent } from './components/profile/password-request/password-request.component';
import { PasswordResetComponent } from './components/profile/password-reset/password-reset.component';
import { ProfileComponent } from './components/profile/profile.component';
import { VerifyComponent } from './components/profile/verify/verify.component';
import { LoginComponent } from './components/sign/login/login.component';
import { RegisterComponent } from './components/sign/register/register.component';
import { SearchComponent } from "./components/search/search.component";

const routes: Routes = [
	{
		path: 'sign',
		canActivate: [AuthGuard],
		children: [
			{
				path: 'up',
				component: RegisterComponent,
			},
			{
				path: 'in',
				component: LoginComponent,
			}
		]
	},
	{
		path: 'profile',
		component: ProfileComponent,
		runGuardsAndResolvers: 'always',
		children: [
			{
				path: 'verify/:token',
				component: VerifyComponent
			},
			{
				path: 'password',
				children: [
					{
						path: 'request',
						component: PasswordRequestComponent
					},
					{
						path: 'reset/:token',
						component: PasswordResetComponent
					}
				]
			},
			{
				path: 'complete',
		    canActivate: [AuthGuard],
				component: CompleteProfileComponent
			},
			{
				path: 'edit',
		    canActivate: [AuthGuard],
				component: EditComponent
			},
			{
				path: ':id',
		    canActivate: [AuthGuard],
				component: ConsultComponent
			}
		]
	},
	{
		path: 'discover',
		canActivate: [AuthGuard],
		component: DiscoverComponent
	},
	{
		path: 'search',
		canActivate: [AuthGuard],
		component: SearchComponent
	},
	{
		path: 'notifications',
		canActivate: [AuthGuard],
		component: NotificationsComponent
	},
	{
		path: 'chat',
		canActivate: [AuthGuard],
		component: ChatComponent,
		children: [
			{
				path: '',
				component: NothingSelectedComponent
			},
			{
				path: ':id',
				component: IndividualChatComponent
			}
		]
	},
	{
		path: '*',
		pathMatch: 'full',
		redirectTo: 'sign/in'
	},
];

@NgModule({
	imports: [RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'})],
	exports: [RouterModule]
})
export class AppRoutingModule {
}
