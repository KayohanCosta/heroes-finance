package app.heroes.finance;
import android.content.*;
import org.json.*;
public class BootReceiver extends BroadcastReceiver {
 @Override public void onReceive(Context c,Intent i){if(!Intent.ACTION_BOOT_COMPLETED.equals(i.getAction()))return;try{ReminderScheduler.replace(c,new JSONArray(c.getSharedPreferences(ReminderScheduler.PREF,0).getString("dates","[]")));}catch(JSONException ignored){}}
}
