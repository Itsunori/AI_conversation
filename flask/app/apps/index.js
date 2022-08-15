const fuga = () => {
  console.log("hogehoge");
  console.log('Ready to receive a color command.');
  
  if (ai_is_speaking == false) {
      recognition.start();
      human_is_speaking = true;
      target = document.getElementById("button");
      target_2 = document.getElementById("person");
      if (target.value == "CLICK TO \nSTOP") {
          ///「STOP」ボタンを押した場合の処理
          button.textContent = 'ANSWERING...';
          target.style.background = "#777777";
          target.value = "ANSWERING...";
          target_2.src = "images/person.gif";
          ai_is_speaking = true;
          setTimeout(function () {
              ///5秒後にspeaking=falseにする
              ai_is_speaking=false;
              target.value = "CLICK TO \nSPEAK";
              button.textContent = 'CLICK TO \nSPEAK';
              target_2.src="images/person.png";
              target.style.background= "#8ac6d1";
              },5000);
      } else {
          ///「START」ボタンを押した場合の処理
          button.textContent = 'CLICK TO \nSTOP';
          target.style.background= "#ffb6b9";
          target.value = "CLICK TO \nSTOP";
          target_2.src = "images/person.png";
      };
  }
};

let ai_is_speaking = false;
let human_is_speaking = false;


//音声認識
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList
const SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent
// let comment;

var recognition = new SpeechRecognition();
if (SpeechGrammarList) {

var speechRecognitionList = new SpeechGrammarList();

recognition.grammars = speechRecognitionList;
}
recognition.continuous = false;
recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

recognition.onresult = function(event) {
const comment = event.results[0][0].transcript;
// diagnostic.textContent = comment ;
console.log('Confidence: ' + event.results[0][0].confidence);


  console.log(comment);
  createMsg(comment, "human");
  sendData(comment);
}
// console.log('外の',comment);

let num = 4;
const push_chat = (num) => {
let num_p = $('#english-chat > p').length
if (num_p >= 3){
  $('.chat'+String(num-4)).remove();
}
}
console.log('.chat'+String(num-4))
const createMsg = (comment, type) => {
  const person = document.getElementById('english-chat');
  let chat = document.createElement("p");
  chat.textContent = comment;
  chat.id = type;
  chat.className = "chat" + String(num);
  person.append(chat);
  num++
  push_chat(num);
}

recognition.onspeechend = function() {
  recognition.stop();
  human_is_speaking = false;
console.log('stop');
// OnButtonClick();
}

//音声合成

const synth = window.speechSynthesis;

const inputForm = document.querySelector("form")
const voiceSelect = document.querySelector("select");

const pitch = document.querySelector("#pitch");
const pitchValue = document.querySelector(".pitch-value");
const rate = document.querySelector("#rate");
const rateValue = document.querySelector(".rate-value");

let voices = [];

function populateVoiceList() {
voices = synth.getVoices().sort(function (a, b) {
  const aname = a.name.toUpperCase();
  const bname = b.name.toUpperCase();

  if (aname < bname) {
    return -1;
  } else if (aname == bname) {
    return 0;
  } else {
    return +1;
  }
});
const selectedIndex =
  voiceSelect.selectedIndex < 0 ? 0 : voiceSelect.selectedIndex;
voiceSelect.innerHTML = "";

for (let i = 0; i < voices.length; i++) {
  const option = document.createElement("option");
  option.textContent = `${voices[i].name} (${voices[i].lang})`;

  if (voices[i].default) {
    option.textContent += " -- DEFAULT";
  }

    option.setAttribute("data-lang", voices[i ].lang);
    console.log("lang");
  option.setAttribute("data-name", voices[i   ].name);
  voiceSelect.appendChild(option);
}
voiceSelect.selectedIndex = selectedIndex;
}

populateVoiceList();

if (speechSynthesis.onvoiceschanged !== undefined) {
speechSynthesis.onvoiceschanged = populateVoiceList;
}

function speak(comment) {
if (synth.speaking) {
  console.error("speechSynthesis.speaking");
  return;
}

//   if (inputTxt.value !== "") {
  const utterThis = new SpeechSynthesisUtterance(comment);

  utterThis.onend = function (event) {
    console.log("SpeechSynthesisUtterance.onend");
  };

  utterThis.onerror = function (event) {
    console.error("SpeechSynthesisUtterance.onerror");
  };

  const selectedOption =
    voiceSelect.selectedOptions[0].getAttribute("data-name");

  for (let i = 0; i < voices.length; i++) {
    if (voices[i].name === selectedOption) {
        utterThis.voice = voices[i];
      break;
    }
  }
  utterThis.pitch = pitch.value;
  utterThis.rate = rate.value;
  synth.speak(utterThis);
}
// }

//  function (event) {
//   event.preventDefault();

//   speak();

//   inputTxt.blur();
// };

pitch.onchange = function () {
pitchValue.textContent = pitch.value;
};

rate.onchange = function () {
rateValue.textContent = rate.value;
};

voiceSelect.onchange = function () {
speak();
};



//データ受け渡し
// const xxx = {"key": "comment"}; 
// JSON.stringify(xxx)

// const url = "https://locahost:5000/";
const url = "https://example.com/";

const sendData = (comment) => {
  //Pythonの ポート番号が5000でなければ変更
  let data = JSON.stringify({key:comment});
  $.ajax({
      type: "POST",
      url: "http://127.0.0.1:5000/",
      data:data,
      contentType:'application/json',
      dataType: 'json',
      credentials:true
  }).done(function (res) {
      console.log('success!');
      console.log('res:',res);
      // const msg = JSON.parse(res.response);
      // console.log('msg:', msg)
      createMsg(res.response , "AI");
      speak(res.response);
  }
      ).fail(function(error) {  //alert( "error" );
      console.log(error);
  })
}
