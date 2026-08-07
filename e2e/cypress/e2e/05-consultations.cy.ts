import { uniqueUser } from '../support/commands';

describe('Consultations (correction: visit history + who-liked-me list)', () => {
	it('records a visit on the visited profile owner side, and updates the like list when liked', () => {
		// Set B up fully via the UI first (browser ends up "logged in" as B),
		// capture B's session cookie via a raw API login (untouched by the
		// browser jar), then log B out and set A up for real in the browser -
		// see the multi-user helpers doc-comment in support/commands.ts.
		const userB = uniqueUser('consb');
		cy.createFullUser(userB).then(() => {
			cy.apiLoginCookie(userB.username, userB.password).then((bCookie) => {
				cy.uiLogout();

				cy.createFullUser(uniqueUser('consa')).then((userA) => {
					cy.location('pathname').should('include', '/discover');

					// Find B via a wide-open search (no filters) and open its
					// profile - this is a normal in-app routerLink navigation, so
					// A's auth state survives.
					cy.openSearch();
					cy.contains('button', 'Search').click();
					cy.contains('mat-list-item', userB.username, { timeout: 10000 })
						.contains('button', 'See profile')
						.click();
					cy.location('pathname').should('include', `/profile/${userB.username}`);

					// The visit should now show up for B.
					cy.requestAsCookie(bCookie, { method: 'GET', url: '/rest/account/more-infos' }).then(
						(res) => {
							expect(res.body.visits).to.include(userA.username);
						}
					);

					// A likes B; B's "likes" list should then include A.
					cy.contains('button', 'like').click();
					cy.contains('button', 'Dislike').should('be.visible');
					cy.requestAsCookie(bCookie, { method: 'GET', url: '/rest/account/more-infos' }).then(
						(res) => {
							expect(res.body.likes).to.include(userA.username);
						}
					);
				});
			});
		});
	});
});
