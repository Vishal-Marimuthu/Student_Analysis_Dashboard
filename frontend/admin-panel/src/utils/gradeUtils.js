// Indian University Grading Scale
// O: 91–100 | A+: 81–90 | A: 71–80 | B+: 61–70 | B: 51–60 | C: 41–50 | F: ≤40

export function getGrade(marks) {
    if (marks >= 91) return 'O';
    if (marks >= 81) return 'A+';
    if (marks >= 71) return 'A';
    if (marks >= 61) return 'B+';
    if (marks >= 51) return 'B';
    if (marks >= 41) return 'C';
    return 'F';
}

export function getGradeColor(marks) {
    if (marks >= 81) return 'badge-success';   // O, A+ → green
    if (marks >= 61) return 'badge-primary';   // A, B+ → indigo
    if (marks >= 41) return 'badge-warning';   // B, C  → amber
    return 'badge-danger';                      // F     → red
}
