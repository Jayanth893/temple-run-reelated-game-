/**
 * AABB (Axis-Aligned Bounding Box) Collision Detection
 * box1 and box2 must have: { x, y, z, width, height, depth }
 */
export function checkCollision(box1, box2) {
  return (
    Math.abs(box1.x - box2.x) * 2 < (box1.width  + box2.width)  &&
    Math.abs(box1.y - box2.y) * 2 < (box1.height + box2.height) &&
    Math.abs(box1.z - box2.z) * 2 < (box1.depth  + box2.depth)
  )
}

/**
 * Returns bounding box dimensions per obstacle type.
 * width  → X (across lane)
 * height → Y (vertical)
 * depth  → Z (along direction of travel)
 */
export function getObstacleDimensions(type) {
  switch (type) {
    // ── Jump obstacles (player must be airborne) ───────────────────────────
    case 'fireLine':       return { width: 2.2, height: 0.45, depth: 1.0 }
    case 'brokenPath':     return { width: 2.2, height: 0.35, depth: 1.8 }
    case 'energyBarrier':  return { width: 2.1, height: 0.55, depth: 0.5 }
    case 'low':            return { width: 1.8, height: 0.6,  depth: 0.7 }

    // ── Slide obstacles (player must duck) ────────────────────────────────
    case 'high':           return { width: 2.0, height: 0.6,  depth: 0.8 }
    case 'hangingLog':     return { width: 2.2, height: 0.6,  depth: 0.8 }
    case 'lowWall':        return { width: 2.2, height: 1.5,  depth: 0.6 }
    case 'treeBranch':     return { width: 2.5, height: 0.6,  depth: 0.8 }

    // ── Lane-switch obstacles (player must move laterally) ─────────────────
    // laneBlock fills the full lane — wide and very tall, no way through
    case 'laneBlock':      return { width: 2.3, height: 3.2,  depth: 0.7 }
    // spikeTrap is ground-level, wide — player must leave the lane
    case 'spikeTrap':      return { width: 2.2, height: 1.4,  depth: 1.8 }
    // swingBlade sweeps mid-height; narrow depth so timing matters
    case 'swingBlade':     return { width: 1.9, height: 0.4,  depth: 0.5 }
    // rollingBoulder uses a per-frame calculated X, sphere-ish hitbox
    case 'rollingBoulder': return { width: 1.7, height: 1.7,  depth: 1.7 }
    // legacy
    case 'boulder':        return { width: 1.6, height: 1.6,  depth: 1.6 }
    case 'barrier':        return { width: 1.4, height: 2.8,  depth: 0.7 }

    default:               return { width: 1.0, height: 1.0,  depth: 0.9 } // rock
  }
}

/**
 * Returns the Y world-space centre of each obstacle's AABB.
 * Obstacle AABB: [yOffset - height/2, yOffset + height/2]
 */
export function getObstacleYOffset(type) {
  switch (type) {
    // Jump: low to ground
    case 'fireLine':       return 0.12
    case 'brokenPath':     return 0.05
    case 'energyBarrier':  return 0.35
    case 'low':            return 0.3

    // Slide: mid-to-high, hits standing player but not a sliding one
    case 'high':           return 2.15
    case 'hangingLog':     return 0.9    // bottom ≈ 0.6, above slide height
    case 'lowWall':        return 1.4    // bottom ≈ 0.65
    case 'treeBranch':     return 0.9

    // Lane-switch: all heights, but wide — player simply must switch lane
    case 'laneBlock':      return 1.6    // centre of a 3.2-tall wall
    case 'spikeTrap':      return 0.7    // ground spikes, centre at 0.7
    case 'swingBlade':     return 1.1    // blade sweeps ~mid-body
    case 'rollingBoulder': return 0.9
    case 'boulder':        return 0.9
    case 'barrier':        return 1.45

    default:               return 0.5
  }
}

/** Obstacle types that require the player to be jumping to pass safely */
export const JUMP_REQUIRED_TYPES = new Set([
  'fireLine', 'brokenPath', 'energyBarrier', 'low'
])

/** Obstacle types that require the player to be sliding to pass safely */
export const SLIDE_REQUIRED_TYPES = new Set([
  'high', 'hangingLog', 'lowWall', 'treeBranch'
])

/**
 * Lane-switch obstacles cannot be passed by jumping or sliding.
 * The only escape is to switch lanes before the obstacle is reached.
 * Collision logic should NOT pass these regardless of jump/slide state.
 */
export const LANE_SWITCH_TYPES = new Set([
  'laneBlock', 'spikeTrap', 'swingBlade', 'rollingBoulder', 'boulder', 'barrier', 'rock'
])

export default { checkCollision, getObstacleDimensions, getObstacleYOffset }
