export function formatTimeInput(raw:string,previous:string){
 const digits=raw.replace(/\D/g,'').slice(0,4);
 if(digits.length<2)return digits;
 // Allow backspace to remove the automatic separator instead of trapping the cursor.
 if(digits.length===2&&previous.length===3&&raw.length===2)return digits.slice(0,1);
 return digits.slice(0,2)+':'+digits.slice(2);
}
