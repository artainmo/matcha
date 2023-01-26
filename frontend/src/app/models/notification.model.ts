import { NotificationTypeEnum } from '../enums/notification-type.enum';

export interface INotification {
	id: string;
	userId: number;
	opened: boolean;
	time: Date;
	title: string;
	content: string;
	type: NotificationTypeEnum;
}
