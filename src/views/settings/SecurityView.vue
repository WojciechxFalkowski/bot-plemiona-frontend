<template>
  <div class="security-settings">
    <h2 class="section-title">Ustawienia Bezpieczeństwa</h2>
    <p class="section-description">
      Zarządzaj ustawieniami bezpieczeństwa swojego konta.
    </p>

    <div class="settings-grid">
      <div class="setting-card">
        <h3 class="card-title">Zmiana hasła</h3>
        <p class="card-description">Zaktualizuj swoje hasło dla lepszego bezpieczeństwa.</p>

        <div class="form-group">
          <label for="current-password">Aktualne hasło</label>
          <input
            id="current-password"
            type="password"
            placeholder="Wprowadź aktualne hasło"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="new-password">Nowe hasło</label>
          <input
            id="new-password"
            type="password"
            placeholder="Wprowadź nowe hasło"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="confirm-password">Potwierdź nowe hasło</label>
          <input
            id="confirm-password"
            type="password"
            placeholder="Powtórz nowe hasło"
            class="form-input"
          />
        </div>

        <button class="btn-primary">Zmień hasło</button>
      </div>

      <div class="setting-card">
        <h3 class="card-title">Uwierzytelnianie dwuskładnikowe</h3>
        <p class="card-description">Dodaj dodatkową warstwę bezpieczeństwa do swojego konta.</p>

        <div class="security-option">
          <div class="option-info">
            <h4>SMS</h4>
            <p>Otrzymuj kody weryfikacyjne przez SMS</p>
          </div>
          <button class="btn-secondary">Skonfiguruj</button>
        </div>

        <div class="security-option">
          <div class="option-info">
            <h4>Aplikacja uwierzytelniająca</h4>
            <p>Użyj aplikacji jak Google Authenticator</p>
          </div>
          <button class="btn-secondary">Skonfiguruj</button>
        </div>
      </div>

      <div class="setting-card">
        <h3 class="card-title">Sesje aktywne</h3>
        <p class="card-description">Zarządzaj urządzeniami zalogowanymi na Twoje konto.</p>

        <div class="session-item">
          <div class="session-info">
            <h4>Aktualna sesja</h4>
            <p>Windows • Chrome • Warszawa, Polska</p>
            <span class="session-time">Aktywna teraz</span>
          </div>
          <span class="current-badge">Aktualna</span>
        </div>

        <button class="btn-danger">Wyloguj wszystkie inne urządzenia</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.security-settings {
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
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-danger {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  width: 100%;
}

.btn-danger:hover {
  background: #dc2626;
}

.security-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.security-option:last-child {
  border-bottom: none;
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

.session-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 1rem;
}

.session-info h4 {
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.session-info p {
  color: #6b7280;
  font-size: 0.875rem;
}

.session-time {
  color: #059669;
  font-size: 0.75rem;
  font-weight: 500;
}

.current-badge {
  background: #d1fae5;
  color: #059669;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}
</style>
