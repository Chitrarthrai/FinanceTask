package com.boxow35525.mobile

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.RemoteViews
import org.json.JSONObject
import com.boxow35525.mobile.R

class ReportsWidgetProvider : AppWidgetProvider() {
    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        val sharedPref = context.getSharedPreferences("WidgetPrefs", Context.MODE_PRIVATE)
        val dataJsonStr = sharedPref.getString("data", null)

        var totalIncome = 0.0
        var totalFixed = 0.0
        var totalVariable = 0.0

        if (dataJsonStr != null) {
            try {
                val json = JSONObject(dataJsonStr)
                totalIncome = json.optDouble("totalIncome", 0.0)
                totalFixed = json.optDouble("totalFixedExpenses", 0.0)
                totalVariable = json.optDouble("totalVariableExpenses", 0.0)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }

        val maxVal = if (totalIncome > 0) totalIncome else 5000.0
        val fixedPercent = if (maxVal > 0) Math.min(100, ((totalFixed / maxVal) * 100).toInt()) else 0
        val variablePercent = if (maxVal > 0) Math.min(100, ((totalVariable / maxVal) * 100).toInt()) else 0

        for (appWidgetId in appWidgetIds) {
            val views = RemoteViews(context.packageName, R.layout.reports_widget_layout)

            // Deep link to Reports tab
            val reportsIntent = Intent(Intent.ACTION_VIEW, Uri.parse("financetask://reports")).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            val pending = PendingIntent.getActivity(
                context,
                4,
                reportsIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.progress_income, pending)

            // Populate values
            views.setTextViewText(R.id.text_income, "$${totalIncome.toInt()}")
            views.setTextViewText(R.id.text_fixed, "$${totalFixed.toInt()}")
            views.setTextViewText(R.id.text_variable, "$${totalVariable.toInt()}")

            views.setProgressBar(R.id.progress_fixed, 100, fixedPercent, false)
            views.setProgressBar(R.id.progress_variable, 100, variablePercent, false)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
