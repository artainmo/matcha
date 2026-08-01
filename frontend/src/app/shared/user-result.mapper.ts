import { IUserResult, IUserResultResponse } from "./search.interface";

export function mapUserResultResponse(item: IUserResultResponse): IUserResult {
	return {
		...item,
		age: computeAge(item.birthday),
	};
}

function computeAge(birthday: string): number {
	const birthDate = new Date(birthday);
	if (Number.isNaN(birthDate.getTime())) {
		return Number.NaN;
	}
	const today = new Date();
	let age = today.getFullYear() - birthDate.getFullYear();
	const monthDiff = today.getMonth() - birthDate.getMonth();
	const hasBirthdayPassed = monthDiff > 0 || (monthDiff === 0 && today.getDate() >= birthDate.getDate());
	if (!hasBirthdayPassed) {
		age--;
	}
	return age;
}
