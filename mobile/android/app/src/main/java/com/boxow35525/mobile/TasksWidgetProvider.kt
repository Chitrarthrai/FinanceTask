package com.boxow35525.mobile

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.RemoteViews
import org.json.JSONArray
import org.json.JSONObject
import com.boxow35525.mobile.R

class TasksWidgetProvider : AppWidgetProvider() {
    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        val sharedPref = context.getSharedPreferences("WidgetPrefs", Context.MODE_PRIVATE)
        val dataJsonStr = sharedPref.getString("data", null)

        var tasksArray = JSONArray()

        if (dataJsonStr != null) {
            try {
                val json = JSONObject(dataJsonStr)
                tasksArray = json.optJSONArray("tasks") ?: JSONArray()
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }

        for (appWidgetId in appWidgetIds) {
            val views = RemoteViews(context.packageName, R.layout.tasks_widget_layout)

            // Setup deep link to Tasks screen
            val tasksIntent = Intent(Intent.ACTION_VIEW, Uri.parse("financetask://tasks")).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            val pending = PendingIntent.getActivity(
                context,
                3,
                tasksIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.task_slot_1, pending)

            // Clear defaults
            views.setTextViewText(R.id.task_title_1, "No upcoming tasks")
            views.setTextViewText(R.id.task_date_1, "")
            views.setTextViewText(R.id.task_title_2, "")
            views.setTextViewText(R.id.task_date_2, "")
            views.setTextViewText(R.id.task_title_3, "")
            views.setTextViewText(R.id.task_date_3, "")

            if (tasksArray.length() > 0) {
                val task = tasksArray.optJSONObject(0)
                views.setTextViewText(R.id.task_title_1, task.optString("title", ""))
                views.setTextViewText(R.id.task_date_1, task.optString("dueDate", ""))
            }
            if (tasksArray.length() > 1) {
                val task = tasksArray.optJSONObject(1)
                views.setTextViewText(R.id.task_title_2, task.optString("title", ""))
                views.setTextViewText(R.id.task_date_2, task.optString("dueDate", ""))
            }
            if (tasksArray.length() > 2) {
                val task = tasksArray.optJSONObject(2)
                views.setTextViewText(R.id.task_title_3, task.optString("title", ""))
                views.setTextViewText(R.id.task_date_3, task.optString("dueDate", ""))
            }

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
