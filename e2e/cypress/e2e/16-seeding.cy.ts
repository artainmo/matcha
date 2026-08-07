// Correction: "Installation and Seeding" - the app must ship a way to seed
// >=500 realistic profiles (see backend/database/tests_and_scripts/generateUsers.rb
// and `make docker-generate_users AMOUNT=500` / its e2e-scoped counterpart
// `make docker-e2e-generate_users AMOUNT=500`).
//
// Seeding 500 fresh users takes ~2 minutes (each one does a real Nominatim
// geocoding lookup, rate-limited to 1/s - see generateUsers.rb), so this spec
// only triggers the seeding script if the current count is below the
// threshold, rather than unconditionally re-seeding on every run.
describe('Installation and Seeding (correction: >=500 seeded profiles)', () => {
	const REQUIRED_USERS = 500;

	it('has at least 500 seeded profiles available, seeding more via the generator script if needed', () => {
		cy.task('dbUserCount').then((count) => {
			const currentCount = count as number;
			if (currentCount >= REQUIRED_USERS) {
				cy.log(`Already have ${currentCount} accounts, skipping seeding.`);
				return;
			}

			const amountToSeed = REQUIRED_USERS - currentCount;
			cy.log(`Only ${currentCount} accounts found, seeding ${amountToSeed} more.`);
			cy.task('generateUsers', { amount: amountToSeed }, { timeout: 5 * 60 * 1000 });
		});

		cy.task('dbUserCount').then((count) => {
			expect(count as number).to.be.at.least(REQUIRED_USERS);
		});
	});
});
