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
			.filter((item: IUserResult) => filterArg.fame.length === 0 || filterArg.fame.includes(item.fame))
			.filter((item: IUserResult) => filterArg.commonTags.length === 0 || filterArg.commonTags.includes(item.numberOfTags))
			.filter((item: IUserResult) => filterArg.distance.length === 0 || filterArg.distance.includes(item.distance));
	}
}
