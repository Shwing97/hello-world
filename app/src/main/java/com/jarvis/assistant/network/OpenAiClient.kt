package com.jarvis.assistant.network

import com.jarvis.assistant.storage.SettingsRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject

class OpenAiClient(
    private val client: OkHttpClient,
    private val settingsRepository: SettingsRepository
) {
    private val jsonMediaType = "application/json".toMediaType()

    suspend fun chat(messages: List<Message>): String = withContext(Dispatchers.IO) {
        val apiKey = settingsRepository.openAiApiKeyFirst() ?: return@withContext ""
        val url = "https://api.openai.com/v1/chat/completions"

        val payload = JSONObject().apply {
            put("model", DEFAULT_MODEL)
            put("temperature", 0.4)
            put("messages", JSONArray().apply {
                messages.forEach { m ->
                    put(JSONObject().apply {
                        put("role", m.role)
                        put("content", m.content)
                    })
                }
            })
        }

        val req = Request.Builder()
            .url(url)
            .addHeader("Authorization", "Bearer $apiKey")
            .addHeader("Content-Type", "application/json")
            .post(payload.toString().toRequestBody(jsonMediaType))
            .build()

        client.newCall(req).execute().use { resp ->
            if (!resp.isSuccessful) return@withContext ""
            val body = resp.body?.string().orEmpty()
            val obj = JSONObject(body)
            val choices = obj.optJSONArray("choices") ?: return@withContext ""
            if (choices.length() == 0) return@withContext ""
            val message = choices.getJSONObject(0).getJSONObject("message")
            return@withContext message.optString("content", "")
        }
    }

    companion object {
        const val DEFAULT_MODEL = "gpt-4o-mini"
    }
}

// Lightweight message structure for OpenAI chat API
class Message(val role: String, val content: String)
