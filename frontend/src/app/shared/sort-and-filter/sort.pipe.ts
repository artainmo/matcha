import { Pipe, PipeTransform } from '@angular/core';
import { IUserResult } from "../search.interface";

@Pipe({name: 'sort'})
export class SortPipe implements PipeTransform {

	transform(value: IUserResult[], sortArg: string | null): IUserResult[] {
		switch (sortArg) {
			case 'Relevant':
				return value.sort(
					(a: IUserResult, b: IUserResult) => a.order - b.order
				);
			case 'Age':
				return value.sort(
					(a: IUserResult, b: IUserResult) => a.age - b.age
				);
			case 'Location':
				return value.sort(
					(a: IUserResult, b: IUserResult) => a.distance - b.distance
				);
			case 'Fame':
				return value.sort(
					(a: IUserResult, b: IUserResult) => b.fame - a.fame
				);
			case 'Tags':
				return value.sort(
					(a: IUserResult, b: IUserResult) => b.tags.length - a.tags.length
				);
		}
		return value;
	}

}
