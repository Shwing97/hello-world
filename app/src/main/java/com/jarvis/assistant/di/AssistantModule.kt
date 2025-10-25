package com.jarvis.assistant.di

import android.app.Application
import com.jarvis.assistant.audio.SpeechRecognizerManager
import com.jarvis.assistant.audio.TtsManager
import com.jarvis.assistant.network.OpenAiClient
import com.jarvis.assistant.storage.SettingsRepository
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import okhttp3.OkHttpClient
import java.util.concurrent.TimeUnit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AssistantModule {

    @Provides
    @Singleton
    fun provideOkHttpClient(): OkHttpClient = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .build()

    @Provides
    @Singleton
    fun provideOpenAiClient(client: OkHttpClient, settings: SettingsRepository): OpenAiClient =
        OpenAiClient(client, settings)

    @Provides
    @Singleton
    fun provideTtsManager(app: Application): TtsManager = TtsManager(app)

    @Provides
    @Singleton
    fun provideSpeechRecognizerManager(app: Application): SpeechRecognizerManager = SpeechRecognizerManager(app)
}
