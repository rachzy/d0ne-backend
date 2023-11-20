import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';
import { ZodObject } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodObject<any>) {}

  transform(value: any) {
    try {
      this.schema.parse(value);
    } catch (error) {
      throw new BadRequestException('Invalid request!');
    }

    return value;
  }
}
