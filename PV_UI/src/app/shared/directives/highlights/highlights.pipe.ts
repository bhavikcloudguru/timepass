import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'highlights'
})
export class HighlightsPipe implements PipeTransform {
  transform(value: any, args: any): any {
    if (!args) {
      return value;
    }
    const re = new RegExp(args, 'gi');
    return value.replace(re, '<mark>$&</mark>');
  }
}
