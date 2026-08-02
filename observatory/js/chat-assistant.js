/**
 * ChatAssistant — Mockup in-app assistant for RuView Observatory
 *
 * Not a real LLM/backend — a small client-side keyword matcher that maps
 * chat commands to real DOM/state actions already exposed by the rest of
 * the app (toggle an ESP32 node, pause the feed, switch scenario, open a
 * panel...). Intentionally "action-first": every recognized command does
 * something visible rather than just returning text.
 */

const SCENARIO_KEYWORDS = {
  fall_event:       ['fall', 'ล้ม'],
  intrusion_detect: ['intrusion', 'บุกรุก'],
  sleep_monitoring: ['sleep', 'apnea', 'นอนหลับ'],
  empty_room:       ['empty room', 'ห้องว่าง'],
  two_walking:      ['multi-person', 'multi person', 'หลายคน', 'walking'],
  single_breathing: ['breathing', 'vital signs', 'หายใจ'],
  gesture_control:  ['gesture', 'ท่าทาง'],
  crowd_occupancy:  ['crowd', 'ฝูงชน'],
  search_rescue:    ['rescue', 'กู้ภัย'],
  elderly_care:     ['elderly', 'ผู้สูงอายุ'],
  fitness_tracking: ['fitness', 'ออกกำลังกาย'],
  security_patrol:  ['patrol', 'ลาดตระเวน'],
};

const HELP_TEXT =
  `ฉันสามารถควบคุมหน้าจอนี้ได้จริงๆ ลองพิมพ์ เช่น:\n` +
  `• "ปิด ESP32-C6" / "turn off esp32-s3"\n` +
  `• "เปิดทุกอุปกรณ์" / "turn on all devices"\n` +
  `• "pause" / "resume"\n` +
  `• "show vitals" / "show alerts" / "show devices"\n` +
  `• "reset camera"\n` +
  `• "change scenario to fall" / "เปลี่ยนเป็น intrusion"`;

export class ChatAssistant {
  constructor(observatory, hud) {
    this._obs = observatory;
    this._hud = hud;
    this._greeted = false;

    this._messagesEl = document.getElementById('chat-messages');
    this._formEl = document.getElementById('chat-form');
    this._inputEl = document.getElementById('chat-input');
    this._quickActionsEl = document.getElementById('chat-quick-actions');
    if (!this._messagesEl || !this._formEl || !this._inputEl) return;

    this._renderQuickActions();
    this._bindEvents();
  }

  /** Called by HudController the first time the chat panel is opened. */
  onOpen() {
    if (this._greeted) return;
    this._greeted = true;
    this._addMessage(
      'สวัสดีค่ะ 👋 ฉันคือ RuView Assistant ช่วยควบคุมระบบและตอบคำถามได้ ' +
      'ลองพิมพ์ "ปิด ESP32-C6" หรือกดปุ่มลัดด้านล่างได้เลยค่ะ',
      'bot',
    );
  }

  _bindEvents() {
    this._formEl.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = this._inputEl.value.trim();
      if (!text) return;
      this._inputEl.value = '';
      this._handleUserMessage(text);
    });

    document.getElementById('chat-close')?.addEventListener('click', () => {
      document.getElementById('nav-chat')?.click();
    });
  }

  _renderQuickActions() {
    if (!this._quickActionsEl) return;
    const actions = ['Turn off ESP32-C6', 'Show vitals', 'Pause feed', 'Reset camera'];
    this._quickActionsEl.innerHTML = actions
      .map((a) => `<button type="button" class="chat-quick-btn">${a}</button>`)
      .join('');
    this._quickActionsEl.querySelectorAll('.chat-quick-btn').forEach((btn) => {
      btn.addEventListener('click', () => this._handleUserMessage(btn.textContent));
    });
  }

  _handleUserMessage(text) {
    this._addMessage(text, 'user');
    this._showTyping();
    const delay = 450 + Math.random() * 350;
    setTimeout(() => {
      this._hideTyping();
      const { text: reply, kind } = this._interpret(text);
      this._addMessage(reply, kind);
    }, delay);
  }

  // ============================================================
  // Command interpretation (mock intent matching, no real NLP)
  // ============================================================

  _interpret(raw) {
    const lower = raw.trim().toLowerCase();
    if (!lower) return { text: 'พิมพ์คำสั่งมาได้เลยค่ะ', kind: 'bot' };

    const wantsOff = /(turn off|switch off|disable|shut down|power off|ปิด)/.test(lower);
    const wantsOn = !wantsOff && /(turn on|switch on|enable|power on|เปิด)/.test(lower);

    if (wantsOff || wantsOn) {
      if (/\ball\b|ทั้งหมด|ทุกตัว/.test(lower)) {
        document.querySelectorAll('#panel-esp32 .device-row').forEach((row) => this._setDevicePower(row, wantsOn));
        this._openPanel('nav-devices', 'panel-esp32');
        return { text: `${wantsOn ? '🟢 Turned on' : '🔴 Turned off'} all ESP32 nodes.`, kind: 'action' };
      }
      const row = this._matchDeviceRow(lower);
      if (row) {
        this._setDevicePower(row, wantsOn);
        this._openPanel('nav-devices', 'panel-esp32');
        const name = row.dataset.deviceName || 'device';
        return { text: `${wantsOn ? '🟢 Turned on' : '🔴 Turned off'} ${name}.`, kind: 'action' };
      }
      return { text: 'บอกด้วยว่าอุปกรณ์ไหนคะ เช่น "ปิด ESP32-C6" หรือ "ปิดทั้งหมด"', kind: 'bot' };
    }

    if (/\bpause\b|หยุดข้อมูล|หยุดการทำงาน/.test(lower)) {
      this._setPaused(true);
      return { text: '⏸️ Data feed paused.', kind: 'action' };
    }
    if (/\bresume\b|เล่นต่อ|เริ่มต่อ/.test(lower)) {
      this._setPaused(false);
      return { text: '▶️ Data feed resumed.', kind: 'action' };
    }

    if (/reset camera|มุมกล้อง|รีเซ็ตกล้อง/.test(lower)) {
      document.getElementById('btn-reset-camera')?.click();
      return { text: '🎥 Camera view reset.', kind: 'action' };
    }

    if (/scenario|สถานการณ์|เปลี่ยนเป็น|switch to|change to/.test(lower)) {
      for (const [key, keywords] of Object.entries(SCENARIO_KEYWORDS)) {
        if (keywords.some((k) => lower.includes(k))) {
          this._obs._demoData.setScenario(key);
          const sel = document.getElementById('scenario-quick-select');
          if (sel) sel.value = key;
          return { text: `🎬 Switched scenario to "${this._hud._labelize(key)}".`, kind: 'action' };
        }
      }
    }

    if (/vital|signal|ชีพจร|สัญญาณชีพ/.test(lower)) {
      this._openPanel('nav-vitals', 'vital-signal-group');
      return { text: '📊 Opened Vital Signs & WiFi Signal panel.', kind: 'action' };
    }
    if (/device|esp32|node|อุปกรณ์/.test(lower)) {
      this._openPanel('nav-devices', 'panel-esp32');
      return { text: '📡 Opened ESP32 device panel.', kind: 'action' };
    }
    if (/alert|history|event|ประวัติ|เหตุการณ์/.test(lower)) {
      this._openPanel('nav-noti', 'panel-noti');
      return { text: '🔔 Opened event history.', kind: 'action' };
    }

    if (/help|ช่วยเหลือ|คำสั่ง|what can you do/.test(lower)) {
      return { text: HELP_TEXT, kind: 'bot' };
    }

    return {
      text: `ขอโทษค่ะ ไม่แน่ใจคำสั่งนี้ 🤔 พิมพ์ "help" เพื่อดูตัวอย่างคำสั่งที่ฉันทำได้ค่ะ`,
      kind: 'bot',
    };
  }

  _matchDeviceRow(lower) {
    const rows = document.querySelectorAll('#panel-esp32 .device-row');
    for (const row of rows) {
      const key = row.dataset.device;
      const aliases = key === 's3'
        ? ['s3', 'node 1', 'node1', 'esp32-s3']
        : ['c6', 'node 2', 'node2', 'esp32-c6'];
      if (aliases.some((a) => lower.includes(a))) return row;
    }
    return null;
  }

  _setDevicePower(row, on) {
    const checkbox = row.querySelector('.mini-toggle input');
    if (checkbox) {
      checkbox.checked = on;
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    }
    const statusEl = row.querySelector('.device-status');
    if (!statusEl) return;
    if (on) {
      const restoreClass = row.dataset.originalStatusClass || 'device-status--online';
      const restoreText = row.dataset.originalStatusText || 'Online';
      statusEl.className = `device-status ${restoreClass}`;
      statusEl.innerHTML = `<span class="status-dot"></span>${restoreText}`;
    } else {
      if (!row.dataset.originalStatusClass) {
        const cls = [...statusEl.classList].find((c) => c.startsWith('device-status--'));
        row.dataset.originalStatusClass = cls || 'device-status--online';
        row.dataset.originalStatusText = statusEl.textContent.trim();
      }
      statusEl.className = 'device-status device-status--offline';
      statusEl.innerHTML = `<span class="status-dot"></span>Offline`;
    }
  }

  _setPaused(paused) {
    this._obs._demoData.paused = paused;
    const cta = document.getElementById('header-cta');
    if (cta) cta.textContent = paused ? 'Resume' : 'Pause';
  }

  _openPanel(navId, panelId) {
    const btn = document.getElementById(navId);
    const panel = document.getElementById(panelId);
    if (!panel) return;
    panel.classList.add('overlay-open');
    btn?.classList.add('active');
  }

  // ============================================================
  // Message rendering
  // ============================================================

  _addMessage(text, role) {
    const el = document.createElement('div');
    el.className = `chat-msg chat-msg--${role}`;
    el.textContent = text;
    this._messagesEl.appendChild(el);
    this._messagesEl.scrollTop = this._messagesEl.scrollHeight;
  }

  _showTyping() {
    const el = document.createElement('div');
    el.id = 'chat-typing';
    el.className = 'chat-msg chat-msg--bot chat-msg--typing';
    el.innerHTML = '<span></span><span></span><span></span>';
    this._messagesEl.appendChild(el);
    this._messagesEl.scrollTop = this._messagesEl.scrollHeight;
  }

  _hideTyping() {
    document.getElementById('chat-typing')?.remove();
  }
}
