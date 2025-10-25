package com.jarvis.assistant.assistant

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.launch

class AssistantEngine {
    private val scope = CoroutineScope(Dispatchers.Default)

    private val _events = MutableSharedFlow<String>(extraBufferCapacity = 64)
    val events = _events.asSharedFlow()

    fun handleUserText(text: String) {
        scope.launch {
            _events.emit("You said: $text")
        }
    }
}
