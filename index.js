const kill = require('tree-kill')
const execa = require('execa')
const NodeMediaServer = require('node-media-server')
const env = process.env
const config = {
  rtmp: {
    port: env.RTMP_PORT || 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  http: {
    port: env.HTTP_PORT || 3000,
    allow_origin: '*'
  }
}

const nms = new NodeMediaServer(config)
nms.run()
const subProcessStore = new Map()

async function push ({ url, name }) {
  const subProcess = execa('ffmpeg', ['-re', '-i', url, '-c', 'copy', '-f', 'flv', 'rtmp://localhost:' + config.rtmp.port + '/live/' + name])
  subProcessStore.set(name, { subProcess, count: 1 })
  try {
    await subProcess
    console.log('ffmpeg ok')
  } catch (error) {
    console.log(error)
    subProcess.pid && kill(subProcess.pid, 'SIGKILL')
    subProcessStore.delete(name)
  }
}

nms.on('preConnect', async (id, args) => {
  const session = await nms.getSession(id)
  if (session.TAG === 'http-flv') {
    const name = args.query.name
    const item = subProcessStore.get(name)
    if (subProcessStore.has(name)) {
      item.count++
    } else {
      await push(args.query)
    }
  }
})
nms.on('donePlay', (id, streamPath, args) => {
  const item = subProcessStore.get(args.name)
  if (item) {
    item.count--
    if (item.count <= 0) {
      kill(item.subProcess.pid, 'SIGKILL')
      subProcessStore.delete(args.name)
    }
  }
})
