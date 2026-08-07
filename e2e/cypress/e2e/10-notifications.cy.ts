import { uniqueUser } from '../support/commands';

describe('Notifications (correction: like/visit/message notify within ~10s)', () => {
	it('notifies A (visible from any page via the unread badge) when B views their profile', () => {
		const userB = uniqueUser('notifb');
		cy.createFullUser(userB).then(() => {
			cy.apiLoginCookie(userB.username, userB.password).then((bCookie) => {
				cy.uiLogout();

				cy.createFullUser(uniqueUser('notifa')).then((userA) => {
					cy.location('pathname').should('include', '/discover');

					// B views A's profile via a raw request (no UI navigation, so
					// A's browser session is untouched) - this records a visit and
					// creates an "account view" notification for A.
					cy.requestAsCookie(bCookie, {
						method: 'GET',
						url: `/rest/account/find/${userA.username}`
					});

					cy.openNotifications();
					// notifications.service.ts polls every 10s - allow for one
					// full cycle plus margin.
					cy.contains('mat-list-item', 'account view', { timeout: 15000 }).should('be.visible');
					cy.contains('mat-list-item', 'account view').contains(userB.username).should('be.visible');
				});
			});
		});
	});

	it('notifies A when B likes them, and the unread badge is visible from any page', () => {
		const userB = uniqueUser('notifc');
		cy.createFullUser(userB).then(() => {
			cy.apiLoginCookie(userB.username, userB.password).then((bCookie) => {
				cy.uiLogout();

				cy.createFullUser(uniqueUser('notifd')).then((userA) => {
					cy.location('pathname').should('include', '/discover');

					cy.requestAsCookie(bCookie, {
						method: 'POST',
						url: `/rest/liked/${userA.username}`
					});

					// The unread badge (matBadge on the Notifications nav button)
					// should reflect the new notification from the Discover page
					// itself, without needing to open the Notifications page.
					cy.get('.mat-badge-content', { timeout: 15000 }).should('be.visible');

					cy.openNotifications();
					cy.contains('mat-list-item', 'account liked', { timeout: 15000 }).should('be.visible');
				});
			});
		});
	});
});
