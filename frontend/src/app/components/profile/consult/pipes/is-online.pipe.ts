import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
	name: 'isOnline',
})
export class IsOnlinePipe implements PipeTransform {
	transform(input: Date): boolean {
		input = new Date(input);
		input.setMinutes(input.getMinutes() + 2);
		return (new Date()) < input;
	}
}
