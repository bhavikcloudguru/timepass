import { Injectable } from '@angular/core';
import { Utils } from 'src/app/common/utilities/Utils';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor() {}

  /**
   * Save Data in local storage using specific key
   * @param string key - local storage key name
   * @param any key - Data to be stored
   */
  public setData(key: string, data: any) {
    const currentTime = new Date();
    const storageData = {
      value: data,
      expiry: currentTime.getTime() + Utils.oneDay
    };
    localStorage.setItem(key, JSON.stringify(storageData));
  }

  /**
   * Get Data from local storage using key
   * @param  string  key - local storage key name
   */

  public getData(key: string): any {
    const itemStr = localStorage.getItem(key);
    // if the item doesn't exist, return null
    if (!itemStr) {
      return null;
    }

    const item = JSON.parse(itemStr);
    const currentTime = new Date();
    if (currentTime.getTime() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return item.value;
  }

  public uploadFiles(files: any[]): Promise<Blob>[] {
    const promises: Promise<Blob>[] = [];
    if (files) {
      files.forEach(file => {
        promises.push(this.readFile(file));
      });
    }
    return promises;
  }

  private async readFile(file: File): Promise<Blob> {
    return new Promise<Blob>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = e => {
        let encoded = reader.result.toString().replace(/^data:(.*,)?/, '');
        if (encoded.length % 4 > 0) {
          encoded += '='.repeat(4 - (encoded.length % 4));
        }
        const encodedBlob = this.base64toBlob(encoded, file.type);
        return resolve(encodedBlob);
      };

      reader.onerror = e => {
        console.error(`FileReader failed on file ${file.name}.`);
        return reject(null);
      };

      if (!file) {
        console.error('No file to read.');
        return reject(null);
      }

      reader.readAsDataURL(file);
    });
  }
  private base64toBlob(base64Data, contentType) {
    contentType = contentType || '';
    const sliceSize = 1024;
    const byteCharacters = atob(base64Data);
    const bytesLength = byteCharacters.length;
    const slicesCount = Math.ceil(bytesLength / sliceSize);
    const byteArrays = new Array(slicesCount);

    for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
      var begin = sliceIndex * sliceSize;
      var end = Math.min(begin + sliceSize, bytesLength);

      var bytes = new Array(end - begin);
      for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
        bytes[i] = byteCharacters[offset].charCodeAt(0);
      }
      byteArrays[sliceIndex] = new Uint8Array(bytes);
    }
    return new Blob(byteArrays, { type: contentType });
  }
}
