export interface IMessage {
	id: number;
	receiver_id: string;
	sender_id: string;
	time: Date;
	content: string;
}
