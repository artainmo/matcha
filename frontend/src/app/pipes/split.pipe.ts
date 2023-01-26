import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: 'getLast',
})
export class SplitPipe implements PipeTransform {
  transform(input: any, separator: string = ' '): any {
    const x = input.split(separator);
    return x[x.length - 1];
  }
}
