const mongoose = require("mongoose");
const User = require("./User");

const ComplaintSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: [true, "Please provide subject"],
      maxLength: 50,
    },
    description: {
      type: String,
      required: [true, "Please provide description"],
      maxLength: 500,
    },
    department: {
      type: String,
      required: [true, "Please provide department"],
      enum: ["Health", "Education", "Transport", "Pension", "other"],
    },
    status: {
      type: String,
      enum: ["in process", "resolved", "pending"],
      default: "pending",
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide user id"],
    },
    contact: {
      type: String,
      unique: false,
    },
    officerID: {
      type: mongoose.Types.ObjectId,
      ref: "Officer",
    },
    actionHistory: [
      {
        time: {
          type: Date,
          default: Date.now(),
        },
        officerName: {
          type: String,
          required: [true, "Please provide officer name for action history"],
        },
        officerLevel: {
          type: Number,
          required: [true, "Please provide officer level for action history"],
        },
        feedback: {
          type: String,
          required: [true, "Please provide feedback for action history"],
        },
      },
    ],
    lastRemindedAt: {
      type: Date,
      default: new Date('2022-01-01'),
    },
    isRated: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
    },
    reopenCount: {
      type: Number,
      default: 0,
    },
    // Géolocalisation
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
    // Médias (photos, vidéos, audio)
    media: {
      photos: [{
        url: String,
        filename: String,
        uploadedAt: { type: Date, default: Date.now }
      }],
      videos: [{
        url: String,
        filename: String,
        duration: Number,
        uploadedAt: { type: Date, default: Date.now }
      }],
      audio: [{
        url: String,
        filename: String,
        duration: Number,
        uploadedAt: { type: Date, default: Date.now }
      }]
    },
    // Analyse Gemini AI
    geminiAnalysis: {
      category: String,
      urgency: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical']
      },
      summary: String,
      keywords: [String],
      sentiment: {
        type: String,
        enum: ['positive', 'neutral', 'negative']
      },
      imageAnalysis: {
        problemType: String,
        severity: String,
        description: String,
        safetyConcern: Boolean
      },
      analyzedAt: Date
    },
    // Assignation ServiceMan
    assignedServiceMan: {
      type: mongoose.Types.ObjectId,
      ref: 'ServiceMan'
    },
    assignedBy: {
      type: mongoose.Types.ObjectId,
      refPath: 'assignedByModel'
    },
    assignedByModel: {
      type: String,
      enum: ['Admin', 'Officer']
    },
    assignedAt: Date,
    // Rapport d'intervention
    interventionReport: {
      type: mongoose.Types.ObjectId,
      ref: 'InterventionReport'
    },
    // Timeline des actions
    timeline: [{
      action: {
        type: String,
        enum: ['created', 'assigned_officer', 'assigned_serviceman', 'in_progress', 'report_submitted', 'resolved', 'validated', 'reopened'],
        required: true
      },
      by: {
        type: mongoose.Types.ObjectId,
        required: true
      },
      byModel: {
        type: String,
        enum: ['User', 'Admin', 'Officer', 'ServiceMan'],
        required: true
      },
      at: {
        type: Date,
        default: Date.now
      },
      note: String
    }]
    //
  },
  { timestamps: true }
);

// ComplaintSchema.methods.sendMail = async function (officer) {

// }



ComplaintSchema.methods.assignOfficer = async function (officer) {
  this.officerID = officer;
  await this.save();
};

ComplaintSchema.methods.assignEmail = async function (email) {
  this.contact = email;
  await this.save();
};

ComplaintSchema.methods.addFeedback = async function (officerName, officerLevel, feedback) {
  this.actionHistory.push({ officerName, officerLevel, feedback });
  await this.save();
};

ComplaintSchema.methods.setRated = async function (numberofstars) {
  this.isRated = true;
  this.rating = numberofstars;
  await this.save();
};

ComplaintSchema.methods.updateStatus = async function (status) {
  this.status = status;
  await this.save();
};

ComplaintSchema.methods.incrementReopens = async function () {
  this.reopenCount = this.reopenCount + 1;
  await this.save();
};

ComplaintSchema.methods.assignServiceMan = async function (serviceManId, assignedById, assignedByModel) {
  this.assignedServiceMan = serviceManId;
  this.assignedBy = assignedById;
  this.assignedByModel = assignedByModel;
  this.assignedAt = new Date();
  this.status = 'in process';

  // Ajouter à la timeline
  this.timeline.push({
    action: 'assigned_serviceman',
    by: assignedById,
    byModel: assignedByModel,
    at: new Date(),
    note: `Assigned to ServiceMan ${serviceManId}`
  });

  await this.save();
};

ComplaintSchema.methods.addToTimeline = async function (action, by, byModel, note) {
  this.timeline.push({
    action,
    by,
    byModel,
    at: new Date(),
    note
  });
  await this.save();
};

ComplaintSchema.methods.attachInterventionReport = async function (reportId) {
  this.interventionReport = reportId;
  await this.save();
};

module.exports = mongoose.model("Complaint", ComplaintSchema);

