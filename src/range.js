
/**
 * A range implementation that operates on integers.
 * 
 * This currently does not support infinite bounds.
 *
 */
function IntRange(start, end)
{
    IntRanges.newRange(this, arguments);
}
IntRange.prototype.toString = function()
{
    return 'Range( ' + this.start + '-' + this.end + ' )';
};

// Controller definition
var IntRanges =
{
    newRange: function(range, args) {
        var start,end;
        if(args.length <= 1) {
            if(args.length == 0 || args[0] == null) {
                // Create a null range
                start = null;
            }
            else if(args[0] instanceof IntRange) {
                // Copy the int range values into the args
                start = args[0].start;
                end = args[0].end;
            }
            else if(args[0].length == 2 && typeof args[0][0] == 'number' && typeof args[0][1] == 'number') {
                // Unpack the array args
                start = args[0][0];
                end = args[0][1];
            }
            else if(typeof args[0] == 'number') {
                throw "Error: Missing end argument";
            }
            else {
                throw "Invalid Arguments: Type Error: Must be two number arguments, an IntRange, an array of 2 numbers, or null.";
            }
        }
        else if(args.length == 2) {
            start = args[0];
            end = args[1];
        }
        else {
            throw "Error: Too many arguments";
        }

        if(typeof start == 'number' && typeof end == 'number') {
            range.start = Math.floor(start);
            range.end = Math.floor(end);
            if(range.start > range.end) {
                throw "Invalid Arguments: Value Error [start > end]: in " + this.toString(range);
            }
        }
        else if(start == null) {
            range.start = null;
            range.end = null;
        }
        else {
            range.start = start;
            range.end = end;
            throw "Invalid Arguments: Type Error " + this.toString(range);
        }
    },
    equal: function(left, right) {
    	if(left === right) return true;
        if(!left || !right) return false;
        if(!(left instanceof IntRange)) {
            left = new IntRange(left);
        }
        if(!(right instanceof IntRange)) {
            right = new IntRange(right);
        }
        return left.start == right.start && left.end == right.end;
    },
    compare: function(left, right) {
        if(this.equal(left, right)) {
            return 0;
        }
        else if(this.isEmpty(left)) {
            return -1;
        }
        else if(this.isEmpty(right)) {
            return 1;
        }
        else if(left.start != right.start) {
            return left.start - right.start;
        }
        else {
            return left.end - right.end;
        }
    },
    isEmpty: function(range) {
        if(!(range instanceof IntRange)) range = new IntRange(range);
        return range.start == null || range.end == null || range.start == range.end;
    },
    contains: function(left, right) {
        if(!(left instanceof IntRange)) left = new IntRange(left);
        if(!(right instanceof IntRange)) right = new IntRange(right);
        if(this.isEmpty(left) || this.isEmpty(right)) return false;
        return left.start <= right.start &&
               left.end   >= right.end;
    },
    surrounds: function(left, right) {
        if(!(left instanceof IntRange)) left = new IntRange(left);
        if(!(right instanceof IntRange)) right = new IntRange(right);
        if(this.isEmpty(left) || this.isEmpty(right)) return false;
        return left.start < right.start &&
               left.end   > right.end;
    },
    isConnected: function(left, right) {
        if(!(left instanceof IntRange)) left = new IntRange(left);
        if(!(right instanceof IntRange)) right = new IntRange(right);
        if(this.isEmpty(left) || this.isEmpty(right)) return false;
        return left.end   >= right.start &&
               left.start <= right.end;
    },
    intersect: function(left, right) {
        if(!(left instanceof IntRange)) left = new IntRange(left);
        if(!(right instanceof IntRange)) right = new IntRange(right);
        if(this.isEmpty(left) || this.isEmpty(right)) return new IntRange();
        if(left.end < right.start || left.start > right.end) return new IntRange();
        return new IntRange(Math.max(left.start, right.start),
                            Math.min(left.end, right.end));
    },
    merge: function(left, right) {
        if(!(left instanceof IntRange)) left = new IntRange(left);
        if(!(right instanceof IntRange)) right = new IntRange(right);
        if(this.isConnected(left, right)) {
            return new IntRange(Math.min(left.start, right.start),
                                Math.max(left.end, right.end));
        }
        else {
            return new IntRange();
        }
    },
    difference: function(left, right) {
        if(!(left instanceof IntRange)) left = new IntRange(left);
        if(!(right instanceof IntRange)) right = new IntRange(right);
        if(this.isEmpty(left)) return new IntRangeSet([right]);
        if(this.isEmpty(right)) return new IntRangeSet([left]);
        ranges = [];
        if(this.surrounds(left, right)) {
            ranges.push(new IntRange(left.start, right.start), new IntRange(right.end, left.end));
        }
        else if(this.surrounds(right, left)) {
            ranges.push(new IntRange(right.start, left.start), new IntRange(left.end, right.end));
        }
        else {
        	// TODO: Fix this so that the left range is incorporated
            var intersect = this.intersect(left, right);
            if(intersect.start == right.start) {
                // They share the same start point
                if(right.end > intersect.end) ranges.push(new IntRange(intersect.end, right.end));
                else ranges.push(new IntRange(right.end, intersect.end));
            }
            else if(intersect.end == right.end) {
                // They share the same end point
                if(right.start > intersect.start) ranges.push(new IntRange(intersect.start, right.start));
                else ranges.push(new IntRange(right.start, intersect.start));
            }
            else {
                // The have no points in common
                ranges.push(left, right);
            }
        }
        return new IntRangeSet(ranges);
    }
};