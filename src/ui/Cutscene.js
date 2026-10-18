// Story Cutscenes, Title Screen, Class Select & Game Over Engine
import { Lang } from '../systems/Lang.js';

export class CutsceneManager {
  constructor(game) {
    this.game = game;
    this.container = null;
  }

  init(container) {
    this.container = container;
  }

  // --- 1. TITLE & CLASS SELECT SCREEN ---
  renderTitleScreen(onStart) {
    this.container.innerHTML = `
      <div class="title-screen-overlay">
        <!-- Floating Cyber Sparks Background -->
        <div class="title-logo-container">
          <h1 class="game-main-title">CHRONO CHASM</h1>
          <div class="game-main-subtitle">${Lang.t('game_subtitle')}</div>
        </div>

        <div class="class-selection-container">
          <h2 class="section-heading">${Lang.t('select_hero')}</h2>
          <div class="class-cards-grid">
            <!-- Knight -->
            <div class="class-card selected" data-class="knight">
              <div class="class-avatar-preview knight-preview"></div>
              <h3 class="class-title">${Lang.t('class_knight')}</h3>
              <p class="class-desc">${Lang.t('class_knight_desc')}</p>
              <div class="class-role-badge">TUGANMAS CHIDAMLILIK</div>
            </div>
            <!-- Mage -->
            <div class="class-card" data-class="mage">
              <div class="class-avatar-preview mage-preview"></div>
              <h3 class="class-title">${Lang.t('class_mage')}</h3>
              <p class="class-desc">${Lang.t('class_mage_desc')}</p>
              <div class="class-role-badge">MAYDONIY SEHR</div>
            </div>
            <!-- Rogue -->
            <div class="class-card" data-class="rogue">
              <div class="class-avatar-preview rogue-preview"></div>
              <h3 class="class-title">${Lang.t('class_rogue')}</h3>
              <p class="class-desc">${Lang.t('class_rogue_desc')}</p>
              <div class="class-role-badge">KRITIK ZARBA</div>
            </div>
            <!-- Chronomancer -->
            <div class="class-card" data-class="chronomancer">
              <div class="class-avatar-preview chronomancer-preview"></div>
              <h3 class="class-title">${Lang.t('class_chronomancer')}</h3>
              <p class="class-desc">${Lang.t('class_chronomancer_desc')}</p>
              <div class="class-role-badge">VAQT HOKIMI</div>
            </div>
          </div>
        </div>

        <div class="title-controls-bar">
          <button id="btn-start-game" class="title-play-btn">⚔️ ${Lang.t('start_adventure')} ⚔️</button>
        </div>

        <div class="controls-cheat-sheet">
          <span>⌨️ <b>Harakat:</b> WASD / Arrows</span> |
          <span>⚔️ <b>Hujum:</b> Sichqoncha / J</span> |
          <span>⚡ <b>Dash:</b> Space</span> |
          <span>🌀 <b>Qobiliyatlar:</b> 1-4</span> |
          <span>🎒 <b>Inventar:</b> I</span>
        </div>
      </div>
    `;

    let selectedClass = 'knight';
    const cards = document.querySelectorAll('.class-card');
    cards.forEach(card => {
      card.onclick = () => {
        cards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedClass = card.getAttribute('data-class');
        this.game.audio.playSfx('click');
      };
    });

    const startBtn = document.getElementById('btn-start-game');
    if (startBtn) {
      startBtn.onclick = () => {
        this.game.audio.playSfx('levelup');
        this.container.innerHTML = '';
        this.renderPrologue(() => {
          onStart(selectedClass);
        });
      };
    }
  }

  // --- 2. PROLOGUE STORY CUTSCENE ---
  renderPrologue(onFinish) {
    const paragraphs = [
      Lang.t('prologue_1'),
      Lang.t('prologue_2'),
      Lang.t('prologue_3'),
      Lang.t('prologue_4')
    ];

    let currentPara = 0;
    this.container.innerHTML = `
      <div class="prologue-overlay">
        <div class="prologue-content-box">
          <h2 class="prologue-header">${Lang.t('prologue_title')}</h2>
          <div id="prologue-text-body" class="prologue-text-body"></div>
          <div class="prologue-actions">
            <button id="btn-prologue-skip" class="prologue-skip-btn">${Lang.t('skip_prologue')}</button>
          </div>
        </div>
      </div>
    `;

    const bodyEl = document.getElementById('prologue-text-body');
    const showNext = () => {
      if (currentPara < paragraphs.length) {
        bodyEl.innerHTML = `<p class="fade-in-text">${paragraphs[currentPara]}</p>`;
        this.game.audio.playSfx('dialogue_beep');
        currentPara++;
      } else {
        this.container.innerHTML = '';
        onFinish();
      }
    };

    showNext();
    const interval = setInterval(showNext, 4000);

    const skipBtn = document.getElementById('btn-prologue-skip');
    if (skipBtn) {
      skipBtn.onclick = () => {
        clearInterval(interval);
        this.container.innerHTML = '';
        onFinish();
      };
    }
  }

  // --- 3. GAME OVER SCREEN ---
  renderGameOver(onRespawn) {
    this.container.innerHTML = `
      <div class="modal-overlay gameover-overlay">
        <div class="gameover-box">
          <h1 class="gameover-title">${Lang.t('game_over')}</h1>
          <p class="gameover-subtitle">${Lang.t('game_over_sub')}</p>
          <button id="btn-gameover-respawn" class="gameover-respawn-btn">
            💫 ${Lang.t('respawn_btn')} 💫
          </button>
        </div>
      </div>
    `;

    const respawnBtn = document.getElementById('btn-gameover-respawn');
    if (respawnBtn) {
      respawnBtn.onclick = () => {
        this.container.innerHTML = '';
        onRespawn();
      };
    }
  }

  // --- 4. REALM VICTORY / PORTAL TRANSITION ---
  renderRealmTransition(depth, onEnterNext) {
    this.container.innerHTML = `
      <div class="modal-overlay victory-overlay">
        <div class="victory-box">
          <h1 class="victory-title">🌌 ${Lang.t('boss_defeated')} 🌌</h1>
          <p class="victory-subtitle">Vaqt o'lchami eshigi ochildi!</p>
          <button id="btn-victory-next" class="victory-next-btn">
            ⚡ ${Lang.t('enter_next_dimension', depth + 1)} ⚡
          </button>
        </div>
      </div>
    `;

    const nextBtn = document.getElementById('btn-victory-next');
    if (nextBtn) {
      nextBtn.onclick = () => {
        this.container.innerHTML = '';
        onEnterNext();
      };
    }
  }
}
