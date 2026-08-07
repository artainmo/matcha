import { uniqueUser } from '../support/commands';

describe('Profile Suggestions (correction: orientation-aware suggestions)', () => {
	it('suggests both same-gender and opposite-gender profiles for a bisexual/default-orientation user', () => {
		// B and C are created (and logged out of) first so they exist in the DB
		// before A ever looks at suggestions.
		const userB = uniqueUser('sugb'); // MALE
		const userC = uniqueUser('sugc'); // FEMALE
		cy.createFullUser(userB, { gender: 'MALE', preferences: 'BI' }).then(() => {
			cy.uiLogout();
			cy.createFullUser(userC, { gender: 'FEMALE', preferences: 'BI' }).then(() => {
				cy.uiLogout();

				// A has no orientation preference set beyond the default 'BI', so
				// both B (male) and C (female) should be suggested.
				cy.createFullUser(uniqueUser('suga'), { preferences: 'BI' }).then(() => {
					cy.location('pathname').should('include', '/discover');
					cy.contains('mat-list-item', userB.username, { timeout: 10000 }).should('exist');
					cy.contains('mat-list-item', userC.username, { timeout: 10000 }).should('exist');
				});
			});
		});
	});
});
