import { uniqueUser } from '../support/commands';

describe('Profile of Other Users (correction: hides private data, shows fame/online state, records a visit)', () => {
	it("shows another user's fame rating and never leaks their email or password anywhere in the page", () => {
		const userB = uniqueUser('otherb');
		cy.createFullUser(userB).then(() => {
			cy.uiLogout();

			cy.createFullUser(uniqueUser('othera')).then(() => {
				cy.location('pathname').should('include', '/discover');
				cy.openSearch();
				cy.contains('button', 'Search').click();
				cy.contains('mat-list-item', userB.username, { timeout: 10000 }).contains('See profile').click();

				cy.location('pathname', { timeout: 10000 }).should('include', `/profile/${userB.username}`);
				// Fame rating must be shown for other users' profiles.
				cy.get('.profile-page').find('app-fame-rating').should('exist');
				cy.contains('Fame', { matchCase: false }).should('be.visible');

				// Neither the private email nor the password/hash should ever
				// leak into the rendered DOM.
				cy.get('body').should('not.contain.text', userB.email);
				cy.get('body').should('not.contain.text', userB.password);
			});
		});
	});

	it('shows "Online" when the other user connected recently, and a last-connected timestamp otherwise', () => {
		const userB = uniqueUser('otherc');
		cy.createFullUser(userB).then(() => {
			cy.uiLogout();

			cy.createFullUser(uniqueUser('otherd')).then(() => {
				cy.location('pathname').should('include', '/discover');

				// Deterministically set B's last_connected instead of relying on
				// "just registered" timing, which can drift under slow/retried
				// runs or environment clock skew.
				cy.task('dbSetLastConnected', { username: userB.username, minutesAgo: 0 });
				cy.openSearch();
				cy.contains('button', 'Search').click();
				cy.contains('mat-list-item', userB.username, { timeout: 10000 }).contains('See profile').click();
				cy.location('pathname', { timeout: 10000 }).should('include', `/profile/${userB.username}`);
				cy.contains('h4', 'Online', { timeout: 10000 }).should('be.visible');

				// Backdate B's last_connected beyond the 2-minute "online" window
				// (see is-online.pipe.ts) and re-open the profile to see the
				// "Last Connected" state instead.
				cy.task('dbSetLastConnected', { username: userB.username, minutesAgo: 10 });
				cy.openDiscover();
				cy.openSearch();
				cy.contains('button', 'Search').click();
				cy.contains('mat-list-item', userB.username, { timeout: 10000 }).contains('See profile').click();
				cy.location('pathname', { timeout: 10000 }).should('include', `/profile/${userB.username}`);
				cy.contains('h4', 'Last Connected:', { timeout: 10000 }).should('be.visible');
			});
		});
	});

	it('records a visit when viewing another profile (visible in the visited profile owner’s more-infos)', () => {
		const userB = uniqueUser('othere');
		cy.createFullUser(userB).then(() => {
			cy.apiLoginCookie(userB.username, userB.password).then((bCookieBeforeVisit) => {
				cy.requestAsCookie(bCookieBeforeVisit, { method: 'GET', url: '/rest/account/more-infos' }).then(
					(before) => {
						expect((before.body as { visits: string[] }).visits).to.deep.equal([]);
					}
				);
				cy.uiLogout();

				cy.createFullUser(uniqueUser('otherf')).then((userA) => {
					cy.location('pathname').should('include', '/discover');
					cy.openSearch();
					cy.contains('button', 'Search').click();
					cy.contains('mat-list-item', userB.username, { timeout: 10000 }).contains('See profile').click();
					cy.location('pathname', { timeout: 10000 }).should('include', `/profile/${userB.username}`);

					cy.requestAsCookie(bCookieBeforeVisit, { method: 'GET', url: '/rest/account/more-infos' }).then(
						(after) => {
							expect((after.body as { visits: string[] }).visits).to.include(userA.username);
						}
					);
				});
			});
		});
	});
});
