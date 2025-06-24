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

    // Add form submission handler
    const form = document.getElementById('signup-form')
    if (form) {
        form.addEventListener('submit', handleSignUp)
    }
})

// Handle sign up
async function handleSignUp(event) {
    event.preventDefault()
    
    const fullName = document.getElementById('fullname').value
    const email = document.getElementById('email').value
    const phone = document.getElementById('phone').value
    const password = document.getElementById('password').value
    const confirmPassword = document.getElementById('confirm-password').value
    const userType = document.getElementById('user-type').value
    const errorDiv = document.getElementById('error-message')
    const successDiv = document.getElementById('success-message')
    
    errorDiv.style.display = 'none'
    successDiv.style.display = 'none'
    
    // Validate passwords match
    if (password !== confirmPassword) {
        errorDiv.textContent = 'Passwords do not match'
        errorDiv.style.display = 'block'
        return
    }
    
    // Validate password strength
    if (password.length < 8) {
        errorDiv.textContent = 'Password must be at least 8 characters long'
        errorDiv.style.display = 'block'
        return
    }
    
    const result = await auth.signUp(email, password, fullName, phone, userType)
    
    if (result?.error) {
        errorDiv.textContent = result.error
        errorDiv.style.display = 'block'
    }
}
