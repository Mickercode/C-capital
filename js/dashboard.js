import { auth } from './supabase.js'

// Check auth state and update UI on page load
window.addEventListener('load', async () => {
    console.log('Page loaded, checking auth...')
    const user = await auth.checkAuth()
    if (!user) {
        window.location.href = '/signin.html'
        return
    }

    // Update welcome message with user's first name
    const firstName = user.user_metadata.full_name.split(' ')[0]
    const welcomeNameElement = document.getElementById('user-firstname')
    if (welcomeNameElement) {
        welcomeNameElement.textContent = firstName
    }
})

// Handle sign out
document.addEventListener('click', async (e) => {
    if (e.target.matches('.sign-out-button')) {
        await auth.signOut()
    }
})

// Document Upload Functionality
function initDocumentCenter() {
    const form = document.getElementById('document-upload-form');
    if (!form) return;

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const dropzones = form.querySelectorAll('.upload-dropzone');

    // Handle drag and drop
    dropzones.forEach(dropzone => {
        const input = dropzone.querySelector('input[type="file"]');
        const preview = dropzone.querySelector('.file-preview');
        const content = dropzone.querySelector('.dropzone-content');
        const fileName = preview.querySelector('.file-name');
        const removeBtn = preview.querySelector('.remove-file');
        const timestamp = dropzone.closest('.upload-field').querySelector('.upload-timestamp');
        const field = dropzone.closest('.upload-field');

        function showError(message) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'upload-error';
            errorDiv.textContent = message;
            
            const existingError = field.querySelector('.upload-error');
            if (existingError) {
                existingError.remove();
            }
            
            field.appendChild(errorDiv);
            setTimeout(() => errorDiv.remove(), 3000);
        }

        function formatFileSize(bytes) {
            if (bytes < 1024) return bytes + ' B';
            else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
            else return (bytes / 1048576).toFixed(1) + ' MB';
        }

        // Drag events with visual feedback
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        dropzone.addEventListener('dragenter', () => dropzone.classList.add('drag-over'));
        dropzone.addEventListener('dragover', () => dropzone.classList.add('drag-over'));
        dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
        dropzone.addEventListener('drop', (e) => {
            dropzone.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            if (files.length) {
                handleFileSelect(files[0]);
            }
        });

        // File input change
        input.addEventListener('change', (e) => {
            if (e.target.files.length) {
                handleFileSelect(e.target.files[0]);
            }
        });

        // Remove file
        removeBtn.addEventListener('click', () => {
            input.value = '';
            preview.classList.add('hidden');
            content.classList.remove('hidden');
            timestamp.textContent = '';
        });

        function handleFileSelect(file) {
            // Validate file type
            const acceptedTypes = dropzone.dataset.accepts.split(',');
            const fileExt = '.' + file.name.split('.').pop().toLowerCase();
            
            if (!acceptedTypes.includes(fileExt)) {
                showError('Please upload a PDF or DOCX file only');
                return;
            }

            // Validate file size
            if (file.size > MAX_FILE_SIZE) {
                showError(`File too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}`);
                return;
            }

            // Update UI
            fileName.textContent = `${file.name} (${formatFileSize(file.size)})`;
            preview.classList.remove('hidden');
            content.classList.add('hidden');
            timestamp.textContent = new Date().toLocaleString();
        }
    });

    // Form submission with validation
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = form.querySelector('.upload-submit-btn');
        const originalText = submitBtn.innerHTML;
        const requiredInputs = form.querySelectorAll('input[required]');
        
        // Check required files
        let missingFiles = false;
        requiredInputs.forEach(input => {
            if (!input.files.length) {
                const field = input.closest('.upload-field');
                const label = field.querySelector('label').textContent;
                showError(`Please upload ${label}`);
                missingFiles = true;
            }
        });

        if (missingFiles) return;

        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i>⏳</i> Uploading...';

            // TODO: Replace with actual upload logic
            await new Promise(resolve => setTimeout(resolve, 2000));

            submitBtn.innerHTML = '<i>✅</i> Uploaded Successfully!';
            
            // Show success message
            const successMsg = document.createElement('div');
            successMsg.className = 'upload-success';
            successMsg.textContent = 'All documents uploaded successfully!';
            form.insertBefore(successMsg, form.firstChild);
            
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                successMsg.remove();
            }, 3000);

        } catch (error) {
            console.error('Upload failed:', error);
            submitBtn.innerHTML = '<i>❌</i> Upload Failed';
            
            // Show error message
            const errorMsg = document.createElement('div');
            errorMsg.className = 'upload-error';
            errorMsg.textContent = 'Failed to upload documents. Please try again.';
            form.insertBefore(errorMsg, form.firstChild);
            
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                errorMsg.remove();
            }, 3000);
        }
    });

    function showError(message) {
        const errorMsg = document.createElement('div');
        errorMsg.className = 'upload-error';
        errorMsg.textContent = message;
        form.insertBefore(errorMsg, form.firstChild);
        setTimeout(() => errorMsg.remove(), 3000);
    }
}

// Help & Support Footer
class HelpSupport {
    constructor() {
        this.footer = document.getElementById('help-support');
        if (!this.footer) return;

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const contactBtn = this.footer.querySelector('.contact-support');
        const bookCallBtn = this.footer.querySelector('.book-call');

        if (contactBtn) {
            contactBtn.addEventListener('click', () => this.handleContactSupport());
        }

        if (bookCallBtn) {
            bookCallBtn.addEventListener('click', () => this.handleBookCall());
        }
    }

    handleContactSupport() {
        const supportEmail = 'support@crawdwall.com';
        const subject = 'Application Support Request';
        const body = 'I need assistance with my funding application.';
        
        window.location.href = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        if (window.notificationFeed) {
            window.notificationFeed.addNotification(
                'Support request sent. We\'ll respond within 24 hours.',
                'info',
                '💬'
            );
        }
    }

    handleBookCall() {
        const calendarUrl = '#'; // Replace with actual Calendly or similar URL
        window.open(calendarUrl, '_blank');
        
        if (window.notificationFeed) {
            window.notificationFeed.addNotification(
                'Opening call booking calendar...',
                'info',
                '📅'
            );
        }
    }
}

// Initialize help & support
document.addEventListener('DOMContentLoaded', () => {
    const helpSupport = new HelpSupport();
    window.helpSupport = helpSupport;
});

// Initialize all dashboard components
function initDashboard() {
    console.log('Initializing dashboard components...');
    
    // Initialize core components first
    initDocumentCenter();
    
    // Initialize notification feed
    const notificationFeed = new NotificationFeed();
    window.notificationFeed = notificationFeed;
    
    // Initialize funding offer
    const fundingOffer = new FundingOffer();
    window.fundingOffer = fundingOffer;
}

// Initialize on DOM load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
} else {
    initDashboard();
}

// Notification Feed Functionality
class NotificationFeed {
    constructor() {
        this.list = document.getElementById('notification-list');
        this.template = document.getElementById('notification-template');
        this.emptyState = document.querySelector('.empty-notifications');
        
        // Bind event listeners
        const markAllBtn = document.querySelector('.mark-all-read');
        const clearAllBtn = document.querySelector('.clear-all');
        
        if (markAllBtn) markAllBtn.addEventListener('click', () => this.markAllAsRead());
        if (clearAllBtn) clearAllBtn.addEventListener('click', () => this.clearAll());
        
        // Initialize notifications
        this.notifications = [];
        this.loadNotifications();
    }

    loadNotifications() {
        // TODO: Replace with actual API call
        const mockNotifications = [
            {
                id: 1,
                message: "Your proposal 'TechConnect 2024' has been vetted successfully.",
                type: "success",
                icon: "🟢",
                timestamp: new Date(2025, 5, 24, 15, 30).getTime(),
                unread: true
            },
            {
                id: 2,
                message: "You have a callback scheduled for Thursday at 2:00 PM.",
                type: "warning",
                icon: "🟡",
                timestamp: new Date(2025, 5, 24, 14, 15).getTime(),
                unread: true
            },
            {
                id: 3,
                message: "Please upload a valid CAC document to continue.",
                type: "error",
                icon: "❗",
                timestamp: new Date(2025, 5, 24, 12, 0).getTime(),
                unread: true
            },
            {
                id: 4,
                message: "Milestone 1 funding has been approved.",
                type: "success",
                icon: "✅",
                timestamp: new Date(2025, 5, 24, 10, 45).getTime(),
                unread: false
            }
        ];

        this.notifications = mockNotifications;
        this.render();
    }

    render() {
        if (!this.list || !this.template) return;

        // Clear existing notifications
        while (this.list.firstChild && this.list.firstChild !== this.emptyState) {
            this.list.removeChild(this.list.firstChild);
        }

        // Show/hide empty state
        if (this.notifications.length === 0) {
            this.emptyState?.classList.remove('hidden');
            return;
        } else {
            this.emptyState?.classList.add('hidden');
        }

        // Sort notifications by timestamp (newest first)
        const sorted = [...this.notifications].sort((a, b) => b.timestamp - a.timestamp);

        // Render each notification
        sorted.forEach(notification => {
            const element = this.template.content.cloneNode(true);
            const item = element.querySelector('.notification-item');
            
            // Set notification type and unread status
            item.setAttribute('data-type', notification.type);
            if (notification.unread) item.classList.add('unread');
            
            // Set content
            const icon = item.querySelector('.notification-icon');
            const message = item.querySelector('.notification-message');
            const time = item.querySelector('.notification-time');
            const markReadBtn = item.querySelector('.mark-read');
            
            icon.textContent = notification.icon;
            message.textContent = notification.message;
            time.textContent = this.formatTimestamp(notification.timestamp);
            
            // Add mark as read handler
            if (markReadBtn) {
                if (!notification.unread) {
                    markReadBtn.style.display = 'none';
                } else {
                    markReadBtn.addEventListener('click', () => this.markAsRead(notification.id));
                }
            }
            
            this.list.insertBefore(element, this.emptyState);
        });
    }

    formatTimestamp(timestamp) {
        const now = new Date();
        const date = new Date(timestamp);
        const diffMinutes = Math.floor((now - date) / 60000);
        
        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
        if (diffMinutes < 10080) return `${Math.floor(diffMinutes / 1440)}d ago`;
        
        return date.toLocaleDateString();
    }

    markAsRead(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
            notification.unread = false;
            this.render();
            
            // TODO: Update backend
            console.log('Marked as read:', id);
        }
    }

    markAllAsRead() {
        this.notifications.forEach(n => n.unread = false);
        this.render();
        
        // TODO: Update backend
        console.log('Marked all as read');
    }

    clearAll() {
        this.notifications = [];
        this.render();
        
        // TODO: Update backend
        console.log('Cleared all notifications');
    }

    // Method to add a new notification
    addNotification(message, type = 'success', icon = '✅') {
        const notification = {
            id: Date.now(),
            message,
            type,
            icon,
            timestamp: Date.now(),
            unread: true
        };
        
        this.notifications.unshift(notification);
        this.render();
        
        // TODO: Update backend
        console.log('Added notification:', notification);
    }
}

// Funding Offer Functionality
class FundingOffer {
    constructor() {
        this.section = document.getElementById('funding-offer');
        if (!this.section) return;

        // Bind event listeners
        const acceptBtn = this.section.querySelector('.accept-offer');
        const requestChangesBtn = this.section.querySelector('.request-changes');
        const downloadLink = this.section.querySelector('.download-link');

        if (acceptBtn) {
            acceptBtn.addEventListener('click', () => this.handleAcceptOffer());
        }

        if (requestChangesBtn) {
            requestChangesBtn.addEventListener('click', () => this.handleRequestChanges());
        }

        if (downloadLink) {
            downloadLink.addEventListener('click', (e) => this.handleDownload(e));
        }

        // Initialize
        this.checkOfferStatus();
    }

    checkOfferStatus() {
        // TODO: Replace with actual API call
        const mockStatus = {
            approved: true,
            amount: '₦10,000,000',
            milestones: [
                {
                    name: 'Initial Release',
                    description: 'Upon contract signing',
                    amount: '₦3,000,000'
                },
                {
                    name: 'Milestone 1',
                    description: 'Event venue & vendor contracts',
                    amount: '₦4,000,000'
                },
                {
                    name: 'Final Milestone',
                    description: 'Post-event report submission',
                    amount: '₦3,000,000'
                }
            ],
            contractUrl: '#'
        };

        if (mockStatus.approved) {
            this.section.classList.add('visible');
            this.updateOfferDetails(mockStatus);
        }
    }

    updateOfferDetails(data) {
        const amountDisplay = this.section.querySelector('.funding-amount h3');
        if (amountDisplay) {
            amountDisplay.textContent = data.amount;
        }

        const milestoneTable = this.section.querySelector('.milestone-table');
        if (milestoneTable && data.milestones) {
            milestoneTable.innerHTML = data.milestones.map(milestone => `
                <div class="milestone-row">
                    <div class="milestone-info">
                        <span class="milestone-name">${milestone.name}</span>
                        <span class="milestone-desc">${milestone.description}</span>
                    </div>
                    <div class="milestone-amount">${milestone.amount}</div>
                </div>
            `).join('');
        }

        const downloadLink = this.section.querySelector('.download-link');
        if (downloadLink && data.contractUrl) {
            downloadLink.href = data.contractUrl;
        }
    }

    async handleAcceptOffer() {
        const actions = this.section.querySelector('.offer-actions');
        const success = this.section.querySelector('.offer-success');
        
        try {
            // TODO: Replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Show success message
            if (actions) actions.style.display = 'none';
            if (success) success.classList.remove('hidden');
            
            // Notify the notification feed
            if (window.notificationFeed) {
                window.notificationFeed.addNotification(
                    'You have accepted the funding offer. Our team will contact you shortly.',
                    'success',
                    '🎉'
                );
            }
            
        } catch (error) {
            console.error('Failed to accept offer:', error);
            // Show error in notification feed
            if (window.notificationFeed) {
                window.notificationFeed.addNotification(
                    'Failed to accept offer. Please try again.',
                    'error',
                    '❌'
                );
            }
        }
    }

    handleRequestChanges() {
        // TODO: Implement changes request modal
        console.log('Request changes clicked');
    }

    handleDownload(e) {
        // TODO: Replace with actual contract download
        e.preventDefault();
        console.log('Contract download clicked');
    }
}
