import mongoose from 'mongoose';

/**
 * AdminWallet Model
 * 
 * Singleton model for tracking platform financials.
 * Stores all commissions earned from partner withdrawals.
 */
const adminWalletSchema = new mongoose.Schema({
    // Singleton identifier
    key: {
        type: String,
        default: 'admin_wallet',
        unique: true
    },

    // Current wallet balance (all commissions)
    balance: {
        type: Number,
        default: 0,
        min: 0
    },

    // Lifetime commissions earned
    totalCommissionsEarned: {
        type: Number,
        default: 0
    },

    // Total amount processed through platform
    totalVolumeProcessed: {
        type: Number,
        default: 0
    },

    // Currency
    currency: {
        type: String,
        default: 'INR'
    },

    // Last updated tracking
    lastTransactionAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Static method to get or create the admin wallet
adminWalletSchema.statics.getAdminWallet = async function () {
    let wallet = await this.findOne({ key: 'admin_wallet' });
    if (!wallet) {
        wallet = await this.create({ key: 'admin_wallet' });
    }
    return wallet;
};

// Method to add commission
adminWalletSchema.statics.addCommission = async function (amount, description = '') {
    const wallet = await this.findOneAndUpdate(
        { key: 'admin_wallet' },
        {
            $inc: {
                balance: amount,
                totalCommissionsEarned: amount
            },
            $set: {
                lastTransactionAt: new Date()
            }
        },
        { upsert: true, new: true }
    );
    return wallet;
};

// Method to track processed volume
adminWalletSchema.statics.trackVolume = async function (amount) {
    return this.findOneAndUpdate(
        { key: 'admin_wallet' },
        {
            $inc: { totalVolumeProcessed: amount },
            $set: { lastTransactionAt: new Date() }
        },
        { upsert: true, new: true }
    );
};

export default mongoose.models.AdminWallet || mongoose.model('AdminWallet', adminWalletSchema);
