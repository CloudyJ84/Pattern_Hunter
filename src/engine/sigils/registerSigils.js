/**
 * registerSigils.js
 * * The ritual of awakening.
 * * Imports all defined sigils and registers them with the SigilController.
 * * This file should be imported once at app startup.
 */

import { SigilController } from './SigilController.js';

// Core Sigils
import { sigil_peak } from './definitions/sigil_peak.js';
import { sigil_valley } from './definitions/sigil_valley.js';
import { sigil_unique } from './definitions/sigil_unique.js';
import { sigil_frequency } from './definitions/sigil_frequency.js';
import { sigil_weekend } from './definitions/sigil_weekend.js';
import { sigil_sequence } from './definitions/sigil_sequence.js';
import { sigil_outlier } from './definitions/sigil_outlier.js';
import { sigil_date_mark } from './definitions/sigil_date_mark.js';
import { sigil_fallback } from './definitions/sigil_fallback.js';

// Advanced Sigils
import { sigil_balance } from './definitions/sigil_balance.js';
import { sigil_cluster } from './definitions/sigil_cluster.js';
import { sigil_trend } from './definitions/sigil_trend.js';
import { sigil_symmetry } from './definitions/sigil_symmetry.js';
import { sigil_entropy } from './definitions/sigil_entropy.js';

/**
 * Registers all known sigils into the Controller's codex.
 */
export function registerAllSigils() {
    // console.log("SigilSystem: Awakening symbols...");

    // Core
    SigilController.registerSigil(sigil_peak);
    SigilController.registerSigil(sigil_valley);
    SigilController.registerSigil(sigil_unique);
    SigilController.registerSigil(sigil_frequency);
    SigilController.registerSigil(sigil_weekend);
    SigilController.registerSigil(sigil_sequence);
    SigilController.registerSigil(sigil_outlier);
    SigilController.registerSigil(sigil_date_mark);
    SigilController.registerSigil(sigil_fallback);

    // Advanced
    SigilController.registerSigil(sigil_balance);
    SigilController.registerSigil(sigil_cluster);
    SigilController.registerSigil(sigil_trend);
    SigilController.registerSigil(sigil_symmetry);
    SigilController.registerSigil(sigil_entropy);

    // console.log("SigilSystem: Symbols awakened.");
}
