
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