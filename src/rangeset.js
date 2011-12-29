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
        // Merge by joining contiguous ranges from lowest to highest
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
            // Set the previous pointer to the current contiguous range
            prev = merged.nullrange ? cur : merged;
        }
        if(!prev.nullrange) {
            // Add the last non-null contiguous range
            newranges.push(prev);
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
    /**
     * Compute the asymetric differce with the given rangeset.
     *
     * Ex:
     *      ___  ___  _ ___  _ ___  (a)
     *         ___ ____ _ ____      (b)
     *    = ___   _      _     ___  (result)
     *
     * NOTE: a.difference(b) != b.difference(a) for all a,b
     *
     * @param rangeset Another IntRangeSet to subtract from this rangeset.
     *
     * @return A new rangeset representing the rangeset difference of
     *         this rangeset - the given rangeset.
     */
    difference: function(rangeset) {
        /* This uses what I would like to call the pen algorithm.
         *
         * An easy way to imagine it is to pretend to hold a pen and
         * examine each of the ranges in the top rangeset, which we
         * can imagine as a series of line segments.
         *
         * ie.       ____  _________  ___    (top rangeset)
         *      __  ___  ____  ___      ___  (bottom rangeset)
         *    =        __    __   __  __     (resulting rangeset)
         *
         * First, we search for when to place our pen.
         * If the vertex falls inside a bottom range, we move our pen
         * to the end of that bottom range.
         *
         * ie.       ____  _________  ___    (top rangeset)
         *      __  ___  ____  ___      ___  (bottom rangeset)
         *  pen_start >
         *
         * Then we drag the pen to either the end of the top range
         * or the start of the next bottom range.
         *
         * ie.       ____  _________  ___    (top rangeset)
         *      __  ___  ____  ___      ___  (bottom rangeset)
         *             __< pen_end
         *
         * Then we add the marked range to the resulting rangeset
         * and move to the next top range and do it again.
         *
         * When searching for where to place our pen, we must always
         * examine the bottom range that ends after the start of the
         * current top range.
         *
         * Then we can construct the range
         * from max(top.start, btm.end) to min(top.end, btm.start)
         */
        if( rangeset.ranges.length == 0 || this.ranges.length == 0 ) {
            return new IntRangeSet();
        }
        var newranges = [];
        var top_idx = 0, btm_idx = 0;
        // We keep track of the bottom ranges separately,
        // so we need to set it here.
        var top_range, btm_range = rangeset.ranges[btm_idx];
        var pen_start, pen_stop;
        // TODO: Solve rangeset difference algorithm
        do
        {
            // TODO: Rewrite this to handle bottom rangesets
            //== Step 1: Find pen_start ==
            // There will always be a pen_start on a top range
            // unless the top range is surrounded by a bottom range
            // i.e.   ___   OR  _____
            //       _____      _____
            top_range = this.ranges[top_idx++];
            if( btm_range.surrounds(top_range) ) {
                continue;
            }
            // Skip any bottom ranges that end before the
            // start of the top range
            while( btm_range && top_range.start >= btm_range.end )
            {
                btm_range = rangeset.ranges[++btm_idx];
            }
            if( btm_range ) {
                if( btm_range.start <= top_range.start ) {
                    // The bottom 
                    // Set the pen down at the start of the top range
                    // or the end of bottom range (if it is greater)
                    pen_start = Math.max(top_range.start, btm_range.end);
                    // Find the next bottom range (if there is one)
                    btm_range = rangeset.ranges[++btm_idx];
                }
                else {
                    // The bottom range does not affect the pen_start
                    pen_start = top_range.start;
                }
            }
            else {
                // No more bottom ranges, just draw from the start
                pen_start = top_range.start;
            }
            // Step 2: Find pen_end
            if( btm_range ) {
                // Mark to the end of the top range
                // or the start of the bottom range (if it is less)
                pen_end = Math.min(top_range.end, btm_range.start);
            }
            else {
                // No more bottom ranges, just draw to the end
                pen_end = top_range.end;
            }
            // Step 3: Add the marked range to the results
            if( pen_start < pen_end ) {
                // Only add the range if it is valid
                newranges.push(new IntRange(pen_start, pen_end));
            }
            if( !btm_range ) {
                // If we have run out of ranges to subtract
                // Add all the remaining ranges to the set
                Array.prototype.push.apply(
                        newranges, this.ranges.splice(top_idx + 1));
                break;
            }
        }
        // Iterate through every range to be subtracted from
        while ( top_idx < this.ranges.length );
        // Return a new rangeset to insure immutability
        return new IntRangeSet(newranges);
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
