import {z} from 'zod';
export const settingsSchema=z.object({
 displayName:z.string().trim().min(1).max(40),
 avatar:z.string().max(40000).refine(v=>!v||/^data:image\/(jpeg|png);base64,[A-Za-z0-9+/]+={0,2}$/.test(v),'Foto inválida.'),
 theme:z.enum(['dark','light']).default('dark'),
 defaultPeriod:z.enum(['week','month']),hideBalances:z.boolean(),
 showAgent:z.boolean(),showFlow:z.boolean(),showPaymentReminders:z.boolean(),showPersonalReminders:z.boolean(),
}).strict();
export type UserSettings=z.infer<typeof settingsSchema>;
export const defaultSettings=(name:string):UserSettings=>({displayName:name,avatar:'',theme:'dark',defaultPeriod:'week',hideBalances:false,showAgent:true,showFlow:true,showPaymentReminders:true,showPersonalReminders:true});
