const Complaint = require("../models/Complaint");
const OfficerRatings = require("../models/OfficerRatings")
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError, UnauthenticatedError } = require("../errors");
const User = require("../models/User");
const Officer = require("../models/Officer");
const {
  roleAuthenticationMiddleware,
} = require("../middleware/roleAuthentication");
var nodemailer = require("nodemailer");
// Twilio configuration replaced by environment variables
// const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const getAllComplaints = async (req, res) => {
  const complaints = await Complaint.find({ createdBy: req.user.userId }).sort(
    "createdAt"
  );
  res.status(StatusCodes.OK).json({ count: complaints.length, complaints });
};

const getComplaint = async (req, res) => {
  const {
    user: { userId },
    params: { id: complaintId },
  } = req;

  const complaint = await Complaint.findOne({
    _id: complaintId,
    createdBy: userId,
  });
  if (!complaint) {
    throw new NotFoundError("Complaint not found");
  }
  res.status(StatusCodes.OK).json({ complaint });
};

const reopenTask = async (req, res) => {
  const {
    user: { userId },
    params: { id: complaintId },
  } = req;

  const complaint = await Complaint.findById(complaintId);
  const officer = await Officer.findById(complaint.officerID);

  // console.log(complaint)
  // console.log(userId)

  if (!complaint) {
    throw new NotFoundError("complaint not found");
  }
  if (complaint.status !== "resolved") {
    throw new BadRequestError("Complaint is already opened")
  }
  if (complaint.reopensCount >= 3) {
    throw new BadRequestError("Cannot reopen complaint more than 3 times")
  }

  if (complaint.createdBy != userId) {
    throw new UnauthenticatedError("not authorized to update this task");
  }

  if (req.body.status === complaint.status && !req.body.feedback) {
    throw new BadRequestError("Duplicate changes not allowed. Add valid feedback or change status.")
  }

  await complaint.updateStatus("pending");
  await complaint.addFeedback(
    officer.name,
    officer.level,
    "Complaint reopened by citizen."
  );

  await complaint.incrementReopens();

  const bod = `The complaint "${complaint.subject}" has been reopened by the citizen. Please resolve it as soon as possible!`;

  await sendEmail(officer.email, complaint.subject, bod, "Reopened Grievance");

  res.status(StatusCodes.OK).json({ complaint });
};

const createComplaint = async (req, res) => {
  try {
    req.body.createdBy = req.user.userId;

    const user = await User.findOne({ _id: req.user.userId });

    const officer = await Officer.findOne({
      district: user.district,
      level: 1,
      department: req.body.department,
    });

    if (!officer) {
      throw new NotFoundError("No officer in this district");
    }

    // Préparer les données de la plainte
    const complaintData = {
      subject: req.body.subject,
      description: req.body.description,
      department: req.body.department,
      createdBy: req.user.userId
    };

    // Ajouter la géolocalisation si présente
    if (req.body.location) {
      try {
        const locationData = typeof req.body.location === 'string'
          ? JSON.parse(req.body.location)
          : req.body.location;
        complaintData.location = locationData;
      } catch (err) {
        console.error('Erreur parsing location:', err);
      }
    }

    // Ajouter l'analyse Gemini si présente
    if (req.body.geminiAnalysis) {
      try {
        const analysisData = typeof req.body.geminiAnalysis === 'string'
          ? JSON.parse(req.body.geminiAnalysis)
          : req.body.geminiAnalysis;
        complaintData.geminiAnalysis = analysisData;
      } catch (err) {
        console.error('Erreur parsing geminiAnalysis:', err);
      }
    }

    // Ajouter les médias si présents
    if (req.files) {
      complaintData.media = {
        photos: [],
        videos: [],
        audio: []
      };

      // Photos
      if (req.files.photos) {
        complaintData.media.photos = req.files.photos.map(file => ({
          url: `/uploads/images/${file.filename}`,
          filename: file.filename,
          uploadedAt: new Date()
        }));
      }

      // Vidéos
      if (req.files.videos) {
        complaintData.media.videos = req.files.videos.map(file => ({
          url: `/uploads/videos/${file.filename}`,
          filename: file.filename,
          uploadedAt: new Date()
        }));
      }

      // Audio
      if (req.files.audio) {
        complaintData.media.audio = req.files.audio.map(file => ({
          url: `/uploads/audio/${file.filename}`,
          filename: file.filename,
          uploadedAt: new Date()
        }));
      }
    }

    const complaint = await Complaint.create(complaintData);
    await complaint.assignOfficer(officer._id);
    await complaint.assignEmail(user.email);
    await complaint.addFeedback(
      officer.name,
      officer.level,
      "Complaint received"
    );

    res.status(StatusCodes.CREATED).json({ complaint });
  } catch (error) {
    console.error('Erreur création plainte:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: error.message,
      message: "Erreur lors de la création de la plainte"
    });
  }
};


const deleteComplaint = async (req, res) => {
  const {
    user: { userId },
    params: { id: complaintId },
  } = req;

  const complaint = await Complaint.findByIdAndRemove({
    _id: complaintId,
    createdBy: userId,
  });

  if (!complaint) {
    throw new NotFoundError("Complaint not found");
  }
  if (complaint.status === 'resolved') {
    throw new BadRequestError("Cannot delete a resolved complaint")
  }

  await Complaint.deleteOne({ _id: complaintId });
  res.status(StatusCodes.OK).json({ complaint });
};

const sendReminder = async (req, res) => {
  const {
    user: { userId },
    params: { id: complaintId },
  } = req;
  const complaint = await Complaint.findByIdAndUpdate(
    complaintId,
    { lastRemindedAt: Date.now() },
    { new: true, runValidators: true }
  );
  if (complaint.status === "resolved") {
    throw new BadRequestError("Complaint is already resolved");
  }

  const officer = await Officer.findOne({ _id: complaint.officerID });

  if (!officer) {
    throw new NotFoundError("No officer assigned to this complaint");
  }

  await complaint.addFeedback(
    officer.name,
    officer.level,
    "Reminder mail received by assigned officer."
  );

  const bod = `Gentle reminder regarding the complaint "${complaint.subject}". Please resolve it as soon as possible!`;

  await sendEmail(officer.email, complaint.subject, bod, "Reminder about Grievance");

  res.status(StatusCodes.OK).json({ complaint });
};

const rateOfficer = async (req, res) => {
  const {
    user: { userId },
    params: { id: complaintId },
  } = req;
  // console.log(req);
  const numberofstars = req.body.rating;
  const complaint = await Complaint.findOne({ _id: complaintId });

  if (complaint.status !== "resolved") {
    throw new BadRequestError("Can't give feedback unless complaint is resolved.");
  }
  if (complaint.isRated) {
    throw new BadRequestError("Complaint already rated.")
  }

  const officer = await Officer.findOne({ _id: complaint.officerID });


  const officerRating = await OfficerRatings.findOne({ OfficerId: complaint.officerID });

  // console.log(officerRating);
  await officerRating.addRating(numberofstars, complaintId, userId);
  await complaint.setRated(numberofstars);

  const bod = `You have been rated! \nComplaint subject : ${complaint.subject} \nRating : ${numberofstars}`;

  await sendEmail(officer.email, complaint.subject, bod, "You have been rated!");

  res.status(StatusCodes.OK).json({ officer });
};

const sendEmail = async (to, subject, body, head) => {
  try {
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: 'grievanceportaliiita4@gmail.com',
        pass: 'bryoccqsbhkhnhah',
      },
    });

    let info = await transporter.sendMail({
      from: ' "Grievance Portal" <grievanceportal25@gmail.com>',
      to: to,
      subject: head,
      text: `Message from grievance portal: ${body}`,
    });

    console.log("Message sent: %s", info.messageId);
  } catch (err) {
    console.error(err);
  }
};

// const sendSMS = async (to, body) => {
//   try {
//     const message = await client.messages.create({
//       body: body,
//       from: '+15075162002',
//       to: to
//     });

//     console.log('Message sent: %s', message.sid);
//   } catch (err) {
//     console.error(err);
//   }
// };


module.exports = {
  getAllComplaints,
  getComplaint,
  createComplaint,
  deleteComplaint,
  sendReminder,
  reopenTask,
  rateOfficer,
};

// const updateUserComplaint = async (req, res) => {
//     const {
//         body: { description },
//         user: { userId },
//         params: { id: complaintId },
//     } = req

//     if (description === '') {
//         throw new BadRequestError('Please fill in description')
//     }
//     const complaint = await Complaint.findByIdAndUpdate({ _id: complaintId, createdBy: userId }, req.body, { new: true, runValidators: true })
//     if (!complaint) {
//         throw new NotFoundError('complaint not found')
//     }
//     res.status(StatusCodes.OK).json({ complaint })
// }
