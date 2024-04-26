import { Injectable } from '@nestjs/common';
import { RequestDto } from './dto/Request.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UzumService {
  constructor(private readonly prismaService: PrismaService) {}
  async check(reqBody: RequestDto) {}

  async create(reqBody: RequestDto) {}

  async confirm(reqBody: RequestDto) {}

  async reverse(reqBody: RequestDto) {}

  async status(reqBody: RequestDto) {}
}
