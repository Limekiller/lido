// Because we are serving streams dynamically, 
// we need a custom server file
// any request starting with /streams will be routed to /media/streams

// This is because of the way m3u8 works
// and the fact that items in the public folder are only available
// if they existed at build time

const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const path = require('path')
const fs = require('fs')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

let port
if (dev) {
  port = process.argv[2] ? process.argv[2] : 3000
} else {
  port = process.argv[2] ? process.argv[2] : 80
}

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    const { pathname, query } = parsedUrl

    if (pathname.split('/')[1] == 'streams') {
        
        fs.readFile(path.join(process.cwd(), '/media/temp/' + pathname), (err,data) => {
            if (err) {
                res.writeHead(404);
                res.end(JSON.stringify(err));
                return;
            }
            res.writeHead(200);
            res.end(data);
        });
    } else {
        handle(req, res, parsedUrl)
    }

  }).listen(port, (err) => {
    if (err) throw err
    console.log('> Ready on http://localhost:' + port)
  })
})