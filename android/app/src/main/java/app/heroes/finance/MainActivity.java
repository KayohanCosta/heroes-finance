package app.heroes.finance;

import android.Manifest;
import android.os.*;
import android.graphics.Color;
import android.webkit.*;
import android.view.*;
import android.widget.*;
import androidx.fragment.app.FragmentActivity;
import androidx.biometric.*;
import androidx.core.content.ContextCompat;
import androidx.webkit.*;
import java.util.Collections;
import org.json.*;

public class MainActivity extends FragmentActivity {
 private static final String URL="https://heroesfinance.vercel.app";
 private WebView web;
 private ValueCallback<android.net.Uri[]> photoCallback;
 private boolean disableAfterAuth=false;
 private final androidx.activity.result.ActivityResultLauncher<android.content.Intent> photoPicker=registerForActivityResult(new androidx.activity.result.contract.ActivityResultContracts.StartActivityForResult(),result->{if(photoCallback!=null){photoCallback.onReceiveValue(result.getResultCode()==RESULT_OK&&result.getData()!=null&&result.getData().getData()!=null?new android.net.Uri[]{result.getData().getData()}:null);photoCallback=null;}});
 private FrameLayout root;
 private LinearLayout shield;
 private boolean prompting=false, unlocked=false;
 private boolean enabled(){return getPreferences(0).getBoolean("biometry",false);}
 @Override public void onCreate(Bundle state){
  super.onCreate(state);
  getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE);
  getWindow().setStatusBarColor(Color.rgb(9,13,18));
  getWindow().setNavigationBarColor(Color.rgb(9,13,18));
  root=new FrameLayout(this); setContentView(root);
  androidx.core.view.ViewCompat.setOnApplyWindowInsetsListener(root,(v,insets)->{androidx.core.graphics.Insets bars=insets.getInsets(androidx.core.view.WindowInsetsCompat.Type.systemBars()|androidx.core.view.WindowInsetsCompat.Type.ime());v.setPadding(bars.left,bars.top,bars.right,bars.bottom);return insets;});
  web=new WebView(this);root.addView(web);
  web.setBackgroundColor(Color.rgb(9,13,18));
  WebSettings s=web.getSettings();s.setJavaScriptEnabled(true);s.setDomStorageEnabled(true);
  s.setAllowFileAccess(false);s.setAllowContentAccess(false);s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
  CookieManager.getInstance().setAcceptThirdPartyCookies(web,false);
  web.setWebChromeClient(new WebChromeClient(){
   @Override public boolean onShowFileChooser(WebView v,ValueCallback<android.net.Uri[]> callback,FileChooserParams params){
    if(!trusted(v.getUrl()))return false;
    if(photoCallback!=null)photoCallback.onReceiveValue(null);photoCallback=callback;
    android.content.Intent picker=new android.content.Intent(android.content.Intent.ACTION_GET_CONTENT);picker.setType("image/*");picker.addCategory(android.content.Intent.CATEGORY_OPENABLE);
    try{photoPicker.launch(picker);}catch(Exception e){photoCallback.onReceiveValue(null);photoCallback=null;Toast.makeText(MainActivity.this,"Não foi possível abrir as fotos.",Toast.LENGTH_SHORT).show();}return true;
   }
   @Override public boolean onJsConfirm(WebView v,String url,String message,JsResult result){
    if(!trusted(url)){result.cancel();return true;}
    new android.app.AlertDialog.Builder(MainActivity.this).setTitle("Heroes Finance").setMessage(message).setPositiveButton("Confirmar",(dialog,which)->result.confirm()).setNegativeButton("Cancelar",(dialog,which)->result.cancel()).setOnCancelListener(dialog->result.cancel()).show();return true;
   }
  });
  web.setWebViewClient(new WebViewClient(){
   @Override public boolean shouldOverrideUrlLoading(WebView v,WebResourceRequest r){return !trusted(r.getUrl().toString());}
   @Override public void onReceivedError(WebView v,WebResourceRequest r,WebResourceError e){if(r.isForMainFrame())Toast.makeText(MainActivity.this,"Sem conexão. Verifique a internet e abra o app novamente.",Toast.LENGTH_LONG).show();}
  });
  if(WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER)){
   WebViewCompat.addWebMessageListener(web,"HeroesAndroid",Collections.singleton(URL),(v,message,origin,main,reply)->{
    if(!main||!URL.equals(origin.toString())||!trusted(v.getUrl()))return;
    try{
     JSONObject data=new JSONObject(message.getData());String action=data.optString("action");
     if(action.equals("syncReminders")){ReminderScheduler.replace(this,data.getJSONArray("items"));getPreferences(0).edit().putBoolean("reminders_v2",true).apply();}
     if(action.equals("sync")&&!getPreferences(0).getBoolean("reminders_v2",false)) ReminderScheduler.replace(this,data.getJSONArray("dates"));
     if(action.equals("clear")){ReminderScheduler.replace(this,new JSONArray());((android.app.NotificationManager)getSystemService(NOTIFICATION_SERVICE)).cancelAll();}
     if(action.equals("notifications")){if(Build.VERSION.SDK_INT>=33)requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS},1);}
     if(action.equals("biometry")) authenticate(true);
     if(action.equals("biometryOff")){disableAfterAuth=true;authenticate(false);}
     if(action.equals("deviceState"))publishDeviceState();
     if(action.equals("notificationSettings")){android.content.Intent settings=new android.content.Intent(android.provider.Settings.ACTION_APP_NOTIFICATION_SETTINGS);settings.putExtra(android.provider.Settings.EXTRA_APP_PACKAGE,getPackageName());startActivity(settings);}
    }catch(Exception e){Toast.makeText(this,"Não foi possível atualizar os lembretes.",Toast.LENGTH_SHORT).show();}
   });
  }
  if(enabled())showShield();
  web.loadUrl(URL);
 }
 private void publishDeviceState(){
  if(web==null||!trusted(web.getUrl()))return;
  boolean notifications=androidx.core.app.NotificationManagerCompat.from(this).areNotificationsEnabled();
  web.evaluateJavascript("window.dispatchEvent(new CustomEvent('heroes-device-state',{detail:{notifications:"+notifications+",biometry:"+enabled()+"}}))",null);
 }
 @Override public void onRequestPermissionsResult(int requestCode,String[] permissions,int[] results){super.onRequestPermissionsResult(requestCode,permissions,results);publishDeviceState();}
 private boolean trusted(String url){if(url==null)return false;android.net.Uri u=android.net.Uri.parse(url);return "https".equals(u.getScheme())&&"heroesfinance.vercel.app".equals(u.getHost())&&(u.getPort()==-1||u.getPort()==443);}
 private void showShield(){
  unlocked=false;web.setVisibility(View.INVISIBLE);
  if(shield!=null)return;
  shield=new LinearLayout(this);shield.setOrientation(LinearLayout.VERTICAL);shield.setGravity(Gravity.CENTER);shield.setBackgroundColor(Color.rgb(9,13,18));shield.setPadding(32,32,32,32);
  TextView title=new TextView(this);title.setText("HEROES FINANCE\nSeu workspace está protegido.");title.setTextColor(Color.WHITE);title.setTextSize(22);title.setGravity(Gravity.CENTER);shield.addView(title);
  Button button=new Button(this);button.setText("Desbloquear");button.setOnClickListener(v->authenticate(false));shield.addView(button);root.addView(shield,new FrameLayout.LayoutParams(-1,-1));
 }
 private void authenticate(boolean enable){
  if(prompting)return;
  int authenticators=BiometricManager.Authenticators.BIOMETRIC_STRONG;
  if(Build.VERSION.SDK_INT>=30)authenticators|=BiometricManager.Authenticators.DEVICE_CREDENTIAL;
  if(BiometricManager.from(this).canAuthenticate(authenticators)!=BiometricManager.BIOMETRIC_SUCCESS){disableAfterAuth=false;Toast.makeText(this,"Cadastre uma biometria ou bloqueio compatível nas configurações do Android.",Toast.LENGTH_LONG).show();return;}
  prompting=true;
  BiometricPrompt prompt=new BiometricPrompt(this,ContextCompat.getMainExecutor(this),new BiometricPrompt.AuthenticationCallback(){
   @Override public void onAuthenticationSucceeded(BiometricPrompt.AuthenticationResult result){prompting=false;unlocked=true;if(disableAfterAuth){getPreferences(0).edit().putBoolean("biometry",false).apply();disableAfterAuth=false;}if(enable)getPreferences(0).edit().putBoolean("biometry",true).apply();if(shield!=null){root.removeView(shield);shield=null;}web.setVisibility(View.VISIBLE);publishDeviceState();}
   @Override public void onAuthenticationError(int code,CharSequence message){prompting=false;disableAfterAuth=false;Toast.makeText(MainActivity.this,message,Toast.LENGTH_SHORT).show();}
  });
  BiometricPrompt.PromptInfo.Builder info=new BiometricPrompt.PromptInfo.Builder().setTitle("Heroes Finance").setSubtitle("Confirme sua identidade").setAllowedAuthenticators(authenticators);
  if(Build.VERSION.SDK_INT<30)info.setNegativeButtonText("Cancelar");
  prompt.authenticate(info.build());
 }
 @Override protected void onPause(){if(enabled())showShield();super.onPause();CookieManager.getInstance().flush();}
 @Override protected void onResume(){super.onResume();publishDeviceState();if(enabled()&&!unlocked&&!prompting){showShield();authenticate(false);}}
 @Override public void onBackPressed(){if(shield==null&&web.canGoBack())web.goBack();else super.onBackPressed();}
 @Override protected void onDestroy(){if(photoCallback!=null){photoCallback.onReceiveValue(null);photoCallback=null;}web.destroy();super.onDestroy();}
}
