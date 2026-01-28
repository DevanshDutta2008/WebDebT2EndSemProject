// ===== EXPENSE TRACKER CLASS =====
class ExpenseTracker {
    constructor() {
        this.currentDate = new Date();
        this.currentMonth = this.currentDate.getMonth();
        this.currentYear = this.currentDate.getFullYear();
        this.currentTransactionType = 'expense';
        this.isDarkMode = false;
        
        // Default budget for each new month
        this.DEFAULT_BUDGET = 12000;
        
        this.categories = [
            { id: 1, name: 'Food', icon: '🍔', color: 'category-food', budget: 3000 },
            { id: 2, name: 'Transport', icon: '🚌', color: 'category-transport', budget: 1000 },
            { id: 3, name: 'Academic', icon: '📚', color: 'category-academic', budget: 1500 },
            { id: 4, name: 'Entertainment', icon: '🎬', color: 'category-entertainment', budget: 2000 },
            { id: 5, name: 'Personal', icon: '👕', color: 'category-personal', budget: 1000 },
            { id: 6, name: 'Health', icon: '🏥', color: 'category-health', budget: 500 },
            { id: 7, name: 'Recharges', icon: '📱', color: 'category-recharge', budget: 500 },
            { id: 8, name: 'Housing', icon: '🏠', color: 'category-housing', budget: 3000 },
            { id: 9, name: 'Shopping', icon: '🛍️', color: 'category-shopping', budget: 2000 },
            { id: 10, name: 'Miscellaneous', icon: '📦', color: 'category-misc', budget: 1000 }
        ];
        
        this.incomeCategories = [
            { id: 101, name: 'Allowance', icon: '💰', color: 'success' },
            { id: 102, name: 'Part-time Job', icon: '💼', color: 'success' },
            { id: 103, name: 'Scholarship', icon: '🏆', color: 'success' },
            { id: 104, name: 'Gift', icon: '🎁', color: 'success' },
            { id: 105, name: 'Other Income', icon: '💸', color: 'success' }
        ];
        
        this.monthlyBudget = this.DEFAULT_BUDGET;
        
        // Initialize data
        this.loadData();
        
        // Chart instances
        this.expenseChart = null;
        this.trendChart = null;
    }
    
    // Load data from localStorage
    loadData() {
        // Load transactions
        const savedTransactions = localStorage.getItem('expense_tracker_transactions');
        this.transactions = savedTransactions ? JSON.parse(savedTransactions) : [];
        
        // Load monthly budgets
        const savedBudgets = localStorage.getItem('expense_tracker_budgets');
        this.monthlyBudgets = savedBudgets ? JSON.parse(savedBudgets) : {};
        
        // Load theme
        const savedTheme = localStorage.getItem('expense_tracker_theme');
        if (savedTheme === 'dark') {
            document.body.setAttribute('data-theme', 'dark');
            this.isDarkMode = true;
        }
        
        // Initialize current month's budget
        this.initCurrentMonthBudget();
    }
    
    // Save data to localStorage
    saveData() {
        localStorage.setItem('expense_tracker_transactions', JSON.stringify(this.transactions));
        localStorage.setItem('expense_tracker_budgets', JSON.stringify(this.monthlyBudgets));
        localStorage.setItem('expense_tracker_theme', this.isDarkMode ? 'dark' : 'light');
    }
    
    // Initialize current month's budget
    initCurrentMonthBudget() {
        const monthKey = `${this.currentYear}-${this.currentMonth}`;
        if (!this.monthlyBudgets[monthKey]) {
            this.monthlyBudgets[monthKey] = this.DEFAULT_BUDGET;
        }
        this.monthlyBudget = this.monthlyBudgets[monthKey];
    }
    
    // RESET ALL DATA
    resetAllData() {
        // Reset transactions
        this.transactions = [];
        
        // Reset monthly budgets to default
        this.monthlyBudgets = {};
        this.monthlyBudget = this.DEFAULT_BUDGET;
        
        // Initialize current month's budget
        this.initCurrentMonthBudget();
        
        // Save to localStorage
        this.saveData();
        
        return {
            success: true,
            message: 'All data has been reset successfully! All transactions removed and budgets reset to ₹12,000.'
        };
    }
    
    // Get month name
    getMonthName() {
        return this.currentDate.toLocaleDateString('en-IN', { 
            month: 'long', 
            year: 'numeric' 
        });
    }
    
    // Get formatted date
    getFormattedDate() {
        return this.currentDate.toLocaleDateString('en-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }
    
    // Navigate to previous month
    prevMonth() {
        this.currentMonth--;
        if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        }
        this.currentDate = new Date(this.currentYear, this.currentMonth);
        this.initCurrentMonthBudget();
    }
    
    // Navigate to next month
    nextMonth() {
        this.currentMonth++;
        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        }
        this.currentDate = new Date(this.currentYear, this.currentMonth);
        this.initCurrentMonthBudget();
    }
    
    // Get transactions for current month
    getCurrentMonthTransactions() {
        return this.transactions.filter(transaction => {
            const transDate = new Date(transaction.date);
            return transDate.getMonth() === this.currentMonth && 
                   transDate.getFullYear() === this.currentYear;
        });
    }
    
    // Get filtered transactions
    getFilteredTransactions(filter = 'all') {
        const transactions = this.getCurrentMonthTransactions();
        if (filter === 'all') return transactions;
        return transactions.filter(t => t.type === filter);
    }
    
    // Add new transaction
    addTransaction(transaction) {
        const newTransaction = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ...transaction
        };
        
        this.transactions.unshift(newTransaction);
        this.saveData();
        return newTransaction;
    }
    
    // Delete transaction
    deleteTransaction(id) {
        const index = this.transactions.findIndex(t => t.id === id);
        if (index !== -1) {
            this.transactions.splice(index, 1);
            this.saveData();
            return true;
        }
        return false;
    }
    
    // Update monthly budget
    updateMonthlyBudget(amount) {
        const monthKey = `${this.currentYear}-${this.currentMonth}`;
        this.monthlyBudgets[monthKey] = amount;
        this.monthlyBudget = amount;
        this.saveData();
    }
    
    // Get monthly summary
    getMonthlySummary() {
        const transactions = this.getCurrentMonthTransactions();
        
        const income = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const expense = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const spentPercentage = this.monthlyBudget > 0 ? (expense / this.monthlyBudget) * 100 : 0;
        
        return {
            income,
            expense,
            remaining: Math.max(0, this.monthlyBudget - expense),
            spentPercentage: Math.min(spentPercentage, 100),
            balance: income - expense,
            transactionCount: transactions.length,
            overBudget: expense > this.monthlyBudget
        };
    }
    
    // Get category spending
    getCategorySpending() {
        const transactions = this.getCurrentMonthTransactions();
        const expenseTransactions = transactions.filter(t => t.type === 'expense');
        
        const categoryMap = {};
        
        // Initialize all categories
        this.categories.forEach(category => {
            categoryMap[category.name] = {
                spent: 0,
                budget: category.budget,
                color: this.getCategoryColor(category.color),
                icon: category.icon
            };
        });
        
        // Add spending data
        expenseTransactions.forEach(transaction => {
            if (categoryMap[transaction.category]) {
                categoryMap[transaction.category].spent += transaction.amount;
            }
        });
        
        return categoryMap;
    }
    
    // Get category color
    getCategoryColor(colorClass) {
        const colorMap = {
            'category-food': '#f1c40f',
            'category-transport': '#3498db',
            'category-academic': '#9b59b6',
            'category-entertainment': '#e74c3c',
            'category-personal': '#1abc9c',
            'category-health': '#e67e22',
            'category-recharge': '#1abc9c',
            'category-housing': '#34495e',
            'category-shopping': '#9b59b6',
            'category-misc': '#95a5a6'
        };
        return colorMap[colorClass] || '#95a5a6';
    }
    
    // Get monthly trend data
    getMonthlyTrendData() {
        const months = [];
        const incomeData = [];
        const expenseData = [];
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date(this.currentYear, this.currentMonth - i);
            const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
            
            // Get month name
            months.push(date.toLocaleDateString('en-IN', { month: 'short' }));
            
            // Get transactions for this month
            const monthTransactions = this.transactions.filter(t => {
                const transDate = new Date(t.date);
                return transDate.getMonth() === date.getMonth() && 
                       transDate.getFullYear() === date.getFullYear();
            });
            
            const income = monthTransactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);
            
            const expense = monthTransactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);
            
            incomeData.push(income);
            expenseData.push(expense);
        }
        
        return { months, incomeData, expenseData };
    }
    
    // Format currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }
    
    // Format date
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short'
        });
    }
    
    // Get category icon
    getCategoryIcon(categoryName) {
        const category = [...this.categories, ...this.incomeCategories]
            .find(c => c.name === categoryName);
        return category ? category.icon : '💰';
    }
    
    // Get category color class
    getCategoryColorClass(categoryName) {
        const category = this.categories.find(c => c.name === categoryName);
        return category ? category.color : 'category-misc';
    }
}

// ===== UI CONTROLLER =====
class UIController {
    constructor(tracker) {
        this.tracker = tracker;
        this.currentTransactionId = null;
        this.chartType = 'pie'; // Default chart type
        
        this.initElements();
        this.initEventListeners();
        this.initCharts();
        this.render();
    }
    
    initElements() {
        // DOM Elements
        this.elements = {
            // Date and month
            todayDate: document.getElementById('todayDate').querySelector('span'),
            currentMonth: document.getElementById('currentMonth'),
            
            // Stats
            monthlyBudget: document.getElementById('monthlyBudget'),
            totalSpent: document.getElementById('totalSpent'),
            remainingAmount: document.getElementById('remainingAmount'),
            currentBalance: document.getElementById('currentBalance'),
            spentProgress: document.getElementById('spentProgress'),
            spentPercentage: document.getElementById('spentPercentage'),
            
            // Buttons
            prevMonth: document.getElementById('prevMonth'),
            nextMonth: document.getElementById('nextMonth'),
            themeToggle: document.getElementById('themeToggle'),
            resetBtn: document.getElementById('resetBtn'),
            editBudgetBtn: document.getElementById('editBudgetBtn'),
            fab: document.getElementById('fab'),
            viewAllBtn: document.getElementById('viewAllBtn'),
            
            // Form elements
            transactionForm: document.getElementById('transactionForm'),
            typeButtons: document.querySelectorAll('.type-btn'),
            amountInput: document.getElementById('amount'),
            categorySelect: document.getElementById('category'),
            descriptionInput: document.getElementById('description'),
            dateInput: document.getElementById('date'),
            clearFormBtn: document.getElementById('clearForm'),
            
            // Filter
            transactionFilter: document.getElementById('transactionFilter'),
            
            // Lists
            transactionsList: document.getElementById('transactionsList'),
            categoriesGrid: document.getElementById('categoriesGrid'),
            filteredCount: document.getElementById('filteredCount'),
            
            // Modals
            budgetModal: document.getElementById('budgetModal'),
            newBudgetInput: document.getElementById('newBudget'),
            saveBudgetBtn: document.getElementById('saveBudgetBtn'),
            closeBudgetModal: document.getElementById('closeBudgetModal'),
            cancelBudgetBtn: document.getElementById('cancelBudgetBtn'),
            
            transactionDetailModal: document.getElementById('transactionDetailModal'),
            detailTitle: document.getElementById('detailTitle'),
            transactionDetails: document.getElementById('transactionDetails'),
            closeDetailModal: document.getElementById('closeDetailModal'),
            closeDetailBtn: document.getElementById('closeDetailBtn'),
            deleteTransactionBtn: document.getElementById('deleteTransactionBtn'),
            
            // Reset modal
            resetModal: document.getElementById('resetModal'),
            closeResetModal: document.getElementById('closeResetModal'),
            cancelResetBtn: document.getElementById('cancelResetBtn'),
            confirmResetBtn: document.getElementById('confirmResetBtn'),
            confirmResetInput: document.getElementById('confirmReset'),
            
            // Chart controls
            chartTypeSelect: document.getElementById('chartType'),
            
            // Charts
            expenseChartCanvas: document.getElementById('expenseChart'),
            trendChartCanvas: document.getElementById('trendChart')
        };
        
        // Get chart contexts
        this.expenseChartCtx = this.elements.expenseChartCanvas.getContext('2d');
        this.trendChartCtx = this.elements.trendChartCanvas.getContext('2d');
    }
    
    initEventListeners() {
        // Month navigation
        this.elements.prevMonth.addEventListener('click', () => {
            this.tracker.prevMonth();
            this.render();
        });
        
        this.elements.nextMonth.addEventListener('click', () => {
            this.tracker.nextMonth();
            this.render();
        });
        
        // Theme toggle
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Budget edit
        this.elements.editBudgetBtn.addEventListener('click', () => this.showBudgetModal());
        this.elements.fab.addEventListener('click', () => this.showTransactionForm());
        
        // Form type toggle
        this.elements.typeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.tracker.currentTransactionType = e.currentTarget.dataset.type;
                this.updateFormType();
            });
        });
        
        // Form submission
        this.elements.transactionForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        this.elements.clearFormBtn.addEventListener('click', () => this.clearForm());
        
        // Date input - set max to today
        const today = new Date().toISOString().split('T')[0];
        this.elements.dateInput.max = today;
        this.elements.dateInput.value = today;
        
        // Filter change
        this.elements.transactionFilter.addEventListener('change', () => this.renderTransactions());
        
        // View all transactions
        this.elements.viewAllBtn.addEventListener('click', () => this.showAllTransactions());
        
        // Budget modal
        this.elements.saveBudgetBtn.addEventListener('click', () => this.saveBudget());
        this.elements.closeBudgetModal.addEventListener('click', () => this.hideBudgetModal());
        this.elements.cancelBudgetBtn.addEventListener('click', () => this.hideBudgetModal());
        
        // Detail modal
        this.elements.closeDetailModal.addEventListener('click', () => this.hideDetailModal());
        this.elements.closeDetailBtn.addEventListener('click', () => this.hideDetailModal());
        this.elements.deleteTransactionBtn.addEventListener('click', () => this.deleteCurrentTransaction());
        
        // RESET FUNCTIONALITY
        this.elements.resetBtn.addEventListener('click', () => this.showResetModal());
        this.elements.closeResetModal.addEventListener('click', () => this.hideResetModal());
        this.elements.cancelResetBtn.addEventListener('click', () => this.hideResetModal());
        this.elements.confirmResetBtn.addEventListener('click', () => this.confirmReset());
        this.elements.confirmResetInput.addEventListener('input', (e) => {
            this.validateResetConfirmation(e.target.value);
        });
        
        // Chart type change
        this.elements.chartTypeSelect.addEventListener('change', (e) => {
            this.chartType = e.target.value;
            this.updateChart();
        });
        
        // Close modals on outside click
        window.addEventListener('click', (e) => {
            if (e.target === this.elements.budgetModal) this.hideBudgetModal();
            if (e.target === this.elements.transactionDetailModal) this.hideDetailModal();
            if (e.target === this.elements.resetModal) this.hideResetModal();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl+Alt+R for reset
            if (e.ctrlKey && e.altKey && e.key === 'r') {
                e.preventDefault();
                this.showResetModal();
            }
            
            // Escape to close modals
            if (e.key === 'Escape') {
                this.hideBudgetModal();
                this.hideDetailModal();
                this.hideResetModal();
            }
        });
    }
    
    initCharts() {
        // Destroy existing charts if they exist
        if (this.expenseChart) {
            this.expenseChart.destroy();
        }
        if (this.trendChart) {
            this.trendChart.destroy();
        }
        
        // Create new charts
        this.createExpenseChart();
        this.createTrendChart();
    }
    
    createExpenseChart() {
        // Clear previous chart completely
        this.expenseChartCtx.clearRect(0, 0, this.elements.expenseChartCanvas.width, this.elements.expenseChartCanvas.height);
        
        this.expenseChart = new Chart(this.expenseChartCtx, {
            type: this.chartType,
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [],
                    borderColor: this.tracker.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    borderWidth: 1,
                    hoverOffset: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 15,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            font: {
                                size: 11
                            },
                            color: this.tracker.isDarkMode ? '#d1e0ff' : '#334155'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${this.tracker.formatCurrency(value)} (${percentage}%)`;
                            }
                        },
                        titleFont: {
                            size: 12
                        },
                        bodyFont: {
                            size: 11
                        },
                        backgroundColor: this.tracker.isDarkMode ? 'rgba(30, 30, 46, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                        titleColor: this.tracker.isDarkMode ? '#ffffff' : '#000000',
                        bodyColor: this.tracker.isDarkMode ? '#e8f1ff' : '#334155'
                    }
                },
                animation: {
                    duration: 800,
                    animateScale: true,
                    animateRotate: true
                }
            }
        });
    }
    
    createTrendChart() {
        this.trendChart = new Chart(this.trendChartCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Income',
                        data: [],
                        borderColor: '#2ecc71',
                        backgroundColor: 'rgba(46, 204, 113, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.3
                    },
                    {
                        label: 'Expenses',
                        data: [],
                        borderColor: '#e74c3c',
                        backgroundColor: 'rgba(231, 76, 60, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            padding: 10,
                            usePointStyle: true,
                            font: {
                                size: 11
                            },
                            color: this.tracker.isDarkMode ? '#d1e0ff' : '#334155'
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        titleFont: {
                            size: 12
                        },
                        bodyFont: {
                            size: 11
                        },
                        backgroundColor: this.tracker.isDarkMode ? 'rgba(30, 30, 46, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                        titleColor: this.tracker.isDarkMode ? '#ffffff' : '#000000',
                        bodyColor: this.tracker.isDarkMode ? '#e8f1ff' : '#334155'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: this.tracker.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            callback: (value) => this.tracker.formatCurrency(value),
                            font: {
                                size: 10
                            },
                            color: this.tracker.isDarkMode ? '#8da8c7' : '#64748b'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 10
                            },
                            color: this.tracker.isDarkMode ? '#8da8c7' : '#64748b'
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'nearest'
                }
            }
        });
    }
    
    updateChart() {
        // Destroy and recreate chart to fix background issue
        if (this.expenseChart) {
            this.expenseChart.destroy();
        }
        this.createExpenseChart();
        this.updateChartsData();
    }
    
    updateFormType() {
        // Update active button
        this.elements.typeButtons.forEach(btn => {
            if (btn.dataset.type === this.tracker.currentTransactionType) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // Update category options
        this.updateCategoryOptions();
    }
    
    updateCategoryOptions() {
        const categories = this.tracker.currentTransactionType === 'expense' 
            ? this.tracker.categories 
            : this.tracker.incomeCategories;
        
        this.elements.categorySelect.innerHTML = '';
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = `${category.icon} ${category.name}`;
            this.elements.categorySelect.appendChild(option);
        });
    }
    
    handleFormSubmit(e) {
        e.preventDefault();
        
        const amount = parseFloat(this.elements.amountInput.value);
        const type = this.tracker.currentTransactionType;
        const category = this.elements.categorySelect.value;
        const description = this.elements.descriptionInput.value.trim() || 'No description';
        const date = this.elements.dateInput.value;
        
        // Validation
        if (!amount || amount <= 0) {
            this.showNotification('Please enter a valid amount', 'error');
            return;
        }
        
        if (!category) {
            this.showNotification('Please select a category', 'error');
            return;
        }
        
        // Check if date is in the future
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);
        
        if (selectedDate > today) {
            this.showNotification('Cannot add transactions for future dates!', 'error');
            return;
        }
        
        // Add transaction
        this.tracker.addTransaction({
            type,
            amount,
            category,
            description,
            date
        });
        
        // Update UI
        this.render();
        this.clearForm();
        
        // Show success message
        this.showNotification(
            `${type === 'income' ? 'Income' : 'Expense'} added successfully!`,
            'success'
        );
    }
    
    clearForm() {
        this.elements.amountInput.value = '';
        this.elements.descriptionInput.value = '';
        const today = new Date().toISOString().split('T')[0];
        this.elements.dateInput.value = today;
        this.elements.amountInput.focus();
    }
    
    showBudgetModal() {
        this.elements.newBudgetInput.value = this.tracker.monthlyBudget;
        this.elements.budgetModal.classList.add('active');
    }
    
    hideBudgetModal() {
        this.elements.budgetModal.classList.remove('active');
    }
    
    saveBudget() {
        const newBudget = parseInt(this.elements.newBudgetInput.value);
        if (newBudget > 0) {
            this.tracker.updateMonthlyBudget(newBudget);
            this.render();
            this.hideBudgetModal();
            this.showNotification('Budget updated successfully!', 'success');
        }
    }
    
    showTransactionForm() {
        this.elements.amountInput.focus();
    }
    
    showTransactionDetails(transaction) {
        this.currentTransactionId = transaction.id;
        
        this.elements.detailTitle.textContent = 'Transaction Details';
        
        const details = `
            <div class="transaction-detail">
                <div class="detail-item">
                    <span class="detail-label">Type:</span>
                    <span class="detail-value ${transaction.type}">
                        <i class="fas fa-${transaction.type === 'income' ? 'plus' : 'minus'}-circle"></i>
                        ${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                    </span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Amount:</span>
                    <span class="detail-value ${transaction.type}">
                        ${transaction.type === 'expense' ? '-' : '+'}${this.tracker.formatCurrency(transaction.amount)}
                    </span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Category:</span>
                    <span class="detail-value">
                        ${this.tracker.getCategoryIcon(transaction.category)} ${transaction.category}
                    </span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Description:</span>
                    <span class="detail-value">${transaction.description}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Date:</span>
                    <span class="detail-value">${this.tracker.formatDate(transaction.date)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Time:</span>
                    <span class="detail-value">
                        ${new Date(transaction.timestamp).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </span>
                </div>
            </div>
        `;
        
        this.elements.transactionDetails.innerHTML = details;
        this.elements.transactionDetailModal.classList.add('active');
    }
    
    hideDetailModal() {
        this.elements.transactionDetailModal.classList.remove('active');
        this.currentTransactionId = null;
    }
    
    deleteCurrentTransaction() {
        if (this.currentTransactionId && confirm('Are you sure you want to delete this transaction?')) {
            if (this.tracker.deleteTransaction(this.currentTransactionId)) {
                this.render();
                this.hideDetailModal();
                this.showNotification('Transaction deleted successfully!', 'success');
            }
        }
    }
    
    showAllTransactions() {
        const transactions = this.tracker.getCurrentMonthTransactions();
        if (transactions.length === 0) {
            this.showNotification('No transactions for this month!', 'info');
            return;
        }
        
        let message = `All Transactions for ${this.tracker.getMonthName()}:\n\n`;
        transactions.forEach((t, i) => {
            const sign = t.type === 'expense' ? '-' : '+';
            const date = this.tracker.formatDate(t.date);
            message += `${i + 1}. ${date} - ${t.description} ${sign}${this.tracker.formatCurrency(t.amount)}\n`;
        });
        
        alert(message);
    }
    
    // RESET FUNCTIONALITY METHODS
    showResetModal() {
        this.elements.resetModal.classList.add('active');
        this.elements.confirmResetInput.value = '';
        this.elements.confirmResetBtn.disabled = true;
        this.elements.confirmResetInput.classList.remove('error', 'success');
        this.elements.confirmResetInput.focus();
    }
    
    hideResetModal() {
        this.elements.resetModal.classList.remove('active');
        this.elements.confirmResetInput.value = '';
        this.elements.confirmResetInput.classList.remove('error', 'success');
        this.elements.confirmResetBtn.disabled = true;
    }
    
    validateResetConfirmation(input) {
        const confirmBtn = this.elements.confirmResetBtn;
        const inputField = this.elements.confirmResetInput;
        
        if (input.trim().toUpperCase() === 'RESET') {
            confirmBtn.disabled = false;
            inputField.classList.remove('error');
            inputField.classList.add('success');
        } else {
            confirmBtn.disabled = true;
            inputField.classList.remove('success');
            if (input.trim() !== '') {
                inputField.classList.add('error');
            } else {
                inputField.classList.remove('error');
            }
        }
    }
    
    confirmReset() {
        const result = this.tracker.resetAllData();
        
        if (result.success) {
            // Hide modal
            this.hideResetModal();
            
            // Update UI
            this.render();
            
            // Show success message
            this.showNotification(result.message, 'success');
            
            // Add visual feedback
            this.animateResetEffect();
        } else {
            this.showNotification('Failed to reset data. Please try again.', 'error');
        }
    }
    
    animateResetEffect() {
        // Add a brief flash animation to indicate reset
        const container = document.querySelector('.container');
        container.style.transition = 'opacity 0.3s';
        container.style.opacity = '0.5';
        
        setTimeout(() => {
            container.style.opacity = '1';
            
            // Add success animation to stats
            const statCards = document.querySelectorAll('.stat-card');
            statCards.forEach((card, index) => {
                card.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    card.style.transform = 'scale(1)';
                    card.style.transition = 'transform 0.3s ease';
                }, index * 100);
            });
        }, 300);
        
        setTimeout(() => {
            container.style.transition = '';
        }, 600);
    }
    
    toggleTheme() {
        this.tracker.isDarkMode = !this.tracker.isDarkMode;
        
        if (this.tracker.isDarkMode) {
            document.body.setAttribute('data-theme', 'dark');
            this.elements.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            this.elements.themeToggle.title = 'Switch to Light Mode';
        } else {
            document.body.removeAttribute('data-theme');
            this.elements.themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            this.elements.themeToggle.title = 'Switch to Dark Mode';
        }
        
        this.tracker.saveTheme();
        this.updateChartsTheme();
    }
    
    updateChartsTheme() {
        // Recreate charts with new theme colors
        this.initCharts();
        this.updateChartsData();
    }
    
    updateChartsData() {
        // Update expense chart
        const categorySpending = this.tracker.getCategorySpending();
        const categories = Object.keys(categorySpending).filter(name => categorySpending[name].spent > 0);
        const amounts = categories.map(name => categorySpending[name].spent);
        const colors = categories.map(name => categorySpending[name].color);
        
        if (this.expenseChart) {
            this.expenseChart.data.labels = categories;
            this.expenseChart.data.datasets[0].data = amounts;
            this.expenseChart.data.datasets[0].backgroundColor = colors;
            
            // Update chart type if needed
            if (this.expenseChart.config.type !== this.chartType) {
                this.expenseChart.config.type = this.chartType;
            }
            
            this.expenseChart.update();
        }
        
        // Update trend chart
        const trendData = this.tracker.getMonthlyTrendData();
        if (this.trendChart) {
            this.trendChart.data.labels = trendData.months;
            this.trendChart.data.datasets[0].data = trendData.incomeData;
            this.trendChart.data.datasets[1].data = trendData.expenseData;
            this.trendChart.update();
        }
    }
    
    render() {
        this.renderDate();
        this.renderStats();
        this.renderTransactions();
        this.renderCategories();
        this.updateChartsData();
    }
    
    renderDate() {
        // Today's date
        const today = new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        this.elements.todayDate.textContent = today;
        
        // Current month
        this.elements.currentMonth.textContent = this.tracker.getMonthName();
    }
    
    renderStats() {
        const summary = this.tracker.getMonthlySummary();
        
        this.elements.monthlyBudget.textContent = this.tracker.formatCurrency(this.tracker.monthlyBudget);
        this.elements.totalSpent.textContent = this.tracker.formatCurrency(summary.expense);
        this.elements.remainingAmount.textContent = this.tracker.formatCurrency(summary.remaining);
        this.elements.currentBalance.textContent = this.tracker.formatCurrency(summary.balance);
        
        // Update progress bar
        const percentage = Math.min(summary.spentPercentage, 100);
        this.elements.spentProgress.style.width = `${percentage}%`;
        this.elements.spentPercentage.textContent = `${Math.round(percentage)}%`;
        
        // Change progress bar color based on percentage
        if (percentage >= 100) {
            this.elements.spentProgress.style.background = 'linear-gradient(to right, #ff4757, #c0392b)';
        } else if (percentage > 80) {
            this.elements.spentProgress.style.background = 'linear-gradient(to right, #ffa726, #f39c12)';
        } else {
            this.elements.spentProgress.style.background = 'linear-gradient(to right, var(--primary), var(--secondary))';
        }
        
        // Add warning class if over budget
        const spentCard = document.querySelector('.stat-card.spent');
        if (summary.overBudget) {
            spentCard.classList.add('over-budget');
        } else {
            spentCard.classList.remove('over-budget');
        }
    }
    
    renderTransactions() {
        const filter = this.elements.transactionFilter.value;
        const transactions = this.tracker.getFilteredTransactions(filter);
        
        this.elements.filteredCount.textContent = transactions.length;
        
        if (transactions.length === 0) {
            this.elements.transactionsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-receipt fa-3x"></i>
                    <h4>No Transactions Found</h4>
                    <p>No ${filter === 'all' ? '' : filter} transactions for this month</p>
                </div>
            `;
            return;
        }
        
        this.elements.transactionsList.innerHTML = transactions.map(transaction => `
            <div class="transaction-item ${transaction.type}" 
                 data-id="${transaction.id}"
                 onclick="ui.showTransactionDetails(${JSON.stringify(transaction).replace(/"/g, '&quot;')})">
                <div class="transaction-icon ${this.tracker.getCategoryColorClass(transaction.category)}">
                    ${this.tracker.getCategoryIcon(transaction.category)}
                </div>
                <div class="transaction-details">
                    <div class="transaction-title">${transaction.description}</div>
                    <div class="transaction-meta">
                        <span>${transaction.category}</span>
                        <span>•</span>
                        <span>${this.tracker.formatDate(transaction.date)}</span>
                    </div>
                </div>
                <div class="transaction-amount ${transaction.type}">
                    ${transaction.type === 'expense' ? '-' : '+'}${this.tracker.formatCurrency(transaction.amount)}
                </div>
            </div>
        `).join('');
    }
    
    renderCategories() {
        const categorySpending = this.tracker.getCategorySpending();
        
        const categoriesHTML = Object.entries(categorySpending).map(([name, data]) => {
            const percentage = data.budget > 0 ? Math.round((data.spent / data.budget) * 100) : 0;
            const remaining = Math.max(0, data.budget - data.spent);
            const isOverBudget = data.spent > data.budget;
            
            return `
                <div class="category-item ${this.tracker.getCategoryColorClass(name)} ${isOverBudget ? 'over-budget' : ''}">
                    <div class="category-header">
                        <div class="category-icon">
                            ${data.icon}
                        </div>
                        <div class="category-name">${name}</div>
                    </div>
                    <div class="category-amount">
                        ${this.tracker.formatCurrency(data.spent)}
                    </div>
                    <div class="category-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${Math.min(percentage, 100)}%"></div>
                        </div>
                        <span>${percentage}% of ${this.tracker.formatCurrency(data.budget)}</span>
                    </div>
                </div>
            `;
        }).join('');
        
        this.elements.categoriesGrid.innerHTML = categoriesHTML || 
            '<div class="empty-state"><i class="fas fa-tags"></i><p>No expenses yet</p></div>';
    }
    
    showNotification(message, type = 'info') {
        // Remove existing notification
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
        
        // Add to document
        document.body.appendChild(notification);
        
        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
}

// ===== INITIALIZE APP =====
let tracker, ui;

document.addEventListener('DOMContentLoaded', () => {
    tracker = new ExpenseTracker();
    ui = new UIController(tracker);
    
    // Make available globally for debugging
    window.tracker = tracker;
    window.ui = ui;
    
    // Initialize form type
    ui.updateFormType();
    
    console.log('Expense Tracker loaded successfully! 💰');
});