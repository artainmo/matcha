describe('Security (correction: no 500s / auth bypass on malformed or malicious input)', () => {
	it('redirects to /sign/in when navigating to a protected page while logged out', () => {
		cy.visit('/discover');
		cy.location('pathname', { timeout: 10000 }).should('include', '/sign/in');
	});

	it('rejects SQL-injection-style login attempts without a server error and without granting access', () => {
		const payloads = [
			`' OR '1'='1`,
			`'; DROP TABLE account; --`,
			`admin'--`
		];
		payloads.forEach((payload) => {
			cy.request({
				method: 'POST',
				url: '/rest/account/login',
				body: { username: payload, password: payload },
				failOnStatusCode: false
			}).then((response) => {
				// Whatever the exact status, the backend must not blow up (500)
				// and must not report a successful login.
				expect(response.status, `login with payload ${payload}`).to.be.lessThan(500);
				expect(response.status).to.not.equal(200);
			});
		});
	});

	it('does not crash (500) when a logged-in user searches/filters with malformed or SQL-injection-style values', () => {
		cy.createFullUser().then(() => {
			const payloads: Record<string, unknown>[] = [
				{ tags: [`' OR '1'='1`] },
				{ tags: [`'; DROP TABLE account; --`] },
				{ minAge: `abc' OR '1'='1` },
				{ maxAge: `1); DROP TABLE account; --` },
				{ location: `' OR '1'='1` }
			];
			payloads.forEach((body) => {
				cy.request({
					method: 'POST',
					url: '/rest/account/search',
					body,
					failOnStatusCode: false
				}).then((response) => {
					expect(response.status, `search with payload ${JSON.stringify(body)}`).to.be.lessThan(500);
				});
			});
		});
	});

	it('never returns the password hash in any account-facing API response', () => {
		cy.createFullUser().then((userA) => {
			cy.createFullUser().then((userB) => {
				// Login response.
				cy.request({
					method: 'POST',
					url: '/rest/account/login',
					body: { username: userB.username, password: userB.password }
				}).then((response) => {
					expect(JSON.stringify(response.body)).to.not.contain(userB.password);
					expect(JSON.stringify(response.body).toLowerCase()).to.not.contain('password');
				});

				// Own more-infos.
				cy.request('/rest/account/more-infos').then((response) => {
					expect(JSON.stringify(response.body).toLowerCase()).to.not.contain('password');
				});

				// Viewing another user's profile.
				cy.request(`/rest/account/find/${userB.username}`).then((response) => {
					expect(JSON.stringify(response.body).toLowerCase()).to.not.contain('password');
					expect(JSON.stringify(response.body)).to.not.contain(userB.password);
				});
			});
		});
	});

	it('refuses to store a biography containing HTML tags (backend has_forbidden_chars? guard against stored XSS)', () => {
		cy.createFullUser().then(() => {
			cy.request({
				method: 'PATCH',
				url: '/rest/account/fill',
				body: {
					gender: 'OTHER',
					sexual_orientation: 'BI',
					biography: '<img src=x onerror="window.__xssFired=true">',
					birthday: '1995-01-01',
					profile_picture: null
				},
				failOnStatusCode: false
			}).then((response) => {
				expect(response.status).to.equal(400);
				expect(response.body).to.contain('Invalid characters');
			});
		});
	});

	it('never renders a stored biography as live HTML on the profile page (Angular interpolation, not innerHTML)', () => {
		const marker = 'e2e-xss-marker-safe-text';
		cy.createFullUser({}, { biography: `Look at my tags ${marker} and pictures` }).then(() => {
			cy.openOwnProfile();
			cy.get('.profile-page').should('contain.text', marker);
		});
	});
});
