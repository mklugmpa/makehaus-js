/*
This file is part of MakeHaus JS, the MakeHaus API for Node.js, released under AGPL-3.0 license.
(c) 2019, 2020 MakeProAudio GmbH and Node.js contributors. All rights reserved.
*/

const net = require('net');
const util = require('util');
const EventEmitter = require('events');

class BBuf {
  buf!: Buffer | null;
  pos!: number;
  lim!: number;
  cap!: number;
  length!: number;
  constructor() {}
  init_buf(buf: Buffer): BBuf {
    this.buf = buf;
    this.pos = 0;
    this.lim = buf.length;
    this.cap = buf.length;
    return this;
  }
  init(cap: number): BBuf {
    this.buf = Buffer.alloc(cap);
    this.pos = 0;
    this.lim = cap;
    this.cap = cap;
    return this;
  }
  exit() {
    this.buf = null;
    this.pos = 0;
    this.lim = 0;
    this.cap = 0;
  }
  rem() {
    return this.lim - this.pos;
  }
  mov(pos: number | null, lim: number | null) {
    this.pos = pos != null ? pos : 0;
    this.lim = lim != null ? lim : this.cap;
  }
  put(data: BBuf) {
    const src_rem = data.rem();
    const dst_rem = this.rem();
    const min_rem = src_rem < dst_rem ? src_rem : dst_rem;
    data.buf!.copy(this.buf!, this.pos, data.pos, data.pos + min_rem);
    this.pos += min_rem;
    data.pos += min_rem;
    return min_rem;
  }
  str() {
    return util.format('BBuf(%s %s %s %s)', this.pos, this.lim, this.cap, this.buf!.toString('hex', 0, this.lim));
  }
}

class Packetizer {
  head: BBuf;
  body: BBuf;
  data: BBuf;
  client: Client;
  constructor(client: Client) {
    this.head = new BBuf().init(2);
    this.body = new BBuf().init(1024);
    this.data = new BBuf();
    this.client = client;
  }
  recv_head() {
    this.head.put(this.data);
    if (this.head.rem() > 0) return;
    const cnt = this.head.buf![0] + (this.head.buf![1] << 8);
    if (cnt === 0) {
      this.head.buf!.writeInt16LE(-1, 0);
      this.head.mov(null, null);
      return;
    }
    if (this.body.length < cnt) {
      let idx = 1;
      let div = cnt;
      for (div = cnt; div !== 0; idx++) div >>= 1;
      this.body.init(1 << idx);
    }
    this.body.mov(null, cnt);
  }
  recv_body() {
    let text;
    if (this.body.pos === 0 && this.data.rem() >= this.body.lim) {
      const beg = this.data.pos;
      const end = this.data.pos + this.body.lim;
      text = this.data.buf!.toString('utf-8', beg, end);
      this.data.mov(end, null);
    } else {
      this.body.put(this.data);
      if (this.body.rem() > 0) return;
      const beg = 0;
      const end = this.body.lim;
      text = this.body.buf!.toString('utf-8', beg, end);
    }
    this.head.buf!.writeInt16LE(-1, 0);
    this.head.mov(null, null);
    try {
      const json = JSON.parse(text);
      this.client.emit('data', json);
    } catch (err) {
      console.log(err);
    }
  }
  recv(buf: Buffer) {
    this.data.init_buf(buf);
    while (this.data.rem() > 0) {
      if (this.head.rem() > 0) this.recv_head();
      else this.recv_body();
    }
  }
}

class Depacketizer {
  client: Client;
  constructor(client: Client) {
    this.client = client;
  }
  body(json: any) {
    const text = JSON.stringify(json);
    const body = Buffer.from(text, 'utf-8');
    if (body.length > 0xffff) {
      this.client.emit('send-error', json, text, 'too-large');
      return null;
    }
    return body;
  }
  fused(body: any) {
    const data = Buffer.alloc(2 + body.length);
    data.writeInt16LE(body.length, 0);
    body.copy(data, 2, 0, body.length);
    return data;
  }
}

export class Client extends EventEmitter {
  constructor() {
    super();
    this.packetizer = new Packetizer(this);
    this.depacketizer = new Depacketizer(this);
    const self = this;
    this.socket;
  }

  /* pass a host ip and port to initiate a socket connection to the tiles hub server
   * the socket registers event listeners to the hub here *
   * use nodejs events to communicate the internal state of the client socket to upper application layer */
  init(addr_host: string, addr_port: number) {
    const self = this;
    /* this socket is used to communicate with the tiles hub server. Not to be confused with the socket makehaus
     * will create towards the MakeHaus Web UI */
    this.socket = new net.Socket();
    this.socket.on('data', (data: any) => self.packetizer.recv(data));
    this.socket.on('error', (e: any) => this.emit('error', e));
    this.socket.on('connect', () => {
      this.socket.setNoDelay(true);
      this.emit('connect');
    });
    this.socket.on('close', (e: any) => {
      this.emit('close', e);
    });
    this.connect(addr_host, addr_port);
  }

  connect(addr_host: string, addr_port: number) {
    this.socket.connect(addr_port, addr_host);
  }
  
  exit() {
    this.socket.removeAllListeners();
    this.socket.destroy();
    delete this.socket;
  }

  send(json: any) {
    const body = this.depacketizer.body(json);
    if (body == null) return;
    const data = this.depacketizer.fused(body);
    this.socket.write(data);
  }
}

/* Only a single instance of this class must be used throughout the system */
// export const client: Client = new Client();
// Object.seal(client);
