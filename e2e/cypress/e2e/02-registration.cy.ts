import { uniqueUser } from '../support/commands';

describe('User account management (correction: registration + email verification)', () => {
	it('requires email, username, first/last name and a strong password', () => {
		cy.visit('/sign/up');
		cy.get('.auth-actions').contains('button', 'Register').should('be.disabled');
		cy.get('input[formcontrolname="username"]').type('shortu');
		cy.get('input[formcontrolname="firstname"]').type('First');
		cy.get('input[formcontrolname="lastname"]').type('Last');
		cy.get('input[formcontrolname="email"]').type('not-an-email');
		cy.get('input[formcontrolname="password"]').type('weak');
		cy.get('.auth-actions').contains('button', 'Register').should('be.disabled');
	});

	it('rejects a common dictionary-style password lacking complexity', () => {
		cy.fixture('users').then((fixture) => {
			cy.visit('/sign/up');
			cy.get('input[formcontrolname="password"]').type(fixture.dictionaryWord);
			cy.contains('Password must contain at least').should('be.visible');
			cy.get('.auth-actions').contains('button', 'Register').should('be.disabled');
		});
	});

	it('registers, logs the verification email (test mode) and only allows login after visiting the verify link', () => {
		const user = uniqueUser('reg');
		cy.visit('/sign/up');
		cy.get('input[formcontrolname="username"]').type(user.username);
		cy.get('input[formcontrolname="firstname"]').type(user.firstname);
		cy.get('input[formcontrolname="lastname"]').type(user.lastname);
		cy.get('input[formcontrolname="email"]').type(user.email);
		cy.get('input[formcontrolname="password"]').type(user.password);
		cy.get('.auth-actions').contains('button', 'Register').should('not.be.disabled').click();
		// In e2e/test mode EMAILPASS is empty, so the backend responds 417 with
		// EMAIL_LOGGED_MESSAGE instead of 200 (see backend/myapp.rb send_mail()):
		// the account is still created and the verify link is logged to stdout,
		// but the frontend shows this as an error rather than the "success"
		// screen. This is expected/documented behavior specific to test mode.
		cy.contains('email was logged in the terminal instead').should('be.visible');

		// Login must be refused before the account is verified.
		cy.uiLogin(user.username, user.password);
		cy.contains('account not verified').should('be.visible');

		cy.task('readMailLink', {
			toEmail: user.email,
			urlPattern: '(?<=Click on the following link to verify your account: )\\S+'
		}).then((link) => {
			expect(link, 'verification link logged by the backend in test mode').to.be.a('string');
			const token = (link as string).split('/profile/verify/')[1];
			cy.visit(`/profile/verify/${token}`);
			cy.location('pathname', { timeout: 10000 }).should('include', '/sign/in');
		});

		cy.uiLogin(user.username, user.password);
		cy.location('pathname', { timeout: 10000 }).should('include', '/profile/complete');
	});
});
