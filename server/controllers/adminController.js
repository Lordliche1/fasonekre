const Department = require('../models/Department');
const Service = require('../models/Service');
const User = require('../models/User');
const Officer = require('../models/Officer');
const Complaint = require('../models/Complaint');

// @desc    Get dashboard statistics
// @route   GET /api/v1/admin/dashboard/stats
// @access  Private (Admin only)
exports.getDashboardStats = async (req, res) => {
    try {
        // Compter les citoyens
        const citizensCount = await User.countDocuments();

        // Compter les départements
        const departmentsCount = await Department.countDocuments({ isActive: true });

        // Compter les services
        const servicesCount = await Service.countDocuments({ isActive: true });

        // Compter les responsables (In-Charge)
        const inChargeCount = await Officer.countDocuments({ isActive: true });

        // Statistiques des requêtes par statut
        const requestStats = await Complaint.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Transformer les stats en objet
        const statusCounts = {
            open: 0,
            inProgress: 0,
            archived: 0,
            completed: 0
        };

        requestStats.forEach(stat => {
            const status = stat._id.toLowerCase();
            if (status === 'pending' || status === 'submitted') {
                statusCounts.open += stat.count;
            } else if (status === 'in progress' || status === 'assigned') {
                statusCounts.inProgress += stat.count;
            } else if (status === 'archived') {
                statusCounts.archived += stat.count;
            } else if (status === 'resolved' || status === 'completed') {
                statusCounts.completed += stat.count;
            }
        });

        res.status(200).json({
            success: true,
            data: {
                citizens: citizensCount,
                departments: departmentsCount,
                services: servicesCount,
                inCharge: inChargeCount,
                requests: {
                    open: statusCounts.open,
                    inProgress: statusCounts.inProgress,
                    archived: statusCounts.archived,
                    completed: statusCounts.completed,
                    total: Object.values(statusCounts).reduce((a, b) => a + b, 0)
                }
            }
        });
    } catch (error) {
        console.error('Error getting dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des statistiques',
            error: error.message
        });
    }
};

// @desc    Get all citizens
// @route   GET /api/v1/admin/citizens
// @access  Private (Admin only)
exports.getCitizens = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const citizens = await User.find()
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await User.countDocuments();

        res.status(200).json({
            success: true,
            data: citizens,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error getting citizens:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des citoyens',
            error: error.message
        });
    }
};

// @desc    Get citizen by ID with stats
// @route   GET /api/v1/admin/citizens/:id
// @access  Private (Admin only)
exports.getCitizenById = async (req, res) => {
    try {
        const citizen = await User.findById(req.params.id).select('-password');

        if (!citizen) {
            return res.status(404).json({
                success: false,
                message: 'Citoyen non trouvé'
            });
        }

        // Obtenir les statistiques de plaintes du citoyen
        const complaintsStats = await Complaint.aggregate([
            { $match: { user: citizen._id } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const totalComplaints = await Complaint.countDocuments({ user: citizen._id });

        res.status(200).json({
            success: true,
            data: {
                citizen,
                stats: {
                    total: totalComplaints,
                    byStatus: complaintsStats
                }
            }
        });
    } catch (error) {
        console.error('Error getting citizen:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du citoyen',
            error: error.message
        });
    }
};

// @desc    Update citizen status
// @route   PUT /api/v1/admin/citizens/:id/status
// @access  Private (Admin only)
exports.updateCitizenStatus = async (req, res) => {
    try {
        const { isActive } = req.body;

        const citizen = await User.findByIdAndUpdate(
            req.params.id,
            { isActive },
            { new: true, runValidators: true }
        ).select('-password');

        if (!citizen) {
            return res.status(404).json({
                success: false,
                message: 'Citoyen non trouvé'
            });
        }

        res.status(200).json({
            success: true,
            data: citizen
        });
    } catch (error) {
        console.error('Error updating citizen status:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour du statut',
            error: error.message
        });
    }
};

// @desc    Create a new citizen
// @route   POST /api/v1/admin/citizens
// @access  Private (Admin only)
exports.createCitizen = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // Vérifier si l'utilisateur existe déjà
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'Un utilisateur avec cet email existe déjà'
            });
        }

        // Créer l'utilisateur
        const user = await User.create({
            name,
            email,
            password,
            phone,
            role: 'user', // Forcer le rôle à user
            isActive: true
        });

        res.status(201).json({
            success: true,
            data: user,
            message: 'Citoyen créé avec succès'
        });
    } catch (error) {
        console.error('Error creating citizen:', error);
        // Gestion des erreurs de duplication (ex: téléphone)
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({
                success: false,
                message: `Un utilisateur avec ce ${field} existe déjà`,
                error: error.message
            });
        }
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création du citoyen',
            error: error.message
        });
    }
};

module.exports = exports;
