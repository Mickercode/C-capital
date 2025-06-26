// Initialize Supabase client
const supabaseUrl = 'https://iyodfurtlgtunjybvfcz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5b2RmdXJ0bGd0dW5qeWJ2ZmN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0ODYyNzcsImV4cCI6MjA2NjA2MjI3N30.gsOPQCTBfBi8CFubb67-UF99tacrJJiL84--5aIfCqU'

// Initialize Supabase client using the global object
const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey)

// Check auth state
export async function checkAuth() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession()
        console.log('Current session:', session)
        
        if (error) {
            console.error('Error checking auth:', error.message)
            return null
        }
        
        if (session) {
            console.log('User is logged in:', session.user)
            // Update UI to show logged in state
            document.body.classList.add('authenticated')
            return session.user
        } else {
            console.log('No active session')
            document.body.classList.remove('authenticated')
            return null
        }
    } catch (error) {
        console.error('Error checking auth:', error.message)
        return null
    }
}

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session)
    
    if (event === 'SIGNED_IN') {
        console.log('User signed in:', session?.user)
    } else if (event === 'SIGNED_OUT') {
        console.log('User signed out')
    }
})

// Sign Up function
async function signUp(email, password, fullName, phone, userType) {
    try {
        console.log('Starting sign up process...')
        document.querySelector('button[type="submit"]').disabled = true
        document.querySelector('button[type="submit"]').innerHTML = `
            <span class="loading-spinner"></span>
            Creating Account...
        `

        const { data: { user }, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    phone: phone,
                    user_type: userType
                }
            }
        })

        if (error) {
            console.error('Sign up error:', error)
            throw error
        }

        console.log('Sign up successful:', user)
        
        if (user) {
            console.log('Redirecting to dashboard...')
            if (userType === 'organizer') {
                window.location.href = '/dashboard/organizer.html'
            } else {
                window.location.href = '/dashboard/admin.html'
            }
        }
    } catch (error) {
        console.error('Error signing up:', error.message)
        return { error: error.message }
    } finally {
        document.querySelector('button[type="submit"]').disabled = false
        document.querySelector('button[type="submit"]').textContent = 'Create Account'
    }
}

// Sign In function
async function signIn(email, password) {
    try {
        console.log('Starting sign in process...')
        document.querySelector('button[type="submit"]').disabled = true
        document.querySelector('button[type="submit"]').innerHTML = `
            <span class="loading-spinner"></span>
            Signing In...
        `

        const { data: { user }, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if (error) {
            console.error('Sign in error:', error)
            throw error
        }

        console.log('Sign in successful:', user)
        
        const userType = user.user_metadata.user_type
        console.log('User type:', userType)
        
        if (userType === 'organizer') {
            window.location.href = '/dashboard/organizer.html'
        } else {
            window.location.href = '/dashboard/admin.html'
        }
    } catch (error) {
        console.error('Error signing in:', error.message)
        return { error: error.message }
    } finally {
        document.querySelector('button[type="submit"]').disabled = false
        document.querySelector('button[type="submit"]').textContent = 'Sign In'
    }
}

// Sign Out function
async function signOut() {
    try {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        window.location.href = '/signin.html'
    } catch (error) {
        console.error('Error signing out:', error.message)
        return { error: error.message }
    }
}

// Password Reset function
async function resetPassword(email) {
    try {
        // Show loading state
        const forgotLink = document.querySelector('.forgot-link')
        forgotLink.style.pointerEvents = 'none'
        forgotLink.innerHTML = `
            <span class="loading-spinner"></span>
            Sending...
        `

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/reset-password.html'
        })
        if (error) throw error
        return { message: 'Password reset instructions sent to your email' }
    } catch (error) {
        console.error('Error resetting password:', error.message)
        return { error: error.message }
    } finally {
        // Reset link state
        const forgotLink = document.querySelector('.forgot-link')
        forgotLink.style.pointerEvents = 'auto'
        forgotLink.textContent = 'Forgot Password?'
    }
}

// Role-based protection function
export async function requireRole(requiredRole) {
    const user = await checkAuth();
    if (!user) {
        window.location.href = '/signin.html';
        return false;
    }
    const userType = user.user_metadata.user_type;
    if (userType !== requiredRole) {
        // Redirect to the correct dashboard for their role
        if (userType === 'organizer') {
            window.location.href = '/dashboard/organizer.html';
        } else {
            window.location.href = '/dashboard/admin.html';
        }
        return false;
    }
    return true;
}

export const auth = {
    checkAuth,
    signUp,
    signIn,
    signOut,
    resetPassword
}
