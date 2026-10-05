import{z}from'zod';
import{entrySchema,type Owner}from'./domain.js';
export const debtSchema=z.object({name:z.string().trim().min(1).max(80),description:z.string().trim().max(500).default(''),value:entrySchema.shape.value});
export type Debt=z.infer<typeof debtSchema>&{id:string;owner:Owner};
export function debtTotal(debts:Debt[],owner:Owner){return debts.filter(d=>d.owner===owner).reduce((sum,d)=>sum+Math.round(d.value*100),0)/100;}
