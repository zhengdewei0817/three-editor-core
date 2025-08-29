// 示例：如何使用转换后的 signals 模块

// 方式 1: 默认导入
import signals from './signals.min.js';

// 方式 2: 命名导入
import { Signal } from './signals.min.js';

// 使用默认导入创建信号
const mySignal = new signals();

// 或者使用命名导入创建信号
const mySignal2 = new Signal();

// 添加监听器
mySignal.add(function(message) {
    console.log('收到信号:', message);
});

// 添加一次性监听器
mySignal.addOnce(function(message) {
    console.log('这个监听器只会执行一次:', message);
});

// 触发信号
mySignal.dispatch('Hello World!');
mySignal.dispatch('第二次触发'); // 一次性监听器不会再执行

// 移除所有监听器
mySignal.removeAll();

export { mySignal, mySignal2 }; 