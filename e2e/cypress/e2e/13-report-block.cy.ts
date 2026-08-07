import { uniqueUser } from '../support/commands';

describe('Reporting and Blocking (correction: fake report, block hides from search/suggestions/chat)', () => {
	it('lets A report B as a fake account, hiding the report button and showing the warning on B\'s profile', () => {
		const userB = uniqueUser('reportb');
		cy.createFullUser(userB).then(() => {
			cy.uiLogout();

			cy.createFullUser(uniqueUser('reporta')).then(() => {
				cy.location('pathname').should('include', '/discover');
				cy.openSearch();
				cy.contains('button', 'Search').click();
				cy.contains('mat-list-item', userB.username, { timeout: 10000 }).contains('See profile').click();
				cy.location('pathname', { timeout: 10000 }).should('include', `/profile/${userB.username}`);

				cy.contains('button', 'Report as fake').click();
				cy.contains('This account seems to be a fake account', { timeout: 10000 }).should('be.visible');
				cy.contains('button', 'Report as fake').should('not.exist');
			});
		});
	});

	it('blocks B: A can no longer see the like/report actions, and B disappears from A\'s search and suggestions', () => {
		const userB = uniqueUser('reportc');
		cy.createFullUser(userB, { tags: ['bio', 'blockme'] }).then(() => {
			cy.uiLogout();

			cy.createFullUser(uniqueUser('reportd'), { tags: ['bio', 'blockme'] }).then(() => {
				cy.location('pathname').should('include', '/discover');
				// B should be suggested (shared tag) before being blocked.
				cy.contains('mat-list-item, .suggestion, li', userB.username, { timeout: 15000 }).should('exist');

				cy.openSearch();
				cy.contains('button', 'Search').click();
				cy.contains('mat-list-item', userB.username, { timeout: 10000 }).contains('See profile').click();
				cy.location('pathname', { timeout: 10000 }).should('include', `/profile/${userB.username}`);

				cy.contains('button', 'Block').click();
				cy.location('pathname', { timeout: 10000 }).should('include', '/discover');

				// B must no longer be surfaced in suggestions.
				cy.contains(userB.username).should('not.exist');

				cy.openSearch();
				cy.contains('button', 'Search').click();
				cy.wait(500);
				cy.contains('mat-list-item', userB.username).should('not.exist');
			});
		});
	});

	it('disables chat between a blocked pair: messages silently fail to deliver and B is no longer an available contact', () => {
		const userB = uniqueUser('reporte');
		cy.createFullUser(userB).then(() => {
			cy.apiLoginCookie(userB.username, userB.password).then((bCookie) => {
				cy.uiLogout();

				cy.createFullUser(uniqueUser('reportf')).then((userA) => {
					cy.location('pathname').should('include', '/discover');

					// A and B match first.
					cy.openSearch();
					cy.contains('button', 'Search').click();
					cy.contains('mat-list-item', userB.username, { timeout: 10000 })
						.contains('See profile')
						.click();
					cy.location('pathname', { timeout: 10000 }).should('include', `/profile/${userB.username}`);
					cy.contains('button', 'like').click();
					cy.contains('button', 'Dislike', { timeout: 10000 }).should('be.visible');
					cy.requestAsCookie(bCookie, { method: 'POST', url: `/rest/liked/${userA.username}` });

					// Confirm the match unlocks chat before blocking.
					cy.openChat();
					cy.contains('button', 'Write a new message').click();
					cy.get('input[placeholder="Username"]').click();
					cy.contains('mat-option', userB.username, { timeout: 10000 }).should('exist');
					cy.contains('a, button', 'Cancel').click();

					// Now A blocks B.
					cy.openDiscover();
					cy.openSearch();
					cy.contains('button', 'Search').click();
					cy.contains('mat-list-item', userB.username, { timeout: 10000 })
						.contains('See profile')
						.click();
					cy.location('pathname', { timeout: 10000 }).should('include', `/profile/${userB.username}`);
					cy.contains('button', 'Block').click();
					cy.location('pathname', { timeout: 10000 }).should('include', '/discover');

					// B is no longer an available chat contact.
					cy.openChat();
					cy.contains('button', 'Write a new message').click();
					cy.contains('No contacts found', { timeout: 10000 }).should('be.visible');
					cy.contains('mat-option', userB.username).should('not.exist');
					cy.contains('a, button', 'Cancel').click();

					// B attempting to message A is silently dropped (backend
					// returns a fake 201 without persisting - see myapp.rb
					// post '/rest/message/:receiver').
					cy.requestAsCookie(bCookie, {
						method: 'POST',
						url: `/rest/message/${userA.username}`,
						body: { content: 'should never be delivered' }
					}).then((response) => {
						expect(response.status).to.equal(201);
					});
					cy.request('/rest/message').then((response) => {
						const messages = response.body as { content: string }[];
						expect(messages.map((m) => m.content)).to.not.include('should never be delivered');
					});
				});
			});
		});
	});
});
