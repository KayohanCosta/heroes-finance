import type {Request,Response} from 'express';
// Falha de forma explícita, sem escrever no disco efêmero da Vercel.
export default async function handler(req:Request,res:Response){
 if(!process.env.SUPABASE_URL||!process.env.SUPABASE_SERVICE_ROLE_KEY){res.status(503).json({error:'Configure o Supabase para utilizar o ambiente publicado.'});return;}
 const {app}=await import('../server/index.js');
 return app(req,res);
}
