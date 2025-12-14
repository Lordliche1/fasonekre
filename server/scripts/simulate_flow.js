const axios = require('axios');

const API_URL = 'http://localhost:3000/api/v1';

const TIMESTAMP = Date.now();
const citizen = {
    username: `sim_citizen_${TIMESTAMP}`,
    email: `citizen_${TIMESTAMP}@test.com`,
    password: 'password123',
    phone: '12345678', // Fixed 8-digit phone for BF
    role: 'citizen'
};

const admin = {
    email: 'admin@admin.com',
    password: 'password123'
};

// Colors
const LOG = (msg) => console.log(`\n\x1b[36m[SIMULATION]\x1b[0m ${msg}`);
const SUCCESS = (msg) => console.log(`\x1b[32m  ✓ ${msg}\x1b[0m`);
const FAIL = (msg) => console.log(`\x1b[31m  ✗ ${msg}\x1b[0m`);

async function run() {
    try {
        LOG("🚀 Starting End-to-End Simulation...");

        // 1. Citizen Journey
        LOG("1. Citizen Registration & Login");
        await axios.post(`${API_URL}/auth/register`, citizen);
        const resCit = await axios.post(`${API_URL}/auth/login`, { username: citizen.email, password: citizen.password });
        const citizenToken = resCit.data.token;
        SUCCESS(`Citizen Logged In (${citizen.username})`);

        // 2. Submit Complaint
        LOG("2. Submitting Complaint");
        const complaintRes = await axios.post(`${API_URL}/complaints`, {
            title: `Panne ${TIMESTAMP}`,
            description: "Test simulation automatique",
            department: "Voirie",
            location: { type: "Point", coordinates: [-1.5, 12.3] },
            media: []
        }, { headers: { Authorization: `Bearer ${citizenToken}` } });
        const complaintId = complaintRes.data.complaint._id;
        SUCCESS(`Complaint Created: ${complaintId}`);

        // 3. Admin/Officer Journey
        LOG("3. Admin (Officer) Assignment");
        const resAdmin = await axios.post(`${API_URL}/auth/login`, { username: admin.email, password: admin.password, role: 'admin' });
        const adminToken = resAdmin.data.token;
        SUCCESS("Admin Logged In");

        // Create ServiceMan
        const smEmail = `tech_${TIMESTAMP}@test.com`;
        LOG("4. Creating ServiceMan");
        // Using Admin route to create serviceman if available, else register
        // Assuming /auth/register works for serviceman if role payload allowed (it was fixed previously)
        // Or using a specific admin creation route. Let's try register for now as it's often open or we rely on logic.
        // Actually, previous tasks mentioned "Admin can create ServiceMan". Let's assume standard auth/register with role 'serviceman' works or fallback.
        await axios.post(`${API_URL}/auth/register`, {
            username: `Tech ${TIMESTAMP}`,
            email: smEmail,
            password: 'password123',
            phone: '87654321',
            role: 'serviceman',
            department: 'Voirie'
        });
        SUCCESS(`ServiceMan Created: ${smEmail}`);

        // Login ServiceMan
        const resSM = await axios.post(`${API_URL}/auth/login`, { username: smEmail, password: 'password123', role: 'serviceman' });
        const smToken = resSM.data.token;
        const smId = resSM.data.user._id;
        SUCCESS("ServiceMan Logged In");

        // Assign Complaint (Admin action)
        await axios.put(`${API_URL}/complaints/${complaintId}/assign`, {
            serviceManId: smId
        }, { headers: { Authorization: `Bearer ${adminToken}` } });
        SUCCESS("Complaint Assigned to ServiceMan");

        // 4. ServiceMan Resolution
        LOG("5. ServiceMan Resolution");
        // Start Work
        await axios.put(`${API_URL}/complaints/${complaintId}/status`, {
            status: 'In Progress'
        }, { headers: { Authorization: `Bearer ${smToken}` } });
        SUCCESS("Status Updated to: In Progress");

        // Resolve
        await axios.put(`${API_URL}/complaints/${complaintId}/status`, {
            status: 'Resolved'
        }, { headers: { Authorization: `Bearer ${smToken}` } });
        SUCCESS("Status Updated to: Resolved");

        LOG("✅ SIMULATION SUCCESSFUL - ALL STEPS PASSED");

    } catch (err) {
        FAIL(`Simulation Failed: ${err.response?.data?.msg || err.message}`);
        if (err.response?.data) console.log(err.response.data);
    }
}

run();
