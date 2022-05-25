import { Pipe, PipeTransform } from '@angular/core';
@Pipe({ name: 'highlight' })
export class HighlightPipe implements PipeTransform {
  transform(text: string, search): string {
    const pattern = search ? search
      .replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")
      .split(' ')
      .filter(t => t.length > 0)
      .join('|') : undefined;
    const regex = new RegExp(pattern, 'gi');

    return search ? text.replace(regex, match => `<span class="highlightText">${match}</span>`) : text;
  }
}
