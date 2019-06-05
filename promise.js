// Promise 是一个类
// Promise 含义：承诺
// Promise 三个状态  成功  失败  等待
// Promise 中存放两个变量 分别是value和reason
// Promise 中有then方法
function resolvePromise(promise2, x, resolve, reject) {
  // 1. 循环引用 判断返回的promise不是自己
  if (promise2 === x) {
    return reject(new TypeError("循环引用错误！"));
  }
  // 判断x是不是一个promise
  if (typeof x === "function" || (typeof x === "object" && x !== null)) {
    // 防止调用了别人的promise
    let called;
    try {
      // 捕获取值then的异常
      let then = x.then;
      if (typeof then === "function") {
        then.call(
          x,
          y => {
            // 防止成功和错误一起调用
            if (called) return;
            called = true;
            // 递归调用，直到是一个常量为止
            resolvePromise(promise2, y, resolve, reject);
          },
          r => {
            if (called) return;
            called = true;
            reject(r);
          }
        );
      } else {
        resolve(x);
      }
    } catch (e) {
      if (called) return;
      called = true;
      reject(e);
    }
  } else {
    // x是一个常量
    resolve(x);
  }
}
class Promise {
  constructor(exec) {
    this.state = "pending";
    this.value;
    this.reason;
    this.fulfilledCallbacks = [];
    this.rejectedCallbacks = [];

    let resolve = value => {
      // 如果是Promise就调用pronmise的then
      if (value instanceof Promise) return value.then(resolve, reject);
      if (this.state === "pending") {
        this.value = value;
        this.state = "fulfilled";
        // 发布
        this.fulfilledCallbacks.forEach(fulfilled => fulfilled());
      }
    };
    let reject = reason => {
      if (this.state === "pending") {
        this.reason = reason;
        this.state = "rejected";
        // 发布
        this.rejectedCallbacks.forEach(rejected => rejected());
      }
    };
    try {
      exec(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }
  then(onfulfilled, onrejected) {
    onfulfilled = typeof onfulfilled === "function" ? onfulfilled : val => val;
    onrejected =
      typeof onrejected === "function"
        ? onrejected
        : r => {
            throw r;
          };
    let promise2;
    promise2 = new Promise((resolve, reject) => {
      if (this.state === "fulfilled") {
        // 编程异步执行，确保能拿到promise2
        setTimeout(() => {
          try {
            let x = onfulfilled(this.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (err) {
            reject(err);
          }
        }, 0);
      } else if (this.state === "rejected") {
        setTimeout(() => {
          try {
            let x = onrejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (err) {
            reject(err);
          }
        }, 0);
      } else if (this.state === "pending") {
        // 如果在等待状态，我们就把callback存起来（订阅）
        this.fulfilledCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onfulfilled(this.value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (err) {
              reject(err);
            }
          }, 0);
        });
        this.rejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onrejected(this.reason);
              resolvePromise(promise2, x, resolve, reject);
            } catch (err) {
              reject(err);
            }
          }, 0);
        });
      }
    });
    return promise2;
  }
  // 相当于then的简写
  catch(rejectFunc) {
    return this.then(null, rejectFunc);
  }
  // 不管什么情况都执行
  finally(finallyFunc) {
    return this.then(finallyFunc, finallyFunc);
  }
}
// 产生一个成功后的promise对象
Promise.resolve = function(value) {
  return new Promise((resolve, reject) => {
    resolve(value);
  });
};
// 产生一个错误后的promise对象
Promise.resolve = function(reason) {
  return new Promise((resolve, reject) => {
    reject(reason);
  });
};
// 同时执行多个异步函数，全部完成返回结果，结果跟参数的索引位置一致
Promise.all = function(values) {
  return new Promise((resolve, reject) => {
    // 存储最后的结果
    let results = [];
    let i = 0;
    let promiseData = function(value, index) {
      results[index] = value;
      if (++i === values.length) {
        resolve(results);
      }
    };
    for (let i = 0; i < values.length; i++) {
      // 获取当前数组的元素
      let current = values[i];
      // 判断当前元素是不是一个promise
      if (
        (typeof current === "object" && typeof current !== null) ||
        typeof current === "function"
      ) {
        let then = current.then;
        if (typeof then === "function") {
          then.call(current).then(y => {
            promiseData(y, i);
          }, reject);
        } else {
          promiseData(current, i);
        }
      } else {
        promiseData(current, i);
      }
    }
  });
};
// 同时执行多个异步函数，谁返回的快就then得结果就传谁
Promise.race = function(values) {
  return new Promise((resolve, reject) => {
    for (let i = 0; i < values.length; i++) {
      // 获取当前数组的元素
      let current = values[i];
      // 判断当前元素是不是一个promise
      if (
        (typeof current === "object" && typeof current !== null) ||
        typeof current === "function"
      ) {
        let then = current.then;
        if (typeof then === "function") {
          then.call(current).then(y => {
            resolve(y);
          }, reject);
        } else {
          resolve(current);
        }
      } else {
        resolve(current);
      }
    }
  });
};
// 暴露一个方法需要返回一个对象，对象上游promise resolve reject 三个属性(测试)
// 全局安装promise/A+测试工具 promises-aplus-tests -g
// promises-aplus-tests 文件名
Promise.defer = Promise.deferred = function() {
  let dfd = {};
  dfd.promise = new Promise((resolve, reject) => {
    dfd.resolve = resolve;
    dfd.reject = reject;
  });
  return dfd;
};
module.exports = Promise;
