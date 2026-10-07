package app.heroes.finance;
import android.app.*;
import android.content.*;
import org.json.*;
import java.time.*;

final class ReminderScheduler {
 static final String PREF="heroes_reminders";
 static void replace(Context context,JSONArray dates)throws JSONException {
  AlarmManager alarms=(AlarmManager)context.getSystemService(Context.ALARM_SERVICE);
  int previous=context.getSharedPreferences(PREF,0).getInt("count",0);
  for(int i=0;i<previous;i++){PendingIntent p=intent(context,i);alarms.cancel(p);p.cancel();}
  JSONArray valid=new JSONArray();
  for(int i=0;i<Math.min(dates.length(),500);i++){
   Object raw=dates.get(i);
   try{JSONObject item=raw instanceof JSONObject?(JSONObject)raw:new JSONObject().put("at",LocalDate.parse((String)raw).atTime(9,0).atZone(ZoneId.of("America/Sao_Paulo")).toInstant().toString()).put("title","Você tem pagamentos previstos para hoje. Confira seus lembretes.");
    long time=Instant.parse(item.getString("at")).toEpochMilli();
    if(time<=System.currentTimeMillis())continue;
    String title=item.optString("title","Você tem um lembrete. Abra o Heroes Finance.");if(title.length()>180)title=title.substring(0,180);
    int id=valid.length();Intent broadcast=new Intent(context,ReminderReceiver.class).putExtra("title",title).putExtra("notificationId",id+1).putExtra("reminderId",item.optString("reminderId")).putExtra("dueAt",item.optString("dueAt")).putExtra("owner",item.optString("owner"));
    PendingIntent pending=PendingIntent.getBroadcast(context,id,broadcast,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
    schedule(alarms,time,pending);valid.put(item);
   }catch(java.time.DateTimeException|ClassCastException ignored){}
  }
  context.getSharedPreferences(PREF,0).edit().putString("dates",valid.toString()).putInt("count",valid.length()).apply();
 }
 private static void schedule(AlarmManager alarms,long time,PendingIntent pending){
  if(android.os.Build.VERSION.SDK_INT<31||alarms.canScheduleExactAlarms()){
   try{alarms.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,time,pending);return;}catch(SecurityException ignored){}
  }
  alarms.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,time,pending);
 }
 static void test(Context context){
  Intent broadcast=new Intent(context,ReminderReceiver.class).putExtra("title","Teste de lembrete agendado").putExtra("notificationId",900002);
  PendingIntent pending=PendingIntent.getBroadcast(context,900002,broadcast,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
  schedule((AlarmManager)context.getSystemService(Context.ALARM_SERVICE),System.currentTimeMillis()+30000,pending);
 }
 private static PendingIntent intent(Context context,int id){return PendingIntent.getBroadcast(context,id,new Intent(context,ReminderReceiver.class),PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);}
}
