// src/utils/synthesis.utils.js

/**
 * Calculates a basic risk score (0-100) based on patient metrics.
 * Higher score = higher risk/need for intervention.
 *
 * @param {object} history - Aggregated patient history from DB.
 * @returns {number} Calculated risk score.
 */
exports.calculateRiskScore = (history) => {
    const { appointments, conditions, patient } = history;
    
    // --- Factors and Weights ---
    const WEIGHT_CONDITION_SEVERITY = 5;
    const WEIGHT_APPOINTMENT_ADHERENCE = 3;
    const WEIGHT_CONDITIONS_COUNT = 4;
    
    // 1. Condition Severity (0-100 based on weighted average)
    let totalSeverity = 0;
    conditions.forEach(c => {
        if (c.severity === 'Severe') totalSeverity += 10;
        else if (c.severity === 'Moderate') totalSeverity += 5;
        else totalSeverity += 1;
    });
    let conditionRisk = Math.min(totalSeverity * WEIGHT_CONDITION_SEVERITY, 50); // Max 50 points
    
    // 2. Appointment Adherence (Penalty for missed appointments)
    const totalAppts = appointments.length;
    const cancelledAppts = appointments.filter(a => a.status === 'Cancelled').length;
    const adherenceRate = totalAppts > 0 ? (totalAppts - cancelledAppts) / totalAppts : 1;
    let adherencePenalty = Math.max(0, 100 * (1 - adherenceRate));
    adherencePenalty = Math.min(adherencePenalty * WEIGHT_APPOINTMENT_ADHERENCE, 30); // Max 30 points

    // 3. Number of Chronic Conditions (Max 20 points)
    let conditionCountRisk = Math.min(conditions.length * WEIGHT_CONDITIONS_COUNT, 20);

    // --- Final Score Calculation ---
    let finalScore = Math.round(conditionRisk + adherencePenalty + conditionCountRisk);
    
    // Ensure score is between 0 and 100
    return Math.min(Math.max(finalScore, 0), 100);
};


/**
 * Determines a simple Adherence Status based on cancellations.
 *
 * @param {object} history - Aggregated patient history from DB.
 * @returns {string} Status ('Good', 'Moderate', 'Poor').
 */
exports.getAdherenceStatus = (history) => {
    const totalAppts = history.appointments.length;
    const cancelledAppts = history.appointments.filter(a => a.status === 'Cancelled').length;
    
    if (totalAppts < 3) return 'Insufficient Data';

    const cancellationRate = cancelledAppts / totalAppts;

    if (cancellationRate < 0.10) return 'Good'; // Less than 10% cancelled
    if (cancellationRate < 0.30) return 'Moderate'; // Less than 30% cancelled
    return 'Poor';
};