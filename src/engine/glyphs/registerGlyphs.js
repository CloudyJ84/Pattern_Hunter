/**
 * registerGlyphs.js
 * * The ritual of awakening.
 * * Imports all defined glyphs and registers them with the GlyphController.
 * * This file should be imported once at app startup.
 */

import { GlyphController } from './GlyphController.js';

// Core Glyphs
import { OutlierGlyph } from './definitions/OutlierGlyph.js';
import { AboveGlyph } from './definitions/AboveGlyph.js';
import { BelowGlyph } from './definitions/BelowGlyph.js';
import { FrequencyGlyph } from './definitions/FrequencyGlyph.js';
import { UniqueGlyph } from './definitions/UniqueGlyph.js';
import { WeekendGlyph } from './definitions/WeekendGlyph.js';

// Advanced/Pattern Glyphs
import { SequenceGlyph } from './definitions/SequenceGlyph.js';
import { ClusterGlyph } from './definitions/ClusterGlyph.js';

/**
 * Registers all known runes into the Controller's codex.
 */
export function registerAllGlyphs() {
    // console.log("GlyphSystem: Awakening runes...");
    
    GlyphController.registerGlyph(OutlierGlyph);
    GlyphController.registerGlyph(AboveGlyph);
    GlyphController.registerGlyph(BelowGlyph);
    GlyphController.registerGlyph(FrequencyGlyph);
    GlyphController.registerGlyph(UniqueGlyph);
    GlyphController.registerGlyph(WeekendGlyph);
    
    // Register advanced glyphs (they safely return empty indices if metadata is missing)
    GlyphController.registerGlyph(SequenceGlyph);
    GlyphController.registerGlyph(ClusterGlyph);
    
    // console.log("GlyphSystem: Runes awakened.");
}
