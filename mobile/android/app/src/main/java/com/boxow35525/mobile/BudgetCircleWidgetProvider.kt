package com.boxow35525.mobile

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.widget.RemoteViews
import org.json.JSONObject
import com.boxow35525.mobile.R

class BudgetCircleWidgetProvider : AppWidgetProvider() {
    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        val sharedPref = context.getSharedPreferences("WidgetPrefs", Context.MODE_PRIVATE)
        val dataJsonStr = sharedPref.getString("data", null)

        var spentToday = "0"
        var dailyLimit = "2000"

        if (dataJsonStr != null) {
            try {
                val json = JSONObject(dataJsonStr)
                spentToday = json.optString("spentToday", "0")
                dailyLimit = json.optString("dailyLimit", "2000")
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }

        val spent = spentToday.toDoubleOrNull() ?: 0.0
        val limit = dailyLimit.toDoubleOrNull() ?: 2000.0
        val percentage = if (limit > 0) Math.min(100, ((spent / limit) * 100).toInt()) else 0

        for (appWidgetId in appWidgetIds) {
            val views = RemoteViews(context.packageName, R.layout.budget_circle_widget_layout)

            views.setTextViewText(R.id.widget_spent_today, "$${spent.toInt()}")
            views.setTextViewText(R.id.widget_spent_details, "spent of $${limit.toInt()} limit (${percentage}%)")
            views.setProgressBar(R.id.widget_progress_bar, 100, percentage, false)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
