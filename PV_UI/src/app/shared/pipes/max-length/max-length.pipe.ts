import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'maxLength'
})
export class MaxLengthPipe implements PipeTransform {
  transform(value: string): string {
    if (value) {
      return value.length > 8 ? value.slice(0, 8) : value;
    }
  }
}
