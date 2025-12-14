const mongoose = require('mongoose');

const InterventionReportSchema = new mongoose.Schema({
    complaint: {
        type: mongoose.Types.ObjectId,
        ref: 'Complaint',
        required: [true, 'Please provide complaint ID']
    },
    serviceman: {
        type: mongoose.Types.ObjectId,
        ref: 'ServiceMan',
        required: [true, 'Please provide serviceman ID']
    },
    startTime: {
        type: Date,
        required: [true, 'Please provide start time'],
        default: Date.now
    },
    endTime: {
        type: Date
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            index: '2dsphere'
        },
        address: String,
        capturedAt: Date
    },
    media: {
        photosBefore: [{
            url: String,
            filename: String,
            capturedAt: { type: Date, default: Date.now }
        }],
        photosAfter: [{
            url: String,
            filename: String,
            capturedAt: { type: Date, default: Date.now }
        }],
        videos: [{
            url: String,
            filename: String,
            duration: Number,
            capturedAt: { type: Date, default: Date.now }
        }],
        audioNotes: [{
            url: String,
            filename: String,
            duration: Number,
            capturedAt: { type: Date, default: Date.now }
        }]
    },
    workDescription: {
        type: String,
        required: [true, 'Please provide work description'],
        minLength: 10,
        maxLength: 1000
    },
    materialsUsed: [{
        name: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        unit: {
            type: String,
            required: true // ex: "mètre", "kg", "unité"
        },
        cost: Number
    }],
    timeSpent: {
        type: Number, // en minutes
        required: false
    },
    status: {
        type: String,
        enum: ['in_progress', 'completed', 'requires_followup', 'validated'],
        default: 'in_progress'
    },
    signature: {
        type: String, // Signature numérique ou nom du ServiceMan
        required: false
    },
    citizenFeedback: {
        satisfied: {
            type: Boolean,
            default: null
        },
        comment: {
            type: String,
            maxLength: 500
        },
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        submittedAt: Date
    },
    validatedBy: {
        type: mongoose.Types.ObjectId,
        refPath: 'validatedByModel'
    },
    validatedByModel: {
        type: String,
        enum: ['Admin', 'Officer']
    },
    validatedAt: Date,
    validationNotes: String
}, { timestamps: true });

// Méthodes
InterventionReportSchema.methods.complete = async function () {
    this.endTime = new Date();
    this.status = 'completed';

    // Calculer le temps passé si non fourni
    if (!this.timeSpent && this.startTime) {
        this.timeSpent = Math.round((this.endTime - this.startTime) / (1000 * 60)); // en minutes
    }

    await this.save();
};

InterventionReportSchema.methods.addCitizenFeedback = async function (satisfied, rating, comment) {
    this.citizenFeedback = {
        satisfied,
        rating,
        comment,
        submittedAt: new Date()
    };
    await this.save();
};

InterventionReportSchema.methods.validate = async function (validatorId, validatorModel, notes) {
    this.validatedBy = validatorId;
    this.validatedByModel = validatorModel;
    this.validatedAt = new Date();
    this.validationNotes = notes;
    this.status = 'validated';
    await this.save();
};

InterventionReportSchema.methods.addMedia = async function (mediaType, files) {
    if (!this.media[mediaType]) {
        this.media[mediaType] = [];
    }
    this.media[mediaType].push(...files);
    await this.save();
};

module.exports = mongoose.model('InterventionReport', InterventionReportSchema);
