import { Pipe, PipeTransform } from '@angular/core';
import { IUserResult } from "../search.interface";

@Pipe({
  name: 'sort'
})
export class SortPipe implements PipeTransform {

  transform(value: IUserResult[], sortArg: string | null): IUserResult[] {
	  switch (sortArg) {
		  case 'Default':
		  case 'Relevant':
			  return value.sort(
				  (a: IUserResult, b: IUserResult) => a.order - b.order
			  );
		  case 'Age':
			  return value.sort(
				  (a: IUserResult, b: IUserResult) => (new Date(b.birthday)).getTime() - new Date(a.birthday).getTime()
			  );
		  case 'Location':
			  return value.sort(
				  (a: IUserResult, b: IUserResult) => -(a.distance - b.distance)
			  );
		  case 'Fame':
			  return value.sort(
				  (a: IUserResult, b: IUserResult) => a.fame - b.fame
			  );
		  case 'Tags':
				return value.sort(
					(a: IUserResult, b: IUserResult) => a.numberOfTags - b.numberOfTags
				);
	  }
	  return value;
  }

}
