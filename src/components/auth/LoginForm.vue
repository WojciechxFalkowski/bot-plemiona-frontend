<template>
    <div class="login-container">
        <div class="login-card">
            <div class="login-header">
                <h2>Plemiona Bot</h2>
                <p>Zaloguj się, aby uzyskać dostęp do panelu administracyjnego</p>
            </div>

            <div class="clerk-auth-wrapper">
                <SignIn :routing="'path'" :path="'/sign-in'" :signUpUrl="'/sign-up'" :redirectUrl="redirectUrl"
                    :appearance="clerkAppearance" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { SignIn } from '@clerk/vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const redirectUrl = computed(() => {
    console.log("redirectUrl");
    
    const redirect = route.query.redirect as string
    return redirect || '/dashboard'
})

const clerkAppearance = {
    elements: {
        formButtonPrimary: 'clerk-btn-primary',
        card: 'clerk-card',
        headerTitle: 'clerk-header-title',
        headerSubtitle: 'clerk-header-subtitle',
    },
    variables: {
        colorPrimary: '#2563eb',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        borderRadius: '8px',
    },
}
</script>

<style scoped>
.login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 1rem;
}

.login-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    overflow: hidden;
    width: 100%;
    max-width: 600px;
}

.login-header {
    padding: 2rem 2rem 1rem;
    text-align: center;
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.login-header h2 {
    font-size: 1.875rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 0.5rem;
}

.login-header p {
    color: #6b7280;
    margin: 0;
    font-size: 0.875rem;
}

.clerk-auth-wrapper {
    padding: 1rem 2rem 2rem;
    display: flex;
    justify-content: center;
}

/* Custom Clerk styles */
:global(.clerk-btn-primary) {
    background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%) !important;
    border: none !important;
    border-radius: 8px !important;
    font-weight: 600 !important;
    padding: 0.75rem 1rem !important;
    transition: all 0.2s ease !important;
}

:global(.clerk-btn-primary:hover) {
    background: linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%) !important;
    transform: translateY(-1px) !important;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4) !important;
}

:global(.clerk-card) {
    box-shadow: none !important;
    border: none !important;
}

:global(.clerk-header-title) {
    display: none !important;
}

:global(.clerk-header-subtitle) {
    display: none !important;
}

/* Responsive design */
@media (max-width: 480px) {
    .login-container {
        padding: 0.5rem;
    }

    .login-card {
        border-radius: 8px;
    }

    .login-header {
        padding: 1.5rem 1.5rem 0.75rem;
    }

    .clerk-auth-wrapper {
        padding: 0.75rem 1.5rem 1.5rem;
    }
}
</style>