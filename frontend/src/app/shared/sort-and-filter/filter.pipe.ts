import { Pipe, PipeTransform } from '@angular/core';
import { IUserResult } from "../search.interface";
import { IFilter } from "./filter.interface";

@Pipe({name: 'filter'})
export class FilterPipe implements PipeTransform {

	transform(value: IUserResult[], filterArg: IFilter | null): IUserResult[] {
		if (!filterArg) {
			return value;
		}
		return value
			.filter((item: IUserResult) => {
				if (!Number.isFinite(item.age)) {
					return false;
				}
				const matchesMin = filterArg.ageMin === null || item.age >= filterArg.ageMin;
				const matchesMax = filterArg.ageMax === null || item.age <= filterArg.ageMax;
				return matchesMin && matchesMax;
			})
			.filter((item: IUserResult) => filterArg.fame === null || filterArg.fame === item.fame)
			.filter((item: IUserResult) => filterArg.commonTags.length === 0 || filterArg.commonTags.every((tag: string) => item.tags.includes(tag)))
			.filter((item: IUserResult) => filterArg.distance === null || filterArg.distance === item.distance);
	}
}
