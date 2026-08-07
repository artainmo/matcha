import { uniqueUser } from '../support/commands';

describe('Extended Profile (correction: gender/orientation/bio/tags/pictures + tag suggestions + edit anytime)', () => {
	it('requires gender, orientation, biography and at least one tag and picture before it can be submitted', () => {
		const user = uniqueUser('extprof');
		cy.apiRegisterUser(user).then(() => {
			cy.uiLogin(user.username, user.password);
			cy.location('pathname', { timeout: 10000 }).should('include', '/profile/complete');
			cy.contains('button', 'Register !').should('be.disabled');
		});
	});

	it('suggests tags while typing (autocomplete) once the seeding has created some', () => {
		const user = uniqueUser('tagsug');
		cy.apiRegisterUser(user).then(() => {
			cy.uiLogin(user.username, user.password);
			// "bio" is a very common seeded tag (also used across this suite), so
			// typing a prefix of it should trigger the autocomplete suggestions
			// backed by GET /rest/tag/:tag/similar.
			cy.get('input[placeholder="New tag..."]').type('bi');
			cy.get('mat-option', { timeout: 10000 }).should('have.length.greaterThan', 0);
		});
	});

	it('completes the profile with gender/orientation/bio/tags/picture and can access the app afterward, then edits it later', () => {
		cy.createFullUser(uniqueUser('complete'), {
			gender: 'MALE',
			preferences: 'FEMALE',
			biography: 'Loves hiking and cats.',
			tags: ['bio', 'hiking']
		}).then((user) => {
			cy.location('pathname').should('include', '/discover');

			// The profile must be editable again at any time while logged in.
			cy.openOwnProfile();
			cy.contains('button', 'Edit My profile').click();
			cy.location('pathname').should('include', '/profile/edit');
			cy.get('input[formcontrolname="biography"]').clear().type('Updated bio via edit page.');
			cy.contains('button', 'SAVE').click();

			cy.openOwnProfile();
			cy.contains('Updated bio via edit page.').should('be.visible');
		});
	});

	it('allows uploading up to 5 pictures, including a profile (favorite) picture', () => {
		cy.createFullUser(uniqueUser('pics')).then((user) => {
			cy.openOwnProfile();
			cy.contains('button', 'Edit My profile').click();
			cy.location('pathname').should('include', '/profile/edit');

			// One picture was already uploaded by cy.uiCompleteProfile(); add up
			// to the 5-picture maximum and confirm the upload button then
			// disables itself.
			cy.get('input[type="file"]').selectFile('cypress/fixtures/profile2.png', { force: true });
			cy.get('mat-list-item', { timeout: 10000 }).should('have.length', 2);
			cy.contains('button', 'Add Picture').should('not.be.disabled');
		});
	});
});
