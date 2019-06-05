let Promise = require("./promise");
let promise = new Promise(function(resolve, reject) {
  setTimeout(() => {
    resolve(123);
  }, 3000);
});
// promise.then(
//   function(value) {
//     console.log(value);
//   },
//   function(reason) {
//     console.log(reason);
//   }
// );

let result = Promise.all([
  new Promise(function(resolve, reject) {
    setTimeout(() => {
      resolve(123);
    }, 3000);
  }),
  new Promise(function(resolve, reject) {
    setTimeout(() => {
      resolve(123);
    }, 3000);
  }),
  1,
  2,
  3
]);

result.then(data => {
  console.log(data);
});

let result1 = Promise.race([
  new Promise(function(resolve, reject) {
    setTimeout(() => {
      resolve(123);
    }, 3000);
  }),
  new Promise(function(resolve, reject) {
    setTimeout(() => {
      resolve(456);
    }, 2000);
  })
]);

result1.then(data => {
  console.log(data);
});
