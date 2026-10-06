package app.heroes.finance;

import android.app.AlertDialog;
import android.content.Intent;
import android.net.Uri;
import android.widget.Toast;
import androidx.fragment.app.FragmentActivity;
import androidx.lifecycle.Lifecycle;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;
import org.json.JSONArray;
import org.json.JSONObject;

/** Only published stable releases from our repository can offer an APK download. */
final class AppUpdates {
 private static final String API="https://api.github.com/repos/KayohanCosta/heroes-finance/releases/latest";
 private static final String DOWNLOAD="https://github.com/KayohanCosta/heroes-finance/releases/download/";
 private final FragmentActivity activity;
 private final ExecutorService worker=Executors.newSingleThreadExecutor();
 private final AtomicBoolean checking=new AtomicBoolean(false);
 private volatile boolean closed=false;
 AppUpdates(FragmentActivity activity){this.activity=activity;}
 static boolean newer(String offered,String current){
  if(!offered.matches("[0-9]{1,4}\\.[0-9]{1,4}\\.[0-9]{1,4}")||!current.matches("[0-9]{1,4}\\.[0-9]{1,4}\\.[0-9]{1,4}"))return false;
  String[] a=offered.split("\\."),b=current.split("\\.");for(int i=0;i<3;i++){int delta=Integer.parseInt(a[i])-Integer.parseInt(b[i]);if(delta!=0)return delta>0;}return false;
 }
 void check(boolean manual){
  if(closed)return;
  long last=activity.getPreferences(0).getLong("update_checked",0);
  if(!manual&&System.currentTimeMillis()-last<24*60*60*1000L)return;
  if(!checking.compareAndSet(false,true)){if(manual)Toast.makeText(activity,"Busca em andamento…",Toast.LENGTH_SHORT).show();return;}
  if(manual)Toast.makeText(activity,"Buscando atualizações…",Toast.LENGTH_SHORT).show();
  worker.execute(()->{
   HttpURLConnection connection=null;
   try{
    connection=(HttpURLConnection)new URL(API).openConnection();connection.setConnectTimeout(8000);connection.setReadTimeout(8000);connection.setInstanceFollowRedirects(false);connection.setRequestProperty("Accept","application/vnd.github+json");connection.setRequestProperty("User-Agent","Heroes-Finance-Android");
    int status=connection.getResponseCode();
    if(status==404){activity.getPreferences(0).edit().putLong("update_checked",System.currentTimeMillis()).apply();post(()->{if(manual)message("Nenhuma nova versão publicada.");});return;}
    if(status!=200)throw new java.io.IOException("Release unavailable");
    byte[] bytes;try(java.io.InputStream input=connection.getInputStream()){java.io.ByteArrayOutputStream output=new java.io.ByteArrayOutputStream();byte[] buffer=new byte[4096];int count;while((count=input.read(buffer))!=-1){output.write(buffer,0,count);if(output.size()>128*1024)throw new java.io.IOException("Release too large");}bytes=output.toByteArray();}if(bytes.length>128*1024)throw new java.io.IOException("Release too large");
    JSONObject release=new JSONObject(new String(bytes,StandardCharsets.UTF_8));String tag=release.getString("tag_name");
    if(release.optBoolean("draft")||release.optBoolean("prerelease")||!tag.matches("android-v[0-9]{1,4}\\.[0-9]{1,4}\\.[0-9]{1,4}"))throw new java.io.IOException("Invalid release");
    String version=tag.substring(9);String download=DOWNLOAD+tag+"/heroes-finance.apk";boolean found=false;JSONArray assets=release.getJSONArray("assets");
    for(int i=0;i<assets.length();i++){JSONObject asset=assets.getJSONObject(i);if("heroes-finance.apk".equals(asset.optString("name"))&&download.equals(asset.optString("browser_download_url"))&&asset.optLong("size")>0)found=true;}
    if(!found)throw new java.io.IOException("APK missing");
    activity.getPreferences(0).edit().putLong("update_checked",System.currentTimeMillis()).apply();
    if(!newer(version,BuildConfig.VERSION_NAME)){post(()->{if(manual)message("Seu aplicativo já está atualizado.");});return;}
    if(!manual&&tag.equals(activity.getPreferences(0).getString("update_dismissed","")))return;
    post(()->new AlertDialog.Builder(activity).setTitle("Heroes Finance · "+version).setMessage("Uma nova versão está disponível. Baixe o APK e confirme a instalação no Android. Seus dados da conta continuam salvos.").setPositiveButton("Baixar atualização",(dialog,which)->{
     try{activity.startActivity(new Intent(Intent.ACTION_VIEW,Uri.parse(download)));}catch(android.content.ActivityNotFoundException e){message("Abra a página de releases do Heroes Finance no navegador para baixar.");}
    }).setNegativeButton("Agora não",(dialog,which)->activity.getPreferences(0).edit().putString("update_dismissed",tag).apply()).show());
   }catch(Exception error){post(()->{if(manual)message("Não foi possível buscar atualizações. Confira sua conexão e tente novamente.");});}
   finally{if(connection!=null)connection.disconnect();checking.set(false);}
  });
 }
 private void post(Runnable action){activity.runOnUiThread(()->{if(!closed&&!activity.isFinishing()&&!activity.isDestroyed()&&activity.getLifecycle().getCurrentState().isAtLeast(Lifecycle.State.RESUMED))action.run();});}
 private void message(String text){Toast.makeText(activity,text,Toast.LENGTH_LONG).show();}
 void close(){closed=true;worker.shutdownNow();}
}
