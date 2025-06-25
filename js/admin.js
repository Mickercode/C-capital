// Admin Dashboard Functionality
class AdminDashboard {
    constructor() {
        this.initializeEventListeners();
        this.loadDashboardStats();
    }

    initializeEventListeners() {
        // Logout button
        const logoutBtn = document.querySelector('.logout-button');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Mobile navigation
        if (window.innerWidth <= 768) {
            this.initializeMobileNav();
        }

        // Window resize handler
        window.addEventListener('resize', () => {
            if (window.innerWidth <= 768) {
                this.initializeMobileNav();
            }
        });
    }

    initializeMobileNav() {
        const navLinks = document.querySelector('.nav-links');
        if (!navLinks) return;

        // Add horizontal scroll with touch
        let isScrolling = false;
        let startX;
        let scrollLeft;

        navLinks.addEventListener('touchstart', (e) => {
            isScrolling = true;
            startX = e.touches[0].pageX - navLinks.offsetLeft;
            scrollLeft = navLinks.scrollLeft;
        });

        navLinks.addEventListener('touchmove', (e) => {
            if (!isScrolling) return;
            e.preventDefault();
            const x = e.touches[0].pageX - navLinks.offsetLeft;
            const walk = (x - startX) * 2;
            navLinks.scrollLeft = scrollLeft - walk;
        });

        navLinks.addEventListener('touchend', () => {
            isScrolling = false;
        });
    }

    async loadDashboardStats() {
        try {
            // TODO: Replace with actual API call
            const mockStats = {
                pending: {
                    count: 8,
                    trend: '+2',
                    trendType: 'positive'
                },
                approved: {
                    count: 3,
                    trend: '+1',
                    trendType: 'positive'
                },
                review: {
                    count: 5,
                    trend: '0',
                    trendType: 'neutral'
                },
                funding: {
                    amount: '₦45M',
                    trend: '+₦15M',
                    trendType: 'positive'
                }
            };

            this.updateStats(mockStats);
        } catch (error) {
            console.error('Failed to load dashboard stats:', error);
            this.showError('Failed to load dashboard statistics');
        }
    }

    updateStats(stats) {
        // Update each stat card
        Object.entries(stats).forEach(([key, data]) => {
            const card = document.querySelector(`.stat-card.${key}`);
            if (!card) return;

            const valueEl = card.querySelector('.stat-value');
            const trendEl = card.querySelector('.stat-trend');
            const trendValueEl = card.querySelector('.trend-value');

            if (valueEl) {
                valueEl.textContent = key === 'funding' ? data.amount : data.count;
            }

            if (trendEl) {
                trendEl.className = `stat-trend ${data.trendType}`;
            }

            if (trendValueEl) {
                trendValueEl.textContent = key === 'funding' 
                    ? `${data.trend} this month`
                    : `${data.trend} this week`;
            }
        });
    }

    showError(message) {
        // TODO: Implement error notification system
        console.error(message);
    }

    async handleLogout() {
        try {
            // TODO: Replace with actual logout API call
            await new Promise(resolve => setTimeout(resolve, 500));
            window.location.href = '/login.html';
        } catch (error) {
            console.error('Logout failed:', error);
            this.showError('Failed to logout. Please try again.');
        }
    }
}

class ProposalDetailModal {
    constructor() {
        this.modal = document.getElementById('proposal-detail-modal');
        this.currentProposal = null;
        this.initializeElements();
        this.initializeEventListeners();
    }

    initializeElements() {
        // Modal elements
        this.closeBtn = this.modal.querySelector('.close-modal');
        this.eventTitle = this.modal.querySelector('#modal-event-title');
        this.tabBtns = this.modal.querySelectorAll('.tab-btn');
        this.tabPanes = this.modal.querySelectorAll('.tab-pane');
        
        // Form elements
        this.statusSelect = this.modal.querySelector('#status-update');
        this.newNoteInput = this.modal.querySelector('#new-note');
        this.saveNoteBtn = this.modal.querySelector('#save-note');
        
        // Action buttons
        this.saveChangesBtn = this.modal.querySelector('.save-changes');
        this.notifyOrganizerBtn = this.modal.querySelector('.notify-organizer');
        this.returnDashboardBtn = this.modal.querySelector('.return-dashboard');
    }

    initializeEventListeners() {
        // Close modal
        this.closeBtn.addEventListener('click', () => this.close());
        this.returnDashboardBtn.addEventListener('click', () => this.close());
        
        // Tab switching
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });

        // Status change
        this.statusSelect.addEventListener('change', () => {
            this.updateStatus(this.statusSelect.value);
        });

        // Notes
        this.saveNoteBtn.addEventListener('click', () => {
            this.addNote(this.newNoteInput.value);
        });

        // Save changes
        this.saveChangesBtn.addEventListener('click', () => this.saveChanges());

        // Notify organizer
        this.notifyOrganizerBtn.addEventListener('click', () => this.notifyOrganizer());

        // Document viewers
        this.modal.querySelectorAll('.view-doc').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const docId = e.target.closest('.document-item').id;
                this.viewDocument(docId);
            });
        });
    }

    async open(proposalId) {
        try {
            if (!proposalId) {
                throw new Error('Invalid proposal ID');
            }

            // Show loading state
            this.modal.classList.add('active');
            this.modal.classList.add('loading');
            document.body.style.overflow = 'hidden';

            // Fetch proposal details
            this.currentProposal = await this.fetchProposalDetails(proposalId);
            
            if (!this.currentProposal) {
                throw new Error('Proposal not found');
            }

            // Remove loading state and populate modal
            this.modal.classList.remove('loading');
            this.populateModal();
        } catch (error) {
            console.error('Failed to open proposal details:', error);
            
            // Show error state in modal
            this.modal.classList.remove('loading');
            this.modal.querySelector('.modal-body').innerHTML = `
                <div class="error-state">
                    <span class="error-icon">⚠️</span>
                    <h3>Failed to Load Proposal</h3>
                    <p>${error.message}</p>
                    <button class="secondary-button return-dashboard">Return to Dashboard</button>
                </div>
            `;
        }
    }

    close() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
        this.currentProposal = null;
        this.resetForm();
    }

    switchTab(tabId) {
        this.tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });

        this.tabPanes.forEach(pane => {
            pane.classList.toggle('active', pane.id === `${tabId}-tab`);
        });
    }

    async fetchProposalDetails(proposalId) {
        // TODO: Replace with actual API call
        return {
            id: proposalId,
            title: 'Tech Conference 2025',
            organizer: {
                name: 'John Smith',
                email: 'john@example.com',
                phone: '+234 123 456 7890',
                company: 'Tech Solutions Ltd'
            },
            event: {
                description: 'A three-day tech conference featuring workshops...',
                type: 'Conference',
                dates: '2025-09-15 to 2025-09-17',
                attendees: '500+'
            },
            documents: {
                proposal: { name: 'proposal.pdf', size: '2.4 MB', date: '2025-06-20' },
                cac: { name: 'cac_cert.pdf', size: '1.1 MB', date: '2025-06-20' },
                pitch: { name: 'pitch_deck.pdf', size: '3.8 MB', date: '2025-06-20' },
                bank: { name: 'bank_details.pdf', size: '0.5 MB', date: '2025-06-20' }
            },
            budget: {
                total: '₦15,000,000',
                revenue: '₦25,000,000',
                margin: '40%',
                breakdown: {
                    venue: 30,
                    catering: 20,
                    marketing: 25,
                    speakers: 15,
                    misc: 10
                }
            },
            notes: [
                {
                    author: 'Admin',
                    date: '2025-06-24T10:30:00Z',
                    content: 'Initial review completed. Looks promising.'
                }
            ],
            status: {
                current: 'under_review',
                history: [
                    {
                        status: 'submitted',
                        date: '2025-06-20T09:00:00Z',
                        note: 'Proposal submitted'
                    },
                    {
                        status: 'under_review',
                        date: '2025-06-24T10:30:00Z',
                        note: 'Started initial review'
                    }
                ]
            }
        };
    }

    populateModal() {
        if (!this.currentProposal) return;

        // Set title
        this.eventTitle.textContent = this.currentProposal.title;

        // Populate organizer details
        this.populateOrganizerDetails();

        // Populate event details
        this.populateEventDetails();

        // Populate documents
        this.populateDocuments();

        // Populate budget
        this.populateBudget();

        // Populate notes
        this.populateNotes();

        // Populate status
        this.populateStatus();
    }

    populateOrganizerDetails() {
        const { organizer } = this.currentProposal;
        this.modal.querySelector('#organizer-name').textContent = organizer.name;
        this.modal.querySelector('#organizer-email').textContent = organizer.email;
        this.modal.querySelector('#organizer-phone').textContent = organizer.phone;
        this.modal.querySelector('#organizer-company').textContent = organizer.company;
    }

    populateEventDetails() {
        const { event } = this.currentProposal;
        this.modal.querySelector('#event-description').textContent = event.description;
        this.modal.querySelector('#event-type').textContent = event.type;
        this.modal.querySelector('#event-dates').textContent = event.dates;
        this.modal.querySelector('#event-attendees').textContent = event.attendees;
    }

    populateDocuments() {
        const { documents } = this.currentProposal;
        Object.entries(documents).forEach(([type, doc]) => {
            const item = this.modal.querySelector(`#${type}-doc .file-meta`);
            if (item) {
                item.textContent = `${doc.name} • ${doc.size} • Uploaded ${doc.date}`;
            }
        });
    }

    populateBudget() {
        const { budget } = this.currentProposal;
        this.modal.querySelector('#total-budget').textContent = budget.total;
        this.modal.querySelector('#expected-revenue').textContent = budget.revenue;
        this.modal.querySelector('#profit-margin').textContent = budget.margin;
        
        // TODO: Implement chart visualization
        this.renderBudgetChart(budget.breakdown);
    }

    populateNotes() {
        const notesList = this.modal.querySelector('#notes-list');
        notesList.innerHTML = '';
        
        this.currentProposal.notes.forEach(note => {
            const noteEl = document.createElement('div');
            noteEl.className = 'note-item';
            noteEl.innerHTML = `
                <div class="note-header">
                    <span class="note-author">${note.author}</span>
                    <span class="note-date">${new Date(note.date).toLocaleString()}</span>
                </div>
                <p class="note-content">${note.content}</p>
            `;
            notesList.appendChild(noteEl);
        });
    }

    populateStatus() {
        const { status } = this.currentProposal;
        this.statusSelect.value = status.current;

        const timeline = this.modal.querySelector('#status-timeline');
        timeline.innerHTML = '';

        status.history.forEach((item, index) => {
            const timelineItem = document.createElement('div');
            timelineItem.className = 'timeline-item';
            timelineItem.innerHTML = `
                <div class="timeline-icon"></div>
                <div class="timeline-content">
                    <div class="timeline-header">
                        <span class="timeline-status">${this.getStatusLabel(item.status)}</span>
                        <span class="timeline-date">${new Date(item.date).toLocaleString()}</span>
                    </div>
                    <p class="timeline-note">${item.note}</p>
                </div>
            `;
            timeline.appendChild(timelineItem);
        });
    }

    getStatusLabel(status) {
        const labels = {
            submitted: '📥 Submitted',
            under_review: '🔍 Under Review',
            vetted: '✔️ Vetted',
            callback_scheduled: '📞 Callback Scheduled',
            approved: '✅ Approved',
            rejected: '❌ Rejected'
        };
        return labels[status] || status;
    }

    async updateStatus(newStatus) {
        try {
            // TODO: Replace with actual API call
            this.currentProposal.status.current = newStatus;
            this.currentProposal.status.history.push({
                status: newStatus,
                date: new Date().toISOString(),
                note: `Status updated to ${this.getStatusLabel(newStatus)}`
            });
            this.populateStatus();
        } catch (error) {
            console.error('Failed to update status:', error);
            // TODO: Show error notification
        }
    }

    async addNote(content) {
        if (!content.trim()) return;

        try {
            // TODO: Replace with actual API call
            const note = {
                author: 'Admin',
                date: new Date().toISOString(),
                content: content.trim()
            };
            this.currentProposal.notes.unshift(note);
            this.populateNotes();
            this.newNoteInput.value = '';
        } catch (error) {
            console.error('Failed to add note:', error);
            // TODO: Show error notification
        }
    }

    async saveChanges() {
        try {
            // TODO: Replace with actual API call
            console.log('Saving changes:', this.currentProposal);
            // TODO: Show success notification
            this.close();
        } catch (error) {
            console.error('Failed to save changes:', error);
            // TODO: Show error notification
        }
    }

    async notifyOrganizer() {
        try {
            // TODO: Replace with actual API call
            console.log('Notifying organizer:', this.currentProposal.organizer.email);
            // TODO: Show success notification
        } catch (error) {
            console.error('Failed to notify organizer:', error);
            // TODO: Show error notification
        }
    }

    async viewDocument(docId) {
        try {
            const docType = docId.split('-')[0];
            const doc = this.currentProposal.documents[docType];
            // TODO: Replace with actual document viewer/download
            console.log('Viewing document:', doc);
        } catch (error) {
            console.error('Failed to view document:', error);
            // TODO: Show error notification
        }
    }

    renderBudgetChart(breakdown) {
        const chart = this.modal.querySelector('#budget-chart');
        // TODO: Implement chart visualization using a charting library
        chart.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                Budget Breakdown Chart Placeholder<br>
                ${Object.entries(breakdown)
                    .map(([key, value]) => `${key}: ${value}%`)
                    .join('<br>')}
            </div>
        `;
    }

    resetForm() {
        this.newNoteInput.value = '';
        this.switchTab('organizer');
    }
}

class ProposalManagement {
    constructor() {
        this.proposals = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.sortField = 'date';
        this.sortDirection = 'desc';
        this.searchQuery = '';
        this.statusFilter = '';
        this.detailModal = new ProposalDetailModal();

        this.initializeElements();
        this.initializeEventListeners();
        this.loadProposals();
    }

    initializeElements() {
        // Table elements
        this.tableBody = document.getElementById('proposal-table-body');
        this.rowTemplate = document.getElementById('proposal-row-template');
        
        // Search and filter elements
        this.searchInput = document.getElementById('proposal-search');
        this.statusFilter = document.getElementById('status-filter');
        
        // Pagination elements
        this.prevPageBtn = document.getElementById('prev-page');
        this.nextPageBtn = document.getElementById('next-page');
        this.pageNumbers = document.getElementById('page-numbers');
        this.showingStart = document.getElementById('showing-start');
        this.showingEnd = document.getElementById('showing-end');
        this.totalEntries = document.getElementById('total-entries');
    }

    initializeEventListeners() {
        // Search and filter
        this.searchInput.addEventListener('input', this.debounce(() => {
            this.searchQuery = this.searchInput.value;
            this.currentPage = 1;
            this.renderTable();
        }, 300));

        this.statusFilter.addEventListener('change', () => {
            this.statusFilter = this.statusFilter.value;
            this.currentPage = 1;
            this.renderTable();
        });

        // Sorting
        document.querySelectorAll('.sortable').forEach(header => {
            header.addEventListener('click', () => {
                const field = header.dataset.sort;
                if (this.sortField === field) {
                    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
                } else {
                    this.sortField = field;
                    this.sortDirection = 'asc';
                }
                this.renderTable();
            });
        });

        // Pagination
        this.prevPageBtn.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.renderTable();
            }
        });

        this.nextPageBtn.addEventListener('click', () => {
            const maxPage = Math.ceil(this.getFilteredProposals().length / this.itemsPerPage);
            if (this.currentPage < maxPage) {
                this.currentPage++;
                this.renderTable();
            }
        });
    }

    async loadProposals() {
        try {
            // TODO: Replace with actual API call
            this.proposals = [
                {
                    id: 'PRO-001',
                    title: 'Tech Conference 2025',
                    organizer: 'John Smith',
                    status: 'pending',
                    date: '2025-06-20T10:30:00Z'
                },
                {
                    id: 'PRO-002',
                    title: 'Startup Summit',
                    organizer: 'Sarah Johnson',
                    status: 'approved',
                    date: '2025-06-19T14:15:00Z'
                },
                {
                    id: 'PRO-003',
                    title: 'AI Workshop Series',
                    organizer: 'Michael Chen',
                    status: 'under_review',
                    date: '2025-06-18T09:00:00Z'
                }
                // Add more mock data as needed
            ];

            this.renderTable();
        } catch (error) {
            console.error('Failed to load proposals:', error);
            this.showError('Failed to load proposals');
        }
    }

    getFilteredProposals() {
        return this.proposals
            .filter(proposal => {
                const matchesSearch = this.searchQuery === '' ||
                    proposal.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                    proposal.organizer.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                    proposal.id.toLowerCase().includes(this.searchQuery.toLowerCase());

                const matchesStatus = this.statusFilter === '' || proposal.status === this.statusFilter;

                return matchesSearch && matchesStatus;
            })
            .sort((a, b) => {
                const aValue = a[this.sortField];
                const bValue = b[this.sortField];
                const modifier = this.sortDirection === 'asc' ? 1 : -1;

                if (this.sortField === 'date') {
                    return (new Date(aValue) - new Date(bValue)) * modifier;
                }
                return aValue.localeCompare(bValue) * modifier;
            });
    }

    renderTable() {
        const filteredProposals = this.getFilteredProposals();
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, filteredProposals.length);
        const pageProposals = filteredProposals.slice(startIndex, endIndex);

        // Clear existing rows
        while (this.tableBody.firstChild) {
            this.tableBody.removeChild(this.tableBody.firstChild);
        }

        // Add new rows
        pageProposals.forEach(proposal => {
            const row = this.rowTemplate.content.cloneNode(true);
            
            row.querySelector('.proposal-id').textContent = proposal.id;
            row.querySelector('.event-title').textContent = proposal.title;
            row.querySelector('.organizer-name').textContent = proposal.organizer;
            row.querySelector('.status-badge').value = proposal.status;
            row.querySelector('.submission-date').textContent = 
                new Date(proposal.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });

            // Add event listeners for actions
            this.setupRowActions(row, proposal);
            
            this.tableBody.appendChild(row);
        });

        // Update pagination
        this.updatePagination(filteredProposals.length);
    }

    setupRowActions(row, proposal) {
        // View Details
        row.querySelector('.view-details').addEventListener('click', () => {
            this.viewProposalDetails(proposal);
        });

        // Add Note
        row.querySelector('.add-note').addEventListener('click', () => {
            this.addProposalNote(proposal);
        });

        // Schedule Call
        row.querySelector('.schedule-call').addEventListener('click', () => {
            this.scheduleCall(proposal);
        });

        // Status Change
        row.querySelector('.status-badge').addEventListener('change', (e) => {
            this.updateProposalStatus(proposal, e.target.value);
        });

        // Approve/Reject
        row.querySelector('.approve-proposal').addEventListener('click', () => {
            this.approveProposal(proposal);
        });

        row.querySelector('.reject-proposal').addEventListener('click', () => {
            this.rejectProposal(proposal);
        });
    }

    updatePagination(totalItems) {
        const maxPage = Math.ceil(totalItems / this.itemsPerPage);
        const startIndex = (this.currentPage - 1) * this.itemsPerPage + 1;
        const endIndex = Math.min(this.currentPage * this.itemsPerPage, totalItems);

        // Update info text
        this.showingStart.textContent = totalItems === 0 ? 0 : startIndex;
        this.showingEnd.textContent = endIndex;
        this.totalEntries.textContent = totalItems;

        // Update buttons state
        this.prevPageBtn.disabled = this.currentPage === 1;
        this.nextPageBtn.disabled = this.currentPage === maxPage;

        // Update page numbers
        this.pageNumbers.innerHTML = '';
        for (let i = 1; i <= maxPage; i++) {
            const button = document.createElement('button');
            button.className = `page-number${i === this.currentPage ? ' active' : ''}`;
            button.textContent = i;
            button.addEventListener('click', () => {
                this.currentPage = i;
                this.renderTable();
            });
            this.pageNumbers.appendChild(button);
        }
    }

    // Action handlers
    async viewProposalDetails(proposal) {
        this.detailModal.open(proposal.id);
    }

    async addProposalNote(proposal) {
        // TODO: Implement add note modal
        console.log('Add note:', proposal);
    }

    async scheduleCall(proposal) {
        // TODO: Implement calendar integration
        console.log('Schedule call:', proposal);
    }

    async updateProposalStatus(proposal, newStatus) {
        try {
            // TODO: Replace with actual API call
            proposal.status = newStatus;
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500));
            this.renderTable();
        } catch (error) {
            console.error('Failed to update status:', error);
            this.showError('Failed to update proposal status');
        }
    }

    async approveProposal(proposal) {
        await this.updateProposalStatus(proposal, 'approved');
    }

    async rejectProposal(proposal) {
        await this.updateProposalStatus(proposal, 'rejected');
    }

    showError(message) {
        // TODO: Implement error notification system
        console.error(message);
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Initialize systems only on their respective pages
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Funding Management only on funding page
    if (window.location.pathname.includes('funding.html') && document.getElementById('funding-management')) {
        new FundingManagement();
    }
    
    // Initialize Proposal Management only on admin/proposals page
    if (window.location.pathname.includes('admin.html') && document.getElementById('proposal-management-container')) {
        new ProposalManagement();
    }
});
