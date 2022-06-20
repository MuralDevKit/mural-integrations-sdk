import { EventEmitter } from 'events';
import cloneDeep from 'lodash/cloneDeep';
import { v4 as uuid } from 'uuid';

export interface RpcContext {
  user: any;
  participants: any[];
  facilitators: any[];
}

interface RpcMessage {
  type: string;
  rpcid: string;
  method: string;
  args?: string[];
}

interface RpcCallback {
  type: string;
  rpcid: string;
  error?: string;
  context?: RpcContext;
}

class Queue<T> {
  constructor() {
    this.data = new Array<T>();
  }

  private data: T[];

  push(elem: T) {
    this.data.push(elem);
  }

  pop(): T | undefined {
    return this.data.shift();
  }

  clear() {
    this.data = new Array<T>();
  }
}

export type RpcConfig = {
  source: Window;
  target: Window;
  origin: string;
};

type PromiseHandler = (...args: any[]) => void;

const HANDSHAKE_RPC_ID = '00000000-0000-0000-0000-000000000000';

const RPC_DEFAULT_CONFIG = {
  origin: document.referrer,
  source: window,
  target: undefined,
};

export default class RpcClient extends EventEmitter {
  private rpcContext: RpcContext | null = null;
  private rpcQueue = new Queue<RpcMessage>();
  private outboundRpcs = new Map<
    string,
    [resolve: PromiseHandler, reject: PromiseHandler]
  >();

  // shadow configuration
  private _config: Partial<RpcConfig> = RPC_DEFAULT_CONFIG;
  private config: RpcConfig | null = null;

  constructor(config: Partial<RpcConfig> = {}) {
    super();

    this._config = config;
  }

  init = (config: Partial<RpcConfig>) => {
    this.config = {
      ...this._config,
      ...config,
    } as RpcConfig;

    if (!this.config.origin)
      throw new Error('Invalid RPC configuration: origin');
    if (!this.config.source)
      throw new Error('Invalid RPC configuration: source');
    if (!this.config.target)
      throw new Error('Invalid RPC configuration: target');

    this.config.source.addEventListener('message', this.recv);
  };

  rpc = async (method: string, ...args: any[]) => {
    const msg = {
      type: 'mural.rpc_message',
      rpcid: uuid(),
      method,
      args,
    };

    // push the message on the queue to preserve call ordering
    this.rpcQueue.push(msg);

    const uponRpc = new Promise((resolve, reject) => {
      // we could potentially have a `timeout` here to automatically reject
      // stale RPCs after a while

      // index the message per RPC id
      this.outboundRpcs.set(msg.rpcid, [resolve, reject]);
    });

    // send the message
    this.dispatch();

    return uponRpc;
  };

  dispatch = () => {
    if (!this.config) throw new Error('RpcClient not initialized');

    const msg = this.rpcQueue.pop();

    if (msg) {
      // send the message through the canvas
      this.emit('rpc_dispatch', msg);
      this.config.target.postMessage(msg, this.config.origin);
      this.emit('rpc_after_dispatch', msg);

      return true;
    }

    return false;
  };

  updateContext = (context: RpcContext | undefined) => {
    if (!context) return;

    // keep an immutable readonly reference to the latest context
    const [from, to] = [this.rpcContext, Object.freeze(cloneDeep(context))];

    this.emit('rpc_context', { from: from, to: to });
    this.rpcContext = to;
  };

  recv = (evt: MessageEvent<RpcCallback>) => {
    const msg = evt.data;
    if (msg.type != 'mural.rpc_callback') return;

    // There is a special case for the handshake call sent
    // by the mural-integration add-on within murally
    if (msg.rpcid === HANDSHAKE_RPC_ID) {
      this.updateContext(msg.context);
      this.emit('rpc_ready');
      return;
    }

    const rpcHandles = this.outboundRpcs.get(msg.rpcid);
    if (!rpcHandles) {
      console.warn(`Ignoring non-originating RPC ${msg.rpcid}`);
      return;
    }

    this.updateContext(msg.context);
    this.emit('rpc_callback', msg);

    // figure out if we have an error of a success
    if (!msg.error) {
      rpcHandles[0](msg);
    } else {
      console.log('mural.rpc_callback:error', msg.error);
      rpcHandles[1](msg);
    }

    // clean-up the RPC reference
    this.outboundRpcs.delete(msg.rpcid);

    // dispatch the next RPC in the queue,
    // if there are any
    this.dispatch();
  };

  get context() {
    return this.rpcContext;
  }

  dispose() {
    if (!this.config) return;

    this.rpcQueue.clear();
    this.outboundRpcs.forEach(([_, reject]) => reject('RPC client disposed'));
    this.outboundRpcs.clear();

    this.config.source.removeEventListener('message', this.recv);
  }
}
