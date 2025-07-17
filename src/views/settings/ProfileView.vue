<template>
  <div class="profile-settings">
    <h2 class="section-title">Ustawienia Profilu</h2>
    <p class="section-description">
      Zarządzaj swoimi danymi osobowymi i ustawieniami konta.
    </p>

    <div class="settings-grid">
      <div class="setting-card">
        <h3 class="card-title">Informacje podstawowe</h3>
        <p class="card-description">Aktualizuj swoje podstawowe dane osobowe.</p>

        <div class="form-group">
          <label for="username">Nazwa użytkownika</label>
          <input
            id="username"
            type="text"
            placeholder="Wprowadź nazwę użytkownika"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="email">Adres email</label>
          <input
            id="email"
            type="email"
            placeholder="example@domain.com"
            class="form-input"
          />
        </div>

        <button class="btn-primary">Zapisz zmiany</button>
      </div>

      <div class="setting-card">
        <h3 class="card-title">Preferencje</h3>
        <p class="card-description">Dostosuj sposób działania aplikacji.</p>

        <div class="form-group">
          <label for="language">Język</label>
          <select id="language" class="form-select">
            <option value="pl">Polski</option>
            <option value="en">English</option>
          </select>
        </div>

        <div class="form-group">
          <label for="timezone">Strefa czasowa</label>
          <select id="timezone" class="form-select">
            <option value="Europe/Warsaw">Europa/Warszawa</option>
            <option value="UTC">UTC</option>
          </select>
        </div>

        <button class="btn-primary">Zapisz preferencje</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Component logic here
</script>

<style scoped>
.profile-settings {
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

.form-input,
.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-select:focus {
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
</style>
