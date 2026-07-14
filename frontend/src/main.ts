import { enableProdMode, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { environment } from './environments/environment';
import { AccountService } from './app/services/account.service';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideRouter, withRouterConfig } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

if (environment.production) {
	enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
        provideZoneChangeDetection(),importProvidersFrom(BrowserModule, FormsModule, MatFormFieldModule, MatButtonModule, ReactiveFormsModule, MatIconModule, MatInputModule, MatSelectModule, MatChipsModule, MatAutocompleteModule, MatListModule, MatBadgeModule, MatDialogModule, MatProgressSpinnerModule, MatDatepickerModule, MatNativeDateModule, MatExpansionModule, MatCardModule, MatRadioModule, MatCheckboxModule, MatGridListModule, MatSnackBarModule),
        AccountService,
        { provide: MAT_DATE_LOCALE, useValue: 'fr-FR' },
        provideHttpClient(withXhr(), withInterceptorsFromDi()),
        provideAnimations(),
        provideRouter(routes, withRouterConfig({ onSameUrlNavigation: 'reload' }))
    ]
})
	.catch(err => console.error(err));
