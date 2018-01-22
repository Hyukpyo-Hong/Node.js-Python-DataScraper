var maxArray = new Map();

maxArray.set(1,2);
maxArray.set(1.1,5);
maxArray.set('1.2',8);




for (var [key, value] of maxArray) {
console.log(key,value);
}