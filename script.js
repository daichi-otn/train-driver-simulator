const $ = (id) => document.getElementById(id);
let running = false, power = 0, speed = 0, distance = 1.2, elapsed = 0, timer;
const labels = ['B2','B1','N','P1','P2','P3','P4'];
const speedEl = $('speed'), distanceEl = $('distance'), powerLabel = $('powerLabel');

function setPower(value) {
  power = Number(value);
  document.querySelectorAll('.lever-notch').forEach((button) => button.classList.toggle('active', Number(button.dataset.power) === power));
  $('lever').style.left = `${((power + 2) / 6) * 100}%`;
  powerLabel.textContent = labels[power + 2];
  $('viewMessage').textContent = power < 0 ? '制動中　｜　速度を安全に下げています' : power > 0 ? '力行中　｜　目標速度を超えないよう注意' : '惰行中　｜　このまま速度を維持';
}

function update() {
  if (!running) return;
  const acceleration = power > 0 ? power * 0.16 : power < 0 ? power * 0.48 : -0.015;
  speed = Math.max(0, Math.min(120, speed + acceleration));
  distance = Math.max(0, distance - speed / 360000);
  elapsed += 1;
  speedEl.textContent = Math.round(speed);
  distanceEl.textContent = distance.toFixed(2);
  $('needle').style.transform = `rotate(${speed * 2.15 - 45}deg)`;
  $('targetBar').style.width = `${Math.min(100, speed / 45 * 100)}%`;
  $('distanceBar').style.width = `${Math.max(0, distance / 1.2 * 100)}%`;
  $('status').textContent = speed > 49 ? '速度超過' : speed > 1 ? '走行中' : '停車中';
  $('statusDetail').textContent = speed > 49 ? '目標速度を下げてください' : speed > 1 ? (power < 0 ? '減速しています' : '定刻運転中') : '出発準備完了';
  $('statusDot').style.background = speed > 49 ? 'var(--red)' : 'var(--green)';
  const base = 7 * 3600 + 42 * 60 + elapsed;
  const hh = String(Math.floor(base / 3600) % 24).padStart(2,'0'), mm = String(Math.floor(base / 60) % 60).padStart(2,'0'), ss = String(base % 60).padStart(2,'0');
  $('clock').textContent = `${hh}:${mm}:${ss}`;
  if (distance <= 0) finish();
}

function start() { if (running) return; running = true; $('start').classList.add('active'); $('start').innerHTML = '<span>Ⅱ</span>運転中'; $('viewMessage').textContent = '出発進行！　｜　目標速度 45 km/h'; timer = setInterval(update, 100); }
function finish() { running = false; clearInterval(timer); setPower(-2); $('start').classList.remove('active'); $('start').innerHTML = '<span>↻</span>もう一度運転'; $('score').textContent = `運転評価　${speed < 5 ? 'A' : 'B'}`; $('viewMessage').textContent = '港町駅に到着しました　｜　お疲れさまでした'; }
document.querySelectorAll('.lever-notch').forEach((button) => button.addEventListener('click', () => { if (!running) start(); setPower(button.dataset.power); }));
$('start').addEventListener('click', () => { if (running) return; if (distance <= 0) { distance = 1.2; speed = 0; elapsed = 0; } start(); });
$('brake').addEventListener('click', () => setPower(-2));
$('horn').addEventListener('click', () => { $('viewMessage').textContent = 'ポーーーッ！　｜　警笛を鳴らしました'; document.body.classList.add('flash'); setTimeout(() => document.body.classList.remove('flash'), 160); });
$('sound').addEventListener('click', (event) => { const on = event.currentTarget.getAttribute('aria-pressed') === 'true'; event.currentTarget.setAttribute('aria-pressed', String(!on)); event.currentTarget.textContent = on ? 'SOUND OFF' : 'SOUND ON'; });
document.addEventListener('keydown', (event) => { if (event.code === 'Space') { event.preventDefault(); $('horn').click(); } const keys = {'1':-2,'2':-1,'3':0,'4':1,'5':2,'6':3,'7':4}; if (keys[event.key] !== undefined) { if (!running) start(); setPower(keys[event.key]); } });
setPower(0);
