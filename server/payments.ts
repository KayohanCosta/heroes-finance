import {z} from 'zod';
import {entrySchema} from '../src/domain.js';
export const paymentRequest=z.object({kind:z.enum(['loan','fixed']),sourceId:z.uuid(),number:z.number().int().min(0).max(360),due:entrySchema.shape.date,paidAt:entrySchema.shape.date});
