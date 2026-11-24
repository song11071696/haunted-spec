let audioContext = null;
let droneGain = null;
let droneOscillator = null;
let lfo = null;
let filter = null;
let isPlaying = false;

export function initSound() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
}

export function toggleSound(enabled) {
  if (enabled) {
    startAmbient();
  } else {
    stopAmbient();
  }
  isPlaying = enabled;
}

function startAmbient() {
  if (!audioContext) initSound();
  if (droneOscillator) return;
  
  droneOscillator = audioContext.createOscillator();
  droneOscillator.type = 'sine';
  droneOscillator.frequency.value = 55;
  
  const detune = audioContext.createOscillator();
  detune.type = 'sine';
  detune.frequency.value = 54.5;
  
  filter = audioContext.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 300;
  filter.Q.value = 1;
  
  lfo = audioContext.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 0.2;
  
  const lfoGain = audioContext.createGain();
  lfoGain.gain.value = 100;
  
  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);
  
  droneGain = audioContext.createGain();
  droneGain.gain.value = 0.08;
  
  droneOscillator.connect(filter);
  detune.connect(filter);
  filter.connect(droneGain);
  droneGain.connect(audioContext.destination);
  
  droneOscillator.start();
  detune.start();
  lfo.start();
}

function stopAmbient() {
  if (droneOscillator) {
    droneOscillator.stop();
    droneOscillator.disconnect();
    droneOscillator = null;
  }
  if (lfo) {
    lfo.stop();
    lfo.disconnect();
    lfo = null;
  }
  if (filter) {
    filter.disconnect();
    filter = null;
  }
  if (droneGain) {
    droneGain.disconnect();
    droneGain = null;
  }
}

export function playExorciseSound() {
  if (!audioContext || !isPlaying) return;
  
  const osc = audioContext.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = 400;
  
  const gain = audioContext.createGain();
  gain.gain.value = 0.15;
  
  osc.connect(gain);
  gain.connect(audioContext.destination);
  
  const now = audioContext.currentTime;
  osc.frequency.setValueAtTime(400, now);
  osc.frequency.exponentialRampToValueAtTime(800, now + 0.3);
  
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
  
  osc.start(now);
  osc.stop(now + 0.3);
}

export function isSoundEnabled() {
  return isPlaying;
}
