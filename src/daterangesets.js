
/**
 * Returns a new date on the 1st of the month shifted by the given number of months.
 *
 * @param date The date to shift. This will not be modified.
 * @param months The number of months to shift the date. Positive or negative.
 */
function getDateShiftedByMonths(date, months)
{
    var month = (date.getMonth() + months) % 12;
    var year = date.getFullYear() + parseInt((date.getMonth() + months) / 12, 10);
    return new Date(year, month);
}

/**
 * Create an Array of date range objects starting from a given date with a width of that month optionally
 * expanded by monthsBefore and monthsAfter that month in that year and (optionally) for yearsBefore and
 * yearsAfter the given year.
 *
 * Date range object format:
 * {
 *     start: Date(),
 *     end: Date()
 * }
 *
 * - The range in months for all Date range objects will be 1 + monthsBefore + monthsAfter
 * - The length of the array will be 1 + yearsBefore + yearsAfter.
 *
 * @param date The date to start generating the date rangeset from.
 * @param monthsBefore (Optional) The number of months before the given date to include in the Date ranges
 * @param monthsAfter (Optional) The number of months after the given date to include in the Date ranges
 * @param yearsBefore (Optional) The number of years before the given date to create the Date ranges for
 * @param yearsAfter (Optional) The number of years after the given date to create Date ranges for
 *
 * @return An Array of Date range objects (see above) containing a Date range from monthsBefore to monthsAfter
 * (always inlcuding the month of the given date) for all years between yearsBefore and years after (always
 * including the year of the given date).
 * The Date range may be invalid if either monthsBefore or monthsAfter are negative.
 */
function createYearAndMonthRangeSet(date, monthsBefore, monthsAfter, yearsBefore, yearsAfter) {
    if(!monthsBefore) monthsBefore = 0;
    if(!monthsAfter) monthsAfter = 0;
    if(!yearsBefore) yearsBefore = 0;
    if(!yearsAfter) yearsAfter = 0;
    var rangeset = new IntRangeSet();
    var curYear = date.getFullYear();
    // Add any years before
    if(yearsBefore > 0) {
        var curDate = new Date(date.getTime());
        for(var years = yearsBefore; years > 0; years--) {
            curDate.setFullYear(curYear - years);
            rangeset.add(new IntRange(
                getDateShiftedByMonths(curDate, -monthsBefore).getTime(),
                getDateShiftedByMonths(curDate, monthsAfter + 1).getTime()
            ), true);
        }
    }
    // Always add the date range for the year of the given date
    rangeset.add(new IntRange(
        getDateShiftedByMonths(date, -monthsBefore).getTime(),
        getDateShiftedByMonths(date, monthsAfter + 1).getTime()
    ), true);
    // Add any years after
    if(yearsAfter > 0) {
        var curDate = new Date(date.getTime());
        for(var years = 1; years <= yearsAfter; years++) {
            curDate.setFullYear(curYear + years);
            rangeset.add(new IntRange(
                getDateShiftedByMonths(curDate, -monthsBefore).getTime(),
                getDateShiftedByMonths(curDate, monthsAfter + 1).getTime()
            ), true);
        }
    }
    rangeset.pack();
    return rangeset;
}