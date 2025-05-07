//https://www.geeksforgeeks.org/implementation-queue-javascript/
class Queue {
  constructor(array) {
    this.items = array || [];
  }
  enqueue(element) {
    this.items.push(element); 
  }
  dequeue() {
    return this.isEmpty() ? null : this.items.shift();
  }
  peek() {
    return this.isEmpty() ? null : this.items[0];
  }
  isEmpty() {
    return this.items.length === 0;
  }
  size() {
    return this.items.length;
  }
}

export default Queue;