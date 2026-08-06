package com.boxow35525.mobile

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.RemoteViews
import com.boxow35525.mobile.R

class QuickActionsWidgetProvider : AppWidgetProvider() {
    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (appWidgetId in appWidgetIds) {
            val views = RemoteViews(context.packageName, R.layout.quick_actions_widget_layout)

            // Setup deep link for Transaction
            val txIntent = Intent(Intent.ACTION_VIEW, Uri.parse("financetask://add-transaction")).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            val txPending = PendingIntent.getActivity(
                context,
                1,
                txIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.btn_add_transaction, txPending)

            // Setup deep link for Task
            val taskIntent = Intent(Intent.ACTION_VIEW, Uri.parse("financetask://add-task")).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            val taskPending = PendingIntent.getActivity(
                context,
                2,
                taskIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.btn_add_task, taskPending)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
