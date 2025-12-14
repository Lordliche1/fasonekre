const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const ServiceManSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide name'],
        minLength: 3,
        maxLength: 50,
    },
    email: {
        type: String,
        required: [true, 'Please provide email'],
        match: [/^(([^<>()[\]\\.,;:\s@"]+(\\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please provide valid email'],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'Please provide password'],
        minLength: [6, 'Password must be a minimum of 6 characters'],
    },
    phone: {
        type: String,
        required: [true, 'Please provide phone number'],
        minLength: [10, 'Phone number must be a minimum of 10 characters'],
    },
    department: {
        type: mongoose.Types.ObjectId,
        ref: 'Department',
        required: [true, 'Please provide department']
    },
    assignedBy: {
        type: mongoose.Types.ObjectId,
        refPath: 'assignedByModel'
    },
    assignedByModel: {
        type: String,
        enum: ['Admin', 'Officer'] // Officer sera renommé en DepartmentManager plus tard
    },
    district: {
        type: String,
        required: [true, 'Please provide district'],
        minLength: 3,
    },
    specialization: {
        type: String,
        required: false,
        // ex: "Plomberie", "Électricité", "Voirie", "Assainissement"
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'officer', 'serviceman'],
        default: 'serviceman',
    },
    status: {
        type: String,
        enum: ['available', 'busy', 'offline'],
        default: 'available'
    },
    currentLocation: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            index: '2dsphere'
        },
        lastUpdated: Date
    },
    stats: {
        totalInterventions: {
            type: Number,
            default: 0
        },
        completedInterventions: {
            type: Number,
            default: 0
        },
        averageRating: {
            type: Number,
            default: 0
        },
        averageResponseTime: {
            type: Number,
            default: 0 // en minutes
        }
    }
}, { timestamps: true });

// Hash password avant sauvegarde
ServiceManSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Méthodes
ServiceManSchema.methods.getName = function () {
    return this.name;
};

ServiceManSchema.methods.createJWT = function () {
    return jwt.sign(
        { userId: this._id, name: this.name, role: this.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
};

ServiceManSchema.methods.comparePassword = async function (candidatePassword) {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
};

ServiceManSchema.methods.updateLocation = async function (longitude, latitude) {
    this.currentLocation = {
        type: 'Point',
        coordinates: [longitude, latitude],
        lastUpdated: new Date()
    };
    await this.save();
};

ServiceManSchema.methods.updateStatus = async function (status) {
    this.status = status;
    await this.save();
};

ServiceManSchema.methods.incrementStats = async function (completed = false, rating = null, responseTime = null) {
    this.stats.totalInterventions += 1;
    if (completed) {
        this.stats.completedInterventions += 1;
    }
    if (rating) {
        const totalRatings = this.stats.totalInterventions;
        this.stats.averageRating = ((this.stats.averageRating * (totalRatings - 1)) + rating) / totalRatings;
    }
    if (responseTime) {
        const totalTimes = this.stats.totalInterventions;
        this.stats.averageResponseTime = ((this.stats.averageResponseTime * (totalTimes - 1)) + responseTime) / totalTimes;
    }
    await this.save();
};

module.exports = mongoose.model('ServiceMan', ServiceManSchema);
