
// Aesthetic Quiz App - Vanilla JS
const QUESTION_TIME = 20;
const SAVE_KEY = "brightquiz_history_v1";

const QUESTIONS = [
  { q: "Which planet is nicknamed the 'Red Planet'?", options: ["Venus","Mars","Jupiter","Saturn"], answerIndex:1 },
  { q: "HTML stands for:", options:["Home Tool Markup Language","HyperText Markup Language","HighText Machine Language","Hyperlinks and Text Markup Language"], answerIndex:1 },
  { q: "What is 9 × 7?", options:["54","63","72","49"], answerIndex:1 },
  { q: "Which language runs in the browser?", options:["Python","C#","JavaScript","Java"], answerIndex:2 },
  { q: "What tag is used for a paragraph in HTML?", options:["<p>","<div>","<span>","<para>"], answerIndex:0 }
];

const startBtn = document.getElementById("start-btn");
const viewScoresBtn = document.getElementById("view-scores");
const restartBtn = document.getElementById("restart-btn");
const exportBtn = document.getElementById("export-btn");
const nextBtn = document.getElementById("next-btn");
const finishBtn = document.getElementById("finish-btn");
const introPane = document.getElementById("intro");
const quizPane = document.getElementById("quiz");
const resultPane = document.getElementById("result");
const qCount = document.getElementById("q-count");
const qText = document.getElementById("question");
const answersEl = document.getElementById("answers");
const timerEl = document.getElementById("timer");
const progressBar = document.getElementById("progress-bar");
const historyPane = document.getElementById("history-pane");
const closeHistoryBtn = document.getElementById("close-history");
const historyList = document.getElementById("history-list");
const clearHistoryBtn = document.getElementById("clear-history");
const themeSwitcher = document.getElementById("theme-switcher");
const body = document.body;

let questions = [];
let index = 0;
let score = 0;
let timer = null;
let timeLeft = QUESTION_TIME;
let userAnswers = [];

function loadHistory(){return JSON.parse(localStorage.getItem(SAVE_KEY)||"[]")}
function saveHistory(hist){localStorage.setItem(SAVE_KEY, JSON.stringify(hist))}

themeSwitcher?.addEventListener("click",(e)=>{
  const btn = e.target.closest("button[data-theme]");
  if(!btn) return;
  body.className = btn.dataset.theme;
})

viewScoresBtn?.addEventListener("click",()=>{populateHistory(); historyPane.classList.remove("hide")})
closeHistoryBtn?.addEventListener("click",()=>historyPane.classList.add("hide"))
clearHistoryBtn?.addEventListener("click",()=>{
  if(confirm("Clear all saved history?")){saveHistory([]);populateHistory()}
})

function populateHistory(){
  const hist = loadHistory();
  historyList.innerHTML = hist.length===0?`<div class="muted">No history yet — take a quiz!</div>`:"";
  hist.slice().reverse().forEach(item=>{
    const el = document.createElement("div");
    el.className="history-item";
    el.innerHTML=`<div>${new Date(item.t).toLocaleString()}</div><div>${item.score}/${item.total}</div>`;
    historyList.appendChild(el);
  })
}

startBtn.addEventListener("click", startQuiz);
restartBtn.addEventListener("click", ()=>{showIntro()});
finishBtn.addEventListener("click", ()=>{endQuiz()});
exportBtn.addEventListener("click", ()=>{
  const data={score,total:questions.length,answers:userAnswers,date:new Date().toISOString()};
  const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");a.href=url;a.download="quiz-results.json";a.click();URL.revokeObjectURL(url);
})
nextBtn.addEventListener("click",()=>{
  index++; index<questions.length?loadQuestion():endQuiz();
})

function startQuiz(){
  questions=QUESTIONS.map(q=>({...q})).sort(()=>Math.random()-0.5);
  index=0; score=0; userAnswers=[];
  introPane.classList.add("hide"); resultPane.classList.add("hide"); quizPane.classList.remove("hide");
  loadQuestion();
}

function showIntro(){introPane.classList.remove("hide"); resultPane.classList.add("hide"); quizPane.classList.add("hide"); historyPane.classList.add("hide")}

function loadQuestion(){
  clearTimer();
  const q=questions[index];
  qCount.innerText=`${index+1} / ${questions.length}`;
  qText.innerText=q.q;
  timeLeft=QUESTION_TIME; timerEl.innerText=`${timeLeft}s`; startTimer();
  answersEl.innerHTML="";
  q.options.forEach((opt,i)=>{
    const btn=document.createElement("button");
    btn.className="answer-btn"; btn.type="button"; btn.innerText=opt; btn.dataset.index=i; btn.addEventListener("click",onAnswerClick);
    answersEl.appendChild(btn);
  })
  nextBtn.classList.add("hide"); finishBtn.classList.add("hide"); updateProgress();
}

function startTimer(){
  timerEl.innerText=`${timeLeft}s`;
  timer=setInterval(()=>{
    timeLeft--; timerEl.innerText=`${timeLeft}s`;
    if(timeLeft<=0){clearInterval(timer); userAnswers.push(null); revealCorrect(null,true); setTimeout(()=>{index++; index<questions.length?loadQuestion():endQuiz()},900)}
  },1000)
}

function clearTimer(){if(timer){clearInterval(timer); timer=null}}

function onAnswerClick(e){
  const btn=e.currentTarget;
  const chosen=Number(btn.dataset.index);
  clearTimer(); userAnswers.push(chosen);
  const q=questions[index]; const correctIndex=q.answerIndex;
  if(chosen===correctIndex) score++;
  revealCorrect(chosen,false);
  index<questions.length-1?nextBtn.classList.remove("hide"):finishBtn.classList.remove("hide");
}

function revealCorrect(chosenIndex,timedOut){
  const q=questions[index];
  Array.from(answersEl.children).forEach((btn,i)=>{
    btn.disabled=true;
    if(i===q.answerIndex) btn.classList.add("correct");
    else if(i===chosenIndex&&chosenIndex!==q.answerIndex) btn.classList.add("wrong");
    else btn.classList.add("muted");
  })
}

function endQuiz(){
  clearTimer(); quizPane.classList.add("hide"); resultPane.classList.remove("hide");
  document.getElementById("result-text").innerText=`You scored ${score} of ${questions.length}`;
  const hist=loadHistory(); hist.push({t:Date.now(),score,total:questions.length}); saveHistory(hist); updateProgress();
}

function updateProgress(){
  const pct=(index/Math.max(questions.length,1))*100; progressBar.style.width=pct+"%";
}

showIntro(); populateHistory();
document.addEventListener("keydown",(e)=>{if(e.key==="Enter"&&!quizPane.classList.contains("hide")){!nextBtn.classList.contains("hide")&&nextBtn.click()}})
