import { Pipe, PipeTransform } from '@angular/core';
import { IUserResult } from "../search.interface";
import { IFilter } from "./filter.interface";

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(value: IUserResult[], filterArg: IFilter | null): IUserResult[] {
		return value.filter((value: IUserResult) => filterArg?.birthday.includes(value.birthday))
			.filter((value: IUserResult) => filterArg?.fame.includes(value.fame))
			.filter((value: IUserResult) => filterArg?.commonTags.includes(value.numberOfTags))
			.filter((value: IUserResult) => filterArg?.distance.includes(value.distance));
  }

}
