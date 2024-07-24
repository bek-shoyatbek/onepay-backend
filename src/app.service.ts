import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  memCache = [];

  constructor() {
    this.memCache = [];
  }

  getMemCache() {
    return this.memCache;
  }

  pushMemCache(data: any) {
    this.memCache.push(data);
  }
  getHello(): string {
    return 'Hello World!';
  }
}
