// Firebase की ज़रूरी स्क्रिप्ट्स को लोड करने का पुराना और सबसे पक्का तरीका
const firebaseConfig = {
  apiKey: "AIzaSyAiDMmA2H6L1BjquRSK7tWm3VmhOLDmRO0",
  authDomain: "://firebaseapp.com",
  projectId: "studyconnect-edc3d",
  storageBucket: "studyconnect-edc3d.firebasestorage.app",
  messagingSenderId: "65560986226",
  appId: "1:65560986226:web:60736ad3c1f6a73669b8eb",
  measurementId: "G-DTQ9ZX7881"
};

// Firebase चालू करना
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const messagesRef = db.collection("chats");

// --- भाग A: चैट सिस्टम ---
const chatBox = document.getElementById("chat-box");
const messageInput = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");

sendBtn.addEventListener("click", async () => {
    const text = messageInput.value.trim();
    if (text !== "") {
        await messagesRef.add({
            text: text,
            sender: "User",
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        messageInput.value = "";
    }
});

// डेटाबेस से मैसेज लाइव पढ़ना
messagesRef.orderBy("timestamp", "asc").onSnapshot((snapshot) => {
    chatBox.innerHTML = ""; 
    snapshot.forEach((doc) => {
        const msg = doc.data();
        const msgElement = document.createElement("p");
        msgElement.innerHTML = `<strong>${msg.sender}:</strong> ${msg.text}`;
        chatBox.appendChild(msgElement);
    });
    chatBox.scrollTop = chatBox.scrollHeight; 
});


// --- भाग B: वॉइस कॉल (Agora) ---
const AGORA_APP_ID = "d1c63be6adb64bae8475e640e18b0ca7"; 
const CHANNEL_NAME = "study-room"; 

const agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
let localAudioTrack = null;

const startCallBtn = document.getElementById("start-voice-call");
const endCallBtn = document.getElementById("end-voice-call");

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
        alert("Call Failed! Please check microphone permission.");
    }
});

agoraClient.on("user-published", async (user, mediaType) => {
    await agoraClient.subscribe(user, mediaType);
    if (mediaType === "audio") {
        user.audioTrack.play(); 
    }
});

endCallBtn.addEventListener("click", async () => {
    if (localAudioTrack) {
        localAudioTrack.close();
    }
    await agoraClient.leave();
    startCallBtn.style.display = "inline-block";
    endCallBtn.style.display = "none";
    alert("Call ended.");
});
