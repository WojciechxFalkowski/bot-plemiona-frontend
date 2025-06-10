<template>
    <div class="callback-container">
        <div class="callback-card">
            <div class="loading-content">
                <div class="spinner"></div>
                <h2>Finalizowanie logowania...</h2>
                <p>Proszę czekać, przekierowujemy Cię do panelu.</p>
            </div>

            <div v-if="error" class="error-content">
                <div class="error-icon">⚠️</div>
                <h3>Wystąpił błąd podczas logowania</h3>
                <p>{{ error }}</p>
                <button @click="retryLogin" class="retry-btn">
                    Spróbuj ponownie
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth, useUser } from '@clerk/vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const { isSignedIn } = useAuth()
const { user } = useUser()
const authStore = useAuthStore()

const error = ref<string | null>(null)
const retryAttempts = ref(0)
const maxRetries = 3

async function handleCallback() {
    console.log("handleCallback");
    
    try {
        console.log('Starting callback handling...')
        console.log('isSignedIn:', isSignedIn.value)
        console.log('user:', user.value)

        // Wait longer for Clerk to process the callback
        await new Promise(resolve => setTimeout(resolve, 2000))

        console.log('After waiting, isSignedIn:', isSignedIn.value)
        console.log('After waiting, user:', user.value)

        // Check both isSignedIn and user object
        if (isSignedIn.value || user.value) {
            console.log('User is signed in, initializing...')

            try {
                // Initialize user profile
                await authStore.initialize()
                console.log('Store initialized successfully')

                // Get redirect URL from query params
                const redirectUrl = route.query.redirect_url as string
                const decodedUrl = redirectUrl ? decodeURIComponent(redirectUrl) : '/dashboard'

                console.log('Redirect URL:', redirectUrl)
                console.log('Decoded URL:', decodedUrl)

                // Extract the path from the full URL if needed
                let targetPath = '/dashboard'
                if (decodedUrl) {
                    try {
                        const url = new URL(decodedUrl)
                        targetPath = url.pathname
                    } catch {
                        // If not a valid URL, treat as path
                        targetPath = decodedUrl.startsWith('/') ? decodedUrl : '/dashboard'
                    }
                }

                console.log('Target path:', targetPath)

                // Redirect to target page
                await router.push(targetPath)
            } catch (initError) {
                console.error('Initialization error:', initError)
                // Continue to dashboard even if backend is not available
                console.log('Continuing to dashboard despite backend error...')
                await router.push('/dashboard')
            }
        } else {
            console.log('User not signed in, retry attempt:', retryAttempts.value)
            // If not signed in after callback, retry
            if (retryAttempts.value < maxRetries) {
                retryAttempts.value++
                setTimeout(handleCallback, 2000)
            } else {
                console.log('Max retries reached, forcing redirect to dashboard...')
                // Force redirect to dashboard - let the dashboard handle auth state
                await router.push('/dashboard')
            }
        }
    } catch (err) {
        console.error('SSO Callback error:', err)
        error.value = `Błąd: ${err instanceof Error ? err.message : 'Nieznany błąd'}`
    }
}

function retryLogin() {
    error.value = null
    retryAttempts.value = 0
    router.push('/sign-in')
}

onMounted(() => {
    handleCallback()
})
</script>

<style scoped>
.callback-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 1rem;
}

.callback-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    overflow: hidden;
    width: 100%;
    max-width: 400px;
    text-align: center;
}

.loading-content {
    padding: 3rem 2rem;
}

.spinner {
    width: 48px;
    height: 48px;
    border: 4px solid #e5e7eb;
    border-top: 4px solid #2563eb;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 2rem;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.loading-content h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 1rem;
}

.loading-content p {
    color: #6b7280;
    margin: 0;
    font-size: 0.875rem;
}

.error-content {
    padding: 3rem 2rem;
}

.error-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.error-content h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #dc2626;
    margin: 0 0 1rem;
}

.error-content p {
    color: #6b7280;
    margin: 0 0 2rem;
    font-size: 0.875rem;
}

.retry-btn {
    background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.retry-btn:hover {
    background: linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
}

/* Responsive design */
@media (max-width: 480px) {
    .callback-container {
        padding: 0.5rem;
    }

    .callback-card {
        border-radius: 8px;
    }

    .loading-content,
    .error-content {
        padding: 2rem 1.5rem;
    }
}
</style>