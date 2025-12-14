const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Le nom du service est requis'],
        trim: true,
        maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: [true, 'Le département est requis']
    },
    description: {
        type: String,
        maxlength: [500, 'La description ne peut pas dépasser 500 caractères']
    },
    subInCharge: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Officer',
        default: null
    },
    icon: {
        type: String,
        default: 'service'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Index composé pour éviter les doublons nom+département
ServiceSchema.index({ name: 1, department: 1 }, { unique: true });

// Middleware pour mettre à jour updatedAt
ServiceSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Méthode pour obtenir les statistiques du service
ServiceSchema.methods.getStats = async function () {
    const Request = mongoose.model('Request');

    const stats = await Request.aggregate([
        { $match: { service: this._id } },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);

    return {
        total: stats.reduce((acc, curr) => acc + curr.count, 0),
        byStatus: stats.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {})
    };
};

module.exports = mongoose.model('Service', ServiceSchema);
