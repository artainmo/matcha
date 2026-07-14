import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChatListComponent } from './components/chat/chat-list/chat-list.component';
import { ChatComponent } from './components/chat/chat.component';
import { IndividualChatComponent } from './components/chat/individual-chat/individual-chat.component';
import { NothingSelectedComponent } from './components/chat/nothing-selected/nothing-selected.component';
import { FilterUsernamePipe, GetLatestsPipe } from './components/chat/pipes/chat.pipes';
import { DiscoverComponent } from './components/discover/discover.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { CompleteProfileComponent } from './components/profile/complete-profile/complete-profile.component';
import { TagsComponent } from './shared/tags/tags.component';
import { ConsultComponent } from './components/profile/consult/consult.component';
import { EditComponent } from './components/profile/edit/edit.component';
import { PasswordRequestComponent } from './components/profile/password-request/password-request.component';
import { PasswordResetComponent } from './components/profile/password-reset/password-reset.component';
import { ProfileComponent } from './components/profile/profile.component';
import { VerifyComponent } from './components/profile/verify/verify.component';
import { LoginComponent } from './components/sign/login/login.component';
import { RegisterComponent } from './components/sign/register/register.component';
import { AccountService } from './services/account.service';
import { NewChatComponent } from './components/chat/new-chat/new-chat.component';
import { PictureSelectionComponent } from './components/profile/shared/picture-selection/picture-selection.component';
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MAT_DATE_LOCALE, MatNativeDateModule} from "@angular/material/core";
import { SplitPipe } from "./pipes/split.pipe";
import { MoreProfileInfosComponent } from './components/profile/consult/more-profile-infos/more-profile-infos.component';
import { FameRatingComponent } from './components/profile/consult/fame-rating/fame-rating.component';
import { SearchComponent } from './components/search/search.component';
import { SearchBarComponent } from './components/search/search-bar/search-bar.component';
import { SortAndFilterComponent } from './shared/sort-and-filter/sort-and-filter.component';
import { MatExpansionModule } from "@angular/material/expansion";
import { MatLegacyCardModule as MatCardModule } from "@angular/material/legacy-card";
import { SortPipe } from './shared/sort-and-filter/sort.pipe';
import { FilterPipe } from './shared/sort-and-filter/filter.pipe';
import { MatLegacyRadioModule as MatRadioModule } from "@angular/material/legacy-radio";
import { MatLegacyCheckboxModule as MatCheckboxModule } from "@angular/material/legacy-checkbox";
import { IsOnlinePipe } from "./components/profile/consult/pipes/is-online.pipe";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatLegacySnackBarModule as MatSnackBarModule } from "@angular/material/legacy-snack-bar";

@NgModule({
	declarations: [
		AppComponent,
		ProfileComponent,
		RegisterComponent,
		LoginComponent,
		VerifyComponent,
		PasswordResetComponent,
		PasswordRequestComponent,
		ConsultComponent,
		EditComponent,
		ChatListComponent,
		IndividualChatComponent,
		NothingSelectedComponent,
		DiscoverComponent,
		ChatComponent,
		CompleteProfileComponent,
		TagsComponent,
		NotificationsComponent,
		GetLatestsPipe,
		FilterUsernamePipe,
		NewChatComponent,
		PictureSelectionComponent,
    SplitPipe,
    MoreProfileInfosComponent,
    FameRatingComponent,
    SearchComponent,
    SearchBarComponent,
    SortAndFilterComponent,
    SortPipe,
		IsOnlinePipe,
    FilterPipe
	],
	imports: [
		BrowserModule,
		BrowserAnimationsModule,
		FormsModule,
		AppRoutingModule,
		MatFormFieldModule,
		MatButtonModule,
		ReactiveFormsModule,
		MatIconModule,
		HttpClientModule,
		MatInputModule,
		MatSelectModule,
		MatChipsModule,
		MatAutocompleteModule,
		MatListModule,
		MatBadgeModule,
		MatDialogModule,
		MatProgressSpinnerModule,
		MatDatepickerModule,
		MatNativeDateModule,
		MatExpansionModule,
		MatCardModule,
		MatRadioModule,
		MatCheckboxModule,
		MatGridListModule,
		MatSnackBarModule
	],
	providers: [
    AccountService,
    {provide: MAT_DATE_LOCALE, useValue: 'fr-FR'},
  ],
	bootstrap: [AppComponent]
})
export class AppModule {
}
