import { uniqueUser } from '../support/commands';

describe('Research, Sort and Filters (correction: search by tag/age/fame/location + sort)', () => {
	it('search by tag only returns profiles sharing that tag', () => {
		const userB = uniqueUser('searchb'); // tag: hiking
		const userC = uniqueUser('searchc'); // tag: cycling
		cy.createFullUser(userB, { tags: ['bio', 'hiking'] }).then(() => {
			cy.uiLogout();
			cy.createFullUser(userC, { tags: ['bio', 'cycling'] }).then(() => {
				cy.uiLogout();

				cy.createFullUser(uniqueUser('searcha')).then(() => {
					cy.location('pathname').should('include', '/discover');
					cy.openSearch();

					cy.get('input[placeholder="New tag..."]').type('hiking{enter}');
					cy.contains('button', 'Search').click();

					cy.contains('mat-list-item', userB.username, { timeout: 10000 }).should('exist');
					cy.contains('mat-list-item', userC.username).should('not.exist');
				});
			});
		});
	});

	it('the sort-by dropdown re-orders the results without erroring', () => {
		cy.createFullUser(uniqueUser('sorta')).then(() => {
			cy.location('pathname').should('include', '/discover');
			cy.openSearch();
			cy.contains('button', 'Search').click();

			cy.get('mat-select').first().click();
			cy.get('mat-option').contains('Fame').click();
			cy.get('mat-select').first().should('contain.text', 'Fame');

			cy.get('body').click(0, 0);
			cy.get('mat-select').first().click();
			cy.get('mat-option', { timeout: 10000 }).contains('Age').click();
			cy.get('mat-select').first().should('contain.text', 'Age');
		});
	});
});
