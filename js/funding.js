// Funding Management Functionality
class FundingManagement {
    constructor() {
        this.stats = {
            totalFunded: '₦80M',
            activeEvents: 12,
            completed: 3,
            roi: '18%'
        };
        
        this.funding = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.sortField = 'date';
        this.sortDirection = 'desc';
        this.searchQuery = '';
        this.statusFilter = '';
        
        // Debug flag
        this.debug = true;
        
        // Filter elements
        this.dateRangePicker = document.getElementById('date-range-picker');
        this.milestoneStatusFilter = document.getElementById('milestone-status');
        this.roiTierFilter = document.getElementById('roi-tier');
        this.searchField = document.getElementById('search-field');
        this.applyFiltersBtn = document.getElementById('apply-filters');
        this.resetFiltersBtn = document.getElementById('reset-filters');
        
        this.initializeElements();
        this.initializeEventListeners();
        this.loadFundingStats();
        this.loadFunding();
        this.setupFilters();
    }

    initializeElements() {
        // Table elements
        this.tableBody = document.getElementById('funding-table-body');
        this.rowTemplate = document.getElementById('funding-row-template');
        
        if (this.debug) {
            console.log('Table body found:', !!this.tableBody);
            console.log('Row template found:', !!this.rowTemplate);
        }
        
        // Search and filter elements
        this.searchInput = document.getElementById('funding-search');
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
        // Mobile navigation toggle
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', () => {
                document.querySelector('.sidebar').classList.toggle('active');
            });
        }
        
        // Logout button
        const logoutButton = document.querySelector('.logout-button');
        if (logoutButton) {
            logoutButton.addEventListener('click', this.handleLogout.bind(this));
        }

        // Search and filter - only add listeners if elements exist
        if (this.searchInput) {
            this.searchInput.addEventListener('input', this.debounce(() => {
                this.searchQuery = this.searchInput.value;
                this.currentPage = 1;
                this.renderTable();
            }, 300));
        }

        if (this.statusFilter) {
            this.statusFilter.addEventListener('change', () => {
                this.statusFilter = this.statusFilter.value;
                this.currentPage = 1;
                this.renderTable();
            });
        }

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
        if (this.prevPageBtn && this.nextPageBtn) {
            this.prevPageBtn.addEventListener('click', () => {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.renderTable();
                }
            });

            this.nextPageBtn.addEventListener('click', () => {
                const maxPage = Math.ceil(this.getFilteredFunding().length / this.itemsPerPage);
                if (this.currentPage < maxPage) {
                    this.currentPage++;
                    this.renderTable();
                }
            });
        }
        
        // Modal functionality
        this.initializeModalListeners();
    }
    
    setupFilters() {
        // Initialize date range picker
        $(this.dateRangePicker).daterangepicker({
            opens: 'left',
            autoUpdateInput: false,
            locale: {
                cancelLabel: 'Clear',
                applyLabel: 'Apply'
            }
        });
        
        $(this.dateRangePicker).on('apply.daterangepicker', (ev, picker) => {
            $(this.dateRangePicker).val(picker.startDate.format('MM/DD/YYYY') + ' - ' + picker.endDate.format('MM/DD/YYYY'));
        });
        
        $(this.dateRangePicker).on('cancel.daterangepicker', () => {
            $(this.dateRangePicker).val('');
        });
        
        // Add event listeners
        this.applyFiltersBtn.addEventListener('click', () => this.applyFilters());
        this.resetFiltersBtn.addEventListener('click', () => this.resetFilters());
    }
    
    applyFilters() {
        const statusFilter = this.milestoneStatusFilter.value;
        const roiFilter = this.roiTierFilter.value;
        const searchQuery = this.searchField.value.toLowerCase().trim();
        
        // Get date range
        let startDate, endDate;
        if (this.dateRangePicker.value) {
            const dates = this.dateRangePicker.value.split(' - ');
            startDate = new Date(dates[0]);
            endDate = new Date(dates[1]);
        }
        
        // Filter funding data
        const filteredData = this.funding.filter(item => {
            // Status filter
            if (statusFilter !== 'all' && item.status !== statusFilter) {
                return false;
            }
            
            // ROI tier filter
            if (roiFilter !== 'all') {
                const roi = item.roi || 0;
                if (roiFilter === 'low' && roi >= 10) return false;
                if (roiFilter === 'medium' && (roi < 10 || roi > 30)) return false;
                if (roiFilter === 'high' && roi <= 30) return false;
            }
            
            // Date range filter
            if (startDate && endDate) {
                const itemDate = new Date(item.date);
                if (itemDate < startDate || itemDate > endDate) {
                    return false;
                }
            }
            
            // Search filter
            if (searchQuery) {
                const eventMatch = item.eventTitle.toLowerCase().includes(searchQuery);
                const organizerMatch = item.organizer.toLowerCase().includes(searchQuery);
                if (!eventMatch && !organizerMatch) {
                    return false;
                }
            }
            
            return true;
        });
        
        // Render filtered data
        this.renderTable(filteredData);
    }
    
    resetFilters() {
        this.milestoneStatusFilter.value = 'all';
        this.roiTierFilter.value = 'all';
        this.searchField.value = '';
        $(this.dateRangePicker).val('');
        
        // Render original data
        this.renderTable(this.funding);
    }
    
    initializeModalListeners() {
        const modal = document.getElementById('funding-detail-modal');
        if (!modal) return;
        
        // Close modal button
        const closeButton = modal.querySelector('.close-modal');
        if (closeButton) {
            closeButton.addEventListener('click', () => this.closeModal(modal));
        }
        
        // Return to dashboard button
        const returnButton = modal.querySelector('.return-dashboard');
        if (returnButton) {
            returnButton.addEventListener('click', () => this.closeModal(modal));
        }
        
        // Tab navigation
        const tabButtons = modal.querySelectorAll('.tab-btn');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.dataset.tab;
                this.switchTab(tabId);
            });
        });
        
        // Form submissions
        const disburseForm = modal.querySelector('#disburse-form');
        if (disburseForm) {
            disburseForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleDisbursementSubmit(e.target);
            });
        }
        
        const documentUploadForm = modal.querySelector('#document-upload-form');
        if (documentUploadForm) {
            documentUploadForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleDocumentUpload(e.target);
            });
        }
        
        const addNoteForm = modal.querySelector('#add-note-form');
        if (addNoteForm) {
            addNoteForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddNote(e.target);
            });
        }
        
        // File input change handlers
        const verificationDocs = modal.querySelector('#verification-docs');
        if (verificationDocs) {
            verificationDocs.addEventListener('change', (e) => {
                const fileCount = e.target.files.length;
                const selectedFilesElement = modal.querySelector('#selected-files');
                if (selectedFilesElement) {
                    selectedFilesElement.textContent = fileCount > 0 ? 
                        `${fileCount} file${fileCount > 1 ? 's' : ''} selected` : 
                        'No files selected';
                }
            });
        }
        
        const documentFile = modal.querySelector('#document-file');
        if (documentFile) {
            documentFile.addEventListener('change', (e) => {
                const fileName = e.target.files[0]?.name || 'No file selected';
                const selectedDocElement = modal.querySelector('#selected-document');
                if (selectedDocElement) {
                    selectedDocElement.textContent = fileName;
                }
            });
        }
        
        // Save changes button
        const saveChangesButton = modal.querySelector('.save-changes');
        if (saveChangesButton) {
            saveChangesButton.addEventListener('click', () => {
                this.handleSaveChanges();
            });
        }
    }
    
    switchTab(tabId) {
        const modal = document.getElementById('funding-detail-modal');
        if (!modal) return;
        
        // Deactivate all tabs
        const tabButtons = modal.querySelectorAll('.tab-btn');
        const tabPanes = modal.querySelectorAll('.tab-pane');
        
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabPanes.forEach(pane => pane.classList.remove('active'));
        
        // Activate selected tab
        const selectedButton = modal.querySelector(`[data-tab="${tabId}"]`);
        const selectedPane = modal.querySelector(`#${tabId}`);
        
        if (selectedButton) selectedButton.classList.add('active');
        if (selectedPane) selectedPane.classList.add('active');
    }
    
    closeModal(modal) {
        if (!modal) modal = document.getElementById('funding-detail-modal');
        if (!modal) return;
        
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    handleDisbursementSubmit(form) {
        const milestone = form.querySelector('#milestone-select').value;
        const amount = form.querySelector('#disbursement-amount').value;
        
        if (!milestone || !amount) {
            this.showNotification('Please fill in all required fields', 'warning');
            return;
        }
        
        // In a real application, this would call an API to process the disbursement
        // For now, we'll just show a success notification
        this.showNotification(`Disbursement of ₦${amount} processed for milestone ${milestone}`, 'success');
        
        // Reset form
        form.reset();
        
        // Close modal
        this.closeModal();
    }
    
    handleDocumentUpload(form) {
        const documentType = form.querySelector('#document-type').value;
        const title = form.querySelector('#document-title').value;
        const file = form.querySelector('#document-file').files[0];
        
        if (!documentType || !title || !file) {
            this.showNotification('Please fill in all required fields', 'warning');
            return;
        }
        
        // In a real application, this would call an API to upload the document
        // For now, we'll just show a success notification
        this.showNotification(`Document "${title}" uploaded successfully`, 'success');
        
        // Reset form
        form.reset();
        form.querySelector('#selected-document').textContent = 'No file selected';
    }
    
    handleAddNote(form) {
        const noteContent = form.querySelector('#note-content').value;
        
        if (!noteContent) {
            this.showNotification('Please enter a note', 'warning');
            return;
        }
        
        // In a real application, this would call an API to add the note
        // For now, we'll add it to the notes list
        const notesList = document.getElementById('notes-list');
        if (notesList) {
            const noteItem = document.createElement('div');
            noteItem.className = 'note-item';
            noteItem.innerHTML = `
                <div class="note-header">
                    <span class="note-author">Admin User</span>
                    <span class="note-date">${new Date().toLocaleString()}</span>
                </div>
                <div class="note-content">${noteContent}</div>
            `;
            notesList.prepend(noteItem);
        }
        
        // Reset form
        form.reset();
        
        this.showNotification('Note added successfully', 'success');
    }
    
    handleSaveChanges() {
        // In a real application, this would save all changes made in the modal
        // For now, we'll just show a success notification
        this.showNotification('Changes saved successfully', 'success');
        
        // Close modal
        this.closeModal();
    }
    
    async loadFundingStats() {
        try {
            // In a real application, this would be an API call
            // For now, we'll use the hardcoded stats
            this.updateStats(this.stats);
        } catch (error) {
            console.error('Failed to load funding stats:', error);
            this.showError('Failed to load funding statistics');
        }
    }
    
    updateStats(stats) {
        // Update the stats in the summary bar
        document.querySelectorAll('.summary-stat').forEach(statElement => {
            const label = statElement.querySelector('.stat-label').textContent;
            const valueElement = statElement.querySelector('.stat-value');
            
            switch(label) {
                case 'Total Funded':
                    valueElement.textContent = stats.totalFunded;
                    break;
                case 'Active Events':
                    valueElement.textContent = stats.activeEvents;
                    break;
                case 'Completed':
                    valueElement.textContent = stats.completed;
                    break;
                case 'ROI':
                    valueElement.textContent = stats.roi;
                    break;
            }
        });
    }

    async loadFunding() {
        try {
            // TODO: Replace with actual API call
            this.funding = [
                {
                    id: 'FND-001',
                    eventTitle: 'Tech Conference 2025',
                    organizer: 'John Smith',
                    amount: '₦15M',
                    status: 'active',
                    date: '2025-06-20T10:30:00Z',
                    roi: '22%'
                },
                {
                    id: 'FND-002',
                    eventTitle: 'Startup Summit',
                    organizer: 'Sarah Johnson',
                    amount: '₦8M',
                    status: 'completed',
                    date: '2025-05-19T14:15:00Z',
                    roi: '18%'
                },
                {
                    id: 'FND-003',
                    eventTitle: 'AI Workshop Series',
                    organizer: 'Michael Chen',
                    amount: '₦12M',
                    status: 'active',
                    date: '2025-06-18T09:00:00Z',
                    roi: '15%'
                },
                {
                    id: 'FND-004',
                    eventTitle: 'Fintech Expo',
                    organizer: 'Amanda Williams',
                    amount: '₦20M',
                    status: 'active',
                    date: '2025-06-25T11:00:00Z',
                    roi: '25%'
                },
                {
                    id: 'FND-005',
                    eventTitle: 'Blockchain Summit',
                    organizer: 'David Lee',
                    amount: '₦10M',
                    status: 'pending',
                    date: '2025-07-05T09:30:00Z',
                    roi: '20%'
                }
            ];

            // Only render table if the table body exists
            if (this.tableBody) {
                this.renderTable();
                console.log('Table rendered with funding data:', this.funding);
            } else {
                console.error('Table body element not found');
            }
        } catch (error) {
            console.error('Failed to load funding data:', error);
            this.showError('Failed to load funding data');
        }
    }

    getFilteredFunding() {
        if (!this.funding) return [];
        
        return this.funding.filter(item => {
            // Filter by search query
            const searchMatch = !this.searchQuery || 
                item.id.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                item.eventTitle.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                item.organizer.toLowerCase().includes(this.searchQuery.toLowerCase());
            
            // Filter by status
            const statusMatch = !this.statusFilter || item.status === this.statusFilter;
            
            return searchMatch && statusMatch;
        }).sort((a, b) => {
            // Sort by selected field
            let aValue = a[this.sortField];
            let bValue = b[this.sortField];
            
            // Handle date comparison
            if (this.sortField === 'date') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            }
            
            // Compare values
            if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }

    renderTable(data = this.getFilteredFunding()) {
        if (!this.tableBody) {
            console.error('Table body element not found');
            return;
        }
        
        if (!this.rowTemplate) {
            console.error('Row template not found');
            
            // Create a fallback row template if the template is missing
            const tempTemplate = document.createElement('template');
            tempTemplate.innerHTML = `
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td><span class="status-badge"></span></td>
                    <td></td>
                    <td></td>
                    <td class="row-actions">
                        <button class="action-btn disburse-milestone" title="Disburse Milestone">
                            <span class="icon">📤</span>
                        </button>
                        <button class="action-btn view-financial-report" title="View Financial Report">
                            <span class="icon">🧾</span>
                        </button>
                        <button class="action-btn mark-repayment-complete" title="Mark Repayment Complete">
                            <span class="icon">✅</span>
                        </button>
                        <button class="action-btn update-disbursement-info" title="Update Disbursement Info">
                            <span class="icon">✏️</span>
                        </button>
                    </td>
                </tr>
            `;
            this.rowTemplate = tempTemplate;
        }
        
        const filteredFunding = data;
        this.tableBody.innerHTML = '';

        if (filteredFunding.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.className = 'empty-state';
            emptyRow.innerHTML = `
                <td colspan="8" class="text-center">
                    <div class="empty-state-content">
                        <span class="empty-icon">📭</span>
                        <h3>No Funding Data Found</h3>
                        <p>No active funding matches your current filters.</p>
                    </div>
                </td>
            `;
            this.tableBody.appendChild(emptyRow);
            this.updatePagination(0);
            return;
        }

        // Calculate pagination
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const paginatedFunding = filteredFunding.slice(start, end);

        // Render rows
        paginatedFunding.forEach(item => {
            // Create a new row
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.id}</td>
                <td>${item.eventTitle}</td>
                <td>${item.organizer}</td>
                <td>${item.amount}</td>
                <td><span class="status-badge ${item.status}">${this.getStatusLabel(item.status)}</span></td>
                <td>${new Date(item.date).toLocaleDateString()}</td>
                <td>${item.roi}</td>
                <td class="row-actions">
                    <button class="action-btn disburse-milestone" title="Disburse Milestone">
                        <span class="icon">📤</span>
                    </button>
                    <button class="action-btn view-financial-report" title="View Financial Report">
                        <span class="icon">🧾</span>
                    </button>
                    <button class="action-btn mark-repayment-complete" title="Mark Repayment Complete">
                        <span class="icon">✅</span>
                    </button>
                    <button class="action-btn update-disbursement-info" title="Update Disbursement Info">
                        <span class="icon">✏️</span>
                    </button>
                </td>
            `;
            
            // Add the row to the table
            this.tableBody.appendChild(tr);
            
            // Setup row actions after the row is added to the DOM
            this.setupRowActions(tr, item);
        });

        this.updatePagination(filteredFunding.length);
    }

    updatePagination(totalItems) {
        if (!this.showingStart || !this.showingEnd || !this.totalEntries) return;
        
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        const start = totalItems === 0 ? 0 : (this.currentPage - 1) * this.itemsPerPage + 1;
        const end = Math.min(start + this.itemsPerPage - 1, totalItems);
        
        this.showingStart.textContent = start;
        this.showingEnd.textContent = end;
        this.totalEntries.textContent = totalItems;
        
        // Update page numbers
        if (this.pageNumbers) {
            this.pageNumbers.innerHTML = '';
            for (let i = 1; i <= totalPages; i++) {
                const pageButton = document.createElement('button');
                pageButton.textContent = i;
                pageButton.className = i === this.currentPage ? 'active' : '';
                pageButton.addEventListener('click', () => {
                    this.currentPage = i;
                    this.renderTable();
                });
                this.pageNumbers.appendChild(pageButton);
            }
        }
        
        // Update prev/next buttons
        if (this.prevPageBtn && this.nextPageBtn) {
            this.prevPageBtn.disabled = this.currentPage === 1;
            this.nextPageBtn.disabled = this.currentPage === totalPages || totalPages === 0;
        }
    }

    setupRowActions(row, item) {
        const actionsCell = row.querySelector('.row-actions');
        if (!actionsCell) {
            console.error('Actions cell not found in row', row);
            return;
        }
        
        console.log('Setting up row actions for', item.id, 'with status', item.status);
        console.log('Actions cell content:', actionsCell.innerHTML);
        
        // Disburse milestone button
        const disburseButton = actionsCell.querySelector('.disburse-milestone');
        if (disburseButton) {
            console.log('Found disburse button for', item.id);
            disburseButton.addEventListener('click', () => this.openDisbursementModal(item));
            // Only enable for active funding
            if (item.status !== 'active') {
                disburseButton.disabled = true;
                disburseButton.title += ' (Not available)';
                disburseButton.classList.add('disabled');
            }
        } else {
            console.error('Disburse button not found for', item.id);
        }
        
        // View financial report button
        const viewReportButton = actionsCell.querySelector('.view-financial-report');
        if (viewReportButton) {
            viewReportButton.addEventListener('click', () => this.viewFinancialReport(item));
        } else {
            console.error('View report button not found for', item.id);
        }
        
        // Mark repayment complete button
        const markCompleteButton = actionsCell.querySelector('.mark-repayment-complete');
        if (markCompleteButton) {
            markCompleteButton.addEventListener('click', () => this.markRepaymentComplete(item));
            // Only enable for active funding
            if (item.status !== 'active') {
                markCompleteButton.disabled = true;
                markCompleteButton.title += ' (Not available)';
                markCompleteButton.classList.add('disabled');
            }
        } else {
            console.error('Mark complete button not found for', item.id);
        }
        
        // Update disbursement info button
        const updateInfoButton = actionsCell.querySelector('.update-disbursement-info');
        if (updateInfoButton) {
            updateInfoButton.addEventListener('click', () => this.updateDisbursementInfo(item));
        } else {
            console.error('Update info button not found for', item.id);
        }
    }

    openDisbursementModal(item) {
        console.log('Opening disbursement modal for:', item);
        // Get the modal
        const modal = document.getElementById('funding-detail-modal');
        if (!modal) return;
        
        // Set the modal title
        const modalTitle = modal.querySelector('#modal-event-title');
        if (modalTitle) {
            modalTitle.textContent = `${item.eventTitle} - Disbursement`;
        }
        
        // Switch to disbursement tab
        const tabButtons = modal.querySelectorAll('.tab-btn');
        const tabPanes = modal.querySelectorAll('.tab-pane');
        
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabPanes.forEach(pane => pane.classList.remove('active'));
        
        const disbursementTabBtn = modal.querySelector('[data-tab="disbursement-tab"]');
        const disbursementTab = modal.querySelector('#disbursement-tab');
        
        if (disbursementTabBtn && disbursementTab) {
            disbursementTabBtn.classList.add('active');
            disbursementTab.classList.add('active');
        }
        
        // Populate form fields if needed
        const amountInput = modal.querySelector('#disbursement-amount');
        if (amountInput) {
            // Extract numeric value from amount string (e.g., "₦15M" -> 15000000)
            const numericValue = this.parseAmountToNumber(item.amount);
            const suggestedAmount = Math.round(numericValue / 3); // Suggest 1/3 of total as milestone payment
            amountInput.value = suggestedAmount;
        }
        
        // Show the modal
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    viewFinancialReport(item) {
        console.log('Viewing financial report for:', item);
        // In a real application, this would open a financial report
        // For now, we'll show a notification
        this.showNotification(`Financial report for ${item.eventTitle} would open here`, 'info');
    }
    
    markRepaymentComplete(item) {
        console.log('Marking repayment complete for:', item);
        
        // Create confirmation dialog
        const confirmDialog = document.createElement('div');
        confirmDialog.className = 'confirmation-dialog';
        confirmDialog.innerHTML = `
            <div class="confirmation-content">
                <h3>Confirm Repayment</h3>
                <p>Are you sure you want to mark the repayment for <strong>${item.eventTitle}</strong> as complete?</p>
                <p>This will update the funding status and generate a completion report.</p>
                <div class="confirmation-actions">
                    <button class="secondary-button cancel-btn">Cancel</button>
                    <button class="primary-button confirm-btn">Confirm Repayment</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(confirmDialog);
        
        // Handle confirmation actions
        confirmDialog.querySelector('.cancel-btn').addEventListener('click', () => {
            confirmDialog.remove();
        });
        
        confirmDialog.querySelector('.confirm-btn').addEventListener('click', () => {
            // In a real application, this would call an API to update the funding status
            // For now, we'll update the local data and re-render
            const fundingIndex = this.funding.findIndex(f => f.id === item.id);
            if (fundingIndex !== -1) {
                this.funding[fundingIndex].status = 'completed';
                this.renderTable();
                this.showNotification(`Repayment for ${item.eventTitle} marked as complete`, 'success');
            }
            confirmDialog.remove();
        });
    }
    
    updateDisbursementInfo(item) {
        console.log('Updating disbursement info for:', item);
        // Get the modal
        const modal = document.getElementById('funding-detail-modal');
        if (!modal) return;
        
        // Set the modal title
        const modalTitle = modal.querySelector('#modal-event-title');
        if (modalTitle) {
            modalTitle.textContent = `${item.eventTitle} - Update Info`;
        }
        
        // Populate modal fields with item data
        this.populateModalFields(modal, item);
        
        // Show the modal
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    populateModalFields(modal, item) {
        // Overview tab fields
        const eventTitle = modal.querySelector('#event-title');
        const organizerName = modal.querySelector('#organizer-name');
        const totalFunding = modal.querySelector('#total-funding');
        const fundingStatus = modal.querySelector('#funding-status');
        const startDate = modal.querySelector('#start-date');
        const endDate = modal.querySelector('#end-date');
        const roiValue = modal.querySelector('#roi-value');
        const progressFill = modal.querySelector('#progress-fill');
        const progressText = modal.querySelector('#progress-text');
        const eventDescription = modal.querySelector('#event-description');
        
        if (eventTitle) eventTitle.textContent = item.eventTitle;
        if (organizerName) organizerName.textContent = item.organizer;
        if (totalFunding) totalFunding.textContent = item.amount;
        
        if (fundingStatus) {
            fundingStatus.textContent = this.getStatusLabel(item.status);
            fundingStatus.className = `status-badge ${item.status}`;
        }
        
        // Mock data for other fields
        const mockStartDate = new Date(item.date);
        const mockEndDate = new Date(mockStartDate);
        mockEndDate.setMonth(mockEndDate.getMonth() + 3); // 3 months duration
        
        if (startDate) startDate.textContent = mockStartDate.toLocaleDateString();
        if (endDate) endDate.textContent = mockEndDate.toLocaleDateString();
        if (roiValue) roiValue.textContent = item.roi;
        
        // Calculate progress based on dates
        const now = new Date();
        const totalDuration = mockEndDate - mockStartDate;
        const elapsed = now - mockStartDate;
        const progress = Math.min(Math.max(Math.round((elapsed / totalDuration) * 100), 0), 100);
        
        if (progressFill) progressFill.style.width = `${progress}%`;
        if (progressText) progressText.textContent = `${progress}% Complete`;
        
        // Mock event description
        if (eventDescription) {
            eventDescription.textContent = `This is a ${item.eventTitle} organized by ${item.organizer}. The event has received funding of ${item.amount} with an expected ROI of ${item.roi}.`;
        }
    }
    
    parseAmountToNumber(amountString) {
        // Remove currency symbol and parse the number
        const numericPart = amountString.replace(/[^\d.]/g, '');
        const multiplier = amountString.includes('M') ? 1000000 : 
                          amountString.includes('K') ? 1000 : 1;
        return parseFloat(numericPart) * multiplier;
    }
    
    showNotification(message, type = 'info') {
        // Create and show notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        let icon = '💬';
        if (type === 'success') icon = '✅';
        if (type === 'error') icon = '⚠️';
        if (type === 'warning') icon = '⚠️';
        
        notification.innerHTML = `
            <span class="notification-icon">${icon}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            notification.classList.add('dismissing');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
        
        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.add('dismissing');
            setTimeout(() => notification.remove(), 300);
        });
    }
    
    getStatusLabel(status) {
        switch (status) {
            case 'active': return 'Active';
            case 'completed': return 'Completed';
            case 'pending': return 'Pending';
            default: return status.charAt(0).toUpperCase() + status.slice(1);
        }
    }
    
    showError(message) {
        // Create and show error notification
        const notification = document.createElement('div');
        notification.className = 'notification error';
        notification.innerHTML = `
            <span class="notification-icon">⚠️</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            notification.classList.add('dismissing');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
        
        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.add('dismissing');
            setTimeout(() => notification.remove(), 300);
        });
    }
    
    handleLogout() {
        // In a real application, this would handle the logout process
        console.log('Logging out...');
        window.location.href = '../index.html';
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

    openFundingDetailModal(item, tab = 'overview-tab') {
        this.currentFundingItem = item;
        const modal = document.getElementById('funding-detail-modal');
        
        // Populate overview tab
        document.getElementById('modal-event-title').textContent = item.title;
        document.getElementById('overview-title').textContent = item.title;
        document.getElementById('overview-organizer').textContent = item.organizer;
        document.getElementById('overview-budget').textContent = `₦${item.totalBudget.toLocaleString()}`;
        document.getElementById('overview-status').textContent = item.status;
        document.getElementById('overview-summary').textContent = item.summary || 'No summary available';
        
        // Populate milestones tab
        this.populateMilestonesTable(item.milestones);
        
        // Setup tabs
        this.setupModalTabs(tab);
        
        // Show modal
        modal.style.display = 'block';
    }
    
    populateMilestonesTable(milestones) {
        const tableBody = document.getElementById('milestone-table-body');
        tableBody.innerHTML = '';
        
        milestones.forEach(milestone => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${milestone.name}</td>
                <td>₦${milestone.amount.toLocaleString()}</td>
                <td>${milestone.purpose}</td>
                <td>${milestone.releaseDate}</td>
                <td><span class="status-badge ${milestone.status.toLowerCase()}">${milestone.status}</span></td>
            `;
            tableBody.appendChild(row);
        });
    }
    
    setupModalTabs(activeTab) {
        const tabBtns = document.querySelectorAll('#funding-detail-modal .tab-btn');
        const tabPanes = document.querySelectorAll('#funding-detail-modal .tab-pane');
        
        // Reset all tabs
        tabBtns.forEach(btn => btn.classList.remove('active'));
        tabPanes.forEach(pane => pane.classList.remove('active'));
        
        // Activate requested tab
        const activeBtn = document.querySelector(`#funding-detail-modal .tab-btn[data-tab="${activeTab}"]`);
        const activePane = document.getElementById(activeTab);
        
        if (activeBtn && activePane) {
            activeBtn.classList.add('active');
            activePane.classList.add('active');
        }
        
        // Add tab click handlers
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.getAttribute('data-tab');
                this.setupModalTabs(tabId);
            });
        });
    }
    
    viewFinancialReport(item) {
        this.openFundingDetailModal(item, 'documents-tab');
    }
    
    updateDisbursementInfo(item) {
        this.openFundingDetailModal(item, 'milestones-tab');
    }
}

// Initialize Funding Management only if on funding page
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('funding.html')) {
        new FundingManagement();
    }
});
