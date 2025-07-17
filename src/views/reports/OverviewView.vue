<template>
  <div class="overview-reports">
    <h2 class="section-title">Przegląd Statystyk</h2>
    <p class="section-description">
      Ogólny przegląd aktywności i statystyk Twoich wiosek.
    </p>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon villages">
          <i class="i-lucide-map-pin"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-number">12</h3>
          <p class="stat-label">Aktywne wioski</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon attacks">
          <i class="i-lucide-sword"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-number">147</h3>
          <p class="stat-label">Ataki w tym tygodniu</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon resources">
          <i class="i-lucide-coins"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-number">2.3M</h3>
          <p class="stat-label">Zebrane zasoby</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon buildings">
          <i class="i-lucide-hammer"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-number">23</h3>
          <p class="stat-label">Ukończone budynki</p>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="activity-section">
      <h3 class="activity-title">Ostatnia Aktywność</h3>

      <div class="activity-list">
        <div class="activity-item">
          <div class="activity-icon success">
            <i class="i-lucide-check"></i>
          </div>
          <div class="activity-content">
            <h4>Budowa ukończona</h4>
            <p>Koszary poziom 15 w wiosce "Wioska Główna"</p>
            <span class="activity-time">2 minuty temu</span>
          </div>
        </div>

        <div class="activity-item">
          <div class="activity-icon warning">
            <i class="i-lucide-alert-triangle"></i>
          </div>
          <div class="activity-content">
            <h4>Atak nadchodzący</h4>
            <p>Wioska "Północna Застава" zostanie zaatakowana za 47 minut</p>
            <span class="activity-time">15 minut temu</span>
          </div>
        </div>

        <div class="activity-item">
          <div class="activity-icon info">
            <i class="i-lucide-info"></i>
          </div>
          <div class="activity-content">
            <h4>Zasoby zebrane</h4>
            <p>Auto-zbieracz zebrał 12,450 drewna z tartak</p>
            <span class="activity-time">1 godzina temu</span>
          </div>
        </div>

        <div class="activity-item">
          <div class="activity-icon success">
            <i class="i-lucide-shield"></i>
          </div>
          <div class="activity-content">
            <h4>Atak odparty</h4>
            <p>Pomyślnie obroniłeś wioskę "Wschodnia Strażnica"</p>
            <span class="activity-time">3 godziny temu</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="actions-section">
      <h3 class="actions-title">Szybkie Akcje</h3>

      <div class="actions-grid">
        <button class="action-btn">
          <i class="i-lucide-refresh-cw"></i>
          <span>Odśwież wszystkie wioski</span>
        </button>

        <button class="action-btn">
          <i class="i-lucide-download"></i>
          <span>Eksportuj raporty</span>
        </button>

        <button class="action-btn">
          <i class="i-lucide-settings"></i>
          <span>Konfiguruj auto-funkcje</span>
        </button>

        <button class="action-btn">
          <i class="i-lucide-bell"></i>
          <span>Ustaw powiadomienia</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overview-reports {
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: box-shadow 0.2s;
}

.stat-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.stat-icon.villages {
  background: #3b82f6;
}

.stat-icon.attacks {
  background: #ef4444;
}

.stat-icon.resources {
  background: #10b981;
}

.stat-icon.buildings {
  background: #f59e0b;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.stat-label {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
}

.activity-section,
.actions-section {
  margin-bottom: 3rem;
}

.activity-title,
.actions-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1.5rem;
}

.activity-list {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
  color: white;
  flex-shrink: 0;
}

.activity-icon.success {
  background: #10b981;
}

.activity-icon.warning {
  background: #f59e0b;
}

.activity-icon.info {
  background: #3b82f6;
}

.activity-content h4 {
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.activity-content p {
  color: #6b7280;
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
}

.activity-time {
  color: #9ca3af;
  font-size: 0.75rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.action-btn {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.action-btn:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  transform: translateY(-1px);
}

.action-btn i {
  font-size: 1.125rem;
  color: #6b7280;
}
</style>
