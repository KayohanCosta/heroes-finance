package app.heroes.finance;
import android.app.*;
import android.content.*;
import android.os.Build;
import android.Manifest;
import android.content.pm.PackageManager;
import androidx.core.content.ContextCompat;
import androidx.core.app.NotificationCompat;
public class ReminderReceiver extends BroadcastReceiver {
 @Override public void onReceive(Context c,Intent i){
  if("complete".equals(i.getAction())||"snooze".equals(i.getAction())){act(c,i);return;}
  NotificationManager manager=(NotificationManager)c.getSystemService(Context.NOTIFICATION_SERVICE);
  manager.createNotificationChannel(new NotificationChannel("payments","Lembretes e vencimentos",NotificationManager.IMPORTANCE_HIGH));
  PendingIntent open=PendingIntent.getActivity(c,0,new Intent(c,MainActivity.class),PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
  if(Build.VERSION.SDK_INT>=33&&ContextCompat.checkSelfPermission(c,Manifest.permission.POST_NOTIFICATIONS)!=PackageManager.PERMISSION_GRANTED)return;
  String text=i.getStringExtra("title");if(text==null)text="Você tem um lembrete. Abra o Heroes Finance.";
  NotificationCompat.Builder builder=new NotificationCompat.Builder(c,"payments").setSmallIcon(R.drawable.ic_notification_heroes).setColor(android.graphics.Color.BLACK).setContentTitle(text).setVisibility(NotificationCompat.VISIBILITY_PRIVATE).setContentIntent(open).setAutoCancel(true);
  String reminder=i.getStringExtra("reminderId");
  if(reminder!=null&&reminder.matches("[a-fA-F0-9-]{36}")){
   builder.addAction(new NotificationCompat.Action.Builder(0,"Feito",action(c,i,"complete")).setAuthenticationRequired(true).build());
   builder.addAction(new NotificationCompat.Action.Builder(0,"Adiar 10 min",action(c,i,"snooze")).setAuthenticationRequired(true).build());
  }
  try{manager.notify(i.getIntExtra("notificationId",1),builder.build());}catch(SecurityException ignored){}
 }
 private PendingIntent action(Context c,Intent original,String action){
  Intent intent=new Intent(c,ReminderReceiver.class).setAction(action).setData(android.net.Uri.parse("heroes://reminder/"+original.getStringExtra("reminderId")+"/"+android.net.Uri.encode(original.getStringExtra("dueAt"))));intent.putExtras(original);
  return PendingIntent.getBroadcast(c,original.getIntExtra("notificationId",1),intent,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
 }
 private void act(Context c,Intent intent){
  String cookie=android.webkit.CookieManager.getInstance().getCookie("https://heroesfinance.vercel.app"),owner=intent.getStringExtra("owner"),id=intent.getStringExtra("reminderId");
  if(cookie==null||!("Kayohan".equals(owner)||"Arielle".equals(owner))||id==null||!id.matches("[a-fA-F0-9-]{36}")){feedback(c,"Entre no Heroes para confirmar este lembrete.");return;}
  PendingResult pending=goAsync();new Thread(()->{java.net.HttpURLConnection connection=null;boolean saved=false;try{
   String until=java.time.Instant.now().plusSeconds(600).toString();org.json.JSONObject payload=new org.json.JSONObject().put("at",intent.getStringExtra("dueAt"));if("snooze".equals(intent.getAction()))payload.put("until",until);
   connection=(java.net.HttpURLConnection)new java.net.URL("https://heroesfinance.vercel.app/api/"+owner+"/reminders/"+id+"/"+intent.getAction()).openConnection();connection.setInstanceFollowRedirects(false);connection.setConnectTimeout(3000);connection.setReadTimeout(3000);connection.setRequestMethod("POST");connection.setRequestProperty("Content-Type","application/json");connection.setRequestProperty("Cookie",cookie);connection.setDoOutput(true);
   try(java.io.OutputStream output=connection.getOutputStream()){output.write(payload.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8));}
   if(connection.getResponseCode()!=200)throw new java.io.IOException("Request failed");saved=true;
   ((NotificationManager)c.getSystemService(Context.NOTIFICATION_SERVICE)).cancel(intent.getIntExtra("notificationId",1));
   org.json.JSONArray stored=new org.json.JSONArray(c.getSharedPreferences(ReminderScheduler.PREF,0).getString("dates","[]")),updated=new org.json.JSONArray();
   for(int n=0;n<stored.length();n++){org.json.JSONObject item=stored.getJSONObject(n);if(!(id.equals(item.optString("reminderId"))&&intent.getStringExtra("dueAt").equals(item.optString("dueAt"))))updated.put(item);}
   if("snooze".equals(intent.getAction()))updated.put(new org.json.JSONObject().put("at",until).put("title",intent.getStringExtra("title")).put("reminderId",id).put("dueAt",intent.getStringExtra("dueAt")).put("owner",owner));
   ReminderScheduler.replace(c,updated);feedback(c,"snooze".equals(intent.getAction())?"Lembrete adiado por 10 minutos.":"Lembrete confirmado e salvo na sua conta.");
  }catch(Exception e){feedback(c,saved?"Salvo na conta. Abra o Heroes para atualizar a agenda deste aparelho.":"Não foi possível salvar. Abra o Heroes e confirme o lembrete; o aviso permanece pendente.");}finally{if(connection!=null)connection.disconnect();pending.finish();}},"heroes-reminder-action").start();
 }
 private void feedback(Context c,String message){new android.os.Handler(android.os.Looper.getMainLooper()).post(()->android.widget.Toast.makeText(c,message,android.widget.Toast.LENGTH_LONG).show());}
}
