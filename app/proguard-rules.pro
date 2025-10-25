# Keep Hilt generated classes
-keep class dagger.hilt.** { *; }
-keep class hilt_aggregated_deps.** { *; }

# Keep our app classes (adjust as needed)
-keep class com.jarvis.assistant.** { *; }

# OkHttp/Okio rules (generally safe)
-dontwarn javax.annotation.**
-dontwarn org.codehaus.mojo.animal_sniffer.IgnoreJRERequirement
-dontwarn okhttp3.internal.platform.**
