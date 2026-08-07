import { uniqueUser } from '../support/commands';

describe('User Connexion (correction: login/logout + password reset)', () => {
	it('logs in with username and password, then can log out from any top-level page', () => {
		cy.apiRegisterUser(uniqueUser('login')).then((user) => {
			cy.uiLogin(user.username, user.password);
			cy.location('pathname', { timeout: 10000 }).should('include', '/profile/complete');
			cy.uiLogout();

			// Re-login and check logout works from a different page too.
			cy.uiLogin(user.username, user.password);
			cy.uiCompleteProfile();
			cy.contains('button', 'Discover').click();
			cy.location('pathname').should('include', '/discover');
			cy.uiLogout();
		});
	});

	it('shows an error for a wrong password and for an unknown username', () => {
		cy.apiRegisterUser(uniqueUser('badpwd')).then((user) => {
			cy.uiLogin(user.username, 'wrong-Password1!');
			cy.contains('incorrect combination user password').should('be.visible');
		});
		cy.uiLogin('this-user-does-not-exist', 'whatever-Password1!');
		cy.contains('username not found').should('be.visible');
	});

	it('supports resetting a forgotten password via the emailed (logged, in test mode) link', () => {
		cy.apiRegisterUser(uniqueUser('reset')).then((user) => {
			cy.visit('/sign/in');
			cy.contains('button', 'Reset password').click();
			cy.location('pathname').should('include', '/profile/password/request');
			cy.get('input[name="username"]').type(user.username, { force: true });
			cy.contains('button', 'Request password').click();

			cy.task('readMailLink', {
				toEmail: user.email,
				urlPattern: '(?<=Click on the following link to reset password: )\\S+'
			}).then((link) => {
				expect(link, 'password reset link logged by the backend in test mode').to.be.a('string');
				const token = (link as string).split('/profile/password/reset/')[1];
				const newPassword = 'NewStr0ng!Pass';
				cy.visit(`/profile/password/reset/${token}`);
				cy.get('input[name="password"]').type(newPassword, { force: true });
				cy.contains('button', 'Reset password').should('not.be.disabled').click();
				cy.location('pathname', { timeout: 10000 }).should('include', '/sign/in');

				cy.uiLogin(user.username, newPassword);
				cy.location('pathname', { timeout: 10000 }).should('include', '/profile/complete');
			});
		});
	});
});
