package com.jarvis.assistant.audio

import android.app.Application
import android.content.Intent
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import kotlinx.coroutines.channels.BufferOverflow
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow

class SpeechRecognizerManager(private val app: Application) : RecognitionListener {
    private var recognizer: SpeechRecognizer? = null

    private val _partial = MutableSharedFlow<String>(replay = 1, onBufferOverflow = BufferOverflow.DROP_OLDEST)
    val partial: SharedFlow<String> = _partial

    private val _final = MutableSharedFlow<String>(extraBufferCapacity = 8)
    val final: SharedFlow<String> = _final

    fun startListening(language: String = "en-US") {
        stop()
        recognizer = SpeechRecognizer.createSpeechRecognizer(app).also {
            it.setRecognitionListener(this)
            val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                putExtra(RecognizerIntent.EXTRA_LANGUAGE, language)
                putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
            }
            it.startListening(intent)
        }
    }

    fun stop() {
        recognizer?.let { r ->
            r.stopListening()
            r.cancel()
            r.destroy()
        }
        recognizer = null
    }

    override fun onReadyForSpeech(params: Bundle?) {}
    override fun onBeginningOfSpeech() {}
    override fun onRmsChanged(rmsdB: Float) {}
    override fun onBufferReceived(buffer: ByteArray?) {}
    override fun onEndOfSpeech() {}
    override fun onError(error: Int) { stop() }
    override fun onEvent(eventType: Int, params: Bundle?) {}

    override fun onPartialResults(partialResults: Bundle?) {
        val list = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
        val text = list?.firstOrNull() ?: return
        _partial.tryEmit(text)
    }

    override fun onResults(results: Bundle?) {
        val list = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
        val text = list?.firstOrNull() ?: return
        _final.tryEmit(text)
        stop()
    }
}
