import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class Task {
  _id?: string;

  @Prop({ required: true })
  taskOwner: number;

  @Prop({ required: true })
  id: number;

  @Prop({ required: true })
  title: string;

  @Prop({ required: false, default: 'No description provided' })
  description: string;

  @Prop({ required: false, default: false })
  completed: boolean;

  __v?: number;
}

export type TaskDocument = HydratedDocument<Task>;
export const TaskSchema = SchemaFactory.createForClass(Task);
