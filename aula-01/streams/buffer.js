//  A buffer is a space in memory (typically RAM) that stores binary data (great performance)
const buf = Buffer.from('hello world')

console.log(buf)
console.log(buf.toJSON())