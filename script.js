const LANGUAGES = [
  { code: "auto", name: "Auto Detect (source only)" },
  { code: "af-ZA", name: "Afrikaans" },
  { code: "am-ET", name: "Amharic" },
  { code: "ar-SA", name: "Arabic" },
  { code: "az-AZ", name: "Azerbaijani" },
  { code: "bn-BD", name: "Bengali" },
  { code: "bg-BG", name: "Bulgarian" },
  { code: "ca-ES", name: "Catalan" },
  { code: "cs-CZ", name: "Czech" },
  { code: "da-DK", name: "Danish" },
  { code: "de-DE", name: "German" },
  { code: "el-GR", name: "Greek" },
  { code: "en-US", name: "English (US)" },
  { code: "en-GB", name: "English (UK)" },
  { code: "es-ES", name: "Spanish" },
  { code: "et-EE", name: "Estonian" },
  { code: "fa-IR", name: "Persian" },
  { code: "fi-FI", name: "Finnish" },
  { code: "fr-FR", name: "French" },
  { code: "he-IL", name: "Hebrew" },
  { code: "hi-IN", name: "Hindi" },
  { code: "hr-HR", name: "Croatian" },
  { code: "hu-HU", name: "Hungarian" },
  { code: "id-ID", name: "Indonesian" },
  { code: "it-IT", name: "Italian" },
  { code: "ja-JP", name: "Japanese" },
  { code: "ko-KR", name: "Korean" },
  { code: "lt-LT", name: "Lithuanian" },
  { code: "lv-LV", name: "Latvian" },
  { code: "ms-MY", name: "Malay" },
  { code: "nl-NL", name: "Dutch" },
  { code: "no-NO", name: "Norwegian" },
  { code: "pl-PL", name: "Polish" },
  { code: "pt-PT", name: "Portuguese (PT)" },
  { code: "pt-BR", name: "Portuguese (BR)" },
  { code: "ro-RO", name: "Romanian" },
  { code: "ru-RU", name: "Russian" },
  { code: "sk-SK", name: "Slovak" },
  { code: "sl-SI", name: "Slovenian" },
  { code: "sv-SE", name: "Swedish" },
  { code: "sw-KE", name: "Swahili" },
  { code: "ta-IN", name: "Tamil" },
  { code: "th-TH", name: "Thai" },
  { code: "tr-TR", name: "Turkish" },
  { code: "uk-UA", name: "Ukrainian" },
  { code: "ur-PK", name: "Urdu" },
  { code: "vi-VN", name: "Vietnamese" },
  { code: "zh-CN", name: "Chinese (Simplified)" },
  { code: "zh-TW", name: "Chinese (Traditional)" },
];

const sourceText = document.getElementById("source-text");
const translatedText = document.getElementById("translated-text");
const translateButton = document.getElementById("translate-button");
const fromLanguage = document.getElementById("from-language");
const toLanguage = document.getElementById("to-language");
const swapBtn = document.getElementById("swap-btn");
const micBtn = document.getElementById("mic-btn");
const speakBtn = document.getElementById("speak-btn");
const copySourceBtn = document.getElementById("copy-source");
const copyTranslatedBtn = document.getElementById("copy-translated");
const charCounter = document.getElementById("char-counter");
const clearBtn = document.getElementById("clear-btn");
const statusEl = document.getElementById("status");
const toast = document.getElementById("toast");

const API = "https://api.mymemory.translated.net/get";

let typingInterval = null;
let recognizing = false;
let synth = window.speechSynthesis;
let voices = [];

function showToast(msg){
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(()=> toast.classList.remove("show"), 1800);
}
function updateCounter(){
  const len = (sourceText.value || "").length;
  charCounter.textContent = `${len} / ${sourceText.maxLength}`;
}
function setLoading(isLoading){
  translateButton.classList.toggle("loading", isLoading);
  translateButton.disabled = isLoading;
  if(isLoading){
    statusEl.textContent = "Translating";
    statusEl.classList.add("typing");
    startTypingEffect();
  }else{
    statusEl.textContent = "";
    statusEl.classList.remove("typing");
    stopTypingEffect();
  }
}
function startTypingEffect(){
  stopTypingEffect();
}
function stopTypingEffect(){
}
function encode(str){
  return encodeURIComponent(str).replace(/%20/g,'+');
}
function langForAPI(code){
  if(code === "auto") return "auto";
  return (code.split("-")[0] || code);
}
function populateLanguages(){
  fromLanguage.innerHTML = "";
  toLanguage.innerHTML = "";
  LANGUAGES.forEach(l=>{
    const o1 = document.createElement("option");
    o1.value = l.code; o1.textContent = l.name;
    fromLanguage.appendChild(o1);
    if(l.code !== "auto"){
      const o2 = document.createElement("option");
      o2.value = l.code; o2.textContent = l.name;
      toLanguage.appendChild(o2);
    }
  });
  fromLanguage.value = "en-US";
  toLanguage.value = "es-ES";
}
function swapLanguages(){
  const fromVal = fromLanguage.value;
  const toVal = toLanguage.value;
  if(toVal === "auto"){ showToast("Cannot set target to Auto"); return; }
  if(fromVal === "auto"){
    fromLanguage.value = toVal;
    toLanguage.value = "en-US";
  }else{
    fromLanguage.value = toVal;
    toLanguage.value = fromVal;
  }
  const s = sourceText.value;
  sourceText.value = translatedText.value;
  translatedText.value = s;
  updateCounter();
}

async function translateText(){
  const q = sourceText.value.trim();
  if(!q){ translatedText.value = ""; showToast("Enter text to translate"); return; }
  const src = langForAPI(fromLanguage.value);
  const tgt = langForAPI(toLanguage.value);
  if(!tgt || tgt === "auto"){ showToast("Choose a target language"); return; }

  setLoading(true);
  translatedText.value = "";

  try{
    const url = `${API}?q=${encode(q)}&langpair=${encode(src)}|${encode(tgt)}&de=example%40email.com`;
    const res = await fetch(url);
    const data = await res.json();
    if(data && data.responseData && data.responseData.translatedText){
      translatedText.value = data.responseData.translatedText;
      showToast("Translated!");
    }else{
      translatedText.value = "Translation failed. Please try again later.";
    }
  }catch(e){
    translatedText.value = "Translation failed. Please try again later.";
  }finally{
    setLoading(false);
  }
}

async function copyToClipboard(text){
  try{
    await navigator.clipboard.writeText(text);
    showToast("Copied to clipboard");
  }catch{
    showToast("Copy failed");
  }
}

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
if(SpeechRecognition){
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
}

function startRecognition(){
  if(!recognition){ showToast("Speech recognition not supported"); return; }
  if(recognizing){ recognition.stop(); return; }
  recognizing = true;
  micBtn.classList.add("active");
  recognition.lang = (fromLanguage.value === "auto" ? "en-US" : fromLanguage.value);
  recognition.start();

  recognition.onresult = (e)=>{
    const transcript = e.results[0][0].transcript;
    sourceText.value = sourceText.value ? (sourceText.value.trim() + " " + transcript) : transcript;
    updateCounter();
  };
  recognition.onerror = ()=> showToast("Speech recognition error");
  recognition.onend = ()=>{
    recognizing = false;
    micBtn.classList.remove("active");
  };
}

function loadVoices(){
  voices = synth ? synth.getVoices() : [];
}
if(synth){
  loadVoices();
  if(typeof speechSynthesis !== "undefined"){
    speechSynthesis.onvoiceschanged = loadVoices;
  }
}
function speak(text, langCode){
  if(!synth){ showToast("Speech synthesis not supported"); return; }
  if(!text){ showToast("Nothing to speak"); return; }
  const utter = new SpeechSynthesisUtterance(text);
  const base = (langCode || "en-US");
  const langShort = base.split("-")[0];
  let voice = voices.find(v => v.lang === base) ||
              voices.find(v => v.lang && v.lang.toLowerCase().startsWith(langShort)) ||
              voices.find(v => v.default) || voices[0];
  if(voice) utter.voice = voice;
  utter.lang = voice?.lang || base;
  utter.rate = 1;
  utter.pitch = 1;
  synth.cancel();
  synth.speak(utter);
}

document.addEventListener("DOMContentLoaded", ()=>{
  populateLanguages();
  updateCounter();

  sourceText.addEventListener("input", updateCounter);
  translateButton.addEventListener("click", translateText);
  clearBtn.addEventListener("click", ()=>{
    sourceText.value = ""; translatedText.value = ""; updateCounter();
  });
  swapBtn.addEventListener("click", swapLanguages);
  copySourceBtn.addEventListener("click", ()=> copyToClipboard(sourceText.value));
  copyTranslatedBtn.addEventListener("click", ()=> copyToClipboard(translatedText.value));
  micBtn.addEventListener("click", startRecognition);
  speakBtn.addEventListener("click", ()=> speak(translatedText.value, toLanguage.value));

  sourceText.addEventListener("keydown", (e)=>{
    if((e.metaKey || e.ctrlKey) && e.key === "Enter"){
      translateText();
    }
  });
});
