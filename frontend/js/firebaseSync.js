/**
 * Gen-Z University Accounts & Finance System
 * Firebase Real-time Synchronization Module
 * Connects frontend to Firebase Cloud Firestore for live payment broadcasts and cross-device counter sync.
 */

const genzFirebase = {
  app: null,
  db: null,
  isInitialized: false,
  listenerUnsubscribe: null,
  initialLoadTimestamp: Date.now() - 5000,

  config: {
    apiKey: "AIzaSyBpLQvYjddu0LaEUhPmva08u89eOXKbImg",
    authDomain: "genzuniversity.firebaseapp.com",
    projectId: "genzuniversity",
    storageBucket: "genzuniversity.firebasestorage.app",
    messagingSenderId: "423748552299",
    appId: "1:423748552299:web:8981f1300ad217afd7132e"
  },

  async init() {
    try {
      if (typeof firebase === 'undefined') {
        console.warn('[Firebase] Firebase SDK scripts not loaded yet. Retrying in 1s...');
        setTimeout(() => this.init(), 1000);
        return;
      }

      // Initialize Firebase App if not already initialized
      if (!firebase.apps || firebase.apps.length === 0) {
        this.app = firebase.initializeApp(this.config);
      } else {
        this.app = firebase.apps[0];
      }

      this.db = firebase.firestore();
      this.isInitialized = true;
      console.log('[Firebase] Connected to Firebase Cloud Firestore.');

      // Update UI Status Badge
      this.renderStatusBadge(true);

      // Start listening to real-time payment events
      this.startRealtimePaymentListener();
    } catch (err) {
      console.warn('[Firebase Connection Notice]:', err.message);
      this.renderStatusBadge(false);
    }
  },

  renderStatusBadge(isConnected) {
    const topbarRight = document.querySelector('.topbar-right');
    if (!topbarRight || document.getElementById('firebaseStatusBadge')) return;

    const badge = document.createElement('div');
    badge.id = 'firebaseStatusBadge';
    badge.className = 'session-badge';
    badge.title = isConnected ? 'Connected to Firebase Cloud Firestore' : 'Firebase Offline / Connecting';
    badge.style.display = 'inline-flex';
    badge.style.alignItems = 'center';
    badge.style.gap = '0.35rem';
    badge.style.fontSize = '0.78rem';
    badge.style.fontWeight = '700';

    if (isConnected) {
      badge.style.background = '#ECFDF5';
      badge.style.borderColor = '#A7F3D0';
      badge.style.color = '#047857';
      badge.innerHTML = `<span class="session-dot" style="background: #10B981; animation: pulse 2s infinite;"></span> Firebase Live`;
    } else {
      badge.style.background = '#FEF2F2';
      badge.style.borderColor = '#FECACA';
      badge.style.color = '#B91C1C';
      badge.innerHTML = `<span class="session-dot" style="background: #EF4444;"></span> Firebase`;
    }

    // Insert next to session badge
    const sessionBadge = topbarRight.querySelector('.session-badge');
    if (sessionBadge) {
      topbarRight.insertBefore(badge, sessionBadge);
    } else {
      topbarRight.prepend(badge);
    }
  },

  startRealtimePaymentListener() {
    if (!this.db) return;

    try {
      this.listenerUnsubscribe = this.db.collection('payments')
        .orderBy('timestamp', 'desc')
        .limit(1)
        .onSnapshot((snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const data = change.doc.data();
              const txnTime = data.timestamp || 0;

              // Only notify if transaction happened after page loaded
              if (txnTime > this.initialLoadTimestamp) {
                this.handleIncomingTransaction(data);
              }
            }
          });
        }, (error) => {
          console.warn('[Firebase Listener Notice]:', error.message);
        });
    } catch (e) {
      console.warn('[Firebase Listener Init Error]:', e.message);
    }
  },

  handleIncomingTransaction(txn) {
    const studentName = txn.student_name || 'Student';
    const rollNo = txn.roll_no || txn.reg_no || '';
    const amount = parseFloat(txn.amount || 0);
    const receiptNo = txn.receipt_no || txn.payment_no || 'REC-NEW';
    const method = txn.payment_method || 'Online';
    const source = txn.source || 'PORTAL';

    // Show Institutional Real-time Toast Notification
    if (typeof ui !== 'undefined' && ui.showToast) {
      ui.showToast(
        `⚡ LIVE FIREBASE SYNC: Payment of ₹${amount.toLocaleString('en-IN')} received from ${studentName} (${rollNo}) via ${method}!`,
        'success',
        6000
      );
    }

    // If Fast Receipt Desk is active, live-prepend to recent counterfoil list
    if (typeof becRealFee !== 'undefined' && becRealFee.recentReceipts) {
      const exists = becRealFee.recentReceipts.some(r => r.receiptNo === receiptNo);
      if (!exists) {
        becRealFee.recentReceipts.unshift({
          id: Date.now(),
          receiptNo: receiptNo,
          studentId: txn.student_id,
          studentName: studentName,
          rollNo: rollNo,
          regNo: txn.reg_no || '',
          branch: txn.branch || 'Engineering',
          amount: amount,
          mode: method,
          category: txn.fee_category || 'Academic Fee',
          refNo: txn.transaction_id || 'ONLINE (PORTAL)',
          timestamp: new Date().toLocaleTimeString('en-IN')
        });

        try {
          sessionStorage.setItem('bec_recent_receipts', JSON.stringify(becRealFee.recentReceipts.slice(0, 30)));
        } catch (e) {}

        becRealFee.renderRecentReceipts();
      }
    }

    // If Executive Dashboard is active, refresh live data
    if (typeof accountsDashboard !== 'undefined' && accountsDashboard.loadMetrics) {
      accountsDashboard.loadMetrics();
    }
  },

  async broadcastPayment(paymentData) {
    if (!this.db) {
      console.warn('[Firebase] Firestore not initialized, skipping client broadcast.');
      return;
    }

    try {
      await this.db.collection('payments').add({
        ...paymentData,
        timestamp: Date.now(),
        created_at: new Date().toISOString()
      });
      console.log('[Firebase] Client payment broadcasted to Firestore successfully.');
    } catch (e) {
      console.warn('[Firebase Broadcast Warning]:', e.message);
    }
  }
};

window.genzFirebase = genzFirebase;
window.becFirebase = genzFirebase;

document.addEventListener('DOMContentLoaded', () => {
  genzFirebase.init();
});
