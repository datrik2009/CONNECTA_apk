import React, { useState } from 'react';
import { Code2, Copy, Check, FileText, Smartphone, Shield, Layers } from 'lucide-react';

interface NativeCodeInspectorProps {
  onClose: () => void;
}

const ANDROID_PROJECT_FILES: { name: string; path: string; category: string; code: string }[] = [
  {
    name: 'build.gradle.kts (App)',
    path: 'app/build.gradle.kts',
    category: 'Gradle',
    code: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("com.google.gms.google-services")
}

android {
    namespace = "com.connecta.messenger"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.connecta.messenger"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"
    }

    buildFeatures {
        compose = true
    }
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.8"
    }
}

dependencies {
    // Jetpack Compose Material 3
    implementation(platform("androidx.compose:compose-bom:2024.02.00"))
    implementation("androidx.compose.material3:material3")
    implementation("androidx.navigation:navigation-compose:2.7.7")

    // Firebase Suite
    implementation(platform("com.google.firebase:firebase-bom:32.7.2"))
    implementation("com.google.firebase:firebase-auth-ktx")
    implementation("com.google.firebase:firebase-firestore-ktx")
    implementation("com.google.firebase:firebase-messaging-ktx")

    // Real WebRTC for Voice and Video Calling
    implementation("io.getstream:stream-webrtc-android:1.1.1")

    // Coroutines & Image Loading
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
    implementation("io.coil-kt:coil-compose:2.5.0")
}`
  },
  {
    name: 'AndroidManifest.xml',
    path: 'app/src/main/AndroidManifest.xml',
    category: 'Manifest',
    code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />

    <application
        android:name=".ConnectaApplication"
        android:label="CONNECTA"
        android:theme="@style/Theme.Connecta">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <service
            android:name=".notifications.ConnectaMessagingService"
            android:exported="false">
            <intent-filter>
                <action android:name="com.google.firebase.MESSAGING_EVENT" />
            </intent-filter>
        </service>
    </application>
</manifest>`
  },
  {
    name: 'WebRtcManager.kt',
    path: 'app/src/main/java/com/connecta/messenger/calls/webrtc/WebRtcManager.kt',
    category: 'WebRTC',
    code: `package com.connecta.messenger.calls.webrtc

import android.content.Context
import org.webrtc.*

class WebRtcManager(private val context: Context) {
    private val eglBase = EglBase.create()
    private var peerConnectionFactory: PeerConnectionFactory? = null
    private var peerConnection: PeerConnection? = null
    private var localAudioTrack: AudioTrack? = null
    private var localVideoTrack: VideoTrack? = null

    init {
        val options = PeerConnectionFactory.InitializationOptions.builder(context)
            .setEnableInternalTracer(true)
            .createInitializationOptions()
        PeerConnectionFactory.initialize(options)

        val encoderFactory = DefaultVideoEncoderFactory(eglBase.eglBaseContext, true, true)
        val decoderFactory = DefaultVideoDecoderFactory(eglBase.eglBaseContext)

        peerConnectionFactory = PeerConnectionFactory.builder()
            .setVideoEncoderFactory(encoderFactory)
            .setVideoDecoderFactory(decoderFactory)
            .createPeerConnectionFactory()
    }

    fun startLocalVideoTrack(renderer: SurfaceViewRenderer) {
        val factory = peerConnectionFactory ?: return
        renderer.init(eglBase.eglBaseContext, null)
        val videoSource = factory.createVideoSource(false)
        val capturer = createCameraCapturer()
        capturer?.startCapture(1280, 720, 30)
        localVideoTrack = factory.createVideoTrack("ARDAMSv0", videoSource).apply {
            setEnabled(true)
            addSink(renderer)
        }
    }
}`
  },
  {
    name: 'SignalingClient.kt',
    path: 'app/src/main/java/com/connecta/messenger/calls/signaling/SignalingClient.kt',
    category: 'Signaling',
    code: `package com.connecta.messenger.calls.signaling

import com.google.firebase.firestore.FirebaseFirestore
import org.webrtc.IceCandidate
import org.webrtc.SessionDescription

class SignalingClient(private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance()) {
    fun sendOffer(callId: String, sdp: SessionDescription) {
        firestore.collection("callSessions").document(callId)
            .update("offer", mapOf("type" to sdp.type.canonicalForm(), "sdp" to sdp.description), "status", "calling")
    }

    fun sendAnswer(callId: String, sdp: SessionDescription) {
        firestore.collection("callSessions").document(callId)
            .update("answer", mapOf("type" to sdp.type.canonicalForm(), "sdp" to sdp.description), "status", "accepted")
    }

    fun sendIceCandidate(callId: String, senderId: String, candidate: IceCandidate) {
        firestore.collection("callSessions").document(callId).collection("candidates")
            .add(mapOf("senderId" to senderId, "sdp" to candidate.sdp, "sdpMid" to candidate.sdpMid))
    }
}`
  },
  {
    name: 'firestore.rules',
    path: 'firestore.rules',
    category: 'Security',
    code: `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} { allow read, write: if false; }

    function isSignedIn() { return request.auth != null; }
    function isOwner(userId) { return isSignedIn() && request.auth.uid == userId; }

    match /users/{userId} {
      allow get, list: if isSignedIn();
      allow create, update: if isOwner(userId);
    }

    match /chats/{chatId} {
      allow read, write: if isSignedIn() && (request.auth.uid in resource.data.members);
      match /messages/{messageId} {
        allow read, write: if isSignedIn() && get(/databases/$(database)/documents/chats/$(chatId)).data.members.hasAny([request.auth.uid]);
      }
    }

    match /callSessions/{callId} {
      allow read, write: if isSignedIn() && (request.auth.uid == resource.data.callerId || request.auth.uid == resource.data.receiverId);
    }
  }
}`
  }
];

export const NativeCodeInspector: React.FC<NativeCodeInspectorProps> = ({ onClose }) => {
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  const currentFile = ANDROID_PROJECT_FILES[selectedFileIdx];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 select-none">
      <div className="w-full max-w-4xl h-[88vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>CONNECTA Native Android Architecture</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono">
                  Kotlin + Compose + WebRTC
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">{currentFile.path}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Back to App
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left File Sidebar */}
          <div className="w-64 bg-slate-950/60 border-r border-slate-800/80 p-3 space-y-1 overflow-y-auto shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1 block">
              Native Project Files
            </span>
            {ANDROID_PROJECT_FILES.map((file, idx) => (
              <button
                key={file.path}
                onClick={() => setSelectedFileIdx(idx)}
                className={`w-full px-3 py-2 rounded-xl text-left text-xs font-medium flex items-center justify-between transition-colors ${
                  idx === selectedFileIdx
                    ? 'bg-indigo-600/30 text-indigo-300 font-semibold border border-indigo-500/40'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{file.name}</span>
                </div>
                <span className="text-[10px] font-mono opacity-50 shrink-0">{file.category}</span>
              </button>
            ))}

            <div className="mt-6 pt-4 border-t border-slate-800/80 px-2 space-y-2 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5 text-indigo-400 font-semibold">
                <Layers className="w-3.5 h-3.5" />
                <span>Architecture Highlights</span>
              </div>
              <p className="text-[10px] leading-relaxed">
                • Native Jetpack Compose & Material 3<br />
                • Real Google WebRTC for audio & video<br />
                • Cloud Firestore signaling bus<br />
                • MVVM Clean Architecture with Flows<br />
                • Firebase FCM background notifications
              </p>
            </div>
          </div>

          {/* Right Code Viewer */}
          <div className="flex-1 overflow-auto p-4 bg-slate-950 font-mono text-xs text-slate-200 leading-relaxed">
            <pre className="selection:bg-indigo-600/40">{currentFile.code}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
