// https://www.toptal.com/nodejs/debugging-memory-leaks-node-js-applications
// https://github.com/lloyd/node-memwatch/network
// npm install @icebob/node-memwatch
// https://memo.appri.me/programming/detect-node-memory-leak

// https://marmelab.com/blog/2018/04/03/how-to-track-and-fix-memory-leak-with-nodejs.html
// その他の話題
// https://betterprogramming.pub/the-4-types-of-memory-leaks-in-node-js-and-how-to-avoid-them-with-the-help-of-clinic-js-part-1-3f0c0afda268
// node-inspector改めChrome DevToolsでのやりかた
// https://kazuhira-r.hatenablog.com/entry/20180212/1518433536

/*
let a = [];

const b = {name:"Mike", sex:"Male"};
function contains(a, b) {
    for (const e of a) {
        const aJSON = JSON.stringify(e);
        const bJSON = JSON.stringify(b);
        if (aJSON === bJSON) {
            return true;
        }
    }
    return false;
}

for (let i = 0; i < 10; i++) {
    // これがないとobjectが増え続けるので注意
    //if (contains(a, b)) {
    //    continue;
    //}
    a.push(b);
}
console.log(a);
*/

var memwatch = require('@icebob/node-memwatch');

let mem = [];

class LeakClass {
  constructor(str) {
    this.str = str;
  }
}

// 一定間隔で LeakClass インスタンスを配列へプッシュ:
setInterval(() => {
  mem.push(new LeakClass(Math.random().toString()));
  // mem = []; // NOTE: ここでメモリを解放すればメモリリークは解消されます。
}, 10);

// メモリ使用状況調査を開始
startHeapDiff();

function startHeapDiff() {
  // メモリ使用状況の最初のスナップショットを取得
  const hd = new memwatch.HeapDiff();
  // 2秒ごとにGC＆メモリ使用状況を出力
  setInterval(function generateHeapDumpAndStats() {
    // 1. 強制的にGCを行う
    try {
      global.gc();
    } catch (e) {
      console.log("次のコマンドで実行して下さい: 'node --expose-gc leak.js");
      process.exit();
    }
    // 2.メモリ使用状況を出力
    const heapUsed = process.memoryUsage().heapUsed;
    console.log(heapUsed + " バイト使用中")
  }, 2000);

  // CTRL + C でメモリ使用状況の終了直前のスナップショットを取得しdiffる
  process.on('SIGINT', function() {
    const diff = hd.end();
    // diff情報をコンソール出力:
    console.log("memwatch diff:", JSON.stringify(diff, null, 2));
    // diff情報をファイルにダンプするのも良いかも:
    // const fs = require("fs");
    // fs.writeFileSync("./memdiffdump.json", JSON.stringify(diff, null, 2));
    process.exit();
  });
}