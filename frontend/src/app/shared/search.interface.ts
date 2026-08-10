export interface IUserResult {
	username: string;
	firstname: string;
	lastname: string;
	tags: string[];
	fame: number;
	distance: number;
	order: number;
	birthday: string;
	age: number;
	fake_account: boolean;
}

export type IUserResultResponse = Omit<IUserResult, 'age'>;
