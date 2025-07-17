<template>
  <div class="notifications-settings">
    <h2 class="section-title">Ustawienia Powiadomień</h2>
    <p class="section-description">
      Kontroluj, kiedy i jak otrzymujesz powiadomienia.
    </p>

    <div class="settings-grid">
      <div class="setting-card">
        <h3 class="card-title">Powiadomienia email</h3>
        <p class="card-description">Wybierz, które powiadomienia chcesz otrzymywać przez email.</p>

        <div class="notification-option">
          <div class="option-info">
            <h4>Ataki na wioski</h4>
            <p>Otrzymuj powiadomienia o atakach na Twoje wioski</p>
          </div>
          <label class="toggle">
            <input type="checkbox" checked>
            <span class="slider"></span>
          </label>
        </div>

        <div class="notification-option">
          <div class="option-info">
            <h4>Zakończenie budowy</h4>
            <p>Powiadomienia o ukończeniu budowy budynków</p>
          </div>
          <label class="toggle">
            <input type="checkbox">
            <span class="slider"></span>
          </label>
        </div>

        <div class="notification-option">
          <div class="option-info">
            <h4>Raporty tygodniowe</h4>
            <p>Cotygodniowe podsumowanie aktywności</p>
          </div>
          <label class="toggle">
            <input type="checkbox" checked>
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <div class="setting-card">
        <h3 class="card-title">Powiadomienia push</h3>
        <p class="card-description">Zarządzaj powiadomieniami push w przeglądarce.</p>

        <div class="notification-option">
          <div class="option-info">
            <h4>Ataki w czasie rzeczywistym</h4>
            <p>Natychmiastowe powiadomienia o atakach</p>
          </div>
          <label class="toggle">
            <input type="checkbox" checked>
            <span class="slider"></span>
          </label>
        </div>

        <div class="notification-option">
          <div class="option-info">
            <h4>Ostrzeżenia systemowe</h4>
            <p>Ważne komunikaty systemowe</p>
          </div>
          <label class="toggle">
            <input type="checkbox" checked>
            <span class="slider"></span>
          </label>
        </div>

        <button class="btn-primary">Przetestuj powiadomienia</button>
      </div>

      <div class="setting-card">
        <h3 class="card-title">Godziny ciszy</h3>
        <p class="card-description">Ustaw okresy, w których nie chcesz otrzymywać powiadomień.</p>

        <div class="time-range">
          <div class="form-group">
            <label for="quiet-start">Od godziny</label>
            <input
              id="quiet-start"
              type="time"
              value="22:00"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="quiet-end">Do godziny</label>
            <input
              id="quiet-end"
              type="time"
              value="08:00"
              class="form-input"
            />
          </div>
        </div>

        <div class="notification-option">
          <div class="option-info">
            <h4>Włącz godziny ciszy</h4>
            <p>Wyłącz powiadomienia w określonych godzinach</p>
          </div>
          <label class="toggle">
            <input type="checkbox" checked>
            <span class="slider"></span>
          </label>
        </div>

        <button class="btn-primary">Zapisz ustawienia</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notifications-settings {
  padding: 0;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.section-description {
  color: #6b7280;
  margin-bottom: 2rem;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.setting-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.card-description {
  color: #6b7280;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
}

.notification-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.notification-option:last-child {
  border-bottom: none;
  margin-bottom: 1rem;
}

.option-info h4 {
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.option-info p {
  color: #6b7280;
  font-size: 0.875rem;
}

.toggle {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #3b82f6;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.time-range {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  width: 100%;
}

.btn-primary:hover {
  background: #2563eb;
}
</style>
