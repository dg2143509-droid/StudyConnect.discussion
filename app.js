// 1. Firebase और डेटाबेस मॉड्यूल्स लोड करना
import { initializeApp } from "https://gstatic.com";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "https://gstatic.com";

// आपकी Firebase कॉन्फ़िगरेशन
const firebaseConfig = {
  apiKey: "AIzaSyAiDMmA2H6L1BjquRSK7tWm3VmhOLDmRO0",
  authDomain: "://firebaseapp.com",
  projectId: "studyconnect-edc3d",
  storageBucket: "studyconnect-edc3d.firebasestorage.app",
  messagingSenderId: "65560986226",
  appId: "1:65560986226:web:60736ad3c1f6a73669b8eb",
  measurementId: "G-DTQ9ZX7881"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const messagesRef = collection(db, "chats");

// --- भाग A: रियल-टाइम मैसेजिंग (चैट बॉक्स) ---
const chatBox = document.getElementById("chat-box");
const messageInput = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");

sendBtn.addEventListener("click", async () => {
    const text = messageInput.value.trim();
    if (text !== "") {
        await addDoc(messagesRef, {
            text: text,
            sender: "User", // इसे बाद में Teacher या Student में बदल सकते हैं
            timestamp: serverTimestamp()
        });
        messageInput.value = "";
    }
});

const q = query(messagesRef, orderBy("timestamp", "asc"));
onSnapshot(q, (snapshot) => {
    chatBox.innerHTML = ""; 
    snapshot.forEach((doc) => {
        const msg = doc.data();
        const msgElement = document.createElement("p");
        msgElement.innerHTML = `<strong>${msg.sender}:</strong> ${msg.text}`;
        chatBox.appendChild(msgElement);
    });
    chatBox.scrollTop = chatBox.scrollHeight; 
});


// --- भाग B: वॉइस कॉल सिस्टम (Agora) ---
// यहाँ मैंने आपकी असली App ID सेट कर दी है
const AGORA_APP_ID = "d1c63be6adb64bae8475e640e18b0ca7"; 
const CHANNEL_NAME = "study-room"; // दोनों यूजर का चैनल नेम सेम होना चाहिए

const agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
let localAudioTrack = null;

const startCallBtn = document.getElementById("start-voice-call");
const endCallBtn = document.getElementById("end-voice-call");

// वॉइस कॉल शुरू करने का फंक्शन
startCallBtn.addEventListener("click", async () => {
    try {
        await agoraClient.join(AGORA_APP_ID, CHANNEL_NAME, null, null);
        localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        await agoraClient.publish([localAudioTrack]);

        startCallBtn.style.display = "none";
        endCallBtn.style.display = "inline-block";
        alert("Voice call connected!");
    } catch (error) {
        console.error("Call error:", error);
    }
});

// जब सामने वाला यूजर कॉल में जुड़े तो उसकी आवाज बजाना
agoraClient.on("user-published", async (user, mediaType) => {
    await agoraClient.subscribe(user, mediaType);
    if (mediaType === "audio") {
        user.audioTrack.play(); 
    }
});

// कॉल काटने का फंक्शन
endCallBtn.addEventListener("click", async () => {
    if (localAudioTrack) {
        localAudioTrack.close();
    }
    await agoraClient.leave();
    startCallBtn.style.display = "inline-block";
    endCallBtn.style.display = "none";
    alert("Call ended.");
});
