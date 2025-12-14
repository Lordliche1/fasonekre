const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Le nom du département est requis'],
        unique: true,
        trim: true,
        maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
    },
    description: {
        type: String,
        required: [true, 'La description est requise'],
        maxlength: [500, 'La description ne peut pas dépasser 500 caractères']
    },
    icon: {
        type: String,
        default: 'building'
    },
    color: {
        type: String,
        default: '#6C5CE7'
    },
    inCharge: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Officer',
        default: null
    },
    services: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service'
    }],
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

// Middleware pour mettre à jour updatedAt
DepartmentSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Méthode pour obtenir les statistiques du département
DepartmentSchema.methods.getStats = async function () {
    const Complaint = mongoose.model('Complaint');

    const stats = await Complaint.aggregate([
        { $match: { department: this._id } },
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

module.exports = mongoose.model('Department', DepartmentSchema);
