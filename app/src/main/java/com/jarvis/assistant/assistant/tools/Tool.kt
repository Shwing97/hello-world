package com.jarvis.assistant.assistant.tools

sealed interface ToolResult {
    data class Success(val content: String) : ToolResult
    data class Failure(val reason: String) : ToolResult
}

fun interface Tool {
    suspend fun invoke(input: String): ToolResult
}
