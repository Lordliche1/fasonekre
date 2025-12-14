const Department = require('../models/Department');
const Service = require('../models/Service');

// @desc    Get all departments
// @route   GET /api/v1/admin/departments
// @access  Private (Admin only)
exports.getAllDepartments = async (req, res) => {
    try {
        const departments = await Department.find()
            .populate('inCharge', 'name email')
            .populate('services')
            .sort({ name: 1 });

        // Ajouter les statistiques pour chaque département
        const departmentsWithStats = await Promise.all(
            departments.map(async (dept) => {
                const stats = await dept.getStats();
                return {
                    ...dept.toObject(),
                    stats
                };
            })
        );

        res.status(200).json({
            success: true,
            count: departments.length,
            data: departmentsWithStats
        });
    } catch (error) {
        console.error('Error getting departments:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des départements',
            error: error.message
        });
    }
};

// @desc    Create new department
// @route   POST /api/v1/admin/departments
// @access  Private (Admin only)
exports.createDepartment = async (req, res) => {
    try {
        const department = await Department.create(req.body);

        res.status(201).json({
            success: true,
            data: department
        });
    } catch (error) {
        console.error('Error creating department:', error);

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Un département avec ce nom existe déjà'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création du département',
            error: error.message
        });
    }
};

// @desc    Update department
// @route   PUT /api/v1/admin/departments/:id
// @access  Private (Admin only)
exports.updateDepartment = async (req, res) => {
    try {
        const department = await Department.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('inCharge', 'name email');

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Département non trouvé'
            });
        }

        res.status(200).json({
            success: true,
            data: department
        });
    } catch (error) {
        console.error('Error updating department:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour du département',
            error: error.message
        });
    }
};

// @desc    Delete department
// @route   DELETE /api/v1/admin/departments/:id
// @access  Private (Admin only)
exports.deleteDepartment = async (req, res) => {
    try {
        const department = await Department.findById(req.params.id);

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Département non trouvé'
            });
        }

        // Vérifier s'il y a des services associés
        const servicesCount = await Service.countDocuments({ department: req.params.id });

        if (servicesCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Impossible de supprimer ce département car il contient ${servicesCount} service(s)`
            });
        }

        await department.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Département supprimé avec succès'
        });
    } catch (error) {
        console.error('Error deleting department:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression du département',
            error: error.message
        });
    }
};

// @desc    Assign In-Charge to department
// @route   PUT /api/v1/admin/departments/:id/assign-incharge
// @access  Private (Admin only)
exports.assignInCharge = async (req, res) => {
    try {
        const { officerId } = req.body;

        const department = await Department.findByIdAndUpdate(
            req.params.id,
            { inCharge: officerId },
            { new: true, runValidators: true }
        ).populate('inCharge', 'name email');

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Département non trouvé'
            });
        }

        res.status(200).json({
            success: true,
            data: department
        });
    } catch (error) {
        console.error('Error assigning in-charge:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'assignation du responsable',
            error: error.message
        });
    }
};

module.exports = exports;
