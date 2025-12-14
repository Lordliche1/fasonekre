const Complaint = require('../models/Complaint');
const ServiceMan = require('../models/ServiceMan');
const Officer = require('../models/Officer');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError } = require('../errors');

// Récupérer toutes les plaintes du département
const getDepartmentComplaints = async (req, res) => {
    try {
        // Récupérer l'officer (chef de département)
        const officer = await Officer.findById(req.user.userId);

        if (!officer) {
            throw new NotFoundError('Officer not found');
        }

        // Récupérer toutes les plaintes du département
        const complaints = await Complaint.find({ department: officer.department })
            .populate('createdBy', 'name email phone')
            .populate('department')
            .populate('assignedServiceMan', 'name status specialization')
            .populate('interventionReport')
            .sort('-createdAt');

        res.status(StatusCodes.OK).json({
            count: complaints.length,
            complaints
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
    }
};

// Récupérer une plainte spécifique
const getComplaint = async (req, res) => {
    try {
        const { id } = req.params;
        const officer = await Officer.findById(req.user.userId);

        const complaint = await Complaint.findOne({
            _id: id,
            department: officer.department
        })
            .populate('createdBy', 'name email phone')
            .populate('department')
            .populate('assignedServiceMan')
            .populate('interventionReport');

        if (!complaint) {
            throw new NotFoundError('Complaint not found');
        }

        res.status(StatusCodes.OK).json({ complaint });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
    }
};

// Assigner un ServiceMan à une plainte
const assignServiceMan = async (req, res) => {
    try {
        const { id } = req.params;
        const { servicemanId } = req.body;

        if (!servicemanId) {
            throw new BadRequestError('Please provide serviceman ID');
        }

        // Vérifier que la plainte existe
        const complaint = await Complaint.findById(id);
        if (!complaint) {
            throw new NotFoundError('Complaint not found');
        }

        // Vérifier que le ServiceMan existe
        const serviceman = await ServiceMan.findById(servicemanId);
        if (!serviceman) {
            throw new NotFoundError('ServiceMan not found');
        }

        // Assigner le ServiceMan
        await complaint.assignServiceMan(
            servicemanId,
            req.user.userId,
            'Officer'
        );

        // Mettre à jour le statut du ServiceMan
        await serviceman.updateStatus('busy');

        res.status(StatusCodes.OK).json({
            message: 'ServiceMan assigned successfully',
            complaint
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
    }
};

// Récupérer tous les ServiceMen du département
const getServiceMen = async (req, res) => {
    try {
        const officer = await Officer.findById(req.user.userId);

        const servicemen = await ServiceMan.find({ department: officer.department })
            .populate('department')
            .select('-password')
            .sort('-createdAt');

        res.status(StatusCodes.OK).json({
            count: servicemen.length,
            servicemen
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
    }
};

// Ajouter un ServiceMan
const addServiceMan = async (req, res) => {
    try {
        const officer = await Officer.findById(req.user.userId);

        const servicemanData = {
            ...req.body,
            department: officer.department,
            assignedBy: req.user.userId,
            assignedByModel: 'Officer'
        };

        const serviceman = await ServiceMan.create(servicemanData);

        res.status(StatusCodes.CREATED).json({
            message: 'ServiceMan created successfully',
            serviceman: {
                name: serviceman.name,
                email: serviceman.email,
                specialization: serviceman.specialization,
                status: serviceman.status
            }
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
    }
};

// Mettre à jour un ServiceMan
const updateServiceMan = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const serviceman = await ServiceMan.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        ).select('-password');

        if (!serviceman) {
            throw new NotFoundError('ServiceMan not found');
        }

        res.status(StatusCodes.OK).json({
            message: 'ServiceMan updated successfully',
            serviceman
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
    }
};

// Supprimer un ServiceMan
const deleteServiceMan = async (req, res) => {
    try {
        const { id } = req.params;

        const serviceman = await ServiceMan.findByIdAndDelete(id);

        if (!serviceman) {
            throw new NotFoundError('ServiceMan not found');
        }

        res.status(StatusCodes.OK).json({
            message: 'ServiceMan deleted successfully'
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
    }
};

// Statistiques du département
const getDepartmentStats = async (req, res) => {
    try {
        const officer = await Officer.findById(req.user.userId);

        const complaints = await Complaint.find({ department: officer.department });
        const servicemen = await ServiceMan.find({ department: officer.department });

        const stats = {
            complaints: {
                total: complaints.length,
                pending: complaints.filter(c => c.status === 'pending').length,
                assigned: complaints.filter(c => c.assignedServiceMan).length,
                inProgress: complaints.filter(c => c.status === 'in process').length,
                resolved: complaints.filter(c => c.status === 'resolved').length
            },
            servicemen: {
                total: servicemen.length,
                available: servicemen.filter(s => s.status === 'available').length,
                busy: servicemen.filter(s => s.status === 'busy').length,
                offline: servicemen.filter(s => s.status === 'offline').length
            }
        };

        res.status(StatusCodes.OK).json({ stats });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
    }
};

module.exports = {
    getDepartmentComplaints,
    getComplaint,
    assignServiceMan,
    getServiceMen,
    addServiceMan,
    updateServiceMan,
    deleteServiceMan,
    getDepartmentStats
};
