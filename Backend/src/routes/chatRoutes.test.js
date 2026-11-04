const test = require('node:test');
const assert = require('node:assert');
const Module = require('node:module');
const path = require('node:path');

// ---- in-memory stand-ins ----------------------------------------------
const registered = [];
function makeRouter() {
  const router = {};
  for (const method of ['get', 'post', 'put', 'patch', 'delete', 'use']) {
    router[method] = (routePath, ...handlers) => {
      registered.push({ method, path: routePath, handlers });
      return router;
    };
  }
  return router;
}
const expressStub = () => ({});
expressStub.Router = makeRouter;

const jwtState = { payload: { id: 'user-1' }, shouldThrow: false };
const jwtStub = {
  verify(token) {
    if (jwtState.shouldThrow) throw new Error('bad token');
    return jwtState.payload;
  },
};

const authStub = { authUser: function authUser(req, res, next) { next(); } };
const controllerStub = {
  createChat: function createChat() {},
  getChat: function getChat() {},
};

const messageState = { saved: [], failSave: false, lastQuery: null, lastSort: null, found: [], failFind: false };
function MessageModel(doc) {
  Object.assign(this, doc);
}
MessageModel.prototype.save = async function save() {
  if (messageState.failSave) throw new Error('save failed');
  messageState.saved.push(this);
};
MessageModel.find = (query) => {
  messageState.lastQuery = query;
  return {
    sort: async (s) => {
      messageState.lastSort = s;
      if (messageState.failFind) throw new Error('find failed');
      return messageState.found;
    },
  };
};

const chatState = { deleteResult: null, deletedIds: [], fail: false };
const chatModelStub = {
  findByIdAndDelete: async (id) => {
    chatState.deletedIds.push(id);
    if (chatState.fail) throw new Error('db down');
    return chatState.deleteResult;
  },
};

const stubs = {
  express: expressStub,
  jsonwebtoken: jwtStub,
  '../middleware/auth': authStub,
  '../controller/chatController': controllerStub,
  '../models/message': MessageModel,
  '../models/chat': chatModelStub,
};

// ---- load the routes module with intercepted requires ------------------
const routesPath = path.join(__dirname, 'chatRoutes.js');
const originalLoad = Module._load;
Module._load = function patchedLoad(request, parent, isMain) {
  if (Object.prototype.hasOwnProperty.call(stubs, request)) {
    return stubs[request];
  }
  return originalLoad.apply(this, arguments);
};
delete require.cache[routesPath];
try {
  require(routesPath);
} finally {
  Module._load = originalLoad;
}

function findRoute(method, routePath) {
  return registered.find((r) => r.method === method && r.path === routePath);
}

function makeRes() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

function reset() {
  messageState.saved = [];
  messageState.failSave = false;
  messageState.lastQuery = null;
  messageState.lastSort = null;
  messageState.found = [];
  messageState.failFind = false;
  chatState.deleteResult = null;
  chatState.deletedIds = [];
  chatState.fail = false;
  jwtState.shouldThrow = false;
  jwtState.payload = { id: 'user-1' };
}

// ---- tests --------------------------------------------------------------
test('registers the expected chat routes', () => {
  assert.ok(findRoute('post', '/'), 'POST / missing');
  assert.ok(findRoute('get', '/'), 'GET / missing');
  assert.ok(findRoute('get', '/:chatId/messages'), 'GET messages missing');
  assert.ok(findRoute('post', '/:chatId/messages'), 'POST messages missing');
  assert.ok(findRoute('delete', '/:chatId'), 'DELETE chat missing');
  assert.strictEqual(findRoute('post', '/').handlers[0], authStub.authUser);
  assert.strictEqual(findRoute('post', '/').handlers[1], controllerStub.createChat);
  assert.strictEqual(findRoute('get', '/').handlers[1], controllerStub.getChat);
});

test('verifyToken rejects missing and invalid tokens, accepts valid ones', () => {
  reset();
  const verifyToken = findRoute('delete', '/:chatId').handlers[0];

  let res = makeRes();
  let nextCalled = false;
  verifyToken({ cookies: {} }, res, () => { nextCalled = true; });
  assert.strictEqual(res.statusCode, 401);
  assert.strictEqual(nextCalled, false);

  jwtState.shouldThrow = true;
  res = makeRes();
  verifyToken({ cookies: { token: 'bad' } }, res, () => { nextCalled = true; });
  assert.strictEqual(res.statusCode, 403);
  assert.strictEqual(nextCalled, false);

  jwtState.shouldThrow = false;
  const req = { cookies: { token: 'good' } };
  verifyToken(req, makeRes(), () => { nextCalled = true; });
  assert.strictEqual(nextCalled, true);
  assert.strictEqual(req.userId, 'user-1');
});

test('creating a message uses the authenticated user, not a user supplied in the body', async () => {
  reset();
  const handler = findRoute('post', '/:chatId/messages').handlers[1];
  const req = {
    userId: 'user-1',
    params: { chatId: 'chat-9' },
    body: { content: 'hi', role: 'user', user: 'attacker' },
  };
  const res = makeRes();
  await handler(req, res);
  assert.strictEqual(res.statusCode, 201);
  assert.strictEqual(messageState.saved.length, 1);
  assert.strictEqual(messageState.saved[0].user, 'user-1');
  assert.strictEqual(messageState.saved[0].chat, 'chat-9');
});

test('creating a message validates fields and reports save failures', async () => {
  reset();
  const handler = findRoute('post', '/:chatId/messages').handlers[1];

  let res = makeRes();
  await handler({ userId: 'u', params: { chatId: 'c' }, body: { role: 'user' } }, res);
  assert.strictEqual(res.statusCode, 400);
  assert.strictEqual(messageState.saved.length, 0);

  messageState.failSave = true;
  res = makeRes();
  await handler({ userId: 'u', params: { chatId: 'c' }, body: { content: 'x', role: 'user' } }, res);
  assert.strictEqual(res.statusCode, 500);
});

test('reading messages queries by chat id sorted ascending', async () => {
  reset();
  messageState.found = [{ content: 'a' }];
  const handler = findRoute('get', '/:chatId/messages').handlers[1];
  const res = makeRes();
  await handler({ userId: 'u', params: { chatId: 'chat-3' } }, res);
  assert.deepStrictEqual(messageState.lastQuery, { chat: 'chat-3' });
  assert.deepStrictEqual(messageState.lastSort, { createdAt: 1 });
  assert.deepStrictEqual(res.body, { messages: [{ content: 'a' }] });

  messageState.failFind = true;
  const res2 = makeRes();
  await handler({ userId: 'u', params: { chatId: 'chat-3' } }, res2);
  assert.strictEqual(res2.statusCode, 500);
});

test('deleting a chat that is not found (e.g. not the requester\'s) returns 404', async () => {
  reset();
  chatState.deleteResult = null;
  const handler = findRoute('delete', '/:chatId').handlers[1];
  const res = makeRes();
  await handler({ userId: 'someone-else', params: { chatId: 'chat-x' } }, res);
  assert.deepStrictEqual(chatState.deletedIds, ['chat-x']);
  assert.strictEqual(res.statusCode, 404);
  assert.deepStrictEqual(res.body, { chat: 'Chat not found' });
});

test('deleting an existing chat returns 204 and db errors return 500', async () => {
  reset();
  const handler = findRoute('delete', '/:chatId').handlers[1];

  chatState.deleteResult = { _id: 'chat-1' };
  let res = makeRes();
  await handler({ userId: 'user-1', params: { chatId: 'chat-1' } }, res);
  assert.strictEqual(res.statusCode, 204);

  chatState.fail = true;
  res = makeRes();
  await handler({ userId: 'user-1', params: { chatId: 'chat-1' } }, res);
  assert.strictEqual(res.statusCode, 500);
});
