package com.jarvis.assistant.assistant.tools

import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri

class OpenAppTool(private val context: Context) : Tool {
    override suspend fun invoke(input: String): ToolResult {
        val pm: PackageManager = context.packageManager
        val launchIntent = pm.getLaunchIntentForPackage(input)
        if (launchIntent != null) {
            launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(launchIntent)
            return ToolResult.Success("Opened app: $input")
        }
        // Try search by package or Play Store fallback
        return try {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=$input")).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
            ToolResult.Success("App not found; opened Play Store: $input")
        } catch (e: Exception) {
            ToolResult.Failure("Could not open app: $input")
        }
    }
}
