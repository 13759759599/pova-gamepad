const revealItems = document.querySelectorAll('.reveal');
const progress = document.querySelector('.progress span');
const surfaceScene = document.querySelector('.surface-scroll');
const surfaceLayers = Array.from(document.querySelectorAll('.surface-layer'));
const surfaceSteps = Array.from(document.querySelectorAll('.surface-progress span'));
const surfaceNote = document.querySelector('#surface-note');
const diamondScene = document.querySelector('.diamond-scroll');
const diamondLayers = Array.from(document.querySelectorAll('.diamond-layer'));
const diamondSteps = Array.from(document.querySelectorAll('.diamond-progress span'));
const diamondNote = document.querySelector('#diamond-note');
const aiKeyScene = document.querySelector('.ai-key-scroll');
const aiKeyLayers = Array.from(document.querySelectorAll('.ai-key-layer'));
const aiKeySteps = Array.from(document.querySelectorAll('.ai-key-progress span'));
const aiKeyNote = document.querySelector('#ai-key-note');
const surfaceNotes = [
  '01 从 POVA 手机背部读取三角线索。',
  '02 把三角关系转译为大面切角。',
  '03 底部三角防滑垫进入大面关系。',
  '04 压暗画面，确认底板下沉层次。',
  '05 切回亮面，明确左右斜切边界。',
  '06 按键进入后，验证整机秩序。'
];
const diamondNotes = [
  '01 从菱形动势进入方向键判断。',
  '02 菱形方向键随滚动进入画面。',
  '03 斜切辅助线把方向键和 AI 键串联起来。',
  '04 回到初步构成，确认方向键、斜切线和 AI 键的关系。'
];

const aiKeyNotes = [
  '01 在整体构成中确认 AI 按键的位置与比例。',
  '02 以橙色和斜切轮廓强化 AI 功能焦点。'
];

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
);

revealItems.forEach((item, index) => {
  item.style.setProperty('--reveal-order', index % 3);
  observer.observe(item);
});

function updateProgress() {
  if (!progress) return;
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progressValue = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;
  progress.style.width = `${progressValue}%`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function smoothStep(value) {
  const t = clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
}

function updateLayerScene(scene, layers, steps, note, notes) {
  if (!scene || layers.length === 0) return;

  const rect = scene.getBoundingClientRect();
  const scrollRange = scene.offsetHeight - window.innerHeight;
  const rawProgress = scrollRange > 0 ? -rect.top / scrollRange : 0;
  const sceneProgress = clamp(rawProgress, 0, 1);
  const scaledProgress = sceneProgress * (layers.length - 1);
  const fromIndex = Math.floor(scaledProgress);
  const toIndex = Math.min(fromIndex + 1, layers.length - 1);
  const localProgress = scaledProgress - fromIndex;
  const blend = smoothStep(clamp((localProgress - 0.18) / 0.64, 0, 1));
  const activeIndex = blend < 0.5 ? fromIndex : toIndex;

  layers.forEach((layer, index) => {
    let opacity = 0;
    if (index === fromIndex) opacity = 1 - blend;
    if (index === toIndex) opacity = blend;
    if (fromIndex === toIndex && index === fromIndex) opacity = 1;
    layer.style.opacity = opacity.toFixed(3);
  });

  steps.forEach((step, index) => {
    step.classList.toggle('is-active', index === activeIndex);
  });

  if (note) note.textContent = notes[activeIndex] || notes[0];
}

function updateSurfaceScroll() {
  updateLayerScene(surfaceScene, surfaceLayers, surfaceSteps, surfaceNote, surfaceNotes);
}

function updateDiamondScroll() {
  updateLayerScene(diamondScene, diamondLayers, diamondSteps, diamondNote, diamondNotes);
}

function updateAiKeyScroll() {
  updateLayerScene(aiKeyScene, aiKeyLayers, aiKeySteps, aiKeyNote, aiKeyNotes);
}

function updatePage() {
  updateProgress();
  updateSurfaceScroll();
  updateDiamondScroll();
  updateAiKeyScroll();
}

let ticking = false;

function requestPageUpdate() {
  if (ticking) return;
  ticking = true;
  window.requestAnimationFrame(() => {
    updatePage();
    ticking = false;
  });
}

window.addEventListener('scroll', requestPageUpdate, { passive: true });
window.addEventListener('resize', requestPageUpdate);
updatePage();
