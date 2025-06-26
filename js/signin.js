import { auth } from './supabase.js'

// Check auth state on page load
window.addEventListener('load', async () => {
    const user = await auth.checkAuth()
    if (user) {
        // If already logged in, redirect to appropriate dashboard
        const userType = user.user_metadata.user_type
        if (userType === 'organizer') {
            window.location.href = '/dashboard/organizer.html'
        } else {
            window.location.href = '/dashboard/admin.html'
        }
    }
})

// Handle sign in
window.handleSignIn = async function(event) {
    event.preventDefault()
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    const errorDiv = document.getElementById('error-message')
    const successDiv = document.getElementById('success-message')
    errorDiv.style.display = 'none'
    successDiv.style.display = 'none'

    const result = await auth.signIn(email, password)
    if (result?.error) {
        errorDiv.textContent = result.error
        errorDiv.style.display = 'block'
        return
    }
    // Fetch user again to get metadata
    const user = await auth.checkAuth()
    if (user) {
        const userType = user.user_metadata.user_type
        if (userType === 'organizer') {
            window.location.href = '/dashboard/organizer.html'
        } else {
            window.location.href = '/dashboard/admin.html'
        }
    }
}

// Optional: handle forgot password
window.handleForgotPassword = function(event) {
    event.preventDefault()
    alert('Forgot password functionality coming soon!')
}
