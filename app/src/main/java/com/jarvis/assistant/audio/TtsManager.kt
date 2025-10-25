package com.jarvis.assistant.audio

import android.content.Context
import android.speech.tts.TextToSpeech
import kotlinx.coroutines.CompletableDeferred
import java.util.Locale

class TtsManager(context: Context) : TextToSpeech.OnInitListener {
    private val tts = TextToSpeech(context, this)
    private val initDeferred = CompletableDeferred<Boolean>()

    override fun onInit(status: Int) {
        val ok = status == TextToSpeech.SUCCESS
        if (ok) {
            tts.language = Locale.US
        }
        initDeferred.complete(ok)
    }

    suspend fun speak(text: String) {
        val ready = initDeferred.await()
        if (!ready) return
        tts.speak(text, TextToSpeech.QUEUE_ADD, null, System.currentTimeMillis().toString())
    }

    fun shutdown() {
        tts.shutdown()
    }
}
