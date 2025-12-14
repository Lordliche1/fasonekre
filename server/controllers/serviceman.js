const ServiceMan = require('../models/ServiceMan');
const Complaint = require('../models/Complaint');
const InterventionReport = require('../models/InterventionReport');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError, UnauthenticatedError } = require('../errors');

// Auth
const register = async (req, res) => {
    try {
        const serviceman = await ServiceMan.create(req.body);
        const token = serviceman.createJWT();
        res.status(StatusCodes.CREATED).json({
            serviceman: {
                name: serviceman.name,
                email: serviceman.email,
                role: serviceman.role
            },
            token
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new BadRequestError('Please provide email and password');
    }

    const serviceman = await ServiceMan.findOne({ email });

    if (!serviceman) {
        throw new UnauthenticatedError('Invalid credentials');
    }

    const isPasswordCorrect = await serviceman.comparePassword(password);

    if (!isPasswordCorrect) {
        throw new UnauthenticatedError('Invalid credentials');
    }

    const token = serviceman.createJWT();

    res.status(StatusCodes.OK).json({
        serviceman: {
            name: serviceman.name,
            email: serviceman.email,
            role: serviceman.role,
            status: serviceman.status
        },
        token
    });
};

// Profile
const getProfile = async (req, res) => {
    const serviceman = await ServiceMan.findById(req.user.userId)
        .populate('department')
        .select('-password');

    if (!serviceman) {
        throw new NotFoundError('ServiceMan not found');
    }

    res.status(StatusCodes.OK).json({ serviceman });
};

const updateProfile = async (req, res) => {
    const { name, phone, specialization } = req.body;

    const serviceman = await ServiceMan.findByIdAndUpdate(
        req.user.userId,
        { name, phone, specialization },
        { new: true, runValidators: true }
    ).select('-password');

    res.status(StatusCodes.OK).json({ serviceman });
};

const updateLocation = async (req, res) => {
    const { longitude, latitude } = req.body;

    if (!longitude || !latitude) {
        throw new BadRequestError('Please provide longitude and latitude');
    }

    const serviceman = await ServiceMan.findById(req.user.userId);
    await serviceman.updateLocation(longitude, latitude);

    res.status(StatusCodes.OK).json({
        message: 'Location updated',
        location: serviceman.currentLocation
    });
};

const updateStatus = async (req, res) => {
    const { status } = req.body;

    if (!['available', 'busy', 'offline'].includes(status)) {
        throw new BadRequestError('Invalid status');
    }

    const serviceman = await ServiceMan.findById(req.user.userId);
    await serviceman.updateStatus(status);

    res.status(StatusCodes.OK).json({
        message: 'Status updated',
        status: serviceman.status
    });
};

// Complaints
const getMyComplaints = async (req, res) => {
    const complaints = await Complaint.find({ assignedServiceMan: req.user.userId })
        .populate('createdBy', 'name email phone')
        .populate('department')
        .sort('-assignedAt');

    res.status(StatusCodes.OK).json({
        count: complaints.length,
        complaints
    });
};

const getComplaint = async (req, res) => {
    const { id } = req.params;

    const complaint = await Complaint.findOne({
        _id: id,
        assignedServiceMan: req.user.userId
    })
        .populate('createdBy', 'name email phone')
        .populate('department')
        .populate('interventionReport');

    if (!complaint) {
        throw new NotFoundError('Complaint not found or not assigned to you');
    }

    res.status(StatusCodes.OK).json({ complaint });
};

const updateComplaintStatus = async (req, res) => {
    const { id } = req.params;
    const { status, note } = req.body;

    const complaint = await Complaint.findOne({
        _id: id,
        assignedServiceMan: req.user.userId
    });

    if (!complaint) {
        throw new NotFoundError('Complaint not found or not assigned to you');
    }

    await complaint.updateStatus(status);
    await complaint.addToTimeline(
        'in_progress',
        req.user.userId,
        'ServiceMan',
        note || `Status updated to ${status}`
    );

    res.status(StatusCodes.OK).json({ complaint });
};

// Reports
const createReport = async (req, res) => {
    try {
        const { complaintId, workDescription, materialsUsed } = req.body;

        // Vérifier que la plainte est assignée à ce ServiceMan
        const complaint = await Complaint.findOne({
            _id: complaintId,
            assignedServiceMan: req.user.userId
        });

        if (!complaint) {
            throw new NotFoundError('Complaint not found or not assigned to you');
        }

        // Créer le rapport
        const report = await InterventionReport.create({
            complaint: complaintId,
            serviceman: req.user.userId,
            workDescription,
            materialsUsed: materialsUsed ? JSON.parse(materialsUsed) : []
        });

        // Attacher le rapport à la plainte
        await complaint.attachInterventionReport(report._id);
        await complaint.addToTimeline(
            'report_submitted',
            req.user.userId,
            'ServiceMan',
            'Intervention report created'
        );

        res.status(StatusCodes.CREATED).json({ report });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
    }
};

const getMyReports = async (req, res) => {
    const reports = await InterventionReport.find({ serviceman: req.user.userId })
        .populate('complaint')
        .sort('-createdAt');

    res.status(StatusCodes.OK).json({
        count: reports.length,
        reports
    });
};

const getReport = async (req, res) => {
    const { id } = req.params;

    const report = await InterventionReport.findOne({
        _id: id,
        serviceman: req.user.userId
    }).populate('complaint');

    if (!report) {
        throw new NotFoundError('Report not found');
    }

    res.status(StatusCodes.OK).json({ report });
};

const updateReport = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    const report = await InterventionReport.findOneAndUpdate(
        { _id: id, serviceman: req.user.userId },
        updates,
        { new: true, runValidators: true }
    );

    if (!report) {
        throw new NotFoundError('Report not found');
    }

    res.status(StatusCodes.OK).json({ report });
};

const uploadReportMedia = async (req, res) => {
    try {
        const { id } = req.params;

        const report = await InterventionReport.findOne({
            _id: id,
            serviceman: req.user.userId
        });

        if (!report) {
            throw new NotFoundError('Report not found');
        }

        // Ajouter les médias
        if (req.files) {
            if (req.files.photosBefore) {
                const photos = req.files.photosBefore.map(file => ({
                    url: `/uploads/images/${file.filename}`,
                    filename: file.filename,
                    capturedAt: new Date()
                }));
                await report.addMedia('photosBefore', photos);
            }

            if (req.files.photosAfter) {
                const photos = req.files.photosAfter.map(file => ({
                    url: `/uploads/images/${file.filename}`,
                    filename: file.filename,
                    capturedAt: new Date()
                }));
                await report.addMedia('photosAfter', photos);
            }

            if (req.files.videos) {
                const videos = req.files.videos.map(file => ({
                    url: `/uploads/videos/${file.filename}`,
                    filename: file.filename,
                    capturedAt: new Date()
                }));
                await report.addMedia('videos', videos);
            }

            if (req.files.audioNotes) {
                const audio = req.files.audioNotes.map(file => ({
                    url: `/uploads/audio/${file.filename}`,
                    filename: file.filename,
                    capturedAt: new Date()
                }));
                await report.addMedia('audioNotes', audio);
            }
        }

        res.status(StatusCodes.OK).json({
            message: 'Media uploaded successfully',
            report
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
    }
};

const completeReport = async (req, res) => {
    const { id } = req.params;

    const report = await InterventionReport.findOne({
        _id: id,
        serviceman: req.user.userId
    });

    if (!report) {
        throw new NotFoundError('Report not found');
    }

    await report.complete();

    // Mettre à jour la plainte
    const complaint = await Complaint.findById(report.complaint);
    await complaint.updateStatus('resolved');
    await complaint.addToTimeline(
        'resolved',
        req.user.userId,
        'ServiceMan',
        'Intervention completed'
    );

    // Mettre à jour les stats du ServiceMan
    const serviceman = await ServiceMan.findById(req.user.userId);
    const responseTime = Math.round((report.endTime - complaint.assignedAt) / (1000 * 60));
    await serviceman.incrementStats(true, null, responseTime);
    await serviceman.updateStatus('available');

    res.status(StatusCodes.OK).json({
        message: 'Report completed successfully',
        report
    });
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    updateLocation,
    updateStatus,
    getMyComplaints,
    getComplaint,
    updateComplaintStatus,
    createReport,
    getMyReports,
    getReport,
    updateReport,
    uploadReportMedia,
    completeReport
};
