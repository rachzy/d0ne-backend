import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { pseudoRandomBytes } from 'crypto';
import { add } from 'date-fns';
import { HydratedDocument } from 'mongoose';

export class SecurityToken {
  @Prop({ required: true, length: 64, default: pseudoRandomBytes(64) })
  value: string;

  @Prop({ required: true, default: add(Date.now(), { days: 7 }) })
  expirationDate: Date;

  @Prop({ required: false, default: true })
  valid: boolean;
}

@Schema()
export class User {
  _id: string;

  @Prop({ required: true, default: new Date().getTime() })
  id: number;

  @Prop({ required: true, minlength: 4, maxlength: 16 })
  nickname: string;

  @Prop({ required: true, minlength: 8, maxlength: 128 })
  email: string;

  @Prop({ required: true, minlength: 4, maxlength: 128 })
  password: string;

  @Prop({
    required: false,
    default: [
      {
        value: pseudoRandomBytes(64).toString('hex'),
        expirationDate: add(Date.now(), { days: 7 }),
        valid: true,
      },
    ],
  })
  securityTokens: SecurityToken[];

  __v: number;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
