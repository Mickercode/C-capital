import { auth } from './supabase.js'

// Check auth state and update UI on page load
window.addEventListener('load', async () => {
    const user = await auth.checkAuth()
    if (!user) {
        window.location.href = '/signin.html'
        return
    }

    // Pre-fill organizer name and email if available
    if (user.user_metadata) {
        const { full_name, email } = user.user_metadata
        if (full_name) {
            document.getElementById('organizer-name').value = full_name
        }
        if (email) {
            document.getElementById('email').value = email
        }
    }

    // Handle proposal form submission
    const proposalForm = document.getElementById('proposal-form')
    if (proposalForm) {
        proposalForm.addEventListener('submit', handleProposalSubmit)
    }
})

// Handle proposal form submission
async function handleProposalSubmit(event) {
    event.preventDefault()
    
    const submitButton = event.target.querySelector('button[type="submit"]')
    const errorDiv = document.getElementById('error-message')
    const successDiv = document.getElementById('success-message')
    
    // Hide previous messages
    errorDiv.style.display = 'none'
    successDiv.style.display = 'none'
    
    try {
        // Show loading state
        submitButton.disabled = true
        submitButton.innerHTML = '<span class="loading-spinner"></span> Submitting...'
        
        // Validate file type
        const proposalDoc = document.getElementById('proposal-doc').files[0]
        if (proposalDoc && !proposalDoc.type.includes('pdf')) {
            throw new Error('Please upload a PDF document')
        }
        
        // Validate video URL if provided
        const videoUrl = document.getElementById('pitch-video').value
        if (videoUrl && !isValidVideoUrl(videoUrl)) {
            throw new Error('Please enter a valid YouTube or Vimeo URL')
        }
        
        // Get form data
        const formData = new FormData(event.target)
        const data = Object.fromEntries(formData.entries())
        
        // TODO: Submit to backend
        console.log('Form data:', data)
        
        // Show success message
        successDiv.textContent = 'Proposal submitted successfully! Redirecting to dashboard...'
        successDiv.style.display = 'block'
        
        // Redirect back to dashboard after 2 seconds
        setTimeout(() => {
            window.location.href = '/dashboard/organizer.html'
        }, 2000)
        
    } catch (error) {
        // Show error message
        errorDiv.textContent = error.message
        errorDiv.style.display = 'block'
        
    } finally {
        // Reset button state
        submitButton.disabled = false
        submitButton.innerHTML = '📨 Submit for Review'
    }
}

// Validate video URL
function isValidVideoUrl(url) {
    try {
        const urlObj = new URL(url)
        return (
            urlObj.hostname.includes('youtube.com') ||
            urlObj.hostname.includes('youtu.be') ||
            urlObj.hostname.includes('vimeo.com')
        )
    } catch {
        return false
    }
}
