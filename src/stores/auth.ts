import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuth, useUser } from '@clerk/vue'
import { BACKEND_URL } from '@/composables/backendUrl'

export interface UserProfile {
    id: number
    clerkUserId: string
    email: string
    gameNick?: string
    gameServer?: string
    createdAt: string
    updatedAt: string
}

export interface UpdateProfileData {
    gameNick?: string
    gamePassword?: string
    gameServer?: string
}

export const useAuthStore = defineStore('auth', () => {
    const { isSignedIn, getToken, signOut } = useAuth()
    const { user } = useUser()

    const userProfile = ref<UserProfile | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)

    const isAuthenticated = computed(() => isSignedIn.value)
    const currentUser = computed(() => userProfile.value)

    async function verifyToken() {
        if (!isSignedIn.value) return false

        try {
            const token = await getToken.value()
            const response = await fetch(`${BACKEND_URL}/api/auth/verify`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            if (!response.ok) return false

            const result = await response.json()
            return result.valid
        } catch (err) {
            console.error('Token verification failed:', err)
            return false
        }
    }

    async function logout() {
        try {
            await signOut.value()
            userProfile.value = null
            error.value = null
        } catch (err) {
            console.error('Logout failed:', err)
            error.value = 'Logout failed'
        }
    }

    // Initialize profile when user signs in
    async function initialize() {
        console.log('Auth store initialize called')
        console.log('isSignedIn:', isSignedIn.value)
        console.log('user:', user.value)
    }

    async function fetchUserProfile() {
        if (!isSignedIn.value) return null
        try {
            const token = await getToken.value()
            const response = await fetch(`${BACKEND_URL}/api/auth/profile`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })
            if (!response.ok) return null
            const result = await response.json()
            return result
        } catch (err) {
            console.error('Fetching user profile failed:', err)
            return null
        }
    }

    return {
        // State
        userProfile,
        loading,
        error,

        // Getters
        isAuthenticated,
        currentUser,

        // Actions
        verifyToken,
        logout,
        initialize,
        fetchUserProfile,
    }
}) 