const log = require('log')('app:document');
const Router = require('koa-router');
const _ = require('lodash');
const service = require('./service');
const userService = require('../user/service');

var router = new Router();

router.get('/api/upload/get/:id', async (ctx, next) => {
  var result = await service.findOne(ctx.params.id);
  if(result) {
    ctx.type = result.ContentType;
    ctx.body = result.Body;
  } else {
    ctx.status = 404;
  }
});

router.post('/api/upload/create', async (ctx, next) => {
  await service.upload(ctx.state.user.id, ctx.request.body).then((results) => {
    ctx.type = 'text/html';
    // Wrap in HTML so IE8/9 can process it; can't accept json directly
    var wrapper = '<textarea data-type="application/json">';
    wrapper += JSON.stringify(results);
    wrapper += '</textarea>';
    ctx.body = wrapper;
  }).catch((err) => {
    ctx.status = 400;
    ctx.body = err.message;
  });
});

router.post('/api/upload/remove/:id', async (ctx, next) => {
  if (await userService.canUpdateProfile(ctx)) {
    ctx.status = 200;
    var result = await service.removeFile(ctx.state.user.photoId);
    if(result) {
      ctx.body = { success: true };
    } else {
      ctx.status = 404;
    }
  } else {
    ctx.status = 403;
    ctx.body = { success: false };
  }
});

router.get('/api/attachment/findAllBytaskId/:id', async (ctx, next) => {
  if (ctx.isAuthenticated()) {
    await service.taskAttachments(ctx.params.id).then((results) => {
      ctx.body = results;
    }).catch((err) => {
      ctx.status = 400;
    });
  } else {
    ctx.body = [];
  }
});

module.exports = router.routes();
