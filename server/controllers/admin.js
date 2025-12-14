const Officer = require('../models/Officer')
const Admin = require('../models/Admin')
const OfficerRatings = require('../models/OfficerRatings')
const Complaint = require('../models/Complaint')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, UnauthenticatedError } = require('../errors/')

const registerOfficer = async (req, res) => {

    try {
        console.log('REGISTER OFFICER START');
        console.log('req.body:', req.body);
        console.log('req.user:', req.user);
        console.log('req.admin:', req.admin);

        const adminId = req.admin?.adminId || req.user?.userId;
        console.log('Using adminId:', adminId);

        if (!adminId) {
            return res.status(401).json({ error: "Authentication failed: No admin ID found in request" });
        }

        const admin = await Admin.findOne({ _id: adminId })
        if (!admin) {
            console.log('Admin not found in DB with ID:', adminId);
            return res.status(404).json({ error: "Admin account not found" });
        }
        console.log('Found Admin:', admin);

        req.body.district = admin.district;

        // Ensure department is just the ID (string) if it came as object
        if (typeof req.body.department === 'object' && req.body.department !== null) {
            req.body.department = req.body.department._id || req.body.department.toString();
        }

        // Check if email already exists
        const existingOfficer = await Officer.findOne({ email: req.body.email });
        if (existingOfficer) {
            return res.status(400).json({ error: "Un responsable avec cet email existe déjà." });
        }

        const user = await Officer.create({ ...req.body });
        const token = user.createJWT();

        try {
            await OfficerRatings.create({
                OfficerId: user._id,
                avgRating: null,
                ratings: [],
            });
        } catch (ratingError) {
            console.error('Error creating ratings block:', ratingError);
            // Non-blocking error, we continue
        }

        res.status(StatusCodes.CREATED).json({ user: { name: user.name }, token });
    } catch (error) {
        console.error('Register Officer Error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ error: "Cet email est déjà utilisé." });
        }
        res.status(400).json({ error: error.message });
    }

}

const deleteOfficer = async (req, res) => {

    try {
        const officer = await Officer.findOne({ _id: req.params.id })
        if (!officer) {
            throw new BadRequestError('No officer found')
        }
        await Officer.deleteOne({ _id: req.params.id })
        await OfficerRatings.deleteOne({ OfficerId: req.params.id })
        res.status(StatusCodes.OK).json({ msg: 'Officer deleted' })
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: error.message })
    }
}


const getAdminDetails = async (req, res) => {

    const admin = await Admin.findOne({ _id: req.admin.adminId })

    res.status(StatusCodes.OK).json({ admin })

}

const getOfficerData = async (req, res) => {
    const admin = await Admin.findOne({ _id: req.admin.adminId })
    const officers = await Officer.find({ district: admin.district })
    data = [];
    for (let i = 0; i < officers.length; i++) {
        let officer = officers[i]

        let tasks = await Complaint.find({ officerID: officer._id })

        let pendingcnt = 0
        let inprocesscnt = 0
        let resolvedcnt = 0
        for (let j = 0; j < tasks.length; j++) {
            if (tasks[j].status === 'pending') pendingcnt++;
            else if (tasks[j].status === 'in process') inprocesscnt++;
            else resolvedcnt++;
        }

        let rating = await OfficerRatings.findOne({ OfficerId: officer._id })
        // console.log(pendingcnt, inprocesscnt, resolvedcnt, rating.avgRating)
        data.push({
            name: officer.name,
            email: officer.email,
            department: officer.department,
            level: officer.level,
            avgRating: rating ? rating.avgRating : 0,
            pendingCount: pendingcnt,
            inProcessCount: inprocesscnt,
            resolvedCount: resolvedcnt,
            _id: officer._id
        })
    }

    res.status(StatusCodes.OK).json({ count: data.length, data })
}

// Mettre à jour un officer
const updateOfficer = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Si password fourni, il sera hashé automatiquement par le middleware pre-save
        const officer = await Officer.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        ).select('-password');

        if (!officer) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: 'Officer not found' });
        }

        res.status(StatusCodes.OK).json({ officer });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
    }
};

// Toggle statut officer
const toggleOfficerStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        const officer = await Officer.findByIdAndUpdate(
            id,
            { isActive },
            { new: true }
        ).select('-password');

        if (!officer) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: 'Officer not found' });
        }

        res.status(StatusCodes.OK).json({ officer });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
    }
};

// Services Management
const Service = require('../models/Service');

const getServices = async (req, res) => {
    try {
        const services = await Service.find().populate('department', 'name icon color');
        res.status(StatusCodes.OK).json({ services });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
    }
};

const createService = async (req, res) => {
    try {
        const service = await Service.create(req.body);
        res.status(StatusCodes.CREATED).json({ service });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
    }
};

const updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const service = await Service.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        ).populate('department', 'name icon color');

        if (!service) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: 'Service not found' });
        }

        res.status(StatusCodes.OK).json({ service });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
    }
};

const deleteService = async (req, res) => {
    try {
        const { id } = req.params;
        const service = await Service.findByIdAndDelete(id);

        if (!service) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: 'Service not found' });
        }

        res.status(StatusCodes.OK).json({ message: 'Service deleted successfully' });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
    }
};


module.exports = {
    registerOfficer,
    getAdminDetails,
    getOfficerData,
    deleteOfficer,
    updateOfficer,
    toggleOfficerStatus,
    getServices,
    createService,
    updateService,
    deleteService
}
