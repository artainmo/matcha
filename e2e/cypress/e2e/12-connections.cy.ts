import { uniqueUser } from '../support/commands';

describe('Connection Between Users (correction: like/unlike, mutual match unlocks chat, no picture -> no like)', () => {
	it('lets A like B, shows the liked state, and lets A unlike again', () => {
		const userB = uniqueUser('connb');
		cy.createFullUser(userB).then(() => {
			cy.uiLogout();

			cy.createFullUser(uniqueUser('conna')).then(() => {
				cy.location('pathname').should('include', '/discover');
				cy.openSearch();
				cy.contains('button', 'Search').click();
				cy.contains('mat-list-item', userB.username, { timeout: 10000 }).contains('See profile').click();
				cy.location('pathname', { timeout: 10000 }).should('include', `/profile/${userB.username}`);

				cy.contains('button', 'like').click();
				cy.contains('button', 'Dislike', { timeout: 10000 }).should('be.visible');

				// Not a match yet (B hasn't liked back), so no chat link.
				cy.contains("It's a match!").should('not.exist');

				// Unlike brings the profile back to its initial state.
				cy.contains('button', 'Dislike').click();
				cy.contains('button', 'like', { timeout: 10000 }).should('be.visible');
			});
		});
	});

	it('unlocks a "Message!" chat link for both users once the like is mutual', () => {
		const userB = uniqueUser('connc');
		cy.createFullUser(userB).then(() => {
			cy.apiLoginCookie(userB.username, userB.password).then((bCookie) => {
				cy.uiLogout();

				cy.createFullUser(uniqueUser('connd')).then((userA) => {
					cy.location('pathname').should('include', '/discover');
					cy.openSearch();
					cy.contains('button', 'Search').click();
					cy.contains('mat-list-item', userB.username, { timeout: 10000 })
						.contains('See profile')
						.click();
					cy.location('pathname', { timeout: 10000 }).should('include', `/profile/${userB.username}`);

					// A likes B first.
					cy.contains('button', 'like').click();
					cy.contains('button', 'Dislike', { timeout: 10000 }).should('be.visible');
					cy.contains("It's a match!").should('not.exist');

					// B likes A back via the cookie technique.
					cy.requestAsCookie(bCookie, {
						method: 'POST',
						url: `/rest/liked/${userA.username}`
					});

					// Re-open B's profile to refresh the connected/likes_back state.
					cy.openDiscover();
					cy.openSearch();
					cy.contains('button', 'Search').click();
					cy.contains('mat-list-item', userB.username, { timeout: 10000 })
						.contains('See profile')
						.click();
					cy.location('pathname', { timeout: 10000 }).should('include', `/profile/${userB.username}`);
					cy.contains("It's a match!", { timeout: 10000 }).should('be.visible');
					cy.contains('a, button', 'Message!').should('be.visible');
				});
			});
		});
	});

	it('refuses to let a user without a profile picture like another profile', () => {
		const userB = uniqueUser('conne');
		cy.createFullUser(userB).then(() => {
			cy.apiLoginCookie(userB.username, userB.password).then((bCookie) => {
				cy.uiLogout();

				cy.createFullUser(uniqueUser('connf')).then((userA) => {
					// Directly attack the API as A, after (destructively) clearing
					// A's own profile_picture at the DB level, to confirm the
					// backend itself refuses the like - not just the UI.
					cy.request({
						method: 'PATCH',
						url: '/rest/account',
						body: { profile_picture: '' },
						failOnStatusCode: false
					});
					cy.request({
						method: 'POST',
						url: `/rest/liked/${userB.username}`,
						failOnStatusCode: false
					}).then((response) => {
						expect(response.status).to.equal(417);
					});

					// B, unaffected, was never liked.
					cy.requestAsCookie(bCookie, { method: 'GET', url: '/rest/account/more-infos' }).then(
						(response) => {
							expect((response.body as { likes: string[] }).likes).to.not.include(userA.username);
						}
					);
				});
			});
		});
	});
});
