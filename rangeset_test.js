/**
 * User: jmay
 * Date: Oct 28, 2011
 * Time: 2:23:12 PM
 */

function testRangeConstructor()
{
    console.log("Testing Range Constructor...");
    var action = function(test, args, expected) {
        return construct(IntRange, args);
    };
    var tests = [
        [[], false],
        [[undefined], false],
        [[undefined, undefined], false],
        [[undefined, undefined, undefined], true],
        [[null], false],
        [[null,null], false],
        [[null,null,null], true],
        [[new IntRange(1,2)], false],
        [[[new IntRange(1,2)]], true],
        [[new IntRange(1,2), new IntRange(3,4)], true],
        [[[new IntRange(1,2), new IntRange(3,4)]], true],
        [[1,2], false],
        [[1,2,3], true],
        [[[1,2]], false],
        [[[1,2,3]], true],
        [[[1,2],[3,4]], true]
    ];
    assertTestsError(tests, action);
}

function testRangeSetConstructor()
{
    console.log("Testing RangeSet Constructor...");
    var action = function(test, args, expected) {
        return construct(IntRangeSet, args);
    };
    var tests = [
        // This is an empty IntRangeSet
        [[], false],
        [[undefined], false],
        [[undefined, undefined], false],
        [[undefined, undefined,undefined], false],
        [[null], false],
        [[null,null], false],
        [[null,null,null], false],
        [[[null]], false],
        [[[null, null]], false],
        [[[null, null, null]], false],
        // IntRangeSet(1,2) doesn't make sense
        [[1,2], true],
        // These should all work
        [[[1,2]], false],
        [[[1,2],[3,4]], false],
        [[new IntRange(1,2),new IntRange(3,4)], false],
        [[new IntRange(1,2),[3,4]], false],
        [[[1,2],new IntRange(3,4)], false],
        [[[new IntRange(1,2),new IntRange(3,4)]], false],
        [[[new IntRange(1,2),[3,4]]], false],
        [[[[1,2],new IntRange(3,4)]], false],
        [[[[1,2],[3,4]]], false],
        // Mixed array with IntRange constructor args in an array also do not flatten
        [[new IntRange(1,2),[new IntRange(3,4),new IntRange(5,6)]], true],
        [[new IntRange(1,2),[new IntRange(3,4),[5,6]]], true],
        [[[1,2],[new IntRange(3,4),new IntRange(5,6)]], true],
        [[[1,2],[[3,4],[5,6]]], true],
        [[[new IntRange(3,4),new IntRange(5,6)],new IntRange(1,2)], true],
        [[[new IntRange(3,4),new IntRange(5,6)],[1,2]], true],
        [[[[3,4],[5,6]],new IntRange(1,2)], true],
        [[[[3,4],[5,6]],[1,2]], true],
        // Array of IntRange constructor args in an array also do not flatten
        [[[new IntRange(1,2),[new IntRange(3,4),new IntRange(5,6)]]], true],
        [[[new IntRange(1,2),[new IntRange(3,4),[5,6]]]], true],
        [[[[1,2],[new IntRange(3,4),new IntRange(5,6)]]], true],
        [[[[1,2],[[3,4],[5,6]]]], true],
        [[[[new IntRange(3,4),new IntRange(5,6)],new IntRange(1,2)]], true],
        [[[[new IntRange(3,4),new IntRange(5,6)],[1,2]]], true],
        [[[[[3,4],[5,6]],new IntRange(1,2)]], true],
        [[[[[3,4],[5,6]],[1,2]]], true]
    ];
    assertTestsError(tests, action);
}

function testEmptyRangeSetEqualsNullRangeSet()
{
    console.log("Testing RangeSet Equals Empty Values...");
    var tests = [
        [[new IntRangeSet(), new IntRangeSet(null)], true],
        [[new IntRangeSet([]), new IntRangeSet(null)], true],
        [[new IntRangeSet(), new IntRangeSet([null])], true],
        [[new IntRangeSet([]), new IntRangeSet([null])], true]
    ];
    assertTestsEqual(tests, equalState);
}

function testRangeSetConstructorNullArgTypes()
{
    console.log("Testing RangeSet Equals Null Values...");
    var tests = [
        // Test the array arg format
        [[new IntRangeSet([null]), new IntRangeSet([null])], true],
        [[new IntRangeSet([null]), new IntRangeSet([new IntRange(null)])], true],
        [[new IntRangeSet([new IntRange(null)]), new IntRangeSet([null])], true],
        [[new IntRangeSet([new IntRange(null)]), new IntRangeSet([new IntRange(null)])], true],
        // Test the var args format
        [[new IntRangeSet(null), new IntRangeSet(null)], true],
        [[new IntRangeSet(null), new IntRangeSet(new IntRange(null))], true],
        [[new IntRangeSet(new IntRange(null)), new IntRangeSet(null)], true],
        [[new IntRangeSet(new IntRange(null)), new IntRangeSet(new IntRange(null))], true],
        // Test the array arg format matches the var args format
        [[new IntRangeSet(null), new IntRangeSet([null])], true],
        [[new IntRangeSet([null]), new IntRangeSet(null)], true],
        [[new IntRangeSet(null), new IntRangeSet([new IntRange(null)])], true],
        [[new IntRangeSet([null]), new IntRangeSet(new IntRange(null))], true],
        [[new IntRangeSet(new IntRange(null)), new IntRangeSet([null])], true],
        [[new IntRangeSet([new IntRange(null)]), new IntRangeSet([null])], true],
        [[new IntRangeSet(new IntRange(null)), new IntRangeSet([new IntRange(null)])], true],
        [[new IntRangeSet([new IntRange(null)]), new IntRangeSet(new IntRange(null))], true]
    ];
    assertTestsEqual(tests, equalState);
}

function testRangeSetConstructorOrder() {
    console.log("Testing RangeSet Constructor Order...");
    var tests = [
        [[new IntRangeSet([]), new IntRangeSet()], true],
        [[new IntRangeSet(), new IntRangeSet([])], true],
        [[new IntRangeSet([1,2],[3,4]), new IntRangeSet([3,4],[1,2])], true],
        [[new IntRangeSet(null, [1,2]), new IntRangeSet([1,2], null)], true],
        [[new IntRangeSet([1,2], null), new IntRangeSet(null, [1,2])], true],
        [[new IntRangeSet(null, [1,2],[3,4],[5,8]), new IntRangeSet([1,2],[3,4],[5,8], null)], true],
        [[new IntRangeSet([5,8],[1,2],[3,4]), new IntRangeSet([1,2],[3,4],[5,8])], true]
    ];
    assertTestsEqual(tests, equalState);
}

function testRangeSetEqualsKnown()
{
    console.log("Testing RangeSet Equals Known Values...");
    var tests = [
        // Test for equivalence
        [[new IntRangeSet(), new IntRangeSet()], true],
        [[new IntRangeSet([]), new IntRangeSet([])], true],
        [[new IntRangeSet([1,2]), new IntRangeSet([1,2])], true],
        [[new IntRangeSet([1,2],[3,4]), new IntRangeSet([1,2],[3,4])], true],
        [[new IntRangeSet(null, [1,2]), new IntRangeSet(null, [1,2])], true],
        [[new IntRangeSet([1,2],[3,4]), new IntRangeSet([1,2],[3,4])], true],
        [[new IntRangeSet([1,2],[3,4],[5,8]), new IntRangeSet([1,2],[3,4],[5,8])], true],
        [[new IntRangeSet(null, [1,2],[3,4],[5,8]), new IntRangeSet(null, [1,2],[3,4],[5,8])], true],
        // Test for non-equivalence
        [[new IntRangeSet([1,2]), new IntRangeSet([1,3])], false],
        [[new IntRangeSet([1,2]), new IntRangeSet([0,2])], false],
        [[new IntRangeSet([1,2],[3,4]), new IntRangeSet([1,2])], false],
        [[new IntRangeSet([1,2]), new IntRangeSet([1,2],[3,4])], false],
        [[new IntRangeSet([1,4]), new IntRangeSet([1,2],[3,4])], false],
        [[new IntRangeSet([1,2],[3,4]), new IntRangeSet([1,4])], false]
    ];
    assertTestsEqual(tests, equalState);
}

function testRangeIntersectKnown()
{
    console.log("Testing Range Intersect Known Values...");
    var tests = [
        [[new IntRange(1,2), new IntRange(1,2)], new IntRange(1,2)],
        [[new IntRange(1,3), new IntRange(1,2)], new IntRange(1,2)],
        [[new IntRange(1,2), new IntRange(1,3)], new IntRange(1,2)],
        [[new IntRange(0,2), new IntRange(1,2)], new IntRange(1,2)],
        [[new IntRange(1,2), new IntRange(0,2)], new IntRange(1,2)],
        [[new IntRange(0,3), new IntRange(1,2)], new IntRange(1,2)],
        [[new IntRange(1,2), new IntRange(0,3)], new IntRange(1,2)],
        [[new IntRange(1,3), new IntRange(0,2)], new IntRange(1,2)],
        [[new IntRange(0,2), new IntRange(1,3)], new IntRange(1,2)]
    ];
    assertTestsMatchRelationship(tests, 'intersect', 'equals');
}

function testRangeIntersectNulls()
{
    console.log("Testing Range Intersect Null Cases...");
    var tests = [
        [[new IntRange(1,2),  new IntRange(null)], new IntRange(null)],
        [[new IntRange(null), new IntRange(3,4)],  new IntRange(null)],
        [[new IntRange(1,2),  new IntRange(3,4)],  new IntRange(null)],
        [[new IntRange(null), new IntRange(null)], new IntRange(null)]
    ];
    assertTestsMatchRelationship(tests, 'intersect', 'equals');
}

function testRangeSymdiffKnown()
{
    console.log("Testing Range Symdiff Known Values...");
    var tests = [
        [[new IntRange(1,2), new IntRange(1,3)], new IntRangeSet([2,3])],
        [[new IntRange(1,3), new IntRange(1,2)], new IntRangeSet([2,3])],
        [[new IntRange(0,2), new IntRange(1,2)], new IntRangeSet([1,2])],
        [[new IntRange(1,3), new IntRange(0,2)], new IntRangeSet([1,2])],
        [[new IntRange(0,3), new IntRange(1,2)], new IntRangeSet([2,3])],
        [[new IntRange(1,2), new IntRange(1,3)], new IntRangeSet([2,3])]
    ];
    assertTestsMatchSetRelationship(tests, 'disjoint', 'equals');
}

function testRangeSymdiffNulls()
{
    console.log("Testing Range Symdiff Null Cases...");
    var tests = [
        [[new IntRange(1,2),  new IntRange(1,2)],  new IntRangeSet(null)],
        [[new IntRange(null), new IntRange(1,2)],  new IntRangeSet(null)],
        [[new IntRange(1,2),  new IntRange(null)], new IntRangeSet(null)],
        [[new IntRange(null), new IntRange(null)], new IntRangeSet(null)]
    ];
    assertTestsMatchSetRelationship(tests, 'disjoint', 'equals');
}

function testRangeConnectedKnown()
{
    console.log("Testing Range Symdiff Known Values...");
    var tests = [
        [[new IntRange(1,2), new IntRange(2,3)], true],
        [[new IntRange(2,3), new IntRange(1,2)], true],
        [[new IntRange(1,3), new IntRange(1,2)], true],
        [[new IntRange(1,2), new IntRange(1,3)], true],
        [[new IntRange(1,2), new IntRange(3,4)], false]
    ];
    assertTestsMatchSetRelationship(tests, 'isConnecteded', 'equals');
}

function testRangeConnectedNulls()
{
    console.log("Testing Range Symdiff Known Values...");
    var tests = [
        [[new IntRange(1,2), new IntRange(null)], false],
        [[new IntRange(null), new IntRange(1,2)], false],
        [[new IntRange(null), new IntRange(null)], false]
    ];
    assertTestsMatchSetRelationship(tests, 'isConnecteded', 'equals');
}

function testRangeSetPack()
{
    console.log("Testing RangeSet Pack...");
    var tests = [];
    tests.push(
        [[new IntRangeSet(null), new IntRangeSet()], true],
        [[new IntRangeSet(null,null), new IntRangeSet(null)], true],
        [[new IntRangeSet([1,2],[1,2]), new IntRangeSet([1,2])], true],
        [[new IntRangeSet(null,null,[1,2],[1,2]), new IntRangeSet([1,2])], true],
        [[new IntRangeSet([1,2],null,[1,2]), new IntRangeSet([1,2])], true],
        [[new IntRangeSet([1,2],[3,4]), new IntRangeSet([1,2],[3,4])], true],
        [[new IntRangeSet([1,2],[3,4],[5,6]), new IntRangeSet([1,2],[3,4],[5,6])], true],
        [[new IntRangeSet([1,2],[2,3]), new IntRangeSet([1,3])], true],
        [[new IntRangeSet([1,2],[2,3], null), new IntRangeSet([1,3])], true],
        [[new IntRangeSet([1,2],[2,3],[3,4]), new IntRangeSet([1,4])], true],
        [[new IntRangeSet([3,4],[2,3],[1,2]), new IntRangeSet([1,4])], true],
        [[new IntRangeSet([3,4],[2,3],[1,2]), new IntRangeSet([1,4])], true]
    );
    var dup = new IntRangeSet();
    dup.add([1,2], true);
    dup.add([1,2], true);
    var triplet = new IntRangeSet();
    triplet.add([1,2], true);
    triplet.add([2,3], true);
    triplet.add([3,4], true);
    tests.push(
        // Assure that their counter parts fail
        [[new IntRangeSet([1,2],[1,2]), dup], false],
        [[new IntRangeSet(null,null,[1,2],[1,2]), dup], false],
        [[new IntRangeSet(null,null,[1,2],[1,2]), new IntRangeSet()], false],
        [[new IntRangeSet([1,2],null,[1,2]), dup], false],
        [[new IntRangeSet([1,2],[2,3],[3,4]), triplet], false],
        [[new IntRangeSet([1,2],[2,3]).ranges, [new IntRange(1,2), new IntRange(2,3)]], false],
        [[new IntRangeSet([1,2],[2,3], null).ranges, [new IntRange(1,2), new IntRange(2,3), null]], false]
    );
    assertTestsEqual(tests, equalState);
}

function testRangeSetUnionKnown()
{
    console.log("Testing RangeSet Union Known Values...");
    var tests = [
        [[new IntRangeSet([1,2]), new IntRangeSet([2,3])], new IntRangeSet([1,3])],
        [[new IntRangeSet([2,3]), new IntRangeSet([1,2])], new IntRangeSet([1,3])],
        [[new IntRangeSet([1,2],[3,4]), new IntRangeSet([2,3])], new IntRangeSet([1,4])],
        [[new IntRangeSet([1,2],[3,4]), new IntRangeSet([2,3],[4,5])], new IntRangeSet([1,5])],
        [[new IntRangeSet([1,2],[3,4]), new IntRangeSet([2,5])], new IntRangeSet([1,5])],
        [[new IntRangeSet([1,2]), new IntRangeSet([0,1],[2,5])], new IntRangeSet([0,5])]
    ];
    assertTestsMatchSetRelationship(tests, 'union', 'equals');
}

function testRangeSetUnionNulls()
{
    console.log("Testing RangeSet Union Null Values...");
    var tests = [
        [[new IntRangeSet(), new IntRangeSet()], new IntRangeSet()],
        [[new IntRangeSet([1,2]), new IntRangeSet()], new IntRangeSet([1,2])],
        [[new IntRangeSet(), new IntRangeSet([1,2])], new IntRangeSet([1,2])],
        [[new IntRangeSet([1,2],[3,4]), new IntRangeSet()], new IntRangeSet([1,2],[3,4])],
        [[new IntRangeSet(), null], new IntRangeSet()],
        [[new IntRangeSet([1,2]), null], new IntRangeSet([1,2])],
        [[new IntRangeSet([1,2],[3,4]), null], new IntRangeSet([1,2],[3,4])]
    ];
    assertTestsMatchSetRelationship(tests, 'union', 'equals');
}

// TODO: Finish writing the tests for this function
function testRangeSetDifferenceKnown()
{
    console.log("Testing RangeSet Difference Known Values...");
    var tests = [
        // Test the start of the function
        [[new IntRangeSet([5,9]), new IntRangeSet([0,1],[2,3],[4,5])], new IntRangeSet([5,9])],
        [[new IntRangeSet([5,9]), new IntRangeSet([0,1])], new IntRangeSet([5,9])],
        [[new IntRangeSet([5,9]), new IntRangeSet([4,6])], new IntRangeSet([6,9])],
        [[new IntRangeSet([5,9]), new IntRangeSet([6,7])], new IntRangeSet([5,6],[7,9])],
        [[new IntRangeSet([1,3]), new IntRangeSet([1,2])], new IntRangeSet([2,3])],
        [[new IntRangeSet([1,3]), new IntRangeSet([2,3])], new IntRangeSet([1,2])],
        [[new IntRangeSet([1,3],[4,6]), new IntRangeSet([2,3],[4,5])], new IntRangeSet([1,2],[5,6])],
        [[new IntRangeSet([1,6]), new IntRangeSet([1,6])], new IntRangeSet()],
        [[new IntRangeSet([1,2],[4,5]), new IntRangeSet([3,6])], new IntRangeSet([1,2])],
        [[new IntRangeSet([1,3],[5,6]), new IntRangeSet([2,7])], new IntRangeSet([1,2])],
        [[new IntRangeSet([1,6]), new IntRangeSet([2,3],[4,5])], new IntRangeSet([1,2],[3,4],[5,6])],
        [[new IntRangeSet([2,3],[4,5]), new IntRangeSet([1,6])], new IntRangeSet()],
        [[new IntRangeSet([2,3],[4,5]), new IntRangeSet([2,3])], new IntRangeSet([4,5])]
    ];
    assertTestsMatchSetRelationship(tests, 'difference', 'equals');
}

function testDateShiftStartingMonth() {
    console.log("Testing getDateShiftedByMonths with different starting months...");
    var tests = [
        [[new Date(2010,11),  1],  new Date(2011,0)],
        [[new Date(2010,11),  13], new Date(2012,0)],
        [[new Date(2010, 0), -1],  new Date(2009,11)],
        [[new Date(2010, 0), -13], new Date(2008,11)]
    ];
    assertTestsEqual(tests, getDateShiftedByMonths, 'getTime');
}

function testDateShiftNumberOfMonths() {
    console.log("Testing getDateShiftedByMonths with various number of months...");
    var tests = [
        [[new Date(2011,0), -13], new Date(2009,11)],
        [[new Date(2011,0), -12], new Date(2010,0)],
        [[new Date(2011,0), -11], new Date(2010,1)],
        [[new Date(2011,0), -10], new Date(2010,2)],
        [[new Date(2011,0), -9],  new Date(2010,3)],
        [[new Date(2011,0), -8],  new Date(2010,4)],
        [[new Date(2011,0), -7],  new Date(2010,5)],
        [[new Date(2011,0), -6],  new Date(2010,6)],
        [[new Date(2011,0), -5],  new Date(2010,7)],
        [[new Date(2011,0), -4],  new Date(2010,8)],
        [[new Date(2011,0), -3],  new Date(2010,9)],
        [[new Date(2011,0), -2],  new Date(2010,10)],
        [[new Date(2011,0), -1],  new Date(2010,11)],
        [[new Date(2011,0), 0],   new Date(2011,0)],
        [[new Date(2011,0), 1],   new Date(2011,1)],
        [[new Date(2011,0), 2],   new Date(2011,2)],
        [[new Date(2011,0), 3],   new Date(2011,3)],
        [[new Date(2011,0), 4],   new Date(2011,4)],
        [[new Date(2011,0), 5],   new Date(2011,5)],
        [[new Date(2011,0), 6],   new Date(2011,6)],
        [[new Date(2011,0), 7],   new Date(2011,7)],
        [[new Date(2011,0), 8],   new Date(2011,8)],
        [[new Date(2011,0), 9],   new Date(2011,9)],
        [[new Date(2011,0), 10],  new Date(2011,10)],
        [[new Date(2011,0), 11],  new Date(2011,11)],
        [[new Date(2011,0), 12],  new Date(2012,0)]
    ];
    assertTestsEqual(tests, getDateShiftedByMonths, 'getTime');
}

/* TODO: Replace the following with a real unit testing framework */

function construct(constructor, args) {
    // Do what happens when you use the "new" keyword
    function Type() {
        // Apply the constructor to the new object
        return constructor.apply(this, args);
    }
    Type.prototype = constructor.prototype;
    return new Type();
}

function equalState(a, b)
{
    if(!a || !b) {
        return a == b;
    }

    var p;
    for(p in a) {
        if(typeof(b[p])=='undefined') {return false;}
    }

    for(p in a) {
        if (a[p]) {
            switch(typeof(a[p])) {
                  case 'object':
                      if (!equalState(a[p],b[p])) { return false; } break;
                  case 'function':
                      if (typeof(b[p])=='undefined' ||
                          (a[p].toString() !== b[p].toString()))
                          return false;
                      break;
                  default:
                      if (a[p] != b[p]) { return false; }
            }
        } else {
            if (b[p])
                return false;
        }
    }

    for(p in b) {
        if(typeof(a[p])=='undefined') {return false;}
    }

    return true;
}

function assertTestsError(tests, action) {
    for(var n=0; n<tests.length; n++) {
        try {
            if(typeof tests == 'string') {
                tests[n][0][0][action](tests[n][0][1]);
            }
            else {
                action(n, tests[n][0], tests[n][1]);
            }
            if(tests[n][1]) {
                console.log("Test " + n + ": FAIL: No exception caught.");
            }
            else {
                console.log("Test " + n + ": PASS");
            }
        }
        catch(e) {
            if(tests[n][1]) {
                console.log("Test " + n + ": PASS");
            }
            else {
                console.log("Test " + n + ": FAIL: Exception caught:", e);
            }
        }
    }
}

function assertTestsEqual(tests, action, prop) {
    for(var n=0; n<tests.length; n++) {
        var lhs, rhs;
        lhs = action.apply(this, tests[n][0]);
        rhs = tests[n][1];
        var actual, expected;
        if(prop) {
            actual = typeof lhs[prop] == "function" ? lhs[prop]() : lhs[prop];
            expected = typeof rhs[prop] == "function" ? rhs[prop]() : rhs[prop];
        }
        else {
            actual = lhs;
            expected = rhs;
        }
        if(actual == expected) {
            console.log("Test " + n + ": PASS");
        }
        else {
            if(prop) {
                console.log("Test " + n + ": FAIL: ", lhs, "." + prop + " != ", rhs, "." + prop);
            }
            else {
                console.log("Test " + n + ": FAIL: ", lhs, " != ", rhs);
            }
        }
    }
}

function assertTestsMatchRelationship(tests, action, prop) {
    for(var n=0; n<tests.length; n++) {
        var actual;
        if(typeof action == 'string') {
            actual = tests[n][0][0][action](tests[n][0][1]);
        }
        else {
            actual = action.apply(this, tests[n][0]);
        }
        var expected = tests[n][1];
        if(actual[prop](expected)) {
            console.log("Test " + n + ": PASS");
        }
        else {
            console.log("Test " + n + ": FAIL ( !", actual, "." + prop + "(", expected, ") )");
        }
    }
}

function assertTestsMatchSetRelationship(tests, action, prop) {
    for(var n=0; n<tests.length; n++) {
        var actual;
        var a = tests[n][0][0];
        var b = tests[n][0][1];
        if(typeof action == 'string') {
            actual = a[action](b);
        }
        else {
            actual = action.call(a, b);
        }
        var expected = tests[n][1];
        if(equalState(actual, expected)) {
            console.log("Test " + n + ": PASS");
        }
        else {
            console.log("Test " + n + ": FAIL ( !", actual, "." + prop + "(", expected, ") )");
        }
    }
}
