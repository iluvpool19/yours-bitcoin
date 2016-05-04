/**
 * MsgAddr
 * ======
 *
 * Sends a a list of addrs (IP addresses) of nodes we are connected to.
 */
'use strict'
let dependencies = {
  Addr: require('./addr'),
  Br: require('./br'),
  Bw: require('./bw'),
  Msg: require('./msg')
}

let inject = function (deps) {
  let Addr = deps.Addr
  let Br = deps.Br
  let Bw = deps.Bw
  let Msg = deps.Msg

  function MsgAddr (magicnum, cmdbuf, datasize, checksumbuf, databuf) {
    if (!(this instanceof MsgAddr)) {
      return new MsgAddr(magicnum, cmdbuf, datasize, checksumbuf, databuf)
    }
    this.initialize()
    this.fromObject({magicnum, cmdbuf, datasize, checksumbuf, databuf})
  }

  MsgAddr.prototype = Object.create(Msg.prototype)
  MsgAddr.prototype.constructor = MsgAddr

  MsgAddr.prototype.initialize = function () {
    Msg.prototype.initialize.call(this)
    this.setCmd('addr')
    return this
  }

  MsgAddr.databufFromAddrs = function (addrs) {
    let bw = Bw()
    bw.writeVarIntNum(addrs.length)
    for (let i = 0; i < addrs.length; i++) {
      bw.write(addrs[i].toBuffer())
    }
    return bw.toBuffer()
  }

  MsgAddr.prototype.fromAddrs = function (addrs) {
    this.setData(MsgAddr.databufFromAddrs(addrs))
    return this
  }

  MsgAddr.prototype.asyncFromAddrs = function (addrs) {
    return this.asyncSetData(MsgAddr.databufFromAddrs(addrs))
  }

  MsgAddr.prototype.toAddrs = function () {
    let br = Br(this.databuf)
    let len = br.readVarIntNum()
    let addrs = []
    for (let i = 0; i < len; i++) {
      let addrbuf = br.read(4 + 8 + 16 + 2)
      let addr = Addr().fromBuffer(addrbuf)
      addrs.push(addr)
    }
    return addrs
  }

  MsgAddr.prototype.isValid = function () {
    return this.getCmd() === 'addr'
  }

  return MsgAddr
}

inject = require('injecter')(inject, dependencies)
let MsgAddr = inject()
MsgAddr.MainNet = inject({
  Msg: require('./msg').MainNet
})
MsgAddr.TestNet = inject({
  Msg: require('./msg').TestNet
})
module.exports = MsgAddr