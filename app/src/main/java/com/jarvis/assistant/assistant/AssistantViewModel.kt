package com.jarvis.assistant.assistant

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.jarvis.assistant.audio.SpeechRecognizerManager
import com.jarvis.assistant.audio.TtsManager
import com.jarvis.assistant.network.Message
import com.jarvis.assistant.network.OpenAiClient
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class AssistantViewModel @Inject constructor(
    private val openAi: OpenAiClient,
    private val tts: TtsManager,
    private val stt: SpeechRecognizerManager
) : ViewModel() {

    private val _transcript = MutableStateFlow("")
    val transcript: StateFlow<String> = _transcript

    private val _assistant = MutableStateFlow("")
    val assistant: StateFlow<String> = _assistant

    private val messages = mutableListOf<Message>()

    init {
        viewModelScope.launch {
            stt.partial.collect { partial -> _transcript.value = partial }
        }
        viewModelScope.launch {
            stt.final.collect { finalText ->
                _transcript.value = finalText
                query(finalText)
            }
        }
    }

    fun startListening() {
        stt.startListening()
    }

    fun stopListening() {
        stt.stop()
    }

    fun sendText(text: String) {
        _transcript.value = text
        viewModelScope.launch { query(text) }
    }

    private suspend fun query(text: String) {
        messages.add(Message("user", text))
        val response = openAi.chat(messages)
        if (response.isNotEmpty()) {
            messages.add(Message("assistant", response))
            _assistant.value = response
            tts.speak(response)
        }
    }
}
