import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'keyfilter'
})
export class FilterItemPipe implements PipeTransform {
  transform(items: any[], value: string, searchKey: string): any[] {
    console.log(searchKey);
    if (!items) {
      return [];
    }
    if (!searchKey) {
      return items;
    }
    let result = [];
    for (let item of items) {
      if (item.key === searchKey) {
        return [item];
      }
    }
    return [];
  }
}
