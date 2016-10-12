var app = require('../app');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fetch = require('node-fetch');
var path = require('path');
var fs = require('fs');
var spawn = require('child_process').spawn;

var util = require('util');

import { User } from '../models';

let currentUser = null;

io.use(async (socket, next) => {
  const authenticationToken = socket.handshake.query.authenticationToken;

  if (authenticationToken !== undefined) {
    const user = await User
      .findOne({
        where: {
          token: authenticationToken
        }
      });

    if (user !== undefined) {
      currentUser = user;

      return next();
    } else {
      next(new Error('Failed to authenticate token.'));
    }
  } else {
    next(new Error('No token provided.'));
  }
});


io.of('/book')
  .use((socket, next) => {
    if (socket.handshake.query.author !== undefined && socket.handshake.query.bid !== undefined) {
      return next();
    } else {
      next(new Error('Missing required parameters.'));
    }
  })
  .on('connection', async (socket) => {
    const author = socket.handshake.query.author;
    const bid = socket.handshake.query.bid;
    const id = `${author}/${bid}`;

    const targetPath =  path.join(__dirname, `../public/gitbooks/${id}`);

    if (!fs.existsSync(targetPath)) {

      const totalStepCount = 4;
      let stepCount = 0;

      const bookDetail = await fetch(`https://api.gitbook.com/book/${id}`)
        .then((response) => {
          return response.json()
        });

      let gitURL = bookDetail.urls.git;

      if (gitURL === undefined) {

        socket.emit('break', {
          progress: stepCount / totalStepCount,
          status: {
            code: stepCount,
            message: 'Failed to fetch git url.'
          }
        });

        socket.disconnect();
      } else {

        stepCount++;

        socket.emit('prepare', {
          progress: stepCount / totalStepCount,
          status: {
            code: stepCount,
            message: 'Success to fetch git url.'
          }
        });
      }

      const URLComponents = gitURL.split('://');

      const gitClone = spawn('git', ['clone', `${URLComponents[0]}://${currentUser.username}:${currentUser.token}@${URLComponents[1]}`, targetPath, '--verbose']);

      gitClone.stderr.on('data', (data) => {
        stepCount++;

        socket.emit('prepare', {
          progress: stepCount / totalStepCount,
          status: {
            code: stepCount,
            message: `${data}`
          }
        });
      });

      gitClone.on('close', async (code) => {
        if (code == 128) {
          socket.emit('break', {
            progress: stepCount / totalStepCount,
            status: {
              code: stepCount,
              message: 'Authentication failed.'
            }
          });

        } else if (code == 0) {
          stepCount++;

          socket.emit('prepare', {
            progress: stepCount / totalStepCount,
            status: {
              code: stepCount,
              message: 'Clone done.'
            }
          });

          await convertMarkDownAndEmitResult(socket, targetPath);

          socket.disconnect();

        } else {
          socket.emit('break', {
            progress: stepCount / totalStepCount,
            status: {
              code: stepCount,
              message: 'Unknown error.'
            }
          });
        }
      });
    } else {

      await convertMarkDownAndEmitResult(socket, targetPath);

      socket.disconnect();
    }
  });

async function convertMarkDownAndEmitResult(socket, targetPath) {

  const summaryFile = fs.readFileSync(`${targetPath}/SUMMARY.md`);

  const requestString = { text: `${summaryFile}` };

  const bookDetail = await fetch(`https://api.github.com/markdown`, {
    method: 'POST',
    body: JSON.stringify(requestString),
    headers: { 'Content-Type': 'application/json' }
  })
    .then((response) => {
      return response.text()
    });

  console.log(bookDetail);

  socket.emit('download', [
    {
      level: '1',
      title: '前言',
      fileName: 'README.MD'
    }, {
      level: '2',
      title: 'Selector',
      filePath: 'selector/README.md',
    }, {
      level: '2.1',
      title: 'Objective-C Class/Object 到底是什麼？',
      filePath: 'selector/what_are_objective-c_classes.md',
    }, {
      level: '2.2',
      title: 'Selector 有什麼用途？',
      filePath: 'selector/usage.md',
    }, {
      level: '2.3',
      title: '呼叫 performSelector: 需要注意的地方',
      filePath: 'selector/what_you_way_need_to_notice_on_calling_performselecotr.md',
    }, {
      level: '2.5',
      title: 'Selector 是 Objective-C 中所有魔法的開始',
      filePath: 'selector/selector_is_where_the_magic_begins.md',
    }, {
      level: '2.6',
      title: '相關閱讀',
      filePath: 'selector/reading_list.md',
    }, {
      level: '2.7',
      title: '練習：小計算機',
      filePath: 'selector/practice_simple_calculator.md',
    }, {
      level: '3',
      title: 'Category',
      filePath: 'category/README.md',
    }, {
      level: '3.1',
      title: '什麼時候應該要使用 Category',
      filePath: 'category/when_to_use_categories.md',
    }, {
      level: '3.2',
      title: '實作 Category',
      filePath: 'category/implementing_categories.md',
    }
  ]);
}

module.exports = io;