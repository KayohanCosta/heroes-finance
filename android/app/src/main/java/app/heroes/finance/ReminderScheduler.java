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
  for(int i=0;i<Math.min(dates.length(),60);i++){
   String date=dates.getString(i);
   try{long time=LocalDate.parse(date).atTime(9,0).atZone(ZoneId.of("America/Sao_Paulo")).toInstant().toEpochMilli();
    if(time<=System.currentTimeMillis())continue;
    alarms.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,time,intent(context,valid.length()));valid.put(date);
   }catch(java.time.DateTimeException ignored){}
  }
  context.getSharedPreferences(PREF,0).edit().putString("dates",valid.toString()).putInt("count",valid.length()).apply();
 }
 private static PendingIntent intent(Context context,int id){return PendingIntent.getBroadcast(context,id,new Intent(context,ReminderReceiver.class),PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);}
}
