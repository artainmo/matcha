describe('Geolocation (correction: manual location fallback + editable later)', () => {
	it('lets a user provide a manual location during profile completion, shown as "Custom location" on their profile', () => {
		cy.createFullUser(undefined, { acceptGeolocation: false, geolocation: 'Brussels, Belgium' }).then(
			() => {
				cy.openOwnProfile();
				cy.contains('Custom location').should('be.visible');
				cy.contains('Brussels').should('be.visible');
			}
		);
	});

	it('lets a user switch to a different manual location from the profile edit page later', () => {
		cy.createFullUser(undefined, { acceptGeolocation: false, geolocation: 'Paris, France' }).then((user) => {
			cy.task('dbGeolocation', user.username).then((before) => {
				cy.openOwnProfile();
				cy.contains('button', 'Edit My profile').click();
				cy.location('pathname').should('include', '/profile/edit');
				cy.get('input[formcontrolname="geolocation"]').clear().type('Lyon, France', { force: true });
				cy.contains('button', 'SAVE').click();

				// Save's own post-request router.navigate() back to the consult
				// page can race with in-flight polling GETs on this app; using
				// the same forced "My profile" nav-bar navigation used elsewhere
				// in this suite is the reliable way to land back on the consult
				// page regardless of that race.
				cy.openOwnProfile();
				cy.contains('Custom location').should('be.visible');
				// The human-readable address is reverse-geocoded via the free/
				// rate-limited Nominatim API on every profile view, so it isn't
				// reliable to assert on directly in rapid E2E runs - instead
				// confirm the underlying stored coordinates actually changed.
				cy.task('dbGeolocation', user.username).should('not.eq', before);
			});
		});
	});
});
