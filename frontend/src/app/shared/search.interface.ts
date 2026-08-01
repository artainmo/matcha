export interface IUserResult {
	username: string;
	firstname: string;
	lastname: string;
	numberOfTags: number;
	fame: number;
	distance: number;
	order: number;
	birthday: string;
	age: number;
	fake_account: boolean;
}

export type IUserResultResponse = Omit<IUserResult, 'age'>;
