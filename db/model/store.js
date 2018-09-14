const mongoose = require("mongoose");
// const _ = require("lodash");
// const { ObjectId } = require("mongodb");

const StoreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  openTime: {
    type: Number,
    required: true,
    trim: true
  },
  closeTime: {
    type: Number,
    required: true,
    trim: true
  },
  messageBoard: {
    managerMessage: {
      message: {
        type: String
      },
      timeStamp: {
        type: Number,
        required: true
      },
      username: {
        type: String,
        required: true
      }
    },
    frontMessage: {
      message: {
        type: String
      },
      timeStamp: {
        type: Number
      },
      username: {
        type: String,
        required: true
      }
    },
    kitchenMessage: {
      message: {
        type: String
      },
      timeStamp: {
        type: Number
      },
      username: {
        type: String,
        required: true
      }
    }
  },
  weeklySchedual: [
    {
      //因为每周按照周一作为开始, 所以使用周一的时间点作为一个周的标识.
      MondayDate: {
        type: String,
        required: true
      },
      //本周所有员工的班表是一个数组, 每个员工是一个元素
      stuffSchedual: [
        {
          //使用 username 作为区分员工的标识.区分大小写. 需要进行验证, 如果员工数据库找不到这个名字则无法查看班时.
          username: {
            type: String,
            required: true
          },
          //该员工的本周班表也是一个数组, 每一个工作日是一个元素.
          weekSchedual: [
            {
              week: {
                type: String,
                required: true
              },
              startTime: {
                type: String,
                required: true
              },
              offTime: {
                type: String,
                required: true
              }
            }
          ]
        }
      ]
    }
  ],
  formula: [
    {
      formulaName: {
        type: String,
        required: true
      },
      formulaMaker: [
        {
          username: {
            type: String
          }
        }
      ]
    }
  ]
});

StoreSchema.statics = {
  editMessageBoard(
    belongStore,
    userrole,
    messageField,
    messageContent,
    timeStamp,
    username
  ) {
    // console.log(
    //   `belongStore is ${belongStore},userrole is ${userrole}, messageField is ${messageField}, messageContent is ${messageContent}, timeStamp is ${timeStamp}, username is ${username} `
    // );
    return new Promise((resolve, reject) => {
      //先进行用户权限和所尝试修改的留言板进行判断
      let changeMessageBoard = function() {
        if (messageField === "kitchenMessage") {
          Store.findByIdAndUpdate(
            belongStore,
            {
              $set: {
                "messageBoard.kitchenMessage": {
                  message: messageContent,
                  timeStamp: timeStamp,
                  username: username
                }
              }
            },
            { new: true }
          )
            .then(store => {
              //成功之后的对数据库的操作记录
              // console.log(doc);
              resolve(store.messageBoard);
            })
            .catch(e => {
              reject(`Error when trying to update message board ${e}`);
            });
        } else if (messageField === "frontMessage") {
          Store.findByIdAndUpdate(
            belongStore,
            {
              $set: {
                "messageBoard.frontMessage": {
                  message: messageContent,
                  timeStamp: timeStamp,
                  username: username
                }
              }
            },
            { new: true }
          )
            .then(store => {
              //成功之后的对数据库的操作记录
              // console.log(doc);
              // resolve("Message successful added");
              resolve(store.messageBoard);
            })
            .catch(e => {
              reject(`Error when trying to update message board ${e}`);
            });
        } else if (messageField === "managerMessage") {
          Store.findByIdAndUpdate(
            belongStore,
            {
              $set: {
                "messageBoard.managerMessage": {
                  message: messageContent,
                  timeStamp: timeStamp,
                  username: username
                }
              }
            },
            { new: true }
          )
            .then(store => {
              //成功之后的对数据库的操作记录
              // console.log(doc);
              // resolve("Message successful added");
              resolve(store.messageBoard);
            })
            .catch(e => {
              reject(`Error when trying to update message board ${e}`);
            });
        } else {
          reject(`Cannot know the manager field typed in ${e}`);
        }
      };
      if (userrole.kitchen && messageField === "kitchenMessage") {
        changeMessageBoard();
        //修改厨房
      } else if (userrole.front && messageField === "frontMessage") {
        changeMessageBoard();
        //修改前台
      } else if (userrole.manager && messageField) {
        if (
          messageField === "kitchenMessage" ||
          messageField === "frontMessage" ||
          messageField === "managerMessage"
        ) {
          changeMessageBoard();
          //修改 manager, kitchen, front
        } else {
          reject(`messageField wrond ${e}`);
        }
      } else {
        reject(` No rights to change message board`);
      }
    });
  },
  createMondayDate(storeId, MondayDate) {
    return new Promise((resolve, reject) => {
      //查找对应店铺实例当中, 是否有指定 MondayDate 为日期的记录, 如果没有则进行创建
      Store.findByIdAndUpdate(
        storeId,
        {
          //在对应商店的实例当中的数组 weeklySchedual 中插入MondayDate 变量给 MondayDate字段.
          $push: { weeklySchedual: MondayDate }
        },
        { safe: true, upsert: true }
      )
        .then(store => {
          resolve(store);
        })
        .catch(e => {
          reject(`Can not create MondayDate for the store ${e}`);
        });
    });
  },
  //添加员工的workday信息
  createStuffSchedual(storeId, MondayDate, username, weekSchedual) {
    return new Promise((resolve, reject) => {
      Store.findById(storeId)
        .then(store => {
          let theWeek = store.weeklySchedual.filter(element => {
            return toString(element.MondayDate) === toString(MondayDate);
          });
          //暂停在这里
          console.log(`theWeek is ${theWeek[0]}`);
        })
        .catch(e => {
          console.log(`Cannot find the store.`);
        });
    });
  }
};

const Store = mongoose.model("Store", StoreSchema);

module.exports = {
  Store
};
