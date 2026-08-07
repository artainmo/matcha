import { uniqueUser } from '../support/commands';

describe('Chat (correction: message exchange within the 10s poll window, new-message indicator on any page)', () => {
	it('lets a matched user send a message via the chat UI, delivered to the receiver', () => {
		const userB = uniqueUser('chatb');
		cy.createFullUser(userB).then(() => {
			cy.apiLoginCookie(userB.username, userB.password).then((bCookie) => {
				cy.uiLogout();

				cy.createFullUser(uniqueUser('chata')).then((userA) => {
					cy.location('pathname').should('include', '/discover');

					// A and B match.
					cy.openSearch();
					cy.contains('button', 'Search').click();
					cy.contains('mat-list-item', userB.username, { timeout: 10000 })
						.contains('See profile')
						.click();
					cy.location('pathname', { timeout: 10000 }).should('include', `/profile/${userB.username}`);
					cy.contains('button', 'like').click();
					cy.contains('button', 'Dislike', { timeout: 10000 }).should('be.visible');
					cy.requestAsCookie(bCookie, { method: 'POST', url: `/rest/liked/${userA.username}` });

					// A sends B a message via the "Write a new message" dialog.
					cy.intercept('POST', '/rest/message/*').as('sendMessage');
					cy.openChat();
					cy.contains('button', 'Write a new message').click();
					cy.get('input[placeholder="Username"]').click();
					cy.contains('mat-option', userB.username, { timeout: 10000 }).click();
					cy.get('textarea[placeholder="Message"]').type('Hello from A!');
					cy.contains('button', 'Send').click();
					// Wait for the app's own send XHR to complete before the
					// cookie-swapped requestAsCookie check below - otherwise
					// requestAsCookie's cookie-clearing (to fire as B) can race
					// ahead of the browser's still-pending send request, causing
					// it to fire with no `username` cookie attached at all.
					cy.wait('@sendMessage');

					// B receives it (fetched via a raw request as B - the poll
					// interval doesn't matter here since we hit the API directly).
					cy.requestAsCookie(bCookie, { method: 'GET', url: '/rest/message' }).then((response) => {
						const messages = response.body as { content: string; sender_id: string }[];
						expect(messages.some((m) => m.sender_id === userA.username && m.content === 'Hello from A!')).to
							.be.true;
					});
				});
			});
		});
	});

	it("shows the other user's message in an already-open chat within the 10s poll window, without reloading", () => {
		const userB = uniqueUser('chatc');
		cy.createFullUser(userB).then(() => {
			cy.apiLoginCookie(userB.username, userB.password).then((bCookie) => {
				cy.uiLogout();

				cy.createFullUser(uniqueUser('chatd')).then((userA) => {
					cy.location('pathname').should('include', '/discover');

					cy.openSearch();
					cy.contains('button', 'Search').click();
					cy.contains('mat-list-item', userB.username, { timeout: 10000 })
						.contains('See profile')
						.click();
					cy.location('pathname', { timeout: 10000 }).should('include', `/profile/${userB.username}`);
					cy.contains('button', 'like').click();
					cy.contains('button', 'Dislike', { timeout: 10000 }).should('be.visible');
					cy.requestAsCookie(bCookie, { method: 'POST', url: `/rest/liked/${userA.username}` });

					// A opens the (empty) chat with B, staying on that page live -
					// message.service.ts polls /rest/message every 10s. The
					// chat-list sidebar only lists conversations that already
					// have a message (chat-list.component.ts reads
					// messageService.messages$), so with no message sent yet
					// there's nothing to click there. A full page navigation
					// via cy.visit() would also lose the in-memory
					// AccountService.isLoggedIn state (it's not restored from
					// the cookie on reload) and bounce A to /sign/in. Instead,
					// re-open B's profile (an in-app SPA navigation) to pick up
					// the now-mutual match state and follow its "Message!" link,
					// exactly like the profile page would let a real user do.
					cy.openDiscover();
					cy.openSearch();
					cy.contains('button', 'Search').click();
					cy.contains('mat-list-item', userB.username, { timeout: 10000 })
						.contains('See profile')
						.click();
					cy.location('pathname', { timeout: 10000 }).should('include', `/profile/${userB.username}`);
					cy.contains("It's a match!", { timeout: 10000 }).should('be.visible');
					cy.contains('a, button', 'Message!').click();
					cy.location('pathname', { timeout: 10000 }).should('include', `/chat/${userB.username}`);

					// B messages A "out of band" (raw request as B), while A's
					// browser tab stays open on the chat page the whole time.
					cy.requestAsCookie(bCookie, {
						method: 'POST',
						url: `/rest/message/${userA.username}`,
						body: { content: 'Hi from B, live!' }
					});

					cy.contains('Hi from B, live!', { timeout: 15000 }).should('be.visible');

					// Every message also raises a notification (see myapp.rb
					// post '/rest/message/:receiver'), so the unread badge -
					// visible from any page via app.component.html - reflects
					// the new message too.
					cy.get('.mat-badge-content', { timeout: 15000 }).should('be.visible');
				});
			});
		});
	});
});
