/**
 * User: jmay
 * Date: Oct 28, 2011
 * Time: 2:23:02 PM
 */

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

/**
 * RangeSets are commonly defined by passing a list of 2-tuples. They can be passed
 * as in an argument list or an array.
 *
 *  IntRangeSet([1,2])
 *  IntRangeSet([1,2],[3,4])
 *  IntRangeSet([[1,2],[3,4]])
 *
 * The following can be used to construct an "Empty" IntRangeSet, since
 * null values are valid arguments for the IntRange constructor.
 *
 *  IntRangeSet()
 *  IntRangeSet(null)
 *  IntRangeSet(null, null)
 *
 * Arguments only need to be valid arguments for the IntRange constructor
 *
 *  IntRangeSet(new IntRange(1,2), new IntRange(3,4))
 *  IntRangeSet([1,2], new IntRange(3,4))
 *
 * Same goes for the array argument:
 *
 *  IntRangeSet([new IntRange(1,2), new IntRange(3,4)])
 *  IntRangeSet([[1,2], new IntRange(3,4)])
 *
 * Internally RangeSets are treated as immutable. If you would like to change a RangeSet
 * externally, be sure to call pack() before doing any operations on it.
 *
 */
function IntRangeSet(ranges)
{
    IntRangeSet.prototype.__init__.apply(this, arguments);
}
// Prototype definition
IntRangeSet.prototype = {
    __init__: function(ranges) {
        this.ranges = [];
        // RangeSet with only zero items must be compact
        this.compact = arguments.length == 0;
        if(arguments.length == 1) {
            if(ranges instanceof Array) {
                if(ranges.length == 2 && typeof ranges[0] == 'number' && typeof ranges[1] == 'number') {
                    // Single IntRange
                    this.ranges.push(new IntRange(ranges));
                }
                else {
                    for(var i=0; i<ranges.length; i++) {
                        this.ranges.push(new IntRange(ranges[i]));
                    }
                }
            }
            else if(ranges instanceof IntRangeSet) {
                // Copy the IntRange values into the arguments
                this.ranges = Array.prototype.slice.call(ranges.ranges, 0, 0);
            }
        }
        else {
            for(var i=0; i<arguments.length; i++) {
                this.ranges.push(new IntRange(arguments[i]));
            }
        }
        if(!this.compact) {
            this.pack();
        }
    },
    pack: function() {
        // Sort from lowest to highest
        this.ranges.sort(IntRange.Comparator);
        // Merge by joining continguous ranges from lowest to highest
        var prev = new IntRange();
        var newranges = [];
        for(var i=0; i<this.ranges.length; i++) {
            var cur = this.ranges[i];
            // Skip any null ranges, we don't need them
            if(cur.nullrange) {
                continue;
            }
            // Merge the current range into the previous contiguous range or create a new one
            var merged;
            if(prev.nullrange) {
                // Use the current range as the start of a new contiguous range
                merged = cur;
            }
            else {
                // Merge newest range into contiguous range
                merged = prev.merge(cur);
                // If the current range is not connected to the previous contiguous range
                // or we have reached the end
                if(merged.nullrange) {
                    // add the previous non-null contiguous range
                    newranges.push(prev);
                }
            }
            if(i == this.ranges.length - 1) {
                // If we have reached the end add the current non-null contiguous range
                // Use the current rangeset if it not contiguous 
                newranges.push(merged.nullrange ? cur : merged);
            }
            else {
                // Set the previous pointer to the current contiguous range
                prev = merged;
            }
        }
        this.ranges = newranges;
        // Mark as complete
        this.compact = true;
    },
    // TODO: Create compareTo function
    equals: function(rangeset) {
        var matches = true;
        if(rangeset && this.ranges.length == rangeset.ranges.length) {
            for(var i=0; i<rangeset.ranges.length; i++) {
                if(!this.ranges[i].equals(rangeset.ranges[i])) {
                    matches = false;
                    break;
                }
            }
        }
        else {
            matches = false;
        }
        return matches;
    },
    add: function(range, waitToPack) {
        if(!(range instanceof IntRange)) {
            range = new IntRange(range);
        }
        if(!range.nullrange) {
            this.ranges.push(range);
            if(waitToPack !== true) {
                this.pack();
            }
        }
    },
    union: function(rangeset) {
        var joined = new IntRangeSet(this);
        if(rangeset && rangeset.ranges && rangeset.ranges.length) {
            Array.prototype.push.apply(joined.ranges, rangeset.ranges);
        }
        return joined;
    },
    difference: function(rangeset) {
        throw "NotImplementedError: difference is not implemented.";
        // TODO: Implement this using the pencil method
        if(rangeset.ranges.length == 0 || this.ranges.length == 0) return new IntRangeSet();
        // Sweep from lowest to greatest and subtract out any parts that are inside the given rangeset
        var newranges = [];
        var ti = 0, ri = 0;
        var t = this.ranges[ti];
        var r = rangeset.ranges[ri];
        var subtract_mode = r.start <= t.start;
        debugger;
        do {
            var range = [];
            if(subtract_mode) {
                // t  ---      --         ---         ---
                // r  --   OR  ---  OR  ---    OR  ---

                // Find the end of the subtracting range in the current rangeset
                while(t.end < r.end && ti < this.ranges.length) {
                    // TODO: Break when end reached
                    t = this.ranges[++ti];
                }
                // Get the start point of the current range
                range[0] = t.start < r.end ? r.end : t.start;
                // Check the next range to figure out the state
                r = rangeset.ranges[++ri];
                if(r.start <= t.end) {
                    // Cut the end of the current range at the start of the next subtracting range
                    range[1] = r.start;
                }
                else {
                    // Let the range finish naturally before we look for the next subtracting range
                    range[1] = t.end;
                    // Time to switch modes
                    subtract_mode = false;
                    t = this.ranges[++ti];
                }
                newranges.push(new IntRange(range));
            }
            else {
                // t  --       ---        ---         ---
                // r  ---  OR  ---  OR  ---    OR  ---

                // Find the start of the next subtracting range in the given rangeset
                // Unless we already have it
                while(r.end < t.start && rangeset.ranges.length) {
                    // TODO: Break when end reached
                    r = rangeset.ranges[++ri];
                }

                // Get the end point of the subtracting range
                if(r.end < t.start) {
                    // t  ---         ---
                    // r  ---     OR   ---
                    // Cut the start of the next range to the end end of the subtracting range
                    range[0] = r.end;
                }
                else {
                    // t  ---      ---       ---
                    // r  ---  OR   ---  OR     ---
                    range[0] = t.start;
                    // Time to switch modes
                    subtract_mode = false;
                    r = rangeset.ranges[++ri];
                }
                range[1] = t.end;
                newranges.push(new IntRange(range));
            }
        }
        while(ti < this.ranges.length);
        console.log();
    },
    clone: function() {
        return new IntRangeSet(this);
    },
    toString: function() {
        var str = 'IntRangeSet( ';
        for(var i=0; i<this.ranges.length; i++) {
            if(i > 0) {
                str += ', ';
            }
            str += this.ranges[i].start + '-' + this.ranges[i].end;
        }
        str += ' )';
        return str;
    }
};



/**
 * Valid ways to define an IntRange:
 *
 *  IntRange()
 *  IntRange(null)
 *  IntRange(1,2)
 *  IntRange([1,2])
 *
 */
function IntRange(start, end)
{
    IntRange.prototype.__init__.apply(this, arguments);
}
// Prototype definition
IntRange.prototype = {
    __init__: function() {
        var start,end;
        if(arguments.length <= 1) {
            if(arguments.length == 0 || arguments[0] == null) {
                // Create a null range
                start = null;
            }
            else if(arguments[0] instanceof IntRange) {
                // Copy the int range values into the arguments
                start = arguments[0].start;
                end = arguments[0].end;
            }
            else if(arguments[0].length == 2 && typeof arguments[0][0] == 'number' && typeof arguments[0][1] == 'number') {
                // Unpack the array arguments
                start = arguments[0][0];
                end = arguments[0][1];
            }
            else if(typeof arguments[0] == 'number') {
                throw "Error: Missing end argument";
            }
            else {
                throw "TypeError: Invalid argument type. Must be two number arguments, an IntRange, an array of 2 numbers, or null.";
            }
        }
        else if(arguments.length == 2) {
            start = arguments[0];
            end = arguments[1];
        }
        else {
            throw "Error: Too many arguments";
        }

        if(typeof start == 'number' && typeof end == 'number') {
            this.start = Math.floor(start);
            this.end = Math.floor(end);
            this.nullrange = false;
            if(this.start > this.end) {
                throw "Invalid IntRange( " + start + " : " + end + " ) [start > end]";
            }
        }
        else if(start == null && end == null) {
            this.start = null;
            this.end = null;
            this.nullrange = true;
        }
        else {
            throw "TypeError: Invalid arguments for " + this.toString.call({
                start: start,
                end: end
            });
        }
    },
    equals: function(range) {
        if(!range) return false;
        if(!(range instanceof IntRange)) {
            range = new IntRange(range);
        }
        if(this.nullrange || range.nullrange) return this.nullrange && range.nullrange;
        return this.start == range.start && this.end == range.end;
    },
    compareTo: function(o) {
        if(this.equals(o)) {
            return 0;
        }
        else if(this.nullrange) {
            return -1;
        }
        else if(o.nullrange) {
            return 1;
        }
        else if(this.start != o.start) {
            return this.start - o.start;
        }
        else {
            return this.end - o.end;
        }
    },
    isEmpty: function() {
        return this.nullrange || this.start == 0 && this.end == 0;
    },
    contains: function(range) {
        if(this.nullrange || range.nullrange) return false;
        return this.start <= range.start && this.end >= range.end;
    },
    surrounds: function(range) {
        if(this.nullrange) return false;
        return this.start < range.start && this.end > range.end;
    },
    isConnected: function(range) {
        if(!range || range.nullrange || this.nullrange) return false;
        return this.end >= range.start && this.start <= range.end;
    },

    // Immutable operations

    intersect: function(range) {
        if(this.nullrange || range.nullrange) return new IntRange();
        if(this.end < range.start || this.start > range.end) return new IntRange();
        return new IntRange(Math.max(this.start, range.start), Math.min(this.end, range.end));
    },
    merge: function(range) {
        if(this.isConnected(range)) {
            return new IntRange(Math.min(this.start, range.start), Math.max(this.end, range.end));
        }
        else {
            return new IntRange();
        }
    },
    // TODO: Rename to symdiff ::ugh::
    disjoint: function(range) {
        if(range.nullrange) return new IntRangeSet([this]);
        if(this.nullrange) return new IntRangeSet([range]);
        ranges = [];
        if(this.surrounds(range)) {
            ranges.push(new IntRange(this.start, range.start), new IntRange(range.end, this.end));
        }
        else if(range.surrounds(this)) {
            ranges.push(new IntRange(range.start, this.start), new IntRange(this.end, range.end));
        }
        else {
            var intersect = this.intersect(range);
            if(intersect.start == range.start) {
                // They share the same start point
                if(range.end > intersect.end) ranges.push(new IntRange(intersect.end, range.end));
                else ranges.push(new IntRange(range.end, intersect.end));
            }
            else if(intersect.end == range.end) {
                // They share the same end point
                if(range.start > intersect.start) ranges.push(new IntRange(intersect.start, range.start));
                else ranges.push(new IntRange(range.start, intersect.start));
            }
            else {
                // The have no points in common
                ranges.push(this, range);
            }
        }
        return new IntRangeSet(ranges);
    },
    clone: function() {
        return new IntRange(this);
    },
    toString: function() {
        return 'IntRange( ' + this.start + '-' + this.end + ' )';
    }
};
// Static methods
IntRange.Comparator = function(a, b) {
    return a.compareTo(b);
};
