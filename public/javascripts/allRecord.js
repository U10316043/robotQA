function w3_open() {
    document.getElementById("mySidebar").style.display = "block";
}
function w3_close() {
    document.getElementById("mySidebar").style.display = "none";
}

/*
* Play with this code and it'll update in the panel opposite.
*
* Why not try some of the options above?
*/

Morris.Bar({
element: 'graph',
data: [
{x: 'test 1', A: 100, B: 0, C: 0, D: 0, F: 0},
{x: 'test 2', A: 20, B: 20, C: 50, D: 0, F: 10},
{x: 'test 3', A: 60, B: 0, C: 30, D: 10, F: 0},
{x: 'test 4', A: 50, B: 40, C: 10, D: 0, F: 0},
{x: 'test 5', A: 80, B: 0, C: 0, D: 10, F: 10},

],
xkey: 'x',
ykeys: ['A', 'B', 'C', 'D', 'F'],
labels: ['一次對', '兩次才對', '提示一次', '提示二次', '完全不會'],
stacked: true
});
