package com.boxow35525.mobile

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.widget.RemoteViews
import org.json.JSONObject
import com.boxow35525.mobile.R
import android.util.Log

class FinanceWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        Log.d("FinanceWidgetProvider", "onUpdate triggered for ${appWidgetIds.size} instances.")
        
        val sharedPref = context.getSharedPreferences("WidgetPrefs", Context.MODE_PRIVATE)
        val dataJsonStr = sharedPref.getString("data", null)

        var spentToday = "0"
        var dailyLimit = "2000"
        var recentMerchant = "No transaction"
        var recentAmount = "0.00"

        Log.d("FinanceWidgetProvider", "Stored JSON: $dataJsonStr")

        if (dataJsonStr != null) {
            try {
                val json = JSONObject(dataJsonStr)
                spentToday = json.optString("spentToday", "0")
                dailyLimit = json.optString("dailyLimit", "2000")
                recentMerchant = json.optString("recentMerchant", "No transaction")
                recentAmount = json.optString("recentAmount", "0.00")
            } catch (e: Exception) {
                Log.e("FinanceWidgetProvider", "JSON parse error", e)
            }
        }

        for (appWidgetId in appWidgetIds) {
            val views = RemoteViews(context.packageName, R.layout.finance_widget_layout)

            // Populate text elements
            views.setTextViewText(R.id.widget_balance, "$$spentToday / $$dailyLimit")
            views.setTextViewText(R.id.widget_limit_info, "Today's Limit Utilisation")
            views.setTextViewText(R.id.widget_recent_title, "Recent Activity")
            views.setTextViewText(R.id.widget_recent_desc, "$recentMerchant: -$$recentAmount")

            appWidgetManager.updateAppWidget(appWidgetId, views)
            Log.d("FinanceWidgetProvider", "RemoteViews updated successfully for appWidgetId: $appWidgetId")
        }
    }
}
