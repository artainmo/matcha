// Correction: "Compatibility" (latest Chrome/Firefox) and "Mobile" support.
//
// Browser compatibility isn't something a single spec run can assert on its
// own - it's a property of *how* the whole suite is invoked. The practical
// proxy for "latest Chrome/Firefox" is running this (and every other) spec
// with `cypress run --browser chrome` and `--browser firefox` (both bundled
// in the `cypress/included` image used for the dockerized run, and available
// on the host too via `npx cypress run --browser <name>` once Cypress has
// downloaded them) - see e2e/README.md for the exact commands. This spec
// itself focuses on the "Mobile" requirement: it re-runs the key navigation
// flows (register -> complete profile -> discover -> search -> chat) at a
// small mobile viewport and asserts there's no horizontal overflow (the
// classic "broken on mobile" symptom) and that the primary controls remain
// visible/usable.
import { uniqueUser } from '../support/commands';

// A small representative set of mobile viewports. iPhone SE is the narrowest
// commonly-targeted device (375x667); a small Android width is added too.
const MOBILE_VIEWPORTS: Array<[string, number, number]> = [
	['iPhone SE', 375, 667],
	['small Android', 360, 640]
];

function assertNoHorizontalOverflow() {
	cy.document().then((doc) => {
		const de = doc.documentElement;
		// A 1px tolerance avoids false positives from sub-pixel rounding.
		expect(de.scrollWidth, 'document.documentElement.scrollWidth vs clientWidth').to.be.at.most(
			de.clientWidth + 1
		);
	});
}

MOBILE_VIEWPORTS.forEach(([name, width, height]) => {
	describe(`Mobile compatibility at ${name} (${width}x${height})`, () => {
		beforeEach(() => {
			cy.viewport(width, height);
		});

		it('registers, completes the profile, and reaches Discover without horizontal overflow', () => {
			cy.visit('/sign/up');
			assertNoHorizontalOverflow();

			const user = uniqueUser('mobreg');
			cy.get('input[formcontrolname="username"]').type(user.username, { force: true });
			cy.get('input[formcontrolname="firstname"]').type(user.firstname, { force: true });
			cy.get('input[formcontrolname="lastname"]').type(user.lastname, { force: true });
			cy.get('input[formcontrolname="email"]').type(user.email, { force: true });
			cy.get('input[formcontrolname="password"]').type(user.password, { force: true });
			assertNoHorizontalOverflow();
			cy.get('.auth-actions').contains('button', 'Register').should('not.be.disabled').click();
			cy.contains('email was logged in the terminal instead').should('be.visible');

			cy.task('readMailLink', {
				toEmail: user.email,
				urlPattern: '(?<=Click on the following link to verify your account: )\\S+'
			}).then((link) => {
				expect(link, 'verification link logged by the backend').to.be.a('string');
				const token = (link as string).split('/profile/verify/')[1];
				cy.visit(`/profile/verify/${token}`);
				cy.location('pathname', { timeout: 10000 }).should('include', '/sign/in');
			});

			cy.uiLogin(user.username, user.password);
			cy.location('pathname', { timeout: 10000 }).should('include', '/profile/complete');
			assertNoHorizontalOverflow();

			cy.uiCompleteProfile();
			cy.location('pathname', { timeout: 10000 }).should('include', '/discover');
			assertNoHorizontalOverflow();
			cy.contains('button', 'Discover').should('be.visible');
		});

		it('navigates Discover, Search, Chat and Notifications without horizontal overflow', () => {
			cy.createFullUser(uniqueUser('mobnav')).then(() => {
				cy.location('pathname', { timeout: 10000 }).should('include', '/discover');
				assertNoHorizontalOverflow();

				cy.openSearch();
				cy.location('pathname', { timeout: 10000 }).should('include', '/search');
				assertNoHorizontalOverflow();
				cy.contains('button', 'Search').should('be.visible').click();
				assertNoHorizontalOverflow();

				cy.openChat();
				cy.location('pathname', { timeout: 10000 }).should('include', '/chat');
				assertNoHorizontalOverflow();

				cy.openNotifications();
				cy.location('pathname', { timeout: 10000 }).should('include', '/notifications');
				assertNoHorizontalOverflow();

				cy.openOwnProfile();
				cy.location('pathname', { timeout: 10000 }).should('include', '/profile');
				assertNoHorizontalOverflow();
				cy.contains('h4', 'Fame rating').should('be.visible');
			});
		});
	});
});
