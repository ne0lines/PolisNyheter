import type { PoliceEvent } from '../models/PoliceEvent';
import { matchesBlockedWords } from '../services/eventFilters';

/** Build a small status badge element. Inputs: label text and optional class name. */
function makeAdminFlag(text: string, className: string): HTMLElement {
  const flag = document.createElement('span');
  flag.className = `admin-flag ${className}`.trim();
  flag.textContent = text;
  return flag;
}

/** Render the blocklist pills. Inputs: container element and blocked words set. */
export function renderBlocklist(blocklistEl: HTMLElement | null, blockedWords: Set<string>): void {
  if (!blocklistEl) return;
  blocklistEl.innerHTML = '';

  const words = Array.from(blockedWords).sort();
  if (!words.length) {
    const emptyItem = document.createElement('li');
    emptyItem.className = 'empty';
    emptyItem.textContent = 'No blocked words yet.';
    blocklistEl.appendChild(emptyItem);
    return;
  }

  words.forEach(word => {
    const li = document.createElement('li');
    li.dataset.word = word;
    const text = document.createElement('span');
    text.textContent = word;

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.textContent = 'Remove';
    removeButton.dataset.action = 'remove';

    li.appendChild(text);
    li.appendChild(removeButton);
    blocklistEl.appendChild(li);
  });
}

/** Render the admin event list. Inputs: list container, events, filters, and max count. */
export function renderAdminEventList(
  adminEventListEl: HTMLElement | null,
  events: PoliceEvent[],
  blockedWords: Set<string>,
  hiddenEventIds: Set<number>,
  limit: number
): void {
  if (!adminEventListEl) return;
  adminEventListEl.innerHTML = '';

  const displayEvents = events.slice(0, limit);
  if (displayEvents.length === 0) {
    const emptyItem = document.createElement('li');
    emptyItem.className = 'admin-event empty';
    emptyItem.textContent = 'No events loaded yet.';
    adminEventListEl.appendChild(emptyItem);
    return;
  }

  displayEvents.forEach(event => {
    const li = document.createElement('li');
    li.className = 'admin-event';
    li.dataset.id = String(event.id);

    const toggleWrap = document.createElement('div');
    toggleWrap.className = 'admin-event-toggle';

    const toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.className = 'admin-event-action';
    toggleButton.dataset.action = 'toggle-hidden';
    if (hiddenEventIds.has(event.id)) {
      toggleButton.classList.add('show');
      toggleButton.textContent = 'Show';
    } else {
      toggleButton.textContent = 'Hide';
    }

    toggleWrap.appendChild(toggleButton);

    const meta = document.createElement('div');
    meta.className = 'admin-event-meta';

    const title = document.createElement('div');
    title.className = 'admin-event-title';
    title.textContent = `${event.type} • ${event.location.name}`;

    const summary = document.createElement('div');
    summary.className = 'admin-event-summary';
    summary.textContent = event.summary;

    const time = document.createElement('time');
    time.className = 'admin-event-time';
    time.dateTime = event.datetime;
    time.textContent = event.datetime.replace('T', ' ');

    meta.appendChild(title);
    meta.appendChild(summary);
    meta.appendChild(time);

    const flags = document.createElement('div');
    flags.className = 'admin-event-flags';

    if (matchesBlockedWords(event, blockedWords)) {
      flags.appendChild(makeAdminFlag('Blocked', 'blocked'));
    }

    if (hiddenEventIds.has(event.id)) {
      flags.appendChild(makeAdminFlag('Hidden', 'hidden'));
    }

    if (!flags.childNodes.length) {
      flags.appendChild(makeAdminFlag('Visible', ''));
    }

    li.appendChild(toggleWrap);
    li.appendChild(meta);
    li.appendChild(flags);
    adminEventListEl.appendChild(li);
  });
}
