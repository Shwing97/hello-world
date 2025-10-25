package com.jarvis.assistant.assistant

import android.content.Context
import com.jarvis.assistant.assistant.tools.OpenAppTool
import com.jarvis.assistant.assistant.tools.Tool
import com.jarvis.assistant.assistant.tools.ToolResult

class ToolOrchestrator(context: Context) {
    private val tools: Map<String, Tool> = mapOf(
        "open_app" to OpenAppTool(context)
    )

    suspend fun tryExecute(toolName: String, input: String): ToolResult? {
        val tool = tools[toolName] ?: return null
        return tool.invoke(input)
    }
}
