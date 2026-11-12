/**
 * ETS2 Mod Guard — Cloud Licensing & Mod Distribution Server (Node.js)
 * Enhanced with Phase 2 Seller Hub: Admin Login, Dashboard Stats, Mod Uploads & Mod Lifecycle Management
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 5000;
const ADMIN_KEY = process.env.ADMIN_KEY || 'ETS2_ADMIN_SECRET_2026';

const STORAGE_DIR = path.join(__dirname, 'storage');
const MODS_DIR = path.join(STORAGE_DIR, 'mods');
const CATALOG_FILE = path.join(STORAGE_DIR, 'catalog.json');
const CATEGORIES_FILE = path.join(STORAGE_DIR, 'categories.json');
const LICENSES_FILE = path.join(STORAGE_DIR, 'licenses.json');
const PURCHASES_FILE = path.join(STORAGE_DIR, 'purchases.json');
const DOWNLOADS_FILE = path.join(STORAGE_DIR, 'downloads.json');
const DEVICES_FILE = path.join(STORAGE_DIR, 'devices.json');
const AUDIT_LOGS_FILE = path.join(STORAGE_DIR, 'audit_logs.json');

// Predefined Categories & Predefined Catalogue
const PREDEFINED_CATEGORIES = [
    { categoryId: "cat_ibs", name: "IBS MODS", order: 1, description: "Premium IBS coach & bus simulations" },
    { categoryId: "cat_lynx", name: "LYNX MODS", order: 2, description: "Lynx high-end bus & pack modifications" },
    { categoryId: "cat_rvk", name: "RVK GARAGE", order: 3, description: "RVK heavy commercial trucks & multi-axle chassis" },
    { categoryId: "cat_ajin", name: "AJIN MODS", order: 4, description: "Ajin coach models & regional haulage packs" },
    { categoryId: "cat_ibgc", name: "IBGC GAMING", order: 5, description: "IBGC regional transport & passenger coach mods" },
    { categoryId: "cat_maps", name: "MAPS", order: 6, description: "Ultra-realistic standalone Indian route maps" },
    { categoryId: "cat_graphics", name: "GRAPHICS", order: 7, description: "Next-gen weather, lighting & graphics enhancers" }
];

const PREDEFINED_MODS = [
    // 1. IBS MODS (8)
    { modId: "ibs_volvo_9600", title: "Volvo 9600", categoryId: "cat_ibs", category: "IBS MODS", categoryOrder: 1, author: "IBS", version: "1.0.0", ets2Compatibility: "1.48 - 1.53+" },
    { modId: "ibs_volvo_9600_skin", title: "Volvo 9600 Skin (Paid)", categoryId: "cat_ibs", category: "IBS MODS", categoryOrder: 1, author: "IBS", version: "1.0.0", ets2Compatibility: "1.48 - 1.53+" },
    { modId: "ibs_volvo_9600_bundle", title: "Volvo 9600 + Skin Bundle", categoryId: "cat_ibs", category: "IBS MODS", categoryOrder: 1, author: "IBS", version: "1.0.0", ets2Compatibility: "1.48 - 1.53+" },
    { modId: "ibs_mercedes_shd_2436", title: "Mercedes SHD 2436 (15 m)", categoryId: "cat_ibs", category: "IBS MODS", categoryOrder: 1, author: "IBS", version: "1.0.0", ets2Compatibility: "1.48 - 1.53+" },
    { modId: "ibs_scania_metrolink_s8", title: "Scania Metrolink Sector 8 Sleeper", categoryId: "cat_ibs", category: "IBS MODS", categoryOrder: 1, author: "IBS", version: "1.0.0", ets2Compatibility: "1.48 - 1.53+" },
    { modId: "ibs_volvo_shell_sleeper", title: "Volvo Shell Sleeper Pack", categoryId: "cat_ibs", category: "IBS MODS", categoryOrder: 1, author: "IBS", version: "1.0.0", ets2Compatibility: "1.48 - 1.53+" },
    { modId: "ibs_mg_bs6_pack", title: "MG BS6 Pack", categoryId: "cat_ibs", category: "IBS MODS", categoryOrder: 1, author: "IBS", version: "1.0.0", ets2Compatibility: "1.48 - 1.53+" },
    { modId: "ibs_prakash_celeste", title: "Prakash Celeste Mod Pack", categoryId: "cat_ibs", category: "IBS MODS", categoryOrder: 1, author: "IBS", version: "1.0.0", ets2Compatibility: "1.48 - 1.53+" },

    // 2. LYNX MODS (4)
    { modId: "lynx_scania_metrolink", title: "Scania Metrolink", categoryId: "cat_lynx", category: "LYNX MODS", categoryOrder: 2, author: "Lynx", version: "1.0.0", ets2Compatibility: "1.48 - 1.53+" },
    { modId: "lynx_veera_pack", title: "Lynx Veera Pack", categoryId: "cat_lynx", category: "LYNX MODS", categoryOrder: 2, author: "Lynx", version: "1.0.0", ets2Compatibility: "1.48 - 1.53+" },
    { modId: "lynx_prakash_vega", title: "Prakash Vega", categoryId: "cat_lynx", category: "LYNX MODS", categoryOrder: 2, author: "Lynx", version: "1.0.0", ets2Compatibility: "1.48 - 1.53+" },
    { modId: "lynx_volvo_9400", title: "Volvo 9400 Semi Sleeper", categoryId: "cat_lynx", category: "LYNX MODS", categoryOrder: 2, author: "Lynx", version: "1.0.0", ets2Compatibility: "1.48 - 1.53+" },

    // 3. RVK GARAGE (2)
    { modId: "rvk_al_37_8_cabin_a", title: "Ashok Leyland 37/8 Series Cabin A", categoryId: "cat_rvk", category: "RVK GARAGE", categoryOrder: 3, author: "RVK Garage", version: "1.0.0", ets2Compatibility: "1.48 - 1.53+" },
    { modId: "rvk_brand_series_16w", title: "Brand RVK Series (Tata/high-roof) – 16 wheeler", categoryId: "cat_rvk", category: "RVK GARAGE", categoryOrder: 3, author: "RVK Garage", version: "1.0.0", ets2Compatibility: "1.48 - 1.53+" },

    // 4. AJIN MODS (2)
    { modId: "ajin_prakash_capella", title: "Prakash Capella Seater", categoryId: "cat_ajin", category: "AJIN MODS", categoryOrder: 4, author: "Ajin Mods", version: "1.0.0", ets2Compatibility: "1.48 - 1.53+" },
    { modId: "ajin_tn_al_trucks", title: "Ajin TN Ashok Leyland Trucks Pack (4 bodies)", categoryId: "cat_ajin", category: "AJIN MODS", categoryOrder: 4, author: "Ajin Mods", version: "1.0.0", ets2Compatibility: "1.48 - 1.53+" },

    // 5. IBGC GAMING (5)
    { modId: "ibgc_tnstc_non_ac_yellow", title: "TNSTC Non-AC Bus – Yellow", categoryId: "cat_ibgc", category: "IBGC GAMING", categoryOrder: 5, author: "IBGC Gaming", version: "1.0.0", ets2Compatibility: "1.48 - 1.53+" },
    { modId: "ibgc_economy_sakthi", title: "Economy AC Sakthi Coach Cabin", categoryId: "cat_ibgc", category: "IBGC GAMING", categoryOrder: 5, author: "IBGC Gaming", version: "1.0.0", ets2Compatibility: "1.48 - 1.53+" },
    { modId: "ibgc_al_viking_sf_fp", title: "Eicher / Ashok Leyland Viking SF/FP", categoryId: "cat_ibgc", category: "IBGC GAMING", categoryOrder: 5, author: "IBGC Gaming", version: "1.0.0", ets2Compatibility: "1.48 - 1.53+" },
    { modId: "ibgc_al_viking_dlx_exp", title: "Ashok Leyland Viking DLX/EXP", categoryId: "cat_ibgc", category: "IBGC GAMING", categoryOrder: 5, author: "IBGC Gaming", version: "1.0.0", ets2Compatibility: "1.48 - 1.53+" },
    { modId: "ibgc_eicher_20_15", title: "Eicher 20.15 DLX/EXP", categoryId: "cat_ibgc", category: "IBGC GAMING", categoryOrder: 5, author: "IBGC Gaming", version: "1.0.0", ets2Compatibility: "1.48 - 1.53+" },

    // 6. MAPS (2)
    { modId: "map_ct_chennai_trivandrum", title: "CT Map – Chennai to Trivandrum", categoryId: "cat_maps", category: "MAPS", categoryOrder: 6, author: "Map Team", version: "1.0.0", ets2Compatibility: "1.48 - 1.53+" },
    { modId: "map_ntob_nellore_bangalore", title: "NTOB Map – Nellore to Bangalore", categoryId: "cat_maps", category: "MAPS", categoryOrder: 6, author: "Map Team", version: "1.0.0", ets2Compatibility: "1.48 - 1.53+" },

    // 7. GRAPHICS (2)
    { modId: "gfx_snowymoon_lifetime", title: "Snowymoon (Lifetime Key)", categoryId: "cat_graphics", category: "GRAPHICS", categoryOrder: 7, author: "Snowymoon", version: "1.0.0", ets2Compatibility: "1.48 - 1.53+" },
    { modId: "gfx_jbx", title: "JBX", categoryId: "cat_graphics", category: "GRAPHICS", categoryOrder: 7, author: "JBX", version: "1.0.0", ets2Compatibility: "1.48 - 1.53+" }
];

function getCategories() {
    let categories = loadJson(CATEGORIES_FILE, []);
    if (!categories || categories.length < 7) {
        categories = PREDEFINED_CATEGORIES;
        saveJson(CATEGORIES_FILE, categories);
    }
    return categories;
}

function getCatalog() {
    let catalog = loadJson(CATALOG_FILE, []);
    let modified = false;

    for (const pre of PREDEFINED_MODS) {
        const existing = catalog.find(m => m.modId.toLowerCase() === pre.modId.toLowerCase());
        if (!existing) {
            catalog.push({
                ...pre,
                description: 'Predefined ETS2 mod package',
                changelog: 'Initial predefined release',
                targetScsFileName: `${pre.modId}.scs`,
                fileSizeBytes: 0,
                status: 'Draft',
                uploadStatus: 'NOT UPLOADED',
                packageStatus: 'No Package File',
                downloadCount: 0,
                isPublished: false,
                uploadedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            modified = true;
        } else {
            if (!existing.categoryId) existing.categoryId = pre.categoryId;
            if (!existing.category) existing.category = pre.category;
            if (!existing.categoryOrder) existing.categoryOrder = pre.categoryOrder;
            if (!existing.ets2Compatibility) existing.ets2Compatibility = pre.ets2Compatibility;
        }
    }

    // Dynamic file detection on disk
    catalog.forEach(m => {
        const filePath = path.join(MODS_DIR, `${m.modId}.guard`);
        if (fs.existsSync(filePath) && fs.statSync(filePath).size > 0) {
            m.uploadStatus = 'UPLOADED';
            m.packageStatus = 'Encrypted (.guard)';
            m.fileSizeBytes = fs.statSync(filePath).size;
        } else {
            m.uploadStatus = 'NOT UPLOADED';
            m.packageStatus = 'No Package File';
            m.fileSizeBytes = 0;
        }
        m.isPublished = (m.status || 'Draft').toLowerCase() === 'published';
    });

    if (modified) saveJson(CATALOG_FILE, catalog);
    return catalog;
}

// Ensure directories exist
if (!fs.existsSync(STORAGE_DIR)) fs.mkdirSync(STORAGE_DIR, { recursive: true });
if (!fs.existsSync(MODS_DIR)) fs.mkdirSync(MODS_DIR, { recursive: true });

app.use(express.json());

// Enable CORS for Internet & Web dashboard access
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-Admin-Key');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Setup multer for .guard file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, MODS_DIR),
    filename: (req, file, cb) => {
        const modId = req.headers['x-mod-id'] || path.parse(file.originalname).name;
        cb(null, `${modId}.guard`);
    }
});
const upload = multer({ storage });

function loadJson(filePath, defaultVal = []) {
    try {
        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }
    } catch (e) {
        console.error(`Error reading ${filePath}:`, e.message);
    }
    return defaultVal;
}

function saveJson(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
        console.error(`Error writing ${filePath}:`, e.message);
    }
}

function maskHwid(hwid) {
    if (!hwid || typeof hwid !== 'string') return '(Not yet bound)';
    if (hwid.length <= 10) return hwid.substring(0, 3) + '...';
    return hwid.substring(0, 7) + '...' + hwid.substring(hwid.length - 4);
}

function maskLicenseKey(key) {
    if (!key || typeof key !== 'string') return '';
    const parts = key.split('-');
    if (parts.length >= 4) {
        return `${parts[0]}-${parts[1]}-••••-••••••`;
    }
    return key.substring(0, 4) + '-••••-••••';
}

function createAuditLog(adminId, customerId, action, previousStatus, newStatus, reason) {
    const logs = loadJson(AUDIT_LOGS_FILE, []);
    const record = {
        logId: `AUD-${1000 + logs.length + 1}`,
        adminId: adminId || 'ADMIN_SYSTEM',
        customerId: customerId || 'GENERAL',
        action: action,
        previousStatus: previousStatus || 'None',
        newStatus: newStatus || 'None',
        reason: reason || 'Admin action performed',
        timestamp: new Date().toISOString()
    };
    logs.push(record);
    saveJson(AUDIT_LOGS_FILE, logs);
    return record;
}

function authenticateAdmin(req, res, next) {
    const adminKey = req.headers['x-admin-key'] || req.query.adminKey || (req.body && req.body.adminKey);
    if (adminKey !== ADMIN_KEY) {
        return res.status(401).json({ success: false, error: 'Unauthorized: Invalid Admin Key' });
    }
    next();
}

// ==========================================
// 1. HEALTH & PUBLIC ROUTES
// ==========================================
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'ETS2 Mod Guard Cloud API', timestamp: new Date() });
});

// ==========================================
// 2. PHASE 2: OWNER AUTHENTICATION
// ==========================================
const OWNER_LOGIN_ID = '7780401898';
const OWNER_PASSWORD = 'Dora@321123';

app.post('/api/seller/login', (req, res) => {
    const { username, password } = req.body;
    const cleanUser = (username || '').trim();
    const cleanPass = password || '';

    if (cleanUser === OWNER_LOGIN_ID && cleanPass === OWNER_PASSWORD) {
        createAuditLog('OWNER_7780401898', 'SYSTEM', 'OWNER_LOGIN', 'LoggedOut', 'LoggedIn', 'Owner authenticated into Seller Studio (7780401898)');
        console.log(`[AUTH] Owner successfully authenticated with ID: ${OWNER_LOGIN_ID}.`);
        return res.json({
            success: true,
            message: 'Owner authentication successful',
            adminKey: ADMIN_KEY,
            sessionToken: `SESSION_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            timestamp: new Date().toISOString()
        });
    }

    createAuditLog('GUEST', 'SYSTEM', 'FAILED_LOGIN_ATTEMPT', 'None', 'None', `Failed login attempt for user: ${cleanUser || 'Unknown'}`);
    console.warn(`[AUTH] Failed login attempt for owner: ${cleanUser}`);
    return res.status(401).json({ success: false, error: 'Invalid Owner Login ID or Password. Access denied.' });
});

// ==========================================
// 3. PHASE 2: SELLER CREATOR DASHBOARD STATS
// ==========================================
app.get('/api/seller/dashboard-stats', authenticateAdmin, (req, res) => {
    const catalog = getCatalog();
    const categories = getCategories();
    const licenses = loadJson(LICENSES_FILE, []);
    const downloads = loadJson(DOWNLOADS_FILE, []);
    const purchases = loadJson(PURCHASES_FILE, []);

    let totalStorageBytes = 0;
    let pendingUploads = 0;
    catalog.forEach(m => {
        totalStorageBytes += (m.fileSizeBytes || 0);
        if (m.uploadStatus === 'NOT UPLOADED') pendingUploads++;
    });

    const publishedCount = catalog.filter(m => (m.status || 'Published').toLowerCase() === 'published').length;
    const draftCount = catalog.filter(m => (m.status || '').toLowerCase() === 'draft').length;
    const delistedCount = catalog.filter(m => (m.status || '').toLowerCase() === 'delisted').length;
    const activeCustCount = licenses.filter(l => (l.status || (l.isActive ? 'Active' : 'Suspended')).toLowerCase() === 'active').length;

    res.json({
        success: true,
        totalMods: catalog.length,
        publishedMods: publishedCount,
        draftMods: draftCount,
        delistedMods: delistedCount,
        totalCategories: categories.length,
        pendingUploads: pendingUploads,
        totalCustomers: licenses.length,
        activeCustomers: activeCustCount,
        totalDownloads: downloads.length,
        storageBytes: totalStorageBytes,
        storageFormattedMB: (totalStorageBytes / (1024 * 1024)).toFixed(1) + ' MB',
        recentDownloads: downloads.slice(-5).reverse(),
        recentPurchases: purchases.slice(-5).reverse()
    });
});

// ==========================================
// 4. PHASE 2: UPLOAD & MANAGE MODS
// ==========================================
app.get('/api/categories', (req, res) => {
    res.json(getCategories());
});

app.post('/api/categories', authenticateAdmin, (req, res) => {
    const { name, description } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ success: false, error: 'Category name is required' });

    const categories = getCategories();
    const id = 'cat_' + name.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
    const existing = categories.find(c => c.categoryId.toLowerCase() === id.toLowerCase() || c.name.toLowerCase() === name.trim().toLowerCase());
    if (existing) return res.json({ success: true, category: existing });

    const newCat = {
        categoryId: id,
        name: name.trim(),
        order: categories.length + 1,
        description: description || ''
    };
    categories.push(newCat);
    saveJson(CATEGORIES_FILE, categories);
    createAuditLog('ADMIN', 'CATEGORY', 'ADD_CATEGORY', 'None', newCat.name, `Created category ${newCat.name}`);
    res.json({ success: true, category: newCat });
});

app.post('/api/seller/upload', upload.single('file'), (req, res) => {
    const adminKey = req.headers['x-admin-key'];
    if (adminKey !== ADMIN_KEY) {
        return res.status(401).json({ error: 'Unauthorized: Invalid Admin Key' });
    }

    const modId = req.headers['x-mod-id'] || req.body.modId || 'mod_' + Date.now();
    let title = req.headers['x-mod-title'] ? Buffer.from(req.headers['x-mod-title'], 'base64').toString('utf8') : (req.body.title || modId);
    let author = req.headers['x-mod-author'] ? Buffer.from(req.headers['x-mod-author'], 'base64').toString('utf8') : (req.body.author || 'Mod Creator');
    const version = req.headers['x-mod-version'] || req.body.version || '1.0.0';
    const targetScs = req.headers['x-target-scs'] || req.body.targetScs || `${modId}.scs`;
    const category = req.headers['x-mod-category'] || req.body.category || 'IBS MODS';
    const status = req.headers['x-mod-status'] || req.body.status || 'Published';
    const compatibility = req.headers['x-mod-compatibility'] || req.body.ets2Compatibility || '1.48 - 1.53+';
    let description = req.headers['x-mod-description'] ? Buffer.from(req.headers['x-mod-description'], 'base64').toString('utf8') : (req.body.description || '');
    let changelog = req.headers['x-mod-changelog'] ? Buffer.from(req.headers['x-mod-changelog'], 'base64').toString('utf8') : (req.body.changelog || 'Initial release');

    const categories = getCategories();
    const cat = categories.find(c => c.name.toLowerCase() === category.toLowerCase() || c.categoryId.toLowerCase() === category.toLowerCase());

    const catalog = getCatalog();
    const existingIdx = catalog.findIndex(m => m.modId.toLowerCase() === modId.toLowerCase());

    const isPub = status.toLowerCase() === 'published';

    const modMeta = {
        modId,
        title,
        version,
        author,
        category: cat ? cat.name : category,
        categoryId: cat ? cat.categoryId : 'cat_ibs',
        categoryOrder: cat ? cat.order : 1,
        description,
        changelog,
        targetScsFileName: targetScs,
        fileSizeBytes: req.file ? req.file.size : (existingIdx >= 0 ? catalog[existingIdx].fileSizeBytes : 0),
        status: status,
        uploadStatus: 'UPLOADED',
        packageStatus: 'Encrypted (.guard)',
        ets2Compatibility: compatibility,
        isPublished: isPub,
        downloadCount: existingIdx >= 0 ? (catalog[existingIdx].downloadCount || 0) : 0,
        uploadedAt: existingIdx >= 0 ? catalog[existingIdx].uploadedAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    if (existingIdx >= 0) {
        catalog[existingIdx] = modMeta;
        createAuditLog('ADMIN', 'MOD', 'UPDATE_MOD_PACKAGE', catalog[existingIdx].status, status, `Updated mod package: ${title} (v${version})`);
    } else {
        catalog.push(modMeta);
        createAuditLog('ADMIN', 'MOD', 'UPLOAD_MOD_PACKAGE', 'None', status, `Uploaded new mod package: ${title} (v${version})`);
    }

    saveJson(CATALOG_FILE, catalog);
    console.log(`[SELLER] Mod uploaded & registered: ${title} (${modId}) [${status}]`);
    res.json({ success: true, mod: modMeta });
});

// Full Seller Catalog with Customer & Download counts (NO PRICES)
app.get('/api/seller/catalog', (req, res) => {
    const catalog = getCatalog();
    const licenses = loadJson(LICENSES_FILE, []);
    const downloads = loadJson(DOWNLOADS_FILE, []);

    const enriched = catalog.map(m => {
        const entitledCusts = licenses.filter(l => l.allowedModIds.length === 0 || l.allowedModIds.includes(m.modId)).length;
        const dlCount = downloads.filter(d => (d.modId || '').toLowerCase() === m.modId.toLowerCase()).length;
        return {
            ...m,
            category: m.category || 'IBS MODS',
            categoryId: m.categoryId || 'cat_ibs',
            categoryOrder: m.categoryOrder || 1,
            uploadStatus: m.uploadStatus || 'NOT UPLOADED',
            packageStatus: m.packageStatus || 'No Package File',
            ets2Compatibility: m.ets2Compatibility || '1.48 - 1.53+',
            status: m.status || (m.isPublished !== false ? 'Published' : 'Draft'),
            isPublished: m.isPublished !== false && (m.status || 'Published').toLowerCase() === 'published',
            downloadCount: Math.max(dlCount, m.downloadCount || 0),
            entitledBuyersCount: entitledCusts
        };
    });

    res.json(enriched);
});

// Move Mod to Category
app.post('/api/seller/mods/:modId/move', authenticateAdmin, (req, res) => {
    const modId = req.params.modId.trim().toLowerCase();
    const { targetCategoryId } = req.body;
    const catalog = getCatalog();
    const mod = catalog.find(m => m.modId.toLowerCase() === modId);
    if (!mod) return res.status(404).json({ success: false, error: 'Mod not found' });

    const categories = getCategories();
    const cat = categories.find(c => c.categoryId.toLowerCase() === (targetCategoryId || '').toLowerCase() || c.name.toLowerCase() === (targetCategoryId || '').toLowerCase());
    if (!cat) return res.status(400).json({ success: false, error: 'Target category not found' });

    const prev = mod.category;
    mod.categoryId = cat.categoryId;
    mod.category = cat.name;
    mod.categoryOrder = cat.order;
    mod.updatedAt = new Date().toISOString();
    saveJson(CATALOG_FILE, catalog);

    createAuditLog('ADMIN', 'MOD', 'MOVE_CATEGORY', prev, cat.name, `Moved mod ${mod.title} to category ${cat.name}`);
    res.json({ success: true, message: 'Mod moved successfully', mod });
});

// Archive Mod
app.post('/api/seller/mods/:modId/archive', authenticateAdmin, (req, res) => {
    const modId = req.params.modId.trim().toLowerCase();
    const catalog = getCatalog();
    const mod = catalog.find(m => m.modId.toLowerCase() === modId);
    if (!mod) return res.status(404).json({ success: false, error: 'Mod not found' });

    const prev = mod.status;
    mod.status = 'Archived';
    mod.isPublished = false;
    mod.updatedAt = new Date().toISOString();
    saveJson(CATALOG_FILE, catalog);

    createAuditLog('ADMIN', 'MOD', 'ARCHIVE_MOD', prev, 'Archived', `Archived mod ${mod.title}`);
    res.json({ success: true, message: 'Mod archived successfully', mod });
});

// Publish Mod
app.post('/api/seller/mods/:modId/publish', authenticateAdmin, (req, res) => {
    const modId = req.params.modId.trim().toLowerCase();
    const catalog = getCatalog();
    const mod = catalog.find(m => m.modId.toLowerCase() === modId);

    if (!mod) return res.status(404).json({ success: false, error: 'Mod not found in catalog' });

    const prev = mod.status || 'Draft';
    mod.status = 'Published';
    mod.isPublished = true;
    mod.updatedAt = new Date().toISOString();
    saveJson(CATALOG_FILE, catalog);

    createAuditLog('ADMIN', 'MOD', 'PUBLISH_MOD', prev, 'Published', `Published mod ${mod.title} to live catalog`);
    console.log(`[SELLER] Published mod: ${mod.title}`);
    res.json({ success: true, message: 'Mod published live successfully', mod });
});

// Unpublish / Delist Mod
app.post('/api/seller/mods/:modId/unpublish', authenticateAdmin, (req, res) => {
    const modId = req.params.modId.trim().toLowerCase();
    const catalog = getCatalog();
    const mod = catalog.find(m => m.modId.toLowerCase() === modId);

    if (!mod) return res.status(404).json({ success: false, error: 'Mod not found in catalog' });

    const prev = mod.status || 'Published';
    mod.status = 'Delisted';
    mod.isPublished = false;
    mod.updatedAt = new Date().toISOString();
    saveJson(CATALOG_FILE, catalog);

    createAuditLog('ADMIN', 'MOD', 'UNPUBLISH_MOD', prev, 'Delisted', `Delisted mod ${mod.title} from buyer sync`);
    console.log(`[SELLER] Delisted mod: ${mod.title}`);
    res.json({ success: true, message: 'Mod delisted from catalog', mod });
});

// Edit Mod Metadata (NO PRICES)
app.post('/api/seller/mods/:modId/update', authenticateAdmin, (req, res) => {
    const modId = req.params.modId.trim().toLowerCase();
    const { title, version, author, category, categoryId, ets2Compatibility, description, changelog } = req.body;

    const catalog = getCatalog();
    const mod = catalog.find(m => m.modId.toLowerCase() === modId);

    if (!mod) return res.status(404).json({ success: false, error: 'Mod not found in catalog' });

    if (title) mod.title = title.trim();
    if (version) mod.version = version.trim();
    if (author) mod.author = author.trim();
    if (category) mod.category = category.trim();
    if (categoryId) mod.categoryId = categoryId.trim();
    if (ets2Compatibility) mod.ets2Compatibility = ets2Compatibility.trim();
    if (description !== undefined) mod.description = description;
    if (changelog !== undefined) mod.changelog = changelog;
    mod.updatedAt = new Date().toISOString();

    saveJson(CATALOG_FILE, catalog);
    createAuditLog('ADMIN', 'MOD', 'UPDATE_MOD_METADATA', mod.status, mod.status, `Updated metadata for ${mod.title}`);
    res.json({ success: true, message: 'Mod metadata updated', mod });
});

    const catalog = loadJson(CATALOG_FILE, []);
    const mod = catalog.find(m => m.modId.toLowerCase() === modId);

    if (!mod) return res.status(404).json({ success: false, error: 'Mod not found in catalog' });

    if (title) mod.title = title.trim();
    if (version) mod.version = version.trim();
    if (author) mod.author = author.trim();
    if (category) mod.category = category.trim();
    if (price) mod.price = price.trim();
    if (description !== undefined) mod.description = description;
    if (changelog !== undefined) mod.changelog = changelog;
    mod.updatedAt = new Date().toISOString();

    saveJson(CATALOG_FILE, catalog);
    createAuditLog('ADMIN', 'MOD', 'UPDATE_MOD_METADATA', mod.status, mod.status, `Updated metadata for ${mod.title}`);
    res.json({ success: true, message: 'Mod metadata updated', mod });
});

// Delete Mod
app.delete('/api/seller/mods/:modId', authenticateAdmin, (req, res) => {
    const modId = req.params.modId.trim().toLowerCase();
    let catalog = loadJson(CATALOG_FILE, []);
    const mod = catalog.find(m => m.modId.toLowerCase() === modId);

    if (!mod) return res.status(404).json({ success: false, error: 'Mod not found' });

    // Remove file
    const filePath = path.join(MODS_DIR, `${modId}.guard`);
    if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) {}
    }

    catalog = catalog.filter(m => m.modId.toLowerCase() !== modId);
    saveJson(CATALOG_FILE, catalog);

    createAuditLog('ADMIN', 'MOD', 'DELETE_MOD', mod.status, 'Deleted', `Permanently deleted mod: ${mod.title}`);
    console.log(`[SELLER] Deleted mod: ${mod.title}`);
    res.json({ success: true, message: 'Mod permanently deleted' });
});

// Get Entitled Buyers for a Mod
app.get('/api/seller/mods/:modId/buyers', authenticateAdmin, (req, res) => {
    const modId = req.params.modId.trim().toLowerCase();
    const licenses = loadJson(LICENSES_FILE, []);
    const buyers = licenses.filter(l => l.allowedModIds.length === 0 || l.allowedModIds.map(x => x.toLowerCase()).includes(modId));

    res.json({
        success: true,
        modId,
        totalBuyers: buyers.length,
        buyers: buyers.map(b => ({
            customerId: b.customerId,
            customerName: b.customerName,
            email: b.email,
            status: b.status || (b.isActive ? 'Active' : 'Suspended'),
            boundHwid: maskHwid(b.boundHwid)
        }))
    });
});

// ==========================================
// 5. CUSTOMER MANAGEMENT APIS (From Phase 1)
// ==========================================
app.get('/api/admin/customer-statistics', authenticateAdmin, (req, res) => {
    const licenses = loadJson(LICENSES_FILE, []);
    const devices = loadJson(DEVICES_FILE, []);

    let totalCustomers = licenses.length;
    let activeLicenses = 0;
    let suspendedLicenses = 0;
    let revokedLicenses = 0;

    licenses.forEach(l => {
        const s = (l.status || (l.isActive ? 'Active' : 'Suspended')).toLowerCase();
        if (s === 'active') activeLicenses++;
        else if (s === 'suspended') suspendedLicenses++;
        else if (s === 'revoked') revokedLicenses++;
        else activeLicenses++;
    });

    const activeDevices = devices.filter(d => (d.status || 'Active').toLowerCase() === 'active').length;
    const boundDevices = licenses.filter(l => Boolean(l.boundHwid)).length;
    const totalDevices = Math.max(activeDevices, boundDevices);

    res.json({
        success: true,
        totalCustomers,
        activeLicenses,
        suspendedLicenses,
        revokedLicenses,
        totalDevices
    });
});

app.get('/api/admin/customers', authenticateAdmin, (req, res) => {
    let licenses = loadJson(LICENSES_FILE, []);
    const catalog = loadJson(CATALOG_FILE, []);
    const devices = loadJson(DEVICES_FILE, []);
    const downloads = loadJson(DOWNLOADS_FILE, []);

    const search = (req.query.search || '').trim().toLowerCase();
    const statusFilter = (req.query.status || 'all').trim().toLowerCase();
    const sortBy = (req.query.sort || 'newest').trim().toLowerCase();
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);

    if (search) {
        licenses = licenses.filter(l =>
            (l.customerId || '').toLowerCase().includes(search) ||
            (l.customerName || '').toLowerCase().includes(search) ||
            (l.email || '').toLowerCase().includes(search)
        );
    }

    if (statusFilter && statusFilter !== 'all') {
        licenses = licenses.filter(l => {
            const s = (l.status || (l.isActive ? 'Active' : 'Suspended')).toLowerCase();
            return s === statusFilter;
        });
    }

    if (sortBy === 'newest') {
        licenses.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (sortBy === 'oldest') {
        licenses.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    } else if (sortBy === 'name') {
        licenses.sort((a, b) => (a.customerName || '').localeCompare(b.customerName || ''));
    } else if (sortBy === 'id') {
        licenses.sort((a, b) => (a.customerId || '').localeCompare(b.customerId || ''));
    }

    const total = licenses.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIdx = (page - 1) * limit;
    const pagedItems = licenses.slice(startIdx, startIdx + limit);

    const formatted = pagedItems.map(l => {
        const modTitles = (l.allowedModIds || []).map(id => {
            const m = catalog.find(cat => cat.modId.toLowerCase() === id.toLowerCase());
            return m ? m.title : id;
        });

        const custDevices = devices.filter(d => (d.customerId || '').toLowerCase() === (l.customerId || '').toLowerCase() && (d.status || 'Active').toLowerCase() === 'active');
        const devCount = custDevices.length > 0 ? custDevices.length : (l.boundHwid ? 1 : 0);

        const custDownloads = downloads.filter(d => (d.customerId || '').toLowerCase() === (l.customerId || '').toLowerCase());
        const dlCount = Math.max(custDownloads.length, l.downloadCount || 0);

        const currentStatus = l.status || (l.isActive ? 'Active' : 'Suspended');

        return {
            customerId: l.customerId,
            customerName: l.customerName,
            email: l.email || `${(l.customerId || 'cust').toLowerCase()}@buyer.com`,
            licenseKeyMasked: maskLicenseKey(l.licenseKey),
            purchasedMods: modTitles.length > 0 ? modTitles.join(', ') : 'All Mods',
            purchaseDate: l.createdAt ? l.createdAt.substring(0, 10) : 'N/A',
            licenseStatus: currentStatus,
            deviceCount: devCount,
            downloadCount: dlCount,
            lastLogin: l.lastLoginAt || 'Never'
        };
    });

    res.json({
        success: true,
        total,
        page,
        limit,
        totalPages,
        customers: formatted
    });
});

app.get('/api/admin/customers/:id', authenticateAdmin, (req, res) => {
    const licenses = loadJson(LICENSES_FILE, []);
    const targetId = req.params.id.trim().toLowerCase();
    const l = licenses.find(item => (item.customerId || '').toLowerCase() === targetId);

    if (!l) return res.status(404).json({ success: false, error: 'Customer not found' });

    const catalog = loadJson(CATALOG_FILE, []);
    const modDetails = (l.allowedModIds || []).map(id => {
        const m = catalog.find(cat => cat.modId.toLowerCase() === id.toLowerCase());
        return m ? { modId: m.modId, title: m.title, version: m.version, author: m.author } : { modId: id, title: id, version: '1.0', author: '' };
    });

    const revealKey = req.headers['x-reveal-key'] === 'true';

    res.json({
        success: true,
        customer: {
            customerId: l.customerId,
            customerName: l.customerName,
            email: l.email || `${l.customerId.toLowerCase()}@buyer.com`,
            licenseKey: revealKey ? l.licenseKey : maskLicenseKey(l.licenseKey),
            licenseKeyMasked: maskLicenseKey(l.licenseKey),
            licenseStatus: l.status || (l.isActive ? 'Active' : 'Suspended'),
            createdAt: l.createdAt,
            updatedAt: l.updatedAt,
            lastLoginAt: l.lastLoginAt || 'Never',
            boundHwidMasked: maskHwid(l.boundHwid),
            allowedModIds: l.allowedModIds || [],
            purchasedMods: modDetails,
            maxHwidBinds: l.maxHwidBinds || 1,
            suspensionReason: l.suspensionReason || null,
            revocationReason: l.revocationReason || null
        }
    });
});

app.get('/api/admin/customers/:id/purchases', authenticateAdmin, (req, res) => {
    const targetId = req.params.id.trim().toLowerCase();
    const purchases = loadJson(PURCHASES_FILE, []);
    res.json({ success: true, purchases: purchases.filter(p => (p.customerId || '').toLowerCase() === targetId) });
});

app.get('/api/admin/customers/:id/downloads', authenticateAdmin, (req, res) => {
    const targetId = req.params.id.trim().toLowerCase();
    const downloads = loadJson(DOWNLOADS_FILE, []);
    res.json({ success: true, downloads: downloads.filter(d => (d.customerId || '').toLowerCase() === targetId) });
});

app.get('/api/admin/customers/:id/devices', authenticateAdmin, (req, res) => {
    const targetId = req.params.id.trim().toLowerCase();
    const licenses = loadJson(LICENSES_FILE, []);
    const lic = licenses.find(l => (l.customerId || '').toLowerCase() === targetId);

    const devices = loadJson(DEVICES_FILE, []);
    let custDevices = devices.filter(d => (d.customerId || '').toLowerCase() === targetId);

    if (custDevices.length === 0 && lic && lic.boundHwid) {
        const autoDev = {
            deviceId: `DEV-${1000 + devices.length + 1}`,
            customerId: lic.customerId,
            hardwareFingerprint: maskHwid(lic.boundHwid),
            rawHwid: lic.boundHwid,
            firstActivationDate: lic.createdAt || new Date().toISOString(),
            lastSeen: lic.lastLoginAt || lic.createdAt || new Date().toISOString(),
            status: 'Active'
        };
        devices.push(autoDev);
        saveJson(DEVICES_FILE, devices);
        custDevices = [autoDev];
    }

    res.json({ success: true, devices: custDevices });
});

app.get('/api/admin/customers/:id/audit-logs', authenticateAdmin, (req, res) => {
    const targetId = req.params.id.trim().toLowerCase();
    const logs = loadJson(AUDIT_LOGS_FILE, []);
    res.json({ success: true, auditLogs: logs.filter(l => (l.customerId || '').toLowerCase() === targetId) });
});

app.post('/api/admin/customers/:id/activate', authenticateAdmin, (req, res) => {
    const targetId = req.params.id.trim().toLowerCase();
    const licenses = loadJson(LICENSES_FILE, []);
    const lic = licenses.find(l => (l.customerId || '').toLowerCase() === targetId);

    if (!lic) return res.status(404).json({ success: false, error: 'Customer not found' });

    const prevStatus = lic.status || (lic.isActive ? 'Active' : 'Suspended');
    if (prevStatus.toLowerCase() === 'revoked') {
        return res.status(400).json({ success: false, error: 'Cannot ordinarily reactivate a Revoked license.' });
    }

    lic.status = 'Active';
    lic.isActive = true;
    lic.suspensionReason = null;
    lic.updatedAt = new Date().toISOString();
    saveJson(LICENSES_FILE, licenses);

    createAuditLog(req.headers['x-admin-id'], lic.customerId, 'ACTIVATE_LICENSE', prevStatus, 'Active', 'Admin reactivated customer license');
    res.json({ success: true, message: 'License successfully activated', licenseStatus: 'Active' });
});

app.post('/api/admin/customers/:id/suspend', authenticateAdmin, (req, res) => {
    const targetId = req.params.id.trim().toLowerCase();
    const { reason } = req.body;

    if (!reason || !reason.trim()) return res.status(400).json({ success: false, error: 'Suspension reason is required' });

    const licenses = loadJson(LICENSES_FILE, []);
    const lic = licenses.find(l => (l.customerId || '').toLowerCase() === targetId);

    if (!lic) return res.status(404).json({ success: false, error: 'Customer not found' });

    const prevStatus = lic.status || (lic.isActive ? 'Active' : 'Suspended');
    lic.status = 'Suspended';
    lic.isActive = false;
    lic.suspensionReason = reason.trim();
    lic.updatedAt = new Date().toISOString();
    saveJson(LICENSES_FILE, licenses);

    createAuditLog(req.headers['x-admin-id'], lic.customerId, 'SUSPEND_LICENSE', prevStatus, 'Suspended', reason.trim());
    res.json({ success: true, message: 'License suspended successfully', licenseStatus: 'Suspended' });
});

app.post('/api/admin/customers/:id/revoke', authenticateAdmin, (req, res) => {
    const targetId = req.params.id.trim().toLowerCase();
    const { reason } = req.body;

    if (!reason || !reason.trim()) return res.status(400).json({ success: false, error: 'Revocation reason is required' });

    const licenses = loadJson(LICENSES_FILE, []);
    const lic = licenses.find(l => (l.customerId || '').toLowerCase() === targetId);

    if (!lic) return res.status(404).json({ success: false, error: 'Customer not found' });

    const prevStatus = lic.status || (lic.isActive ? 'Active' : 'Suspended');
    lic.status = 'Revoked';
    lic.isActive = false;
    lic.revocationReason = reason.trim();
    lic.updatedAt = new Date().toISOString();
    saveJson(LICENSES_FILE, licenses);

    createAuditLog(req.headers['x-admin-id'], lic.customerId, 'REVOKE_LICENSE', prevStatus, 'Revoked', reason.trim());
    res.json({ success: true, message: 'License permanently revoked', licenseStatus: 'Revoked' });
});

app.post('/api/admin/customers/:id/reset-device', authenticateAdmin, (req, res) => {
    const targetId = req.params.id.trim().toLowerCase();
    const licenses = loadJson(LICENSES_FILE, []);
    const lic = licenses.find(l => (l.customerId || '').toLowerCase() === targetId);

    if (!lic) return res.status(404).json({ success: false, error: 'Customer not found' });

    const oldHwid = lic.boundHwid;
    lic.boundHwid = null;
    lic.updatedAt = new Date().toISOString();
    saveJson(LICENSES_FILE, licenses);

    const devices = loadJson(DEVICES_FILE, []);
    devices.forEach(d => {
        if ((d.customerId || '').toLowerCase() === targetId) d.status = 'Reset';
    });
    saveJson(DEVICES_FILE, devices);

    createAuditLog(req.headers['x-admin-id'], lic.customerId, 'RESET_DEVICE_ACTIVATION', maskHwid(oldHwid), 'None', 'Admin cleared HWID binding for replacement PC');
    res.json({ success: true, message: 'Device activation reset successfully.' });
});

// ==========================================
// 6. BUYER LOGIN & SECURE MOD DOWNLOAD
// ==========================================
app.post('/api/buyer/login', (req, res) => {
    const { licenseKey, hwid } = req.body;
    if (!licenseKey) return res.status(400).json({ success: false, error: 'License key is required.' });

    const licenses = loadJson(LICENSES_FILE, []);
    const lic = licenses.find(l => l.licenseKey.toLowerCase() === licenseKey.trim().toLowerCase());

    if (!lic) return res.status(404).json({ success: false, error: 'Invalid license key. Please check the code provided by your seller.' });

    const currentStatus = (lic.status || (lic.isActive ? 'Active' : 'Suspended')).toLowerCase();

    if (currentStatus === 'suspended') {
        const reason = lic.suspensionReason ? ` Reason: ${lic.suspensionReason}` : '';
        return res.status(403).json({ success: false, error: `Your license has been SUSPENDED by the seller.${reason} Please contact support.` });
    }

    if (currentStatus === 'revoked') {
        const reason = lic.revocationReason ? ` Reason: ${lic.revocationReason}` : '';
        return res.status(403).json({ success: false, error: `Your license has been permanently REVOKED.${reason} Access is denied.` });
    }

    if (!lic.isActive) return res.status(403).json({ success: false, error: 'License is inactive or disabled.' });

    // HWID Binding
    const devices = loadJson(DEVICES_FILE, []);
    if (!lic.boundHwid) {
        lic.boundHwid = hwid;
        lic.lastLoginAt = new Date().toISOString();
        saveJson(LICENSES_FILE, licenses);

        if (hwid) {
            devices.push({
                deviceId: `DEV-${1000 + devices.length + 1}`,
                customerId: lic.customerId,
                hardwareFingerprint: maskHwid(hwid),
                rawHwid: hwid,
                firstActivationDate: new Date().toISOString(),
                lastSeen: new Date().toISOString(),
                status: 'Active'
            });
            saveJson(DEVICES_FILE, devices);
        }
        console.log(`[BUYER] License ${licenseKey} locked to HWID: ${maskHwid(hwid)}`);
    } else if (hwid && lic.boundHwid !== hwid) {
        return res.status(403).json({
            success: false,
            error: `HWID Mismatch! This license is bound to another PC (Bound: ${maskHwid(lic.boundHwid)}). Please contact your mod seller to transfer your license.`
        });
    } else {
        lic.lastLoginAt = new Date().toISOString();
        saveJson(LICENSES_FILE, licenses);

        const dev = devices.find(d => (d.customerId || '').toLowerCase() === (lic.customerId || '').toLowerCase() && d.rawHwid === hwid);
        if (dev) {
            dev.lastSeen = new Date().toISOString();
            saveJson(DEVICES_FILE, devices);
        }
    }

    // Filter purchased AND published AND uploaded mods only (NO PRICES)
    const catalog = getCatalog();
    const categories = getCategories();
    const buyerMods = catalog.filter(m =>
        (m.isPublished !== false && (m.status || 'Published').toLowerCase() === 'published') &&
        (m.uploadStatus === 'UPLOADED') &&
        (lic.allowedModIds.length === 0 || lic.allowedModIds.map(x => x.toLowerCase()).includes(m.modId.toLowerCase()))
    );

    res.json({
        success: true,
        customerId: lic.customerId,
        customerName: lic.customerName,
        boundHwid: lic.boundHwid,
        purchasedMods: buyerMods,
        categories: categories
    });
});

app.get('/api/buyer/download', (req, res) => {
    const { modId, licenseKey, hwid } = req.query;
    if (!modId || !licenseKey) return res.status(400).send('Missing modId or licenseKey');

    const licenses = loadJson(LICENSES_FILE, []);
    const lic = licenses.find(l => l.licenseKey.toLowerCase() === licenseKey.trim().toLowerCase());

    if (!lic) return res.status(404).send('Invalid license key');

    const status = (lic.status || (lic.isActive ? 'Active' : 'Suspended')).toLowerCase();
    if (status === 'suspended') return res.status(403).send('License is suspended.');
    if (status === 'revoked') return res.status(403).send('License has been revoked.');
    if (!lic.isActive) return res.status(403).send('License is inactive.');

    if (lic.boundHwid && hwid && lic.boundHwid !== hwid) return res.status(403).send('HWID Mismatch');
    if (lic.allowedModIds.length > 0 && !lic.allowedModIds.map(x => x.toLowerCase()).includes(modId.toLowerCase())) return res.status(403).send('You have not purchased this mod.');

    const filePath = path.join(MODS_DIR, `${modId}.guard`);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).size === 0) {
        return res.status(404).send('Mod package file not yet uploaded by creator.');
    }

    const catalog = getCatalog();
    const modMeta = catalog.find(m => m.modId.toLowerCase() === modId.toLowerCase());

    // Check if mod is delisted
    if (modMeta && modMeta.status && modMeta.status.toLowerCase() === 'delisted') {
        return res.status(403).send('This mod package is currently delisted by the creator.');
    }

    const downloads = loadJson(DOWNLOADS_FILE, []);
    downloads.push({
        downloadId: `DL-${1000 + downloads.length + 1}`,
        customerId: lic.customerId,
        modId: modId,
        modName: modMeta ? modMeta.title : modId,
        packageVersion: modMeta ? modMeta.version : '1.0.0',
        deviceId: maskHwid(hwid || lic.boundHwid),
        timestamp: new Date().toISOString(),
        status: 'Success',
        result: 'Package Delivered (100%)'
    });
    saveJson(DOWNLOADS_FILE, downloads);

    lic.downloadCount = (lic.downloadCount || 0) + 1;
    saveJson(LICENSES_FILE, licenses);

    console.log(`[BUYER] Delivered mod ${modId}.guard to ${lic.customerId} (${lic.customerName})`);
    res.download(filePath, `${modId}.guard`);
});

app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`  ETS2 Mod Guard — Cloud Server active on port ${PORT}`);
    console.log(`  Health Check: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
});
