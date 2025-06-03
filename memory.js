// memory.js
let memory = [];

export function getMemory() {
  return memory;
}

export function addToMemory(message) {
  memory.push(message);

  // Optional: limit memory to last 50 messages
  if (memory.length > 50) {
    memory.shift();
  }
}
