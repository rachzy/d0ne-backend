import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';
import { ZodError, ZodObject } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodObject<any>) {}

  transform(value: any) {
    try {
      this.schema.parse(value);
    } catch (error) {
      if (!(error instanceof ZodError)) {
        throw new BadRequestException('Invalid request!');
      }
      throw new BadRequestException(error.message);
    }

    return value;
  }
}
