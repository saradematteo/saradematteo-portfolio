const menuButton = document.querySelector('.menu-button');
const menu = document.querySelector('.menu');

menuButton.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.querySelector('span').textContent = open ? '−' : '＋';
});

menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  menu.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.querySelector('span').textContent = '＋';
}));

const tabs = document.querySelectorAll('.case-tab');
const panels = document.querySelectorAll('.case-panel');

tabs.forEach((tab) => tab.addEventListener('click', () => {
  tabs.forEach((item) => {
    const active = item === tab;
    item.classList.toggle('active', active);
    item.setAttribute('aria-selected', String(active));
  });
  panels.forEach((panel) => {
    const active = panel.id === tab.dataset.case;
    panel.hidden = !active;
    panel.classList.toggle('active', active);
  });
}));

const skillDescriptions = {
  listening: ['LISTENING', 'Starting from an everyday frustration and turning it into an opportunity worth exploring.'],
  validation: ['VALIDATION', 'Listening to workers and restaurant owners to challenge assumptions and validate the concept.'],
  mvp: ['MVP', 'Transforming an idea into something tangible, testable and easier to understand.'],
  storytelling: ['STORYTELLING', 'Building a pitch capable of making the vision, value and business potential clear.'],
  courage: ['A PINCH OF COURAGE', 'Taking risks, embracing uncertainty and learning while building.'],
};

document.querySelectorAll('.skill-chip').forEach((chip) => chip.addEventListener('click', () => {
  document.querySelectorAll('.skill-chip').forEach((item) => item.classList.toggle('active', item === chip));
  const [title, description] = skillDescriptions[chip.dataset.skill];
  const detail = document.querySelector('.skill-detail');
  detail.innerHTML = `<b>${title}</b><p>${description}</p>`;
}));

const smartEatBox = document.querySelector('.smarteat-box');
const smartEatModal = document.querySelector('.smarteat-modal');
const smartEatClose = document.querySelector('.smarteat-close');
const smartEatBackdrop = document.querySelector('.smarteat-backdrop');

function openSmartEat() {
  smartEatBox.classList.add('opening');
  window.setTimeout(() => {
    smartEatModal.hidden = false;
    document.body.classList.add('modal-open');
    smartEatClose.focus();
    smartEatBox.classList.remove('opening');
  }, 360);
}

function closeSmartEat() {
  smartEatModal.hidden = true;
  document.body.classList.remove('modal-open');
  smartEatBox.focus();
}

smartEatBox.addEventListener('click', openSmartEat);
smartEatClose.addEventListener('click', closeSmartEat);
smartEatBackdrop.addEventListener('click', closeSmartEat);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !smartEatModal.hidden) closeSmartEat();
});

const proproBox = document.querySelector('.propro-box');
const proproModal = document.querySelector('.propro-modal');
const proproClose = document.querySelector('.propro-close');
const proproBackdrop = document.querySelector('.propro-backdrop');

function openPropro() {
  proproBox.classList.add('opening');
  window.setTimeout(() => {
    proproModal.hidden = false;
    document.body.classList.add('modal-open');
    proproClose.focus();
    proproBox.classList.remove('opening');
  }, 360);
}

function closePropro() {
  proproModal.hidden = true;
  document.body.classList.remove('modal-open');
  proproBox.focus();
}

proproBox.addEventListener('click', openPropro);
proproClose.addEventListener('click', closePropro);
proproBackdrop.addEventListener('click', closePropro);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !proproModal.hidden) closePropro();
});

const workspaceGallery = document.querySelector('.propro-gallery');
const workspaceSlides = [...workspaceGallery.querySelectorAll('.workspace-slide')];
const workspaceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let workspaceIndex = 0;
let workspacePaused = workspaceMotion.matches;
let workspaceVisible = false;
let workspaceTimer;

function showWorkspace(index) {
  workspaceIndex = (index + workspaceSlides.length) % workspaceSlides.length;
  workspaceSlides.forEach((slide, i) => {
    slide.classList.toggle('is-active', i === workspaceIndex);
    slide.setAttribute('aria-hidden', String(i !== workspaceIndex));
  });
  workspaceGallery.querySelector('.workspace-count').textContent = `${String(workspaceIndex + 1).padStart(2, '0')} / ${String(workspaceSlides.length).padStart(2, '0')}`;
}
function scheduleWorkspace() {
  clearInterval(workspaceTimer);
  if (!workspacePaused && workspaceVisible && !document.hidden && !proproModal.hidden) {
    workspaceTimer = setInterval(() => showWorkspace(workspaceIndex + 1), 5500);
  }
}
workspaceGallery.querySelectorAll('[data-workspace]').forEach((button) => {
  button.addEventListener('click', () => {
    showWorkspace(workspaceIndex + (button.dataset.workspace === 'next' ? 1 : -1));
    scheduleWorkspace();
  });
});
new IntersectionObserver(([entry]) => {
  workspaceVisible = entry.isIntersecting;
  scheduleWorkspace();
}, { root: document.querySelector('.propro-sheet'), threshold: 0.2 }).observe(workspaceGallery);
new MutationObserver(scheduleWorkspace).observe(proproModal, { attributes:true, attributeFilter:['hidden'] });
document.addEventListener('visibilitychange', scheduleWorkspace);
workspaceMotion.addEventListener('change', (event) => { workspacePaused = event.matches; scheduleWorkspace(); });
scheduleWorkspace();

const sandwichBuilder = document.querySelector('.sandwich-builder');
const buildButtons = document.querySelectorAll('[data-build-stage]');

function setBuildStage(stage) {
  const nextStage = Math.max(1, Math.min(4, Number(stage)));
  sandwichBuilder.dataset.stage = String(nextStage);
  buildButtons.forEach((button) => {
    const reached = Number(button.dataset.buildStage) <= nextStage;
    button.classList.toggle('active', reached);
    button.setAttribute('aria-pressed', String(Number(button.dataset.buildStage) === nextStage));
  });
  document.querySelectorAll('.layer-menu a').forEach((link, index) => link.classList.toggle('is-building', index + 1 === nextStage));
}

sandwichBuilder.addEventListener('pointermove', (event) => {
  if (event.pointerType === 'touch') return;
  if (event.target.closest('.builder-progress')) return;
  const bounds = sandwichBuilder.getBoundingClientRect();
  const progress = (event.clientX - bounds.left) / bounds.width;
  setBuildStage(Math.floor(progress * 4) + 1);
});

sandwichBuilder.addEventListener('keydown', (event) => {
  if (['ArrowRight','ArrowUp','ArrowLeft','ArrowDown'].includes(event.key)) event.preventDefault();
  const current = Number(sandwichBuilder.dataset.stage);
  if (event.key === 'ArrowRight' || event.key === 'ArrowUp') setBuildStage(current + 1);
  if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') setBuildStage(current - 1);
});

buildButtons.forEach((button) => button.addEventListener('click', () => setBuildStage(button.dataset.buildStage)));
setBuildStage(sandwichBuilder.dataset.stage);
document.addEventListener('keydown', event => {
  if (event.key !== 'Tab') return;
  const modal = !smartEatModal.hidden ? smartEatModal : !proproModal.hidden ? proproModal : null;
  if (!modal) return;
  const controls = [...modal.querySelectorAll('button, a[href], [tabindex="0"]')].filter(el => el.getClientRects().length && !el.disabled);
  const first = controls[0], last = controls[controls.length - 1];
  if (!modal.contains(document.activeElement) || (event.shiftKey && document.activeElement === first)) {
    event.preventDefault(); (event.shiftKey ? last : first).focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault(); first.focus();
  }
});
document.querySelectorAll('.skill-chip').forEach(chip => chip.setAttribute('aria-pressed',String(chip.classList.contains('active'))));
document.querySelectorAll('.skill-chip').forEach(chip => chip.addEventListener('click', () => {
  document.querySelectorAll('.skill-chip').forEach(item => item.setAttribute('aria-pressed',String(item === chip)));
}));
// Serve the espresso once its own space enters the viewport.
(() => {
  const serving = document.querySelector('.coffee-serving');
  if (!serving || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const picture = serving.querySelector('img');
  serving.classList.add('is-waiting');
  picture.decode().then(() => {
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      serving.classList.remove('is-waiting');
      serving.classList.add('is-served');
      observer.disconnect();
    }, {threshold:.2});
    observer.observe(serving.parentElement);
  }).catch(() => serving.classList.remove('is-waiting'));
})();
