describe('Simple Start (correction: "Start the web server to host the website and ensure that no visible errors appear.")', () => {
	it('loads the app at baseUrl with no crash', () => {
		cy.visit('/');
		// The Matcha shell (header/footer) renders regardless of which route the
		// router lands on for the bare root path - this asserts the SPA/backend
		// combo serves the built app cleanly, without asserting on a specific
		// redirect target.
		cy.contains('.app-shell', 'Matcha').should('be.visible');
		cy.contains('© 2023 artainmo').should('be.visible');
	});

	it('navigates the public register/login pages without any uncaught front-end error', () => {
		cy.visit('/sign/in');
		cy.contains('button', 'Register').click();
		cy.location('pathname').should('include', '/sign/up');
		cy.contains('h2', 'Create account').should('be.visible');
		cy.contains('button', 'Login').click();
		cy.location('pathname').should('include', '/sign/in');
	});
});
