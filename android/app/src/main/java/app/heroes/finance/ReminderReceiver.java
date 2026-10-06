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
  NotificationManager manager=(NotificationManager)c.getSystemService(Context.NOTIFICATION_SERVICE);
  if(Build.VERSION.SDK_INT>=26)manager.createNotificationChannel(new NotificationChannel("payments","Vencimentos",NotificationManager.IMPORTANCE_DEFAULT));
  PendingIntent open=PendingIntent.getActivity(c,0,new Intent(c,MainActivity.class),PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
  if(Build.VERSION.SDK_INT>=33&&ContextCompat.checkSelfPermission(c,Manifest.permission.POST_NOTIFICATIONS)!=PackageManager.PERMISSION_GRANTED)return;
  try{manager.notify(1,new NotificationCompat.Builder(c,"payments").setSmallIcon(app.heroes.finance.R.drawable.ic_heroes).setContentTitle("Heroes Finance").setContentText("Você tem pagamentos previstos para hoje. Confira seus lembretes.").setVisibility(NotificationCompat.VISIBILITY_PRIVATE).setContentIntent(open).setAutoCancel(true).build());}catch(SecurityException ignored){}
 }
}
