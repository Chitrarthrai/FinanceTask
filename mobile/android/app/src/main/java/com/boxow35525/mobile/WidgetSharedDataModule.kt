package com.boxow35525.mobile

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import android.util.Log

class WidgetSharedDataModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "WidgetSharedData"
    }

    @ReactMethod
    fun setWidgetData(dataJson: String) {
        val context = reactApplicationContext
        
        Log.d("WidgetSharedData", "Received setWidgetData payload: $dataJson")
        
        // Save JSON to shared preferences
        val sharedPref = context.getSharedPreferences("WidgetPrefs", Context.MODE_PRIVATE)
        sharedPref.edit().putString("data", dataJson).apply()

        // List of all widget provider classes
        val providers = arrayOf(
            FinanceWidgetProvider::class.java,
            QuickActionsWidgetProvider::class.java,
            BudgetCircleWidgetProvider::class.java,
            TasksWidgetProvider::class.java,
            ReportsWidgetProvider::class.java,
            AIWidgetProvider::class.java
        )

        for (provider in providers) {
            val intent = Intent(context, provider).apply {
                action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
            }
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val componentName = ComponentName(context, provider)
            val ids = appWidgetManager.getAppWidgetIds(componentName)
            
            Log.d("WidgetSharedData", "Found ${ids.size} active widget instances for provider ${provider.simpleName} to broadcast update.")
            
            if (ids.isNotEmpty()) {
                intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids)
                context.sendBroadcast(intent)
            }
        }
    }
}
