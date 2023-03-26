const koa = require('koa')
const Router = require('koa-router')
const logger = require('koa-logger')
const cors = require('koa-cors')
const koaStatic = require('koa-static')
const fs = require('fs')
const path = require("path")
const thumbsupply = require('thumbsupply')

const app = new koa()
const router = new Router()

const videoPath = './vue/static/video'

router.get('/videoList',
  async (ctx, next) => {
    ctx.set('Allow', 'GET')

    let ctx_query = ctx.query

    let fileArr = fs.readdirSync(path.join(__dirname, videoPath), {encoding: 'utf-8', withFileTypes: true})
    let fileNameArr = []

    let count = fileArr.length
    await new Promise((resolve) => {
      fileArr.forEach(async (item, index) => {
        let thumbnail = ''
        // get the thumbnail if it exists
        // console.log(1)
        thumbsupply.lookupThumbnail(item.name).then((thumb) => {
          // serve thumbnail
          thumbnail = thumb
          // console.log(2)
          nextStep()
        }).catch((err) => {
          // thumbnail doesn't exist
          thumbsupply.generateThumbnail('./vue/static/video/' + item.name, {
              size: thumbsupply.ThumbSize.MEDIUM, // or ThumbSize.LARGE
              timestamp: "10%", // or `30` for 30 seconds
              forceCreate: false,
              cacheDir: "./vue/static/cache",
              mimetype: "video/mp4"
          }).then((thumb) => {
            // console.log(2)
            thumbnail = thumb
            nextStep()
          })
        })
        function nextStep () {
          // console.log(3)
          // console.log(thumbnail)
          let obj = {
            name: item.name,
            url: `./static/video/${item.name}`,
            cv: index,
            // thumbnail: `../server/cache/${item.name}`
            thumbnail: '/' + thumbnail.split('vue/')[1],
          }
          fileNameArr.push(obj)
          count-=1
          if (count === 0) {
            resolve()
          }
        }
      })
    }).then(() => {
      ctx.body = {
        videoList: fileNameArr,
      }
      next()
    })
  }
)

// router.get('/', async (ctx, next) => {
//   ctx.throw(404)
//   await next()
// })

const staticPath = '/video'

// const options = {
//   key: fs.readFileSync('./new.feena.site.key'),
//   cert: fs.readFileSync('./cert.pem')
// }

app
.use(cors())
.use(koaStatic(path.join(__dirname, staticPath)))
.use(router.routes()).use(router.allowedMethods())
.use(logger())

// https.createServer(options, app.callback()).listen('7891', () => {
//   console.log('starting at port 7891')
// })

app.listen('7891', () => {
  console.log('starting at port 7891')
})