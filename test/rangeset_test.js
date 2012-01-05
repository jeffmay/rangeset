/**
 * User: jmay
 * Date: Oct 28, 2011
 * Time: 2:23:12 PM
 */
function bind_constructor()
{
	var type = Array.prototype.shift.call(arguments);
	var args = arguments;
	return function() {
		construct(type, args);
	}
}

function construct(constructor, args)
{
    // Do what happens when you use the "new" keyword
    function Type() {
        // Apply the constructor to the new object
        return constructor.apply(this, args);
    }
    Type.prototype = constructor.prototype;
    return new Type();
}

function runTests()
{
	module("IntRange");
	
	test("intersect known values",
		function()
		{
	        deepEqual(new IntRange(1, 2).intersect(new IntRange(1, 2)), new IntRange(1, 2));
	        deepEqual(new IntRange(1, 3).intersect(new IntRange(1, 2)), new IntRange(1, 2));
	        deepEqual(new IntRange(1, 2).intersect(new IntRange(1, 3)), new IntRange(1, 2));
	        deepEqual(new IntRange(0, 2).intersect(new IntRange(1, 2)), new IntRange(1, 2));
	        deepEqual(new IntRange(1, 2).intersect(new IntRange(0, 2)), new IntRange(1, 2));
	        deepEqual(new IntRange(0, 3).intersect(new IntRange(1, 2)), new IntRange(1, 2));
	        deepEqual(new IntRange(1, 2).intersect(new IntRange(0, 3)), new IntRange(1, 2));
	        deepEqual(new IntRange(1, 3).intersect(new IntRange(0, 2)), new IntRange(1, 2));
	        deepEqual(new IntRange(0, 2).intersect(new IntRange(1, 3)), new IntRange(1, 2));
	    }
	);
    test("intersect with null range always results in a null range",
    	function()
    	{
	        deepEqual(new IntRange(1, 2).intersect(new IntRange(null)), new IntRange(null));
	        deepEqual(new IntRange(null).intersect(new IntRange(3, 4)), new IntRange(null));
	        deepEqual(new IntRange(1, 2).intersect(new IntRange(3, 4)), new IntRange(null));
	        deepEqual(new IntRange(null).intersect(new IntRange(null)), new IntRange(null));
	    }
	);
    test("disjoint known values",
    	function()
    	{
	        deepEqual(new IntRange(1, 2).disjoint(new IntRange(1, 3)), new IntRangeSet([2, 3]));
	        deepEqual(new IntRange(1, 3).disjoint(new IntRange(1, 2)), new IntRangeSet([2, 3]));
	        deepEqual(new IntRange(0, 2).disjoint(new IntRange(1, 2)), new IntRangeSet([1, 2]));
	        deepEqual(new IntRange(1, 3).disjoint(new IntRange(0, 2)), new IntRangeSet([1, 2]));
	        deepEqual(new IntRange(0, 3).disjoint(new IntRange(1, 2)), new IntRangeSet([2, 3]));
	        deepEqual(new IntRange(1, 2).disjoint(new IntRange(1, 3)), new IntRangeSet([2, 3]));
	    }
	);
	test("disjoint with null range always results in a null range",
    	function()
    	{
	        deepEqual(new IntRange(1, 2).disjoint(new IntRange(1, 2)), new IntRangeSet(null));
	        deepEqual(new IntRange(null).disjoint(new IntRange(1, 2)), new IntRangeSet(null));
	        deepEqual(new IntRange(1, 2).disjoint(new IntRange(null)), new IntRangeSet(null));
	        deepEqual(new IntRange(null).disjoint(new IntRange(null)), new IntRangeSet(null));
	    }
	);
    test("isConnected known values",
    	function()
    	{
	        equal(new IntRange(1, 2).isConnected(new IntRange(2, 3)), true);
	        equal(new IntRange(2, 3).isConnected(new IntRange(1, 2)), true);
	        equal(new IntRange(1, 3).isConnected(new IntRange(1, 2)), true);
	        equal(new IntRange(1, 2).isConnected(new IntRange(1, 3)), true);
	        equal(new IntRange(1, 2).isConnected(new IntRange(3, 4)), false);
	    }
	);
	test("isConnected with null range is always false",
		function()
		{
	        equal(new IntRange(1, 2).isConnected(new IntRange(null)), false);
	        equal(new IntRange(null).isConnected(new IntRange(1, 2)), false);
	        equal(new IntRange(null).isConnected(new IntRange(null)), false);
	    }
	);
	
	module("IntRangeSet");
	
    test("constructor with empty or null parameters is always a null rangeset",
        function()
        {
        	var nullRangeSet = new IntRangeSet();
            deepEqual(new IntRangeSet(), nullRangeSet);
            deepEqual(new IntRangeSet(undefined), nullRangeSet);
            deepEqual(new IntRangeSet(undefined, undefined), nullRangeSet);
            deepEqual(new IntRangeSet(undefined, undefined, undefined), nullRangeSet);
            deepEqual(new IntRangeSet(null), nullRangeSet);
            deepEqual(new IntRangeSet(null, null), nullRangeSet);
            deepEqual(new IntRangeSet(null, null, null), nullRangeSet);
            deepEqual(new IntRangeSet([]), nullRangeSet);
            deepEqual(new IntRangeSet([null]), nullRangeSet);
            deepEqual(new IntRangeSet([null, null]), nullRangeSet);
            deepEqual(new IntRangeSet([null, null, null]), nullRangeSet);
        }
    );
    test("constructed with any null argument types are equivalent",
        function()
        {
            // Test the array arg format
            deepEqual(new IntRangeSet([null]), new IntRangeSet([null]));
            deepEqual(new IntRangeSet([null]), new IntRangeSet([new IntRange(null)]));
            deepEqual(new IntRangeSet([new IntRange(null)]), new IntRangeSet([null]));
            deepEqual(new IntRangeSet([new IntRange(null)]), new IntRangeSet([new IntRange(null)]));
            // Test the var args format
            deepEqual(new IntRangeSet(null), new IntRangeSet(null));
            deepEqual(new IntRangeSet(null), new IntRangeSet(new IntRange(null)));
            deepEqual(new IntRangeSet(new IntRange(null)), new IntRangeSet(null));
            deepEqual(new IntRangeSet(new IntRange(null)), new IntRangeSet(new IntRange(null)));
            // Test the array arg format matches the var args format
            deepEqual(new IntRangeSet(null), new IntRangeSet([null]));
            deepEqual(new IntRangeSet([null]), new IntRangeSet(null));
            deepEqual(new IntRangeSet(null), new IntRangeSet([new IntRange(null)]));
            deepEqual(new IntRangeSet([null]), new IntRangeSet(new IntRange(null)));
            deepEqual(new IntRangeSet(new IntRange(null)), new IntRangeSet([null]));
            deepEqual(new IntRangeSet([new IntRange(null)]), new IntRangeSet([null]));
            deepEqual(new IntRangeSet(new IntRange(null)), new IntRangeSet([new IntRange(null)]));
            deepEqual(new IntRangeSet([new IntRange(null)]), new IntRangeSet(new IntRange(null)));
        }
    );
    test("constructor does not accept int arguments",
        function()
        {
            raises(bind_constructor(IntRangeSet, 1, 2));
        }
    );
    test("constructor accepted values",
    	function()
    	{
            ok(bind_constructor(IntRangeSet, [1, 2]));
            ok(bind_constructor(IntRangeSet, [1, 2], [3, 4]));
            ok(bind_constructor(IntRangeSet, new IntRange(1, 2), new IntRange(3, 4)));
            ok(bind_constructor(IntRangeSet, new IntRange(1, 2), [3, 4]));
            ok(bind_constructor(IntRangeSet, [1, 2], new IntRange(3, 4)));
            ok(bind_constructor(IntRangeSet, [new IntRange(1, 2), new IntRange(3, 4)]));
            ok(bind_constructor(IntRangeSet, [new IntRange(1, 2), [3, 4]]));
            ok(bind_constructor(IntRangeSet, [[1, 2], new IntRange(3, 4)]));
            ok(bind_constructor(IntRangeSet, [[1, 2], [3, 4]]));
        }
    );
    test("constructor does not accept array of ranges mixed with other arguments",
        function()
        {
            raises(bind_constructor(IntRangeSet, new IntRange(1, 2), [new IntRange(3, 4), new IntRange(5, 6)]));
            raises(bind_constructor(IntRangeSet, new IntRange(1, 2), [new IntRange(3, 4), [5, 6]]));
            raises(bind_constructor(IntRangeSet, [1, 2], [new IntRange(3, 4), new IntRange(5, 6)]));
            raises(bind_constructor(IntRangeSet, [1, 2], [[3, 4], [5, 6]]));
            raises(bind_constructor(IntRangeSet, [new IntRange(3, 4), new IntRange(5, 6)], new IntRange(1, 2)));
            raises(bind_constructor(IntRangeSet, [new IntRange(3, 4), new IntRange(5, 6)], [1, 2]));
            raises(bind_constructor(IntRangeSet, [[3, 4], [5, 6]], new IntRange(1, 2)));
            raises(bind_constructor(IntRangeSet, [[3, 4], [5, 6]], [1, 2]));
        }
    );
    test("constructor does not accept array of ranges mixed with other elements inside a single array argument",
    	function()
    	{
            raises(bind_constructor(IntRangeSet, [new IntRange(1, 2), [new IntRange(3, 4), new IntRange(5, 6)]]));
            raises(bind_constructor(IntRangeSet, [new IntRange(1, 2), [new IntRange(3, 4), [5, 6]]]));
            raises(bind_constructor(IntRangeSet, [1, 2], [new IntRange(3, 4), new IntRange(5, 6)]));
            raises(bind_constructor(IntRangeSet, [1, 2], [[3, 4], [5, 6]]));
            raises(bind_constructor(IntRangeSet, [[new IntRange(3, 4), new IntRange(5, 6)], new IntRange(1, 2)]));
            raises(bind_constructor(IntRangeSet, [[new IntRange(3, 4), new IntRange(5, 6)], [1, 2]]));
            raises(bind_constructor(IntRangeSet, [[[3, 4], [5, 6]], new IntRange(1, 2)]));
            raises(bind_constructor(IntRangeSet, [[[3, 4], [5, 6]], [1, 2]]));
        }
    );
	test("constructor ignores null arguments",
		function()
		{
			var singleRange = new IntRangeSet([1, 2]);
	        deepEqual(new IntRangeSet(null, [1, 2]), singleRange);
	        deepEqual(new IntRangeSet([1, 2], null), singleRange);
	        var multiRange = new IntRangeSet([1, 2], [3, 4], [5, 8]);
	        deepEqual(new IntRangeSet(null, [1, 2], [3, 4], [5, 8]), multiRange);
	        deepEqual(new IntRangeSet([1, 2], null, [3, 4], [5, 8]), multiRange);
	        deepEqual(new IntRangeSet(null, [1, 2], null, [3, 4], [5, 8]), multiRange);
	        deepEqual(new IntRangeSet([1, 2], [3, 4], null, [5, 8]), multiRange);
	        deepEqual(new IntRangeSet([1, 2], [3, 4], [5, 8], null), multiRange);
	        deepEqual(new IntRangeSet([1, 2], [3, 4], null, [5, 8], null), multiRange);
	    }
	);
    test("constructor packs overlapping or connected ranges",
    	function()
    	{
    		// TODO: expand the overlapping tests
            deepEqual(new IntRangeSet([1, 2], [1, 2]), new IntRangeSet([1, 2]));
            // test connected ranges
            deepEqual(new IntRangeSet([1, 2], [2, 3]), new IntRangeSet([1, 3]));
            deepEqual(new IntRangeSet([1, 2], [2, 3], [3, 4]), new IntRangeSet([1, 4]));
	    }
    );
    // TODO: Create a separate test for adding unpacked (or remove this feature)
	test("constructor argument order does not matter",
    	function()
    	{
    		// Order doesn't matter for unconnected ranges
	        deepEqual(new IntRangeSet([1, 2], [3, 4]), new IntRangeSet([3, 4], [1, 2]));
	        // Order doesn't matter with connected ranges
	        deepEqual(new IntRangeSet([3, 4], [2, 3], [1, 2]), new IntRangeSet([1, 4]));
            deepEqual(new IntRangeSet([3, 4], [2, 3], [1, 2]), new IntRangeSet([1, 4]));
            // Order doesn't matter with overlapping ranges
	    }
	);
    test("equals known values",
    	function()
    	{
    		// TODO: Expand this to show that this is just as good as deepEqual()
    		// obviously equal
	        equal(new IntRangeSet().equals(new IntRangeSet()), true);
	        equal(new IntRangeSet([]).equals(new IntRangeSet([])), true);
	        equal(new IntRangeSet([1, 2]).equals(new IntRangeSet([1, 2])), true);
	        equal(new IntRangeSet([1, 2], [3, 4]).equals(new IntRangeSet([1, 2], [3, 4])), true);
	        equal(new IntRangeSet([1, 2], [3, 4], [5, 8]).equals(new IntRangeSet([1, 2], [3, 4], [5, 8])), true);
	        // obviously not equal
	        equal(new IntRangeSet([1, 2]).equals(new IntRangeSet([1, 3])), false);
	        equal(new IntRangeSet([1, 2]).equals(new IntRangeSet([0, 2])), false);
	        equal(new IntRangeSet([1, 2], [3, 4]).equals(new IntRangeSet([1, 2])), false);
	        equal(new IntRangeSet([1, 2]).equals(new IntRangeSet([1, 2], [3, 4])), false);
	        equal(new IntRangeSet([1, 4]).equals(new IntRangeSet([1, 2], [3, 4])), false);
	        equal(new IntRangeSet([1, 2], [3, 4]).equals(new IntRangeSet([1, 4])), false);
		}
	);
    test("union known values",
    	function()
    	{
	        deepEqual(new IntRangeSet([1, 2]).union(new IntRangeSet([2, 3])), new IntRangeSet([1, 3]));
	        deepEqual(new IntRangeSet([2, 3]).union(new IntRangeSet([1, 2])), new IntRangeSet([1, 3]));
	        deepEqual(new IntRangeSet([1, 2], [3, 4]).union(new IntRangeSet([2, 3])), new IntRangeSet([1, 4]));
	        deepEqual(new IntRangeSet([1, 2], [3, 4]).union(new IntRangeSet([2, 3], [4, 5])), new IntRangeSet([1, 5]));
	        deepEqual(new IntRangeSet([1, 2], [3, 4]).union(new IntRangeSet([2, 5])), new IntRangeSet([1, 5]));
	        deepEqual(new IntRangeSet([1, 2]).union(new IntRangeSet([0, 1], [2, 5])), new IntRangeSet([0, 5]));
	    }
	);
	test("union with null rangeset or undefined/null argument equals the non-null rangeset",
		function()
		{
	        deepEqual(new IntRangeSet().union(new IntRangeSet()), new IntRangeSet());
	        deepEqual(new IntRangeSet([1, 2]).union(new IntRangeSet()), new IntRangeSet([1, 2]));
	        deepEqual(new IntRangeSet().union(new IntRangeSet([1, 2])), new IntRangeSet([1, 2]));
	        deepEqual(new IntRangeSet([1, 2], [3, 4]).union(new IntRangeSet()), new IntRangeSet([1, 2], [3, 4]));
	        deepEqual(new IntRangeSet().union(null), new IntRangeSet());
			deepEqual(new IntRangeSet([1, 2]).union(null), new IntRangeSet([1, 2]));
			deepEqual(new IntRangeSet([1, 2], [3, 4]).union(null), new IntRangeSet([1, 2], [3, 4]));
			deepEqual(new IntRangeSet().union(undefined), new IntRangeSet());
			deepEqual(new IntRangeSet([1, 2]).union(undefined), new IntRangeSet([1, 2]));
			deepEqual(new IntRangeSet([1, 2], [3, 4]).union(undefined), new IntRangeSet([1, 2], [3, 4]));
			deepEqual(new IntRangeSet().union(), new IntRangeSet());
			deepEqual(new IntRangeSet([1, 2]).union(), new IntRangeSet([1, 2]));
			deepEqual(new IntRangeSet([1, 2], [3, 4]).union(), new IntRangeSet([1, 2], [3, 4]));
	    }
	);
    test("difference known values",
    	function()
    	{
	        // TODO: Finish writing the tests for this function
	        // Test the inner loop of the function
	        deepEqual(new IntRangeSet([5, 9]).difference(new IntRangeSet([0, 1], [2, 3], [4, 5])), new IntRangeSet([5, 9]));
	        deepEqual(new IntRangeSet([5, 9]).difference(new IntRangeSet([0, 1])), new IntRangeSet([5, 9]));
	        deepEqual(new IntRangeSet([5, 9]).difference(new IntRangeSet([4, 6])), new IntRangeSet([6, 9]));
	        deepEqual(new IntRangeSet([5, 9]).difference(new IntRangeSet([6, 7])), new IntRangeSet([5, 6], [7, 9]));
	        deepEqual(new IntRangeSet([1, 3]).difference(new IntRangeSet([1, 2])), new IntRangeSet([2, 3]));
	        deepEqual(new IntRangeSet([1, 3]).difference(new IntRangeSet([2, 3])), new IntRangeSet([1, 2]));
	        deepEqual(new IntRangeSet([1, 3], [4, 6]).difference(new IntRangeSet([2, 3], [4, 5])), new IntRangeSet([1, 2], [5, 6]));
	        deepEqual(new IntRangeSet([1, 6]).difference(new IntRangeSet([1, 6])), new IntRangeSet());
	        deepEqual(new IntRangeSet([1, 2], [4, 5]).difference(new IntRangeSet([3, 6])), new IntRangeSet([1, 2]));
	        deepEqual(new IntRangeSet([1, 3], [5, 6]).difference(new IntRangeSet([2, 7])), new IntRangeSet([1, 2]));
	        deepEqual(new IntRangeSet([1, 6]).difference(new IntRangeSet([2, 3], [4, 5])), new IntRangeSet([1, 2], [3, 4], [5, 6]));
	        deepEqual(new IntRangeSet([2, 3], [4, 5]).difference(new IntRangeSet([1, 6])), new IntRangeSet());
	        deepEqual(new IntRangeSet([2, 3], [4, 5]).difference(new IntRangeSet([2, 3])), new IntRangeSet([4, 5]));
	    }
	);

	module("Date Utility Functions");

	test("getDateShiftedByMonths known values",
		function()
		{
            deepEqual(getDateShiftedByMonths(new Date(2011, 0), -13), new Date(2009, 11));
            deepEqual(getDateShiftedByMonths(new Date(2011, 0), -12), new Date(2010, 0));
            deepEqual(getDateShiftedByMonths(new Date(2011, 0), -11), new Date(2010, 1));
            deepEqual(getDateShiftedByMonths(new Date(2011, 0), -10), new Date(2010, 2));
            deepEqual(getDateShiftedByMonths(new Date(2011, 0),  -9), new Date(2010, 3));
            deepEqual(getDateShiftedByMonths(new Date(2011, 0),  -7), new Date(2010, 5));
            deepEqual(getDateShiftedByMonths(new Date(2011, 0),  -6), new Date(2010, 6));
            deepEqual(getDateShiftedByMonths(new Date(2011, 0),  -5), new Date(2010, 7));
            deepEqual(getDateShiftedByMonths(new Date(2011, 0),  -4), new Date(2010, 8));
            deepEqual(getDateShiftedByMonths(new Date(2011, 0),  -3), new Date(2010, 9));
            deepEqual(getDateShiftedByMonths(new Date(2011, 0),  -2), new Date(2010, 10));
            deepEqual(getDateShiftedByMonths(new Date(2011, 0),  -1), new Date(2010, 11));
            deepEqual(getDateShiftedByMonths(new Date(2011, 0),   0), new Date(2011, 0));
            deepEqual(getDateShiftedByMonths(new Date(2011, 0),   1), new Date(2011, 1));
            deepEqual(getDateShiftedByMonths(new Date(2011, 0),   2), new Date(2011, 2));
            deepEqual(getDateShiftedByMonths(new Date(2011, 0),   3), new Date(2011, 3));
            deepEqual(getDateShiftedByMonths(new Date(2011, 0),   4), new Date(2011, 4));
            deepEqual(getDateShiftedByMonths(new Date(2011, 0),   5), new Date(2011, 5));
            deepEqual(getDateShiftedByMonths(new Date(2011, 0),   6), new Date(2011, 6));
            deepEqual(getDateShiftedByMonths(new Date(2011, 0),   7), new Date(2011, 7));
            deepEqual(getDateShiftedByMonths(new Date(2011, 0),   8), new Date(2011, 8));
            deepEqual(getDateShiftedByMonths(new Date(2011, 0),   9), new Date(2011, 9));
            deepEqual(getDateShiftedByMonths(new Date(2011, 0),  10), new Date(2011, 10));
            deepEqual(getDateShiftedByMonths(new Date(2011, 0),  11), new Date(2011, 11));
            deepEqual(getDateShiftedByMonths(new Date(2011, 0),  12), new Date(2012, 0));
	    }
	);
	// TODO: Find a better place for this code
    test("getDateShiftedByMonths rolls over based on start month",
    	function()
    	{
	        deepEqual(getDateShiftedByMonths(new Date(2010, 11),  1), new Date(2011, 0));
	        deepEqual(getDateShiftedByMonths(new Date(2010, 11), 13), new Date(2012, 0));
	        deepEqual(getDateShiftedByMonths(new Date(2010, 0),  -1), new Date(2009, 11));
	        deepEqual(getDateShiftedByMonths(new Date(2010, 0), -13), new Date(2008, 11));
	    }
	);
	
}