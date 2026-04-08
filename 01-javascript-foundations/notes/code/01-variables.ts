// Block scoping — let/const are confined to the block
function scopeDemo(): void {
  if (true) {
    var x = 1;    // visible in entire function
    let y = 2;    // only visible in this if-block
    const z = 3;  // only visible in this if-block
  }
  console.log(x); // 1
  // console.log(y); // ReferenceError
  // console.log(z); // ReferenceError
}

// const prevents re-assignment, NOT mutation
const arr: number[] = [1, 2, 3];
arr.push(4);       // OK — mutating the array
// arr = [5, 6];   // Error — re-assigning the binding

scopeDemo();