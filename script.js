'use strict';
const canvas = document.querySelector('#canvas');
const context = canvas.getContext('2d');

const scale = 10;
const width = 50;
const height = 50;

let cells = [], encoder, frames;

canvas.width = width * scale;
canvas.height = height * scale;

init();
record();

(function main () {
  update();
  window.requestAnimationFrame(main);
})();

function count (x, y) {
  return [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]].filter(([ox, oy]) => (cells.find(({x: ex, y: ey}) => ex === x + ox && ey === y + oy) || ({status: 0})).status === 1).length;
}

function init () {
  let status;
  for (let x = 0; x < width; x ++) for (let y = 0; y < height; y ++) {
    status = Math.round(Math.random());
    cells.push({x, y, status});
  }
  redraw(cells);
}

function record () {
  encoder = new GIFEncoder();
  frames = 0;
  encoder.setDelay(0);
  encoder.setRepeat(0);
  encoder.start();
}

function redraw (cells) {
  reset();
  cells.filter(({status: es}) => es === 1).forEach(({x: ex, y: ey}) => context.fillRect(ex * scale, ey * scale, scale, scale));
  encoder.addFrame(context);
  frames ++;
  if (frames === 1000) save();
}

function reset () {
  canvas.width = canvas.width;
  context.fillStyle = 'white';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = 'black';
  let i;
  for (i = 0; i <= width; i ++) {
    context.beginPath();
    context.moveTo(i * scale, 0);
    context.lineTo(i * scale, height * scale);
    context.closePath();
    context.stroke();
  }
  for (i = 0; i <= height; i ++) {
    context.beginPath();
    context.moveTo(0, i * scale);
    context.lineTo(width * scale, i * scale);
    context.closePath();
    context.stroke();
  }
}

function save () {
  encoder.finish();
  const data = encoder.stream().getData();
  const len = data.length;
  const buf = new ArrayBuffer(len);
  const arr = new Uint8Array(buf);
  for (let i = 0; i < len; i++) arr[i] = data.charCodeAt(i);
  const blob = new Blob([buf], {type: 'image/gif'});
  const a = document.createElement('a');
  a.href = window.URL.createObjectURL(blob);
  a.download = `life-game-${Date.now()}.gif`;
  a.click();
  record();
}

function update () {
  let len, temp = cells.slice();
  temp.forEach(({x: cx, y: cy, status: cs}, i) => {
    len = count(cx, cy);
    temp[i] = {x: cx, y: cy};
    temp[i].status = Math.random() < 1 / width / height ? 1 : cs === 0 ? len === 3 ? 1 : 0 : len === 2 || len === 3 ? 1 : 0;
  });
  redraw(cells);
}
