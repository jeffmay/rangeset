
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
    IntRangeSets.newRangeSet(this, arguments);
}
IntRangeSet.prototype.toString = function() {
    var str = 'RangeSet( ';
    for(var i=0; i<this.ranges.length; i++) {
        if(i > 0) {
            str += ', ';
        }
        str += this.ranges[i].start + '-' + this.ranges[i].end;
    }
    str += ' )';
    return str;
};

// Controller definition
var IntRangeSets =
{
    newRangeSet: function(rangeset, args) {
        rangeset.ranges = [];
        // RangeSet with only zero items must be compact
        rangeset.compact = args.length == 0;
        if(args.length == 1) {
            // The argument must be a RangeSet or a list of ranges
            var ranges = args[0];
            if(ranges instanceof Array) {
                if(ranges.length == 2 && typeof ranges[0] == 'number' && typeof ranges[1] == 'number') {
                    // Single IntRange
                    rangeset.ranges.push(new IntRange(ranges));
                }
                else {
                    for(var i=0; i<ranges.length; i++) {
                        rangeset.ranges.push(new IntRange(ranges[i]));
                    }
                }
            }
            else if(ranges instanceof IntRangeSet) {
                // Copy the IntRange values into the arguments
                rangeset.ranges = Array.prototype.slice.call(ranges.ranges, 0, 0);
            }
        }
        else {
            for(var i=0; i<args.length; i++) {
                rangeset.ranges.push(new IntRange(args[i]));
            }
        }
        if(!rangeset.compact) {
            this.pack(rangeset);
        }
    },
    pack: function(rangeset) {
        if(!(rangeset instanceof IntRangeSet)) rangeset = new IntRangeSet(rangeset);
        // Sort from lowest to highest
        rangeset.ranges.sort(IntRange.compare);
        // Merge by joining contiguous ranges from lowest to highest
        var prev = new IntRange();
        var newranges = [];
        for(var i=0; i<rangeset.ranges.length; i++) {
            var cur = rangeset.ranges[i];
            // Skip any null ranges, we don't need them
            if(IntRanges.isEmpty(cur)) {
                continue;
            }
            // Merge the current range into the previous contiguous range or create a new one
            var merged;
            if(IntRanges.isEmpty(prev)) {
                // Use the current range as the start of a new contiguous range
                merged = cur;
            }
            else {
                // Merge newest range into contiguous range
                merged = IntRanges.merge(prev, cur);
                // If the current range is not connected to the previous contiguous range
                // or we have reached the end
                if(IntRanges.isEmpty(merged)) {
                    // add the previous non-null contiguous range
                    newranges.push(prev);
                }
            }
            // Set the previous pointer to the current contiguous range
            prev = IntRanges.isEmpty(merged) ? cur : merged;
        }
        if(!prev.nullrange) {
            // Add the last non-null contiguous range
            newranges.push(prev);
        }
        rangeset.ranges = newranges;
        // Mark as complete
        rangeset.compact = true;
    },
    // TODO: Create compare function
    equal: function(left, right) {
        if(!(left instanceof IntRangeSet)) left = new IntRangeSet(left);
        if(!(right instanceof IntRangeSet)) right = new IntRangeSet(right);
        var matches = true;
        if(left.ranges.length == right.ranges.length) {
            for(var i=0; i<right.ranges.length; i++) {
                if(!IntRanges.equal(left.ranges[i], right.ranges[i])) {
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
    addRange: function(rangeset, range, waitToPack) {
        if(!(rangeset instanceof IntRangeSet)) rangeset = new IntRangeSet(rangeset);
        if(!(range instanceof IntRange)) range = new IntRange(range);
        if(!IntRanges.isEmpty(range)) {
            rangeset.ranges.push(range);
            if(waitToPack !== true) {
                rangeset.pack();
            }
        }
    },
    union: function(left, right) {
        if(!(left instanceof IntRangeSet)) left = new IntRangeSet(left);
        if(!(right instanceof IntRangeSet)) right = new IntRangeSet(right);
        var joined_ranges = Array.prototype.concat.call(left.ranges, right.ranges);
        return new IntRangeSet(joined_ranges);
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
    difference: function(left, right) {
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
        if(!(left instanceof IntRangeSet)) left = new IntRangeSet(left);
        if(!(right instanceof IntRangeSet)) right = new IntRangeSet(right);
        if( left.ranges.length == 0 || right.ranges.length == 0 ) {
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
            top_range = left.ranges[top_idx++];
            if( IntRanges.surrounds(btm_range, top_range) ) {
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
                    btm_range = right.ranges[++btm_idx];
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
                        newranges, left.ranges.splice(top_idx + 1));
                break;
            }
        }
        // Iterate through every range to be subtracted from
        while ( top_idx < left.ranges.length );
        // Return a new rangeset to insure immutability
        return new IntRangeSet(newranges);
    }
};