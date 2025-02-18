import { Readable, Transform, Writable } from 'node:stream'

// process.stdin
//   .pipe(process.stdout)

// BE Reads = So UI is sending something in streams
class OneToHundredStream extends Readable {
  index = 1

  _read() {
    const i = this.index++

    setTimeout(() => {
      if (i > 100) {
        this.push(null)
      } else {
        const buffer = Buffer.from(String(i))
        this.push(buffer)
      }
    }, 1000)
  }
}

class MultiplyToTenStream extends Writable {
  index = 1

  // Buffer, 
  _write(chunk, encoding, callback) {
    console.log(Number(chunk.toString()) * 10)
    callback()
  }
}

class InverseNumberStream extends Transform {
  _transform(chunk, encoding, callback) {
    const transformed = Number(chunk.toString()) * -1
    const buffer = Buffer.from(String(transformed))
    callback(null, buffer)
  }
}

// new OneToHundredStream()
//   .pipe(process.stdout)

new OneToHundredStream()
  .pipe(new InverseNumberStream())
  .pipe(new MultiplyToTenStream())