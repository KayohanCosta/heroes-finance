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
    int id=valid.length();Intent broadcast=new Intent(context,ReminderReceiver.class).putExtra("title",title).putExtra("notificationId",id+1);
    PendingIntent pending=PendingIntent.getBroadcast(context,id,broadcast,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
    alarms.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,time,pending);valid.put(item);
   }catch(java.time.DateTimeException|ClassCastException ignored){}
  }
  context.getSharedPreferences(PREF,0).edit().putString("dates",valid.toString()).putInt("count",valid.length()).apply();
 }
 private static PendingIntent intent(Context context,int id){return PendingIntent.getBroadcast(context,id,new Intent(context,ReminderReceiver.class),PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);}
}
