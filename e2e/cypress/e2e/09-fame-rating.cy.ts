describe('Fame Rating (correction: visible on own profile and other profiles)', () => {
	it('shows a fame rating (starting at 0) on the own profile page', () => {
		cy.createFullUser().then(() => {
			cy.openOwnProfile();
			cy.contains('h4', 'Fame rating').should('be.visible');
			cy.contains('h4', 'Fame rating').next('p').should('have.text', '0');
		});
	});

	it('shows a fame rating on other users profiles too, and it increases after a like/visit', () => {
		const userB = 'fameb' + Date.now();
		cy.createFullUser({ username: userB }).then((b) => {
			cy.uiLogout();

			cy.createFullUser().then(() => {
				cy.location('pathname').should('include', '/discover');
				cy.openSearch();
				cy.contains('button', 'Search').click();
				cy.contains('mat-list-item', b.username, { timeout: 10000 })
					.contains('button', 'See profile')
					.click();
				cy.location('pathname').should('include', `/profile/${b.username}`);

				cy.contains('h4', 'Fame rating').should('be.visible');
				// A visit alone (+10) already bumps fame above 0. Cypress's
				// `.should(callback)` form (unlike `.then()`) auto-retries until
				// the fame-rating component's async GET resolves.
				cy.contains('h4', 'Fame rating')
					.next('p')
					.should(($p) => {
						expect(Number($p.text())).to.be.greaterThan(0);
					});

				cy.contains('button', 'like').click();
				cy.contains('button', 'Dislike').should('be.visible');

				// FameRatingComponent only fetches fame once (in ngOnInit) and
				// doesn't react to further changes on the same page instance,
				// so re-open B's profile via search to get a fresh fetch.
				cy.openSearch();
				cy.contains('button', 'Search').click();
				cy.contains('mat-list-item', b.username, { timeout: 10000 })
					.contains('button', 'See profile')
					.click();
				cy.location('pathname').should('include', `/profile/${b.username}`);
				cy.contains('h4', 'Fame rating')
					.next('p')
					.should(($p) => {
						// visit (+10) + like (+90), weighted by the visits/likes ratio.
						expect(Number($p.text())).to.be.greaterThan(10);
					});
			});
		});
	});
});
